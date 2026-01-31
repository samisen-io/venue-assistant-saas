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
import type { VendorOutreachStatus } from '@/lib/types/vendor-outreach.types'

/**
 * Vendor Communicator
 * Handles drafting and sending emails to vendors
 */

export interface VendorOutreachInput {
  vendor: Vendor
  event: Event
  venueName: string
  agentRunId?: string
  eventVendorId?: string // Link to event_vendors record
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

    const now = new Date().toISOString()

    // Save communication record
    console.log('📧 Saving communication record to database...')
    const { data: communication, error: dbError } = await (supabase as any)
      .from('vendor_communications')
      .insert({
        agent_run_id: input.agentRunId || null,
        event_id: input.event.id,
        vendor_id: input.vendor.id,
        event_vendor_id: input.eventVendorId || null,
        direction: 'outbound',
        subject: emailDraft.subject,
        body: emailBody,
        from_email: emailDraft.from,
        to_email: emailDraft.to,
        sent_at: now,
        status: 'sent',
        processed: true,
        requires_followup: true, // AI contacts should track for follow-up
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error saving communication record:', dbError)
    } else {
      console.log('✅ Communication record saved with ID:', communication?.id)
    }

    // Update event_vendors outreach status to 'contacted'
    if (input.eventVendorId) {
      console.log('📧 Updating event_vendors outreach status to contacted...')
      const { error: statusError } = await (supabase as any)
        .from('event_vendors')
        .update({
          outreach_status: 'contacted' as VendorOutreachStatus,
          status_updated_at: now,
          contacted_at: now,
          status_notes: 'Contacted via AI agent'
        })
        .eq('id', input.eventVendorId)

      if (statusError) {
        console.error('❌ Error updating outreach status:', statusError)
      } else {
        console.log('✅ Outreach status updated to contacted')
      }
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
    eventVendorId?: string
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
        event_vendor_id: input.eventVendorId || null,
        thread_id: threadId || null,
        direction: 'outbound',
        subject: emailDraft.subject,
        body: emailBody,
        from_email: emailDraft.from,
        to_email: emailDraft.to,
        sent_at: new Date().toISOString(),
        status: 'sent',
        processed: true,
        requires_followup: true,
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
    eventVendorId?: string
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

    const now = new Date().toISOString()

    // Save communication record
    const { data: communication, error: dbError } = await (supabase as any)
      .from('vendor_communications')
      .insert({
        event_id: input.event.id,
        vendor_id: input.vendor.id,
        event_vendor_id: input.eventVendorId || null,
        direction: 'outbound',
        subject: emailDraft.subject,
        body: emailBody,
        from_email: emailDraft.from,
        to_email: emailDraft.to,
        sent_at: now,
        status: 'sent',
        processed: true,
        requires_followup: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving confirmation communication record:', dbError)
    }

    // Update event_vendors status to 'confirmed'
    if (input.eventVendorId) {
      const { error: statusError } = await (supabase as any)
        .from('event_vendors')
        .update({
          outreach_status: 'confirmed' as VendorOutreachStatus,
          status_updated_at: now,
          confirmed: true,
          confirmed_at: now,
          status_notes: 'Confirmed via AI agent'
        })
        .eq('id', input.eventVendorId)

      if (statusError) {
        console.error('Error updating outreach status to confirmed:', statusError)
      }
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

/**
 * Update event vendor status based on vendor response
 */
export async function updateVendorOutreachStatus(
  eventVendorId: string,
  newStatus: VendorOutreachStatus,
  options?: {
    quotedCost?: number
    notes?: string
  },
  supabaseClient?: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = supabaseClient || await createClient()

  try {
    const now = new Date().toISOString()
    const updateData: any = {
      outreach_status: newStatus,
      status_updated_at: now,
    }

    // Add vendor_response_at for response statuses
    if (['available', 'not_available', 'needs_attention'].includes(newStatus)) {
      updateData.vendor_response_at = now
    }

    // Add confirmed fields for confirmed status
    if (newStatus === 'confirmed') {
      updateData.confirmed = true
      updateData.confirmed_at = now
    }

    // Add quoted cost if provided
    if (options?.quotedCost !== undefined) {
      updateData.quoted_cost = options.quotedCost
    }

    // Add notes if provided
    if (options?.notes) {
      updateData.status_notes = options.notes
    }

    const { error } = await (supabase as any)
      .from('event_vendors')
      .update(updateData)
      .eq('id', eventVendorId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error updating vendor outreach status:', error)
    return {
      success: false,
      error: error.message || 'Failed to update vendor status'
    }
  }
}
