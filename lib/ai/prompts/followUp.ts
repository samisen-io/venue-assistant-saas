/**
 * Prompt template for generating follow-up emails
 */

import { VendorCommunication } from '@/lib/types'

export interface FollowUpInput {
  vendorName: string
  eventName: string
  eventDate: string
  vendorServices: string
  previousCommunications: VendorCommunication[]
  daysWithoutResponse: number
  reason: 'no_response' | 'incomplete_quote' | 'clarification_needed' | 'deadline_reminder'
  specificQuestions?: string[]
}

export function buildFollowUpPrompt(input: FollowUpInput): string {
  const { vendorName, eventName, eventDate, vendorServices, previousCommunications, daysWithoutResponse, reason, specificQuestions } = input

  const lastEmail = previousCommunications[previousCommunications.length - 1]

  let reasonContext = ''
  switch (reason) {
    case 'no_response':
      reasonContext = `We haven't received a response to our initial outreach sent ${daysWithoutResponse} days ago.`
      break
    case 'incomplete_quote':
      reasonContext = `The vendor responded but didn't provide complete pricing information.`
      break
    case 'clarification_needed':
      reasonContext = `We need clarification on some details from their previous response.`
      break
    case 'deadline_reminder':
      reasonContext = `The event date is approaching and we need confirmation soon.`
      break
  }

  return `You are an AI assistant drafting a follow-up email to a vendor.

**Context:**
- Vendor: ${vendorName} (${vendorServices})
- Event: ${eventName} on ${eventDate}
- Situation: ${reasonContext}
- Days since last contact: ${daysWithoutResponse}

${lastEmail ? `**Previous Email Sent:**\n${lastEmail.body}\n` : ''}

${specificQuestions && specificQuestions.length > 0 ? `**Specific Questions to Address:**\n${specificQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n` : ''}

**Task:**
Write a polite, professional follow-up email that:

1. **Maintains a friendly tone** - Don't sound pushy or demanding
2. **Shows understanding** - Acknowledge they may be busy
3. **Provides context** - Briefly reference previous communication
4. **Restates key needs** - What we're looking for (availability, quote, etc.)
5. **Creates urgency (gently)** - Mention the event date and planning timeline
${specificQuestions ? '6. **Asks specific questions** - Include the questions listed above\n' : ''}
6. **Offers alternatives** - Provide your phone number if email is inconvenient
7. **Sets a deadline** - Give a specific date by which we need a response
8. **Keeps it concise** - Under 150 words

**Tone Guidelines:**
- Professional but warm
- Patient yet clear about needing a response
- Express continued interest in working with them
- Make it easy for them to respond with a simple yes/no or quote

**Important:**
- Do NOT include a subject line (will be added separately)
- Do NOT include a signature block (will be added automatically)
- Write ONLY the email body text
- Do NOT sound desperate or apologetic for following up
- Make the email easy to scan with short paragraphs

Write the follow-up email body:`
}

/**
 * Determine if a follow-up is needed based on communication history
 */
export function shouldSendFollowUp(
  communications: VendorCommunication[],
  maxDaysWithoutResponse: number = 3
): { shouldFollowUp: boolean; reason: string; daysWaiting: number } {
  if (communications.length === 0) {
    return { shouldFollowUp: false, reason: 'No communications yet', daysWaiting: 0 }
  }

  // Get the last outbound and inbound communications
  const outboundComms = communications.filter(c => c.direction === 'outbound')
  const inboundComms = communications.filter(c => c.direction === 'inbound')

  if (outboundComms.length === 0) {
    return { shouldFollowUp: false, reason: 'No outbound communications', daysWaiting: 0 }
  }

  const lastOutbound = outboundComms[outboundComms.length - 1]
  const lastInbound = inboundComms.length > 0 ? inboundComms[inboundComms.length - 1] : null

  // If vendor has responded since our last message, don't follow up yet
  if (lastInbound && new Date(lastInbound.sent_at || lastInbound.created_at!) > new Date(lastOutbound.sent_at || lastOutbound.created_at!)) {
    return { shouldFollowUp: false, reason: 'Vendor has responded', daysWaiting: 0 }
  }

  // Calculate days since last outbound
  const lastOutboundDate = new Date(lastOutbound.sent_at || lastOutbound.created_at!)
  const now = new Date()
  const daysWaiting = Math.floor((now.getTime() - lastOutboundDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysWaiting >= maxDaysWithoutResponse) {
    return {
      shouldFollowUp: true,
      reason: 'No response after waiting period',
      daysWaiting,
    }
  }

  return { shouldFollowUp: false, reason: 'Within waiting period', daysWaiting }
}

/**
 * Calculate optimal follow-up timing
 */
export function getFollowUpTiming(attemptNumber: number): number {
  // Return days to wait before follow-up based on attempt number
  switch (attemptNumber) {
    case 1:
      return 3 // Wait 3 days after initial contact
    case 2:
      return 5 // Wait 5 days after first follow-up
    case 3:
      return 7 // Wait 7 days after second follow-up
    default:
      return 7 // Default to 7 days
  }
}
