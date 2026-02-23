# AI Agent & Webhook Setup Guide

This guide covers the full setup for the AI-powered vendor outreach agent, including Resend email service, webhooks, and background job processing.

---

## Prerequisites

- Vercel deployment configured
- Supabase project with database tables and RLS policies
- Resend account ([resend.com](https://resend.com))
- Anthropic API key for Claude

---

## 1. Resend Email Service

### A. Get Your API Key

1. Log into [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key" (Full Access recommended)
3. Copy the key immediately
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   ```

### B. Domain Verification (Recommended for Production)

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add your domain (e.g., `venuemanager.pro`)
3. Add the required DNS records to your domain registrar
4. Wait for verification
5. Update `.env.local`:
   ```
   RESEND_FROM_EMAIL=assistant@venuemanager.pro
   RESEND_FROM_NAME="Venue Manager AI"
   ```

For development/testing, use Resend's test domain:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=VenueManager Test
```

### C. Configure Inbound Email Routing

1. Go to [resend.com/inbound](https://resend.com/inbound)
2. Click "Add Inbound Route"
3. Configure:
   - **Email Address**: `assistant@venuemanager.pro`
   - **Forward to URL**: `https://your-domain.vercel.app/api/webhooks/email/inbound`
4. Enable the route

---

## 2. Webhook Setup

### Architecture

```
Resend → Supabase Edge Function → Database (webhook_events table) → Cron Job → AI Agent Processor
```

Resend webhooks go through a Supabase Edge Function rather than directly to Vercel, using the database as a reliable queue.

### A. Configure Resend Webhooks

1. Go to [resend.com/webhooks](https://resend.com/webhooks)
2. Click "Add Webhook"
3. Enter your Supabase function URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/resend-webhook
   ```
4. Select events:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.opened` (optional)
   - `email.clicked` (optional)
   - `email.complained` (optional)
5. Copy the webhook secret
6. Add to `.env.local`:
   ```
   RESEND_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### B. Deploy Supabase Edge Function

```bash
supabase login
supabase link --project-ref your-project-ref
supabase secrets set RESEND_WEBHOOK_SECRET=your-webhook-secret-here
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase functions deploy resend-webhook
```

### C. Local Development (ngrok)

For testing webhooks locally:

1. Start your dev server: `npm run dev`
2. In another terminal: `ngrok http 3000`
3. Use the ngrok HTTPS URL as your webhook endpoint

---

## 3. Background Job Processing

### Option A: Inngest Cloud (Recommended)

1. Sign up at [inngest.com](https://www.inngest.com/)
2. Create a new app
3. Get your signing key
4. Add to environment variables:
   ```
   INNGEST_SIGNING_KEY=your_signing_key_here
   ```
5. Sync functions from: `https://your-domain.vercel.app/api/inngest`

### Option B: Vercel Cron Only

The cron job is configured in `vercel.json` to process webhook events every 5 minutes. No additional setup needed.

---

## 4. Environment Variables

### Vercel / `.env.local`

```bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# AI - Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# Email - Resend
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...
RESEND_FROM_EMAIL=assistant@venuemanager.pro
RESEND_FROM_NAME="Venue Manager AI"

# Security
CRON_SECRET=<generate-a-random-secret>

# Optional - Inngest
INNGEST_SIGNING_KEY=<your-inngest-signing-key>

# Agent Configuration
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT_HOURS=72
AGENT_FOLLOWUP_DELAY_HOURS=24
ENABLE_AGENT_AUTO_APPROVAL=false

# Feature Flags
ENABLE_NL_EVENT_CREATION=true
ENABLE_AI_AGENT=true
ENABLE_REAL_TIME_UPDATES=false
```

To generate a secure CRON_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Supabase Secrets (for Edge Function)

```bash
RESEND_WEBHOOK_SECRET=your-resend-webhook-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 5. Testing

### Test the AI Agent via UI

1. Navigate to an event: `/dashboard/events/[eventId]`
2. Click "AI Agent" tab
3. Select vendors to contact
4. Click "Start Agent"

### Test Webhook Pipeline

```bash
# Test Supabase edge function
curl -X POST https://your-project-ref.supabase.co/functions/v1/resend-webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "email.sent", "data": {"to": "test@example.com", "email_id": "test-123"}}'

# Check database for events
# In Supabase SQL Editor:
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;

# Manually trigger processing
curl https://your-domain.vercel.app/api/cron/process-webhooks \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Inbound Email

Send a test email to your configured inbound address. The system should:
1. Receive the email via webhook
2. Match it to the vendor by email
3. Extract the quote
4. Save it to the database

---

## 6. Monitoring

### Supabase Function Logs
Supabase Dashboard → Edge Functions → resend-webhook → Logs

### Database Monitoring
```sql
-- Unprocessed webhook events
SELECT COUNT(*) FROM webhook_events WHERE processed = false;

-- Recent events
SELECT event_type, processed, created_at, processing_error
FROM webhook_events ORDER BY created_at DESC LIMIT 20;

-- Active agent runs
SELECT * FROM agent_runs WHERE status = 'running';

-- Recent communications
SELECT * FROM vendor_communications ORDER BY created_at DESC LIMIT 10;
```

### Vercel Logs
```bash
vercel logs --follow
```

---

## 7. Troubleshooting

### Emails Not Sending
- Verify Resend API key is valid
- Check domain is verified (or use test domain)
- Check Vercel logs for errors

### Webhooks Not Arriving
- Check Supabase function logs for errors
- Verify `RESEND_WEBHOOK_SECRET` is set correctly
- Check Resend dashboard for delivery attempts
- Ensure endpoint URL is publicly accessible (HTTPS required)

### Vendor Replies Not Processing
- Verify inbound email route is configured
- Check webhook endpoint: `/api/webhooks/email/inbound`
- Ensure vendor email matches a vendor in the database

### Quotes Not Being Extracted
- Ensure Anthropic API key is valid
- Check Claude API quota/limits
- Review agent logs in the UI

### Cron Jobs Not Running
- Verify `vercel.json` is in the repository root
- Check Vercel project settings → Cron Jobs
- Ensure `CRON_SECRET` is set

---

## Security Notes

- Never commit `.env.local` to git
- Rotate API keys regularly
- Always verify webhook signatures before processing
- Use strong `CRON_SECRET` in production
- Monitor webhook endpoints for abuse
- Different keys for development and production

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Webhooks Guide](https://resend.com/docs/dashboard/webhooks/introduction)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
