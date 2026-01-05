# Vendor Outreach AI Agent - Setup Guide

This guide will help you complete the setup for the AI-powered vendor outreach agent.

## ✅ What's Already Configured

- ✅ Vercel deployment
- ✅ Resend API key and email service
- ✅ Anthropic Claude API integration
- ✅ Agent orchestrator and core logic
- ✅ Inngest background job processing
- ✅ Agent UI dashboard
- ✅ Database tables and RLS policies

## 🚀 Required Setup Steps

### 1. Configure Resend Email Service

#### A. Domain Verification (Recommended for Production)
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain: `venuemanager.pro`
3. Add the required DNS records to your domain registrar
4. Wait for verification (usually takes a few minutes)

#### B. Set Up Webhooks
1. Go to [Resend Webhooks](https://resend.com/webhooks)
2. Click "Add Webhook"
3. Configure webhook endpoint:
   - **URL**: `https://your-domain.vercel.app/api/webhooks/resend`
   - **Events**: Select all email events (sent, delivered, bounced, opened, clicked)
4. Copy the webhook secret and update your `.env`:
   ```bash
   RESEND_WEBHOOK_SECRET=whsec_your_actual_secret
   ```

#### C. Configure Inbound Email Routing
1. Go to [Resend Inbound](https://resend.com/inbound)
2. Click "Add Inbound Route"
3. Configure:
   - **Email Address**: `replies@venuemanager.pro` (or any address on your verified domain)
   - **Forward to URL**: `https://your-domain.vercel.app/api/webhooks/email/inbound`
4. Enable the route

**Note**: All vendor replies should go to this email address. Configure your "reply-to" field in emails to use this address.

### 2. Configure Inngest (Background Job Processing)

#### Option A: Using Inngest Cloud (Recommended)
1. Sign up at [Inngest](https://www.inngest.com/)
2. Create a new app
3. Get your signing key from the dashboard
4. Add to your Vercel environment variables:
   ```bash
   INNGEST_SIGNING_KEY=your_signing_key_here
   ```
5. Register your functions:
   - Go to your deployed app: `https://your-domain.vercel.app/api/inngest`
   - Copy the URL
   - In Inngest dashboard, sync your functions from this URL

#### Option B: Using Vercel Cron Only
If you prefer not to use Inngest, the system will fall back to Vercel Cron jobs:
1. Ensure `vercel.json` is deployed (already included)
2. The cron job will run every 6 hours automatically
3. No additional configuration needed

### 3. Update Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```bash
# Required (already set)
ANTHROPIC_API_KEY=sk-ant-api03-...
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...
RESEND_FROM_EMAIL=aibot@venuemanager.pro
RESEND_FROM_NAME="Venue Manager AI"

# Security
CRON_SECRET=<generate-a-random-secret>

# Optional - Inngest
INNGEST_SIGNING_KEY=<your-inngest-signing-key>

# Update production URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**To generate a secure CRON_SECRET**, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy to Vercel

After configuring environment variables:

```bash
git add .
git commit -m "feat: complete AI agent setup"
git push
```

Vercel will automatically deploy your changes.

### 5. Test the Agent

#### A. Manual Test via UI
1. Navigate to an event: `/dashboard/events/[eventId]`
2. Click "AI Agent" tab or visit `/dashboard/events/[eventId]/agent`
3. Click "Start AI Agent"
4. Select vendors to contact
5. Click "Start Agent"

#### B. Test Email Webhook (Inbound)
Send a test email from a vendor's email address to your configured inbound route:
```
To: replies@venuemanager.pro
From: vendor@example.com
Subject: Re: Event Quote Request

Hi there,

Thanks for reaching out. We'd be happy to provide a quote.

Our pricing for your event would be:
- Base service: $2,500
- Setup fee: $500
Total: $3,000

We require a 50% deposit to secure the booking.

Let me know if you have any questions!

Best regards,
Vendor Name
```

The system should:
1. Receive the email via webhook
2. Match it to the vendor by email
3. Extract the quote ($3,000)
4. Save it to the database
5. Update agent run statistics

#### C. Monitor Cron Jobs
1. Check Vercel Dashboard → Deployments → Cron Jobs
2. Or visit: `https://your-domain.vercel.app/api/cron/agent-monitor` (protected by CRON_SECRET)

### 6. Verify Setup

**Checklist:**
- [ ] Resend domain verified
- [ ] Resend webhooks configured
- [ ] Inbound email route set up
- [ ] Environment variables updated in Vercel
- [ ] Application deployed successfully
- [ ] Test email sent and received
- [ ] Agent UI accessible
- [ ] Agent can be started from UI
- [ ] Cron job running (check Vercel logs)

## 🔧 Troubleshooting

### Emails Not Sending
- Check Resend API key is valid
- Verify domain is verified (or use Resend test domain)
- Check Vercel logs for errors

### Vendor Replies Not Processing
- Verify inbound email route is configured correctly
- Check webhook endpoint is accessible: `/api/webhooks/email/inbound`
- Ensure vendor email matches a vendor in the database
- Check Vercel logs for webhook errors

### Quotes Not Being Extracted
- Ensure Anthropic API key is valid
- Check Claude API quota/limits
- Verify email contains pricing information
- Review agent logs in the UI

### Cron Jobs Not Running
- Verify `vercel.json` is in the repository root
- Check Vercel project settings → Cron Jobs
- Ensure CRON_SECRET is set
- Check Vercel function logs

### Inngest Functions Not Triggering
- Verify INNGEST_SIGNING_KEY is set
- Ensure functions are synced in Inngest dashboard
- Check `/api/inngest` endpoint is accessible
- Review Inngest dashboard for errors

## 📊 Monitoring

### Agent Activity
- **UI Dashboard**: `/dashboard/events/[eventId]/agent`
  - View agent runs
  - See communication history
  - Review agent logs

### Vercel Logs
```bash
vercel logs --follow
```

### Database Queries
Check agent activity directly:
```sql
-- Active agent runs
SELECT * FROM agent_runs WHERE status = 'running';

-- Recent communications
SELECT * FROM vendor_communications ORDER BY created_at DESC LIMIT 10;

-- Extracted quotes
SELECT * FROM vendor_quotes ORDER BY extracted_at DESC LIMIT 10;
```

## 🎯 Usage Flow

1. **User creates an event** with service requirements
2. **User navigates to Agent tab** for that event
3. **User clicks "Start AI Agent"** and selects vendors
4. **Agent begins**:
   - Sends personalized emails to each vendor
   - Logs each contact in the database
5. **Vendors reply** to the configured email address
6. **Inbound webhook receives replies**:
   - Parses email content
   - Matches to vendor and event
   - Triggers quote extraction
7. **Claude analyzes the reply**:
   - Extracts pricing information
   - Identifies availability
   - Determines if follow-up needed
8. **Agent monitors** (every 6 hours):
   - Processes new replies
   - Sends follow-ups to non-responsive vendors (after 24h)
   - Completes after 72 hours
9. **User reviews quotes** in the dashboard
10. **User approves/rejects quotes** and finalizes bookings

## 🔐 Security Notes

- Never commit `.env` file to version control
- Rotate API keys regularly
- Use strong CRON_SECRET in production
- Monitor webhook endpoints for abuse
- Implement rate limiting if needed
- Review agent logs for suspicious activity

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review agent logs in the UI dashboard
3. Test webhooks using tools like [webhook.site](https://webhook.site)
4. Verify all environment variables are set correctly
