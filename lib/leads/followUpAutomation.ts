/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lead follow-up automation logic.
 * Determines when to send follow-up emails and processes them.
 */

import { sendEmail } from "@/lib/email/resend"
import {
  generateLeadFollowUpSubject,
  generateLeadFollowUpHTML,
  type LeadFollowUpEmailData,
} from "@/lib/email/templates/leadFollowUp"

export interface FollowUpRule {
  type: "no_response_24h" | "no_response_3d" | "proposal_no_response_2d"
  description: string
  delayMs: number
  /** Lead statuses this rule applies to */
  applicableStatuses: string[]
}

export const FOLLOW_UP_RULES: FollowUpRule[] = [
  {
    type: "no_response_24h",
    description: "Follow-up after 24 hours with no response",
    delayMs: 24 * 60 * 60 * 1000,
    applicableStatuses: ["new", "contacted"],
  },
  {
    type: "no_response_3d",
    description: "Reminder after 3 days with no response",
    delayMs: 3 * 24 * 60 * 60 * 1000,
    applicableStatuses: ["new", "contacted", "qualified"],
  },
  {
    type: "proposal_no_response_2d",
    description:
      "Nudge after proposal viewed but no response in 2 days",
    delayMs: 2 * 24 * 60 * 60 * 1000,
    applicableStatuses: ["proposal_sent"],
  },
]

/**
 * Check if a lead needs a follow-up based on the given rule.
 */
export function shouldScheduleFollowUp(
  lead: {
    status: string
    created_at: string
    updated_at: string
  },
  lastActivityAt: string | null,
  rule: FollowUpRule
): boolean {
  // Check if lead status is applicable for this rule
  if (!rule.applicableStatuses.includes(lead.status)) {
    return false
  }

  // Use the most recent activity timestamp, or created_at if no activities
  const referenceTime = lastActivityAt
    ? new Date(lastActivityAt).getTime()
    : new Date(lead.created_at).getTime()

  const elapsed = Date.now() - referenceTime

  return elapsed >= rule.delayMs
}

/**
 * Get all leads that need follow-up for a venue.
 */
export async function getLeadsNeedingFollowUp(
  supabase: any,
  venueId: string
): Promise<
  Array<{
    lead: any
    rule: FollowUpRule
    lastActivityAt: string | null
  }>
> {
  // Get active leads (not won, lost, or negotiating)
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("venue_id", venueId)
    .in("status", ["new", "contacted", "qualified", "proposal_sent"])
    .order("created_at", { ascending: false })

  if (error || !leads) return []

  const results: Array<{
    lead: any
    rule: FollowUpRule
    lastActivityAt: string | null
  }> = []

  for (const lead of leads) {
    // Check if contact email exists (can't follow up without it)
    if (!lead.contact_email) continue

    // Get last activity for this lead
    const { data: activities } = await supabase
      .from("lead_activities")
      .select("created_at, activity_type")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(1)

    const lastActivity = activities?.[0] || null
    const lastActivityAt = lastActivity?.created_at || null

    // Skip if last activity was already a follow-up email (avoid spam)
    if (lastActivity?.activity_type === "email_sent") continue

    // Check each rule
    for (const rule of FOLLOW_UP_RULES) {
      if (shouldScheduleFollowUp(lead, lastActivityAt, rule)) {
        results.push({ lead, rule, lastActivityAt })
        break // Only one follow-up per lead at a time
      }
    }
  }

  return results
}

/**
 * Process a follow-up for a specific lead.
 */
export async function processFollowUp(
  supabase: any,
  lead: any,
  venue: { name: string; phone: string | null; email: string | null },
  managerName: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!lead.contact_email) {
    return { success: false, error: "No contact email on lead" }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const emailData: LeadFollowUpEmailData = {
    contactName: lead.contact_name,
    venueName: venue.name,
    eventType: lead.event_type,
    eventDate: lead.event_date,
    managerName,
    venuePhone: venue.phone,
    venueEmail: venue.email,
    baseUrl,
    leadId: lead.id,
  }

  try {
    // Send the follow-up email
    const result = await sendEmail({
      to: lead.contact_email,
      from: process.env.RESEND_FROM_EMAIL || "noreply@VenueManager.com",
      subject: generateLeadFollowUpSubject(emailData),
      body: generateLeadFollowUpHTML(emailData),
    })

    if (!result.success) {
      return { success: false, error: result.error || "Email send failed" }
    }

    // Log the activity
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      activity_type: "email_sent",
      description: `Automated follow-up email sent to ${lead.contact_email}`,
      metadata: {
        type: "automated_follow_up",
        email: lead.contact_email,
        message_id: result.messageId,
      },
    })

    // Update lead status to "contacted" if still "new"
    if (lead.status === "new") {
      await supabase
        .from("leads")
        .update({ status: "contacted", updated_at: new Date().toISOString() })
        .eq("id", lead.id)
    }

    return { success: true }
  } catch (err) {
    console.error("Follow-up processing error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

/**
 * Process all pending follow-ups for a venue.
 * Call this from a cron job or scheduled function.
 */
export async function processAllFollowUps(
  supabase: any,
  venueId: string
): Promise<{ processed: number; errors: number }> {
  // Get venue details
  const { data: venue } = await supabase
    .from("venues")
    .select("name, phone, email")
    .eq("id", venueId)
    .single()

  if (!venue) return { processed: 0, errors: 0 }

  // Get AI settings for manager name
  const { data: aiSettings } = await supabase
    .from("venue_ai_settings")
    .select("manager_name")
    .eq("venue_id", venueId)
    .single()

  const leadsNeedingFollowUp = await getLeadsNeedingFollowUp(
    supabase,
    venueId
  )

  let processed = 0
  let errors = 0

  for (const { lead } of leadsNeedingFollowUp) {
    const result = await processFollowUp(
      supabase,
      lead,
      venue,
      aiSettings?.manager_name || null
    )

    if (result.success) {
      processed++
    } else {
      errors++
      console.error(
        `Follow-up failed for lead ${lead.id}:`,
        result.error
      )
    }
  }

  return { processed, errors }
}
