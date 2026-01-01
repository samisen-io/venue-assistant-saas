import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

/**
 * Resend Webhook Handler
 *
 * This endpoint receives webhook events from Resend for email delivery status.
 * Events include: email.sent, email.delivered, email.bounced, email.opened, email.clicked, etc.
 *
 * Documentation: https://resend.com/docs/dashboard/webhooks/introduction
 */

// Verify webhook signature from Resend
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Get the signature from headers
    const signature = request.headers.get('resend-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get the raw body
    const body = await request.text();

    // Verify the signature
    if (!verifySignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(body);

    console.log('Resend webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(event.data);
        break;

      case 'email.delivered':
        await handleEmailDelivered(event.data);
        break;

      case 'email.bounced':
        await handleEmailBounced(event.data);
        break;

      case 'email.opened':
        await handleEmailOpened(event.data);
        break;

      case 'email.clicked':
        await handleEmailClicked(event.data);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Event handlers
async function handleEmailSent(data: any) {
  console.log('Email sent:', data);
  const { to } = data;

  if (!to) return;

  try {
    const supabase = await createClient();

    // Update most recent outbound communication to this email
    await (supabase as any)
      .from('vendor_communications')
      .update({ status: 'sent' })
      .eq('to_email', to)
      .eq('direction', 'outbound')
      .is('status', null)
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (error) {
    console.error('Error updating sent status:', error);
  }
}

async function handleEmailDelivered(data: any) {
  console.log('Email delivered:', data);
  const { to } = data;

  if (!to) return;

  try {
    const supabase = await createClient();

    // Update communication status to delivered
    await (supabase as any)
      .from('vendor_communications')
      .update({ status: 'delivered' })
      .eq('to_email', to)
      .eq('direction', 'outbound')
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (error) {
    console.error('Error updating delivered status:', error);
  }
}

async function handleEmailBounced(data: any) {
  console.log('Email bounced:', data);
  const { to } = data;

  if (!to) return;

  try {
    const supabase = await createClient();

    // Update communication status to bounced
    await (supabase as any)
      .from('vendor_communications')
      .update({ status: 'bounced' })
      .eq('to_email', to)
      .eq('direction', 'outbound')
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (error) {
    console.error('Error updating bounced status:', error);
  }
}

async function handleEmailOpened(data: any) {
  console.log('Email opened:', data);
  const { to } = data;

  if (!to) return;

  try {
    const supabase = await createClient();

    // Update read_at timestamp for the most recent unread email
    await (supabase as any)
      .from('vendor_communications')
      .update({ read_at: new Date().toISOString() })
      .eq('to_email', to)
      .eq('direction', 'outbound')
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(1);
  } catch (error) {
    console.error('Error updating read status:', error);
  }
}

async function handleEmailClicked(data: any) {
  console.log('Email clicked:', data);
  // Optional: Track email engagement metrics
  // Could be used for vendor engagement scoring in the future
}
