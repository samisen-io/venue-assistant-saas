/**
 * Prompt template for drafting vendor outreach emails
 */

import { Event, Vendor } from '@/lib/types'

export interface EmailDraftingInput {
  vendor: Vendor
  event: Event
  venueName: string
  purpose: 'outreach' | 'followup' | 'confirmation' | 'inquiry'
  previousEmail?: string
}

export function buildVendorOutreachPrompt(input: EmailDraftingInput): string {
  const { vendor, event, venueName, purpose } = input

  if (purpose === 'outreach') {
    return buildInitialOutreachPrompt(input)
  } else if (purpose === 'followup') {
    return buildFollowUpPrompt(input)
  } else if (purpose === 'confirmation') {
    return buildConfirmationPrompt(input)
  } else {
    return buildInquiryPrompt(input)
  }
}

function buildInitialOutreachPrompt(input: EmailDraftingInput): string {
  const { vendor, event, venueName } = input

  return `You are an AI assistant helping to draft a professional email to a vendor for an event.

Write a professional, friendly, and concise email to reach out to ${vendor.name} (${vendor.category} vendor) for the following event:

**Event Details:**
- Event Name: ${event.event_name}
- Event Type: ${event.event_type}
- Date: ${event.event_date}
- Time: ${event.event_time || 'TBD'}
- Venue: ${venueName}
- Guest Count: ${event.guest_count}
- Budget: $${event.budget_total}
${event.description ? `- Description: ${event.description}` : ''}
${event.special_requirements ? `- Special Requirements: ${event.special_requirements}` : ''}

**Vendor Contact:**
- Name: ${vendor.contact_name || 'Team'}
- Company: ${vendor.name}

**Email Guidelines:**
1. Start with a friendly greeting using the vendor contact name if available
2. Introduce yourself as representing ${venueName}
3. Briefly describe the event and its key details
4. Ask about their availability for the date
5. Request a quote for their services
6. Mention the budget range to set expectations
7. Ask for a response within a reasonable timeframe (3-5 business days)
8. Close professionally with contact information for follow-up
9. Keep the tone professional yet personable
10. Keep the email concise (under 200 words)

**Important:**
- Do NOT include a subject line (that will be added separately)
- Do NOT include a signature block (that will be added automatically)
- Focus on the body content only
- Be specific about what services are needed based on the vendor category
- Express enthusiasm about potentially working together

Write ONLY the email body text. Do not include "Subject:" or any email headers.`
}

function buildFollowUpPrompt(input: EmailDraftingInput): string {
  const { vendor, event, previousEmail } = input

  return `You are an AI assistant helping to draft a follow-up email to a vendor who hasn't responded yet.

**Context:**
We sent an initial email to ${vendor.name} about the ${event.event_name} event on ${event.event_date}, but haven't received a response yet.

${previousEmail ? `**Previous Email:**\n${previousEmail}\n` : ''}

**Task:**
Write a polite, professional follow-up email that:

1. References the previous email sent
2. Politely reminds them about the event opportunity
3. Emphasizes the upcoming date and need for confirmation
4. Reiterates key event details briefly
5. Offers to answer any questions
6. Provides a clear call-to-action (response needed by specific date)
7. Maintains a friendly, non-pushy tone
8. Keeps it shorter than the original email (under 150 words)

**Important:**
- Do NOT include a subject line
- Do NOT include a signature block
- Write ONLY the email body text
- Express understanding that they may be busy
- Show continued interest in working with them

Write the follow-up email body:`
}

function buildConfirmationPrompt(input: EmailDraftingInput): string {
  const { vendor, event } = input

  return `You are an AI assistant helping to draft a confirmation email to a vendor whose quote has been approved.

**Event:** ${event.event_name} on ${event.event_date}
**Vendor:** ${vendor.name}

**Task:**
Write a professional confirmation email that:

1. Confirms we're moving forward with their services
2. Thanks them for their quote and responsiveness
3. Summarizes the key agreed-upon details
4. Asks for next steps (contract, deposit, etc.)
5. Provides contact information for any questions
6. Expresses excitement about working together
7. Keeps a warm, professional tone

**Important:**
- Do NOT include a subject line
- Do NOT include a signature block
- Write ONLY the email body text
- Keep it concise (under 150 words)

Write the confirmation email body:`
}

function buildInquiryPrompt(input: EmailDraftingInput): string {
  const { vendor, event } = input

  return `You are an AI assistant helping to draft a brief inquiry email to a vendor.

**Event:** ${event.event_name} on ${event.event_date}
**Vendor:** ${vendor.name} (${vendor.category})

**Task:**
Write a short, direct inquiry email that:

1. Briefly introduces the event
2. Asks if they provide services for this type of event
3. Requests basic pricing information
4. Asks about availability for the date
5. Keeps it very concise (under 100 words)

**Important:**
- Do NOT include a subject line
- Do NOT include a signature block
- Write ONLY the email body text
- Be direct and to the point

Write the inquiry email body:`
}

/**
 * Build subject line for vendor email
 */
export function buildEmailSubject(
  eventName: string,
  eventDate: string,
  purpose: 'outreach' | 'followup' | 'confirmation' | 'inquiry'
): string {
  const date = new Date(eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  switch (purpose) {
    case 'outreach':
      return `Quote Request: ${eventName} - ${date}`
    case 'followup':
      return `Follow-up: ${eventName} - ${date}`
    case 'confirmation':
      return `Confirmation: ${eventName} - ${date}`
    case 'inquiry':
      return `Inquiry: ${eventName} - ${date}`
    default:
      return `Event Inquiry: ${eventName}`
  }
}
