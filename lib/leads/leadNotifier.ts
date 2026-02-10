/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Sends notification emails when a new lead is created.
 */

import { sendEmail } from "@/lib/email/resend"
import {
  generateLeadAlertSubject,
  generateLeadAlertHTML,
  type LeadAlertData,
} from "@/lib/email/templates/leadAlert"
import {
  generateProspectConfirmationSubject,
  generateProspectConfirmationHTML,
  type ProspectConfirmationData,
} from "@/lib/email/templates/prospectConfirmation"

interface NotifyManagerInput {
  leadId: string
  contactName: string | null
  contactEmail: string | null
  eventType: string | null
  eventDate: string | null
  guestCount: number | null
  estimatedBudget: number | null
  priorityScore: number
  source: string
  venueName: string
  managerEmail: string
}

export async function notifyVenueManager(input: NotifyManagerInput) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const data: LeadAlertData = {
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    eventType: input.eventType,
    eventDate: input.eventDate,
    guestCount: input.guestCount,
    estimatedBudget: input.estimatedBudget,
    priorityScore: input.priorityScore,
    source: input.source,
    leadId: input.leadId,
    venueName: input.venueName,
    baseUrl,
  }

  try {
    await sendEmail({
      to: input.managerEmail,
      from: process.env.RESEND_FROM_EMAIL || "noreply@VenueManager.com",
      subject: generateLeadAlertSubject(data),
      body: generateLeadAlertHTML(data),
    })
  } catch (err) {
    console.error("Failed to notify manager:", err)
  }
}

export async function sendProspectConfirmation(input: {
  prospectEmail: string
  prospectName: string | null
  venueName: string
  eventType: string | null
  eventDate: string | null
  referenceId: string
}) {
  const data: ProspectConfirmationData = {
    prospectName: input.prospectName,
    venueName: input.venueName,
    eventType: input.eventType,
    eventDate: input.eventDate,
    referenceId: input.referenceId,
  }

  try {
    await sendEmail({
      to: input.prospectEmail,
      from: process.env.RESEND_FROM_EMAIL || "noreply@VenueManager.com",
      subject: generateProspectConfirmationSubject(data),
      body: generateProspectConfirmationHTML(data),
    })
  } catch (err) {
    console.error("Failed to send prospect confirmation:", err)
  }
}
