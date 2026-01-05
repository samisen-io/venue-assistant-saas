import { createClient } from '@/lib/supabase/server'
import { Event, Vendor, VendorCommunication } from '@/lib/types'
import { askClaude } from '@/lib/ai/claude'
import { sendEmail } from '@/lib/email/resend'
import {
  buildVendorOutreachPrompt,
  buildEmailSubject,
} from '@/lib/ai/prompts/emailDrafting'
import { buildFollowUpPrompt } from '@/lib/ai/prompts/followUp'
import { EmailDraft, EmailSendResult } from '@/lib/types/communication.types'

/**
 * Vendor Communicator
 * Handles drafting and sending emails to vendors
 */

export interface VendorOutreachInput {
  vendor: Vendor
  event: Event
  venueName: string
  agentRunId?: string
}

export interface VendorOutreachResult {
  success: boolean
  communicationId?: string
  messageId?: string
  error?: string
}

/**
 * Draft an outreach email to a vendor
 */
export async function draftOutreachEmail(input: VendorOutreachInput): Promise<string> {
  try {
    console.log('🤖 Drafting email with Claude AI...')
    const prompt = buildVendorOutreachPrompt({
      vendor: input.vendor,
      event: input.event,
      venueName: input.venueName,
      purpose: 'outreach',
    })

    console.log('🤖 Sending prompt to Claude API...')
    const emailBody = await askClaude(prompt, {
      systemPrompt: 'You are a professional event coordinator drafting vendor outreach emails.',
      maxTokens: 1024,
      temperature: 0.7,
    })

    console.log('🤖 Email drafted successfully, length:', emailBody.length)
    return emailBody.trim()
  } catch (error: any) {
    console.error('❌ Error drafting outreach email:', {
      message: error.message,
      stack: error.stack,
      vendor: input.vendor.name,
      event: input.event.event_name
    })
    throw new Error(`Failed to draft email: ${error.message}`)
  }
}

/**
 * Send outreach email to a vendor
 */
