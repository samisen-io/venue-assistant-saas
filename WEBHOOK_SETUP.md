# Webhook Setup Guide

This guide explains how to set up the Supabase → Database → Agent architecture for processing Resend webhooks.

## Architecture Overview

```
Resend → Supabase Edge Function → Database (webhook_events table) → Cron Job → AI Agent Processor
```

**Why this approach?**
- Resend webhooks couldn't reach Vercel due to middleware redirect issues
- Supabase Edge Functions are publicly accessible and lightweight
- Database acts as a reliable queue for webhook events
- AI agent can process events asynchronously on its own schedule

## Setup Steps

### 1. Deploy Database Migration

Run the migration to create the `webhook_events` table:

```bash
# If using Supabase CLI locally
supabase migration up

# Or apply manually in Supabase Dashboard → SQL Editor
# Copy contents from: supabase/migrations/create_webhook_events_table.sql
```

### 2. Deploy Supabase Edge Function

**Important**: The `supabase/config.toml` file is already configured to allow public access to the webhook endpoint (`verify_jwt = false`). This is required for external webhooks.

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set environment secrets
supabase secrets set RESEND_WEBHOOK_SECRET=your-webhook-secret-here

# Optional: If you get "Missing Supabase configuration" errors in logs, set these:
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy the function (this will use the config.toml settings)
supabase functions deploy resend-webhook
```

After deployment, you'll get a URL like:
```
https://your-project-ref.supabase.co/functions/v1/resend-webhook
```

### 3. Configure Resend Webhook

1. Go to Resend Dashboard: https://resend.com/webhooks
2. Click "Add Endpoint"
3. Enter your Supabase function URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/resend-webhook
   ```
4. Select events to track:
   - ✅ email.sent
   - ✅ email.delivered
   - ✅ email.bounced
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.complained

5. Copy the webhook secret and update your Supabase secrets (done in step 2)

### 4. Deploy Vercel Cron Job

The cron job is already configured in `vercel.json` to run every 5 minutes.

When you deploy to Vercel, it will automatically:
- Call `/api/cron/process-webhooks` every 5 minutes
- Process unprocessed webhook events from the database
- Update vendor communication statuses

### 5. Test the Setup

**Test the Supabase function:**
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/resend-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.sent",
    "data": {
      "to": "test@example.com",
      "email_id": "test-123"
    }
  }'
```

**Check the database:**
```sql
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;
```

**Manually trigger processing:**
```bash
curl https://venuemanager.pro/api/cron/process-webhooks \
  -H "Authorization: Bearer your-cron-secret"
```

## Monitoring

### Supabase Function Logs
- Go to Supabase Dashboard → Edge Functions → resend-webhook → Logs
- You'll see all incoming webhook requests

### Database Monitoring
```sql
-- Check unprocessed events
SELECT COUNT(*) FROM webhook_events WHERE processed = false;

-- Check recent events
SELECT event_type, processed, created_at, processing_error
FROM webhook_events
ORDER BY created_at DESC
LIMIT 20;

-- Check processing errors
SELECT * FROM webhook_events
WHERE processing_error IS NOT NULL
ORDER BY created_at DESC;
```

### Vercel Logs
- Go to Vercel Dashboard → Your Project → Logs
- Filter by `/api/cron/process-webhooks`
- Check for `[Webhook Processor]` log entries

## Environment Variables

### Supabase Secrets (for Edge Function)
```bash
RESEND_WEBHOOK_SECRET=your-resend-webhook-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Vercel Environment Variables (already set)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET (or INNGEST_SIGNING_KEY)
```

## Troubleshooting

### Webhooks not arriving in database
1. Check Supabase function logs for errors
2. Verify RESEND_WEBHOOK_SECRET is set correctly
3. Test with curl command above
4. Check Resend dashboard for webhook delivery attempts

### Events not being processed
1. Check `/api/cron/process-webhooks` logs in Vercel
2. Verify cron job is running (check Vercel Cron logs)
3. Query database for `processed = false` events
4. Check for `processing_error` in webhook_events table

### Status not updating in vendor_communications
1. Verify email addresses match between Resend payload and database
2. Check RLS policies on vendor_communications table
3. Review processing logic in `lib/agents/webhook-processor.ts`

## Optional: Inngest Integration

Instead of cron jobs, you can use Inngest to process webhooks in real-time:

```typescript
// inngest/functions/process-webhook.ts
import { inngest } from '../client';
import { processWebhookEvents } from '@/lib/agents/webhook-processor';

export const processWebhookFunction = inngest.createFunction(
  { id: 'process-webhook-events' },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    return await step.run('process-webhooks', async () => {
      return await processWebhookEvents();
    });
  }
);
```

## Benefits of This Architecture

1. **Reliability**: Database acts as persistent queue - no lost webhooks
2. **Visibility**: All webhook events logged and queryable
3. **Decoupling**: Resend → Supabase → Database → Vercel (independent components)
4. **Debugging**: Full audit trail of webhook receipt and processing
5. **Retry Logic**: Failed events can be reprocessed manually or automatically
6. **Scalability**: Batch processing prevents overwhelming the system
