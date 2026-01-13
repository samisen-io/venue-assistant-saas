/**
 * Webhook Event Processor
 *
 * Processes webhook events from the database that were received via Supabase Edge Function
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

interface WebhookEvent {
  id: string;
  event_type: string;
  provider: string;
  payload: any;
  processed: boolean;
  vendor_communication_id?: string;
}

/**
 * Process unprocessed webhook events from the database
 * This can be called via:
 * 1. Cron job (every few minutes)
 * 2. Inngest function triggered by database changes
 * 3. Manual trigger from admin panel
 */
export async function processWebhookEvents() {
  console.log('[Webhook Processor] Starting to process webhook events');

  const supabase = createServiceRoleClient();

  // Fetch unprocessed webhook events
  const { data: events, error } = await (supabase as any)
    .from('webhook_events')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(50); // Process in batches

  if (error) {
    console.error('[Webhook Processor] Error fetching webhook events:', error);
    return { success: false, error: error.message };
  }

  if (!events || events.length === 0) {
    console.log('[Webhook Processor] No unprocessed events found');
    return { success: true, processed: 0 };
  }

  console.log(`[Webhook Processor] Found ${events.length} unprocessed events`);

  let processedCount = 0;
  let errorCount = 0;

  // Process each event
  for (const event of events) {
    try {
      await processWebhookEvent(event as WebhookEvent);

      // Mark as processed
      await (supabase as any)
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id);

      processedCount++;
    } catch (error) {
      console.error(`[Webhook Processor] Error processing event ${event.id}:`, error);

      // Mark with error
      await (supabase as any)
        .from('webhook_events')
        .update({
          processing_error: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', event.id);

      errorCount++;
    }
  }

  console.log(`[Webhook Processor] Completed: ${processedCount} processed, ${errorCount} errors`);

  return {
    success: true,
    processed: processedCount,
    errors: errorCount,
  };
}

/**
 * Process a single webhook event based on its type
 */
async function processWebhookEvent(event: WebhookEvent) {
  const { event_type, payload } = event;

  console.log(`[Webhook Processor] Processing ${event_type} event:`, event.id);

  switch (event_type) {
    case 'email.sent':
      await handleEmailSent(payload.data, event.id);
      break;

    case 'email.delivered':
      await handleEmailDelivered(payload.data, event.id);
      break;

    case 'email.bounced':
      await handleEmailBounced(payload.data, event.id);
      break;

    case 'email.opened':
      await handleEmailOpened(payload.data, event.id);
      break;

    case 'email.clicked':
      await handleEmailClicked(payload.data, event.id);
      break;

    case 'email.complained':
      await handleEmailComplained(payload.data, event.id);
      break;

    default:
      console.log(`[Webhook Processor] Unhandled event type: ${event_type}`);
  }
}

// Event handlers
async function handleEmailSent(data: any, eventId: string) {
  console.log('[Webhook Processor] Email sent:', data.to);
  const { to, email_id } = data;

  if (!to) return;

  const supabase = createServiceRoleClient();

  // Update most recent outbound communication to this email
  const { data: updated, error } = await (supabase as any)
    .from('vendor_communications')
    .update({
      status: 'sent',
      external_id: email_id, // Store Resend email ID for tracking
    })
    .eq('to_email', to)
    .eq('direction', 'outbound')
    .is('status', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .select('id');

  if (error) {
    console.error('[Webhook Processor] Error updating sent status:', error);
    throw error;
  }

  // Link webhook event to communication
  if (updated && updated.length > 0) {
    await (supabase as any)
      .from('webhook_events')
      .update({ vendor_communication_id: updated[0].id })
      .eq('id', eventId);
  }
}

async function handleEmailDelivered(data: any, eventId: string) {
  console.log('[Webhook Processor] Email delivered:', data.to);
  const { to } = data;

  if (!to) return;

  const supabase = createServiceRoleClient();

  const { data: updated, error } = await (supabase as any)
    .from('vendor_communications')
    .update({ status: 'delivered' })
    .eq('to_email', to)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .select('id');

  if (error) {
    console.error('[Webhook Processor] Error updating delivered status:', error);
    throw error;
  }

  if (updated && updated.length > 0) {
    await (supabase as any)
      .from('webhook_events')
      .update({ vendor_communication_id: updated[0].id })
      .eq('id', eventId);
  }
}

async function handleEmailBounced(data: any, eventId: string) {
  console.log('[Webhook Processor] Email bounced:', data.to);
  const { to } = data;

  if (!to) return;

  const supabase = createServiceRoleClient();

  const { data: updated, error } = await (supabase as any)
    .from('vendor_communications')
    .update({ status: 'bounced' })
    .eq('to_email', to)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .select('id');

  if (error) {
    console.error('[Webhook Processor] Error updating bounced status:', error);
    throw error;
  }

  if (updated && updated.length > 0) {
    await (supabase as any)
      .from('webhook_events')
      .update({ vendor_communication_id: updated[0].id })
      .eq('id', eventId);
  }
}

async function handleEmailOpened(data: any, eventId: string) {
  console.log('[Webhook Processor] Email opened:', data.to);
  const { to } = data;

  if (!to) return;

  const supabase = createServiceRoleClient();

  const { data: updated, error } = await (supabase as any)
    .from('vendor_communications')
    .update({ read_at: new Date().toISOString() })
    .eq('to_email', to)
    .eq('direction', 'outbound')
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .select('id');

  if (error) {
    console.error('[Webhook Processor] Error updating read status:', error);
    throw error;
  }

  if (updated && updated.length > 0) {
    await (supabase as any)
      .from('webhook_events')
      .update({ vendor_communication_id: updated[0].id })
      .eq('id', eventId);
  }
}

async function handleEmailClicked(data: any, eventId: string) {
  console.log('[Webhook Processor] Email clicked:', data.to);
  // Track engagement metrics
  // Could update vendor engagement scores in the future
}

async function handleEmailComplained(data: any, eventId: string) {
  console.log('[Webhook Processor] Email complaint received:', data.to);
  const { to } = data;

  if (!to) return;

  const supabase = createServiceRoleClient();

  // Mark communication as complained/spam
  const { data: updated, error } = await (supabase as any)
    .from('vendor_communications')
    .update({ status: 'complained' })
    .eq('to_email', to)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .select('id');

  if (error) {
    console.error('[Webhook Processor] Error updating complaint status:', error);
    throw error;
  }

  if (updated && updated.length > 0) {
    await (supabase as any)
      .from('webhook_events')
      .update({ vendor_communication_id: updated[0].id })
      .eq('id', eventId);
  }
}
