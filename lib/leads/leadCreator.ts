/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Automatic lead creation from AI chat conversations.
 * Determines when a conversation should trigger lead creation
 * and creates the lead with extracted data.
 */

import { createServiceRoleClient } from "@/lib/supabase/server"
import { priorityFromExtractedData } from "./priorityScoring"
import type { ExtractedEventData } from "@/lib/types/conversation.types"

interface ConversationContext {
  conversationId: string
  venueId: string
  messageCount: number
  extractedData: ExtractedEventData | null
  lastUserMessage: string
}

const QUOTE_KEYWORDS = [
  "quote",
  "proposal",
  "pricing",
  "how much",
  "cost",
  "price",
  "estimate",
  "rate",
  "budget",
]
const ESCALATE_KEYWORDS = ["speak to", "talk to", "manager", "call me", "contact me"]

export function shouldCreateLead(ctx: ConversationContext): boolean {
  const msg = ctx.lastUserMessage.toLowerCase()

  // User provides email
  if (ctx.extractedData?.contact_info?.email) return true

  // User requests proposal/quote
  if (QUOTE_KEYWORDS.some((kw) => msg.includes(kw))) return true

  // User wants to speak to manager
  if (ESCALATE_KEYWORDS.some((kw) => msg.includes(kw))) return true

  // Conversation reaches 5+ messages
  if (ctx.messageCount >= 5) return true

  // AI confidence score > 0.70
  if (
    ctx.extractedData?.confidence_score != null &&
    ctx.extractedData.confidence_score > 0.7
  ) {
    return true
  }

  return false
}

export async function createLeadFromConversation(
  ctx: ConversationContext
): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const { extractedData, conversationId, venueId, messageCount } = ctx

  // Prevent duplicates — check if lead already exists for this conversation
  const { data: existing } = await (supabase as any)
    .from("leads")
    .select("id")
    .eq("conversation_id", conversationId)
    .limit(1)

  if (existing && existing.length > 0) return existing[0].id

  const priority = priorityFromExtractedData(extractedData, messageCount)

  const guestCount =
    typeof extractedData?.guest_count === "number"
      ? extractedData.guest_count
      : typeof extractedData?.guest_count === "string"
        ? parseInt(extractedData.guest_count, 10) || null
        : null

  const { data: lead, error } = await (supabase as any)
    .from("leads")
    .insert({
      venue_id: venueId,
      source: "ai_chat",
      contact_name: extractedData?.contact_info?.name || null,
      contact_email: extractedData?.contact_info?.email || null,
      contact_phone: extractedData?.contact_info?.phone || null,
      company: extractedData?.contact_info?.company || null,
      event_type: extractedData?.event_type || null,
      event_date: extractedData?.date || null,
      date_is_flexible: extractedData?.date_flexibility === "flexible",
      guest_count: guestCount,
      estimated_budget: extractedData?.budget || null,
      requirements: extractedData?.requirements || null,
      status: "new",
      priority_score: priority,
      conversation_id: conversationId,
      ai_insights: {
        urgency: extractedData?.urgency || "medium",
        confidence: extractedData?.confidence_score || null,
        extracted_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single()

  if (error) {
    console.error("Failed to create lead from conversation:", error)
    return null
  }

  // Link conversation to lead
  await (supabase as any)
    .from("conversations")
    .update({ lead_id: lead.id })
    .eq("id", conversationId)

  // Log activity
  await (supabase as any).from("lead_activities").insert({
    lead_id: lead.id,
    activity_type: "created",
    description: "Lead auto-created from AI chat conversation.",
    metadata: { conversation_id: conversationId, message_count: messageCount },
  })

  return lead.id
}
