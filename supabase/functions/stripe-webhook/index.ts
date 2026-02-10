// Supabase Edge Function to receive Stripe webhooks
// Deploy with: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Stripe webhook signature verification using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(',')
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1]
    const v1Signature = parts.find(p => p.startsWith('v1='))?.split('=')[1]

    if (!timestamp || !v1Signature) {
      console.error('[Stripe Webhook] Missing timestamp or signature')
      return false
    }

    // Check timestamp to prevent replay attacks (5 minute tolerance)
    const timestampMs = parseInt(timestamp) * 1000
    const now = Date.now()
    if (Math.abs(now - timestampMs) > 300000) {
      console.error('[Stripe Webhook] Timestamp too old')
      return false
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    )
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return expectedSignature === v1Signature
  } catch (error) {
    console.error('[Stripe Webhook] Signature verification error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Stripe Webhook] Received request')
    console.log('[Stripe Webhook] Method:', req.method)

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get signature header
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header')
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the webhook payload
    const body = await req.text()
    console.log('[Stripe Webhook] Body length:', body.length)

    // Verify signature
    const isValid = await verifyStripeSignature(body, signature, webhookSecret)
    if (!isValid) {
      console.error('[Stripe Webhook] Invalid signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Stripe Webhook] Signature verified')

    const event = JSON.parse(body)
    console.log('[Stripe Webhook] Event type:', event.type)
    console.log('[Stripe Webhook] Event ID:', event.id)

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Stripe Webhook] Missing Supabase credentials')
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })

    // Process the event directly (or store for async processing)
    // For Stripe subscriptions, we want to process immediately
    await processStripeEvent(supabase, event)

    // Also store in webhook_events for audit/debugging
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: event.type,
        provider: 'stripe',
        payload: event,
        processed: true,
      })

    if (insertError) {
      console.error('[Stripe Webhook] Error inserting webhook event:', insertError)
      // Don't fail the request if just logging fails
    }

    console.log('[Stripe Webhook] Event processed successfully')

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error)
    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processStripeEvent(supabase: any, event: any) {
  const eventType = event.type
  const data = event.data.object

  console.log(`[Stripe Webhook] Processing ${eventType}`)

  switch (eventType) {
    case 'checkout.session.completed': {
      const session = data
      const userId = session.metadata?.user_id
      const planTier = session.metadata?.plan_tier
      const subscriptionId = session.subscription
      const customerId = session.customer

      if (!userId || !planTier) {
        console.log('[Stripe Webhook] Missing user_id or plan_tier in session metadata')
        break
      }

      // Fetch subscription details from metadata stored in session
      // Note: In edge function we don't have Stripe SDK, so we rely on metadata
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_tier: planTier,
          status: 'active',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (error) {
        console.error('[Stripe Webhook] Error upserting subscription:', error)
        throw error
      }

      console.log(`[Stripe Webhook] Subscription activated for user ${userId}: ${planTier}`)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = data
      const customerId = subscription.customer

      // Find user by Stripe customer ID
      const { data: existingSub, error: findError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (findError || !existingSub) {
        console.log('[Stripe Webhook] No subscription found for customer:', customerId)
        break
      }

      const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'past_due' ? 'past_due' :
        subscription.status === 'canceled' ? 'canceled' :
        subscription.status

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('[Stripe Webhook] Error updating subscription:', error)
        throw error
      }

      console.log(`[Stripe Webhook] Subscription updated for customer ${customerId}`)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = data
      const customerId = subscription.customer

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('[Stripe Webhook] Error deleting subscription:', error)
        throw error
      }

      console.log(`[Stripe Webhook] Subscription canceled for customer ${customerId}`)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = data
      const customerId = invoice.customer

      if (invoice.subscription) {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('[Stripe Webhook] Error updating subscription on payment success:', error)
        }

        console.log(`[Stripe Webhook] Payment succeeded for customer ${customerId}`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = data
      const customerId = invoice.customer

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('[Stripe Webhook] Error updating subscription on payment failure:', error)
      }

      console.log(`[Stripe Webhook] Payment failed for customer ${customerId}`)
      break
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`)
  }
}
