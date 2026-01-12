// Supabase Edge Function to receive Resend webhooks
// Deploy with: supabase functions deploy resend-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, resend-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Resend Webhook] Received request')
    console.log('[Resend Webhook] Method:', req.method)
    console.log('[Resend Webhook] Headers:', Object.fromEntries(req.headers))

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify signature (if Resend sends one)
    const signature = req.headers.get('resend-signature')
    if (signature) {
      console.log('[Resend Webhook] Signature present:', signature.substring(0, 20) + '...')
      // TODO: Implement signature verification if needed
      // For now, we'll accept it if the secret is configured
    }

    // Parse the webhook payload
    const body = await req.text()
    console.log('[Resend Webhook] Body length:', body.length)

    const event = JSON.parse(body)
    console.log('[Resend Webhook] Event type:', event.type)
    console.log('[Resend Webhook] Event data:', JSON.stringify(event.data).substring(0, 200))

    // Create Supabase client with service role key
    // In Supabase Edge Functions, use the request to get the proper auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('[Resend Webhook] Supabase URL present:', !!supabaseUrl)
    console.log('[Resend Webhook] Service key present:', !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Resend Webhook] Missing Supabase credentials')
      console.error('[Resend Webhook] URL:', supabaseUrl ? 'present' : 'MISSING')
      console.error('[Resend Webhook] Key:', supabaseServiceKey ? 'present' : 'MISSING')
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

    // Insert webhook event into database for async processing
    const { data: insertedEvent, error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: event.type,
        provider: 'resend',
        payload: event,
        processed: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Resend Webhook] Error inserting webhook event:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to store webhook event', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Resend Webhook] Event stored successfully:', insertedEvent.id)

    // Return success response
    return new Response(
      JSON.stringify({
        received: true,
        event_id: insertedEvent.id,
        message: 'Webhook received and queued for processing'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error)
    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