export async function sendVendorOutreach(
  input: VendorOutreachInput,
  supabaseClient?: any
): Promise<VendorOutreachResult> {
  const supabase = supabaseClient || await createClient()

  try {
    console.log('📧 sendVendorOutreach - Starting for vendor:', input.vendor.name)
    console.log('📧 Agent Run ID:', input.agentRunId)

    // Draft the email body
    const emailBody = await draftOutreachEmail(input)
    console.log('📧 Email body drafted, length:', emailBody.length)

    // Create email draft
    const emailDraft: EmailDraft = {
      to: input.vendor.contact_email,
      from: process.env.RESEND_FROM_EMAIL || 'noreply@VenueManager.com',
      subject: buildEmailSubject(input.event.event_name, input.event.event_date, 'outreach'),
      body: emailBody,
      metadata: {
        eventId: input.event.id,
        vendorId: input.vendor.id,
        purpose: 'outreach',
      },
    }

    // Send the email
    console.log('📧 Sending email to:', emailDraft.to)
    const sendResult = await sendEmail(emailDraft)
    console.log('📧 Email send result:', sendResult.success ? 'SUCCESS' : 'FAILED', sendResult.error || '')

    if (!sendResult.success) {
      console.error('📧 Failed to send email:', sendResult.error)
      return {
        success: false,
        error: sendResult.error,
      }
    }

    // Save communication record
    console.log('📧 Saving communication record to database...')
    const { data: communication, error: dbError } = await (supabase as any)
      .from('vendor_communications')
      .insert({
        agent_run_id: input.agentRunId || null,
        event_id: input.event.id,
        vendor_id: input.vendor.id,
        direction: 'outbound',
        subject: emailDraft.subject,
        body: emailBody,
        from_email: emailDraft.from,
        to_email: emailDraft.to,
        sent_at: new Date().toISOString(),
        status: 'sent',
        processed: true,
        requires_followup: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error saving communication record:', dbError)
    } else {
      console.log('✅ Communication record saved with ID:', communication?.id)
    }

    return {
      success: true,
      communicationId: communication?.id,
      messageId: sendResult.messageId,
    }
  } catch (error: any) {
    console.error('❌ Error sending vendor outreach:', error)
    return {
      success: false,
      error: error.message || 'Failed to send outreach email',
    }
  }
}

/**
 * Draft a follow-up email
 */
export async function draftFollowUpEmail(input: {
  vendor: Vendor
  event: Event
  venueName: string
  previousCommunications: VendorCommunication[]
  reason?: 'no_response' | 'incomplete_quote' | 'clarification_needed' | 'deadline_reminder'
  specificQuestions?: string[]
}): Promise<string> {
  try {
    const { vendor, event, previousCommunications, reason = 'no_response', specificQuestions } = input

    // Calculate days without response
    const lastOutbound = previousCommunications
      .filter(c => c.direction === 'outbound')
      .sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]

    const daysWithoutResponse = lastOutbound
      ? Math.floor((Date.now() - new Date(lastOutbound.sent_at!).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const vendorServices = ((vendor as any).vendor_services || [])
      .map((service: any) => service.event_services?.name)
      .filter(Boolean)
      .join(', ') || 'their services'

    const prompt = buildFollowUpPrompt({
      vendorName: vendor.name,
      eventName: event.event_name,
      eventDate: event.event_date,
      vendorServices,
      previousCommunications,
      daysWithoutResponse,
      reason,
      specificQuestions,
    })

    const emailBody = await askClaude(prompt, {
      systemPrompt: 'You are a professional event coordinator drafting follow-up emails to vendors.',
      maxTokens: 800,
      temperature: 0.7,
    })

    return emailBody.trim()
  } catch (error: any) {
    console.error('Error drafting follow-up email:', error)
    throw new Error(`Failed to draft follow-up email: ${error.message}`)
  }
}

/**
 * Send follow-up email to a vendor
 */
export async function sendFollowUpEmail(
  input: {
    vendor: Vendor
    event: Event
    venueName: string
    previousCommunications: VendorCommunication[]
    agentRunId?: string
    reason?: 'no_response' | 'incomplete_quote' | 'clarification_needed' | 'deadline_reminder'
    specificQuestions?: string[]
  },
  supabaseClient?: any
): Promise<VendorOutreachResult> {
  const supabase = supabaseClient || await createClient()

  try {
    // Draft the follow-up email
    const emailBody = await draftFollowUpEmail(input)

    // Get thread ID from previous communications
    const threadId = input.previousCommunications.find(c => c.thread_id)?.thread_id ?? undefined

    // Create email draft
    const emailDraft: EmailDraft = {
      to: input.vendor.contact_email,
      from: process.env.RESEND_FROM_EMAIL || 'noreply@VenueManager.com',
      subject: buildEmailSubject(input.event.event_name, input.event.event_date, 'followup'),
      body: emailBody,
      threadId,
      metadata: {
        eventId: input.event.id,
        vendorId: input.vendor.id,
        purpose: 'followup',
      },
    }

    // Send the email
    const sendResult = await sendEmail(emailDraft)

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error,
      }
    }

    // Save communication record
    const { data: communication, error: dbError } = await (supabase as any)
      .from('vendor_communications')
      .insert({
        agent_run_id: input.agentRunId || null,
        event_id: input.event.id,
        vendor_id: input.vendor.id,
        thread_id: threadId || null,
        direction: 'outbound',
        subject: emailDraft.subject,
        body: emailBody,
        from_email: emailDraft.from,
        to_email: emailDraft.to,
        sent_at: new Date().toISOString(),
        status: 'sent',
        processed: true,
        requires_followup: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving follow-up communication record:', dbError)
    }

    return {
      success: true,
      communicationId: communication?.id,
      messageId: sendResult.messageId,
    }
  } catch (error: any) {
    console.error('Error sending follow-up email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send follow-up email',
    }
  }
}

/**
 * Send confirmation email to a vendor (after quote approval)
 */
export async function sendConfirmationEmail(
  input: {
    vendor: Vendor
    event: Event
    venueName: string
    quoteDetails: {
      totalCost: number
      approvedAt: string
    }
  },
  supabaseClient?: any
): Promise<VendorOutreachResult> {
  const supabase = supabaseClient || await createClient()

  try {
    const prompt = buildVendorOutreachPrompt({
      vendor: input.vendor,
      event: input.event,
      venueName: input.venueName,
      purpose: 'confirmation',
    })

    const emailBody = await askClaude(prompt, {
      systemPrompt: 'You are a professional event coordinator confirming vendor bookings.',
      maxTokens: 800,
      temperature: 0.7,
    })

    // Create email draft
    const emailDraft: EmailDraft = {
      to: input.vendor.contact_email,
      from: process.env.RESEND_FROM_EMAIL || 'noreply@VenueManager.com',
      subject: buildEmailSubject(input.event.event_name, input.event.event_date, 'confirmation'),
      body: emailBody,
      metadata: {
        eventId: input.event.id,
        vendorId: input.vendor.id,
        purpose: 'confirmation',
      },
    }

    // Send the email
    const sendResult = await sendEmail(emailDraft)

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error,
      }
    }

    // Save communication record
    const { data: communication, error: dbError } = await (supabase as any)
      .from('vendor_communications')
      .insert({
        event_id: input.event.id,
        vendor_id: input.vendor.id,
        direction: 'outbound',
        subject: emailDraft.subject,
        body: emailBody,
        from_email: emailDraft.from,
        to_email: emailDraft.to,
        sent_at: new Date().toISOString(),
        status: 'sent',
        processed: true,
        requires_followup: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving confirmation communication record:', dbError)
    }

    return {
      success: true,
      communicationId: communication?.id,
      messageId: sendResult.messageId,
    }
  } catch (error: any) {
    console.error('Error sending confirmation email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send confirmation email',
    }
  }
}
