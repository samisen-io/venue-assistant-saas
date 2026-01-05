import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseEmail } from '@/lib/email/parser'
import { inngest } from '@/lib/inngest/client'

/**
 * Inbound Email Webhook Handler
 *
 * This endpoint receives inbound emails forwarded from Resend.
 * It processes vendor replies and triggers quote extraction.
 *
 * Documentation: https://resend.com/docs/api-reference/emails/receive-email
 */

export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const payload = await request.json()

    console.log('Inbound email received:', {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
    })

    // Parse the email
    const parsedEmail = parseEmail(payload)

    // Extract vendor email from the 'from' field (handle string or object)
    const vendorEmail = typeof parsedEmail.from === 'string'
      ? parsedEmail.from
      : (parsedEmail.from as any)?.email || parsedEmail.from

    // Find the vendor by email
    const supabase = await createClient()
    const { data: vendor, error: vendorError } = await (supabase as any)
      .from('vendors')
      .select('*')
      .eq('contact_email', vendorEmail)
      .single()

    if (vendorError || !vendor) {
      console.log('Vendor not found for email:', vendorEmail)
      // Still save as unmatched communication for manual review
      await saveUnmatchedCommunication(payload)
      return NextResponse.json({
        received: true,
        message: 'Email saved as unmatched communication'
      })
    }

    // Find the most recent outbound communication to this vendor
    // to determine which event this is related to
    const { data: recentComm } = await (supabase as any)
      .from('vendor_communications')
      .select('event_id, thread_id')
      .eq('vendor_id', vendor.id)
      .eq('direction', 'outbound')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    if (!recentComm) {
      console.log('No previous outbound communication found for vendor:', vendor.id)
      await saveUnmatchedCommunication(payload, vendor.id)
      return NextResponse.json({
        received: true,
        message: 'Email saved as unmatched communication'
      })
    }

    // Save the inbound communication
    const { data: communication, error: commError } = await (supabase as any)
      .from('vendor_communications')
      .insert({
        event_id: recentComm.event_id,
        vendor_id: vendor.id,
        thread_id: recentComm.thread_id || null,
        direction: 'inbound',
        subject: parsedEmail.subject,
        body: parsedEmail.body,
        from_email: vendorEmail,
        to_email: typeof parsedEmail.to === 'string' ? parsedEmail.to : parsedEmail.to,
        received_at: new Date().toISOString(),
        status: 'received',
        processed: false,
        requires_followup: false,
      })
      .select()
      .single()

    if (commError) {
      console.error('Error saving inbound communication:', commError)
      return NextResponse.json(
        { error: 'Failed to save communication' },
        { status: 500 }
      )
    }

    console.log('Inbound communication saved:', communication.id)

    // Find the agent run for this event (if any)
    const { data: agentRun } = await (supabase as any)
      .from('agent_runs')
      .select('id')
      .eq('event_id', recentComm.event_id)
      .in('status', ['running', 'pending'])
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    // Trigger quote extraction via Inngest (asynchronous background processing)
    if (agentRun) {
      await inngest.send({
        name: 'vendor/reply.received',
        data: {
          agentRunId: agentRun.id,
          communicationId: communication.id,
          vendorId: vendor.id,
          eventId: recentComm.event_id,
        },
      })
    }

    return NextResponse.json({
      received: true,
      communicationId: communication.id,
    })
  } catch (error: any) {
    console.error('Error processing inbound email:', error)
    return NextResponse.json(
      { error: 'Failed to process email', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Save unmatched communications for manual review
 */
async function saveUnmatchedCommunication(
  payload: any,
  vendorId?: string
): Promise<void> {
  const supabase = await createClient()

  try {
    await (supabase as any)
      .from('vendor_communications')
      .insert({
        vendor_id: vendorId || null,
        event_id: null,
        direction: 'inbound',
        subject: payload.subject || 'No subject',
        body: payload.text || payload.html || '',
        from_email: payload.from,
        to_email: payload.to,
        received_at: new Date().toISOString(),
        status: 'received',
        processed: false,
        requires_followup: true, // Flag for manual review
      })
  } catch (error) {
    console.error('Error saving unmatched communication:', error)
  }
}
