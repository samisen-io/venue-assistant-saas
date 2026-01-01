# Resend Webhook Setup Guide

This guide walks you through setting up webhooks in Resend to track email delivery status for the VenueAssistant AI features.

## Prerequisites

1. A Resend account (sign up at [resend.com](https://resend.com))
2. Your application deployed (or using a tunnel like ngrok for local development)
3. A verified domain (or use resend.dev for testing)

---

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" or "Get Started"
3. Complete the registration process
4. Verify your email address

---

## Step 2: Get Your API Key

1. Log into your Resend dashboard at [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "VenueAssistant Production")
4. Select the appropriate permissions (Full Access recommended)
5. Click "Create"
6. **Copy the API key immediately** (you won't be able to see it again)
7. Add it to your `.env.local` file:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   ```

---

## Step 3: Configure Your Domain (Optional but Recommended)

### For Production:
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `venueassistant.com`)
4. Follow the DNS setup instructions:
   - Add the provided DNS records to your domain registrar
   - Wait for DNS propagation (can take up to 48 hours)
5. Verify the domain in Resend dashboard
6. Update your `.env.local`:
   ```
   RESEND_FROM_EMAIL=noreply@venueassistant.com
   RESEND_FROM_NAME=VenueAssistant
   ```

### For Development/Testing:
You can use Resend's test domain:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=VenueAssistant Test
```

---

## Step 4: Deploy Your Webhook Endpoint

Your webhook endpoint is already created at: `app/api/webhooks/resend/route.ts`

### For Production (Vercel):
Your webhook URL will be:
```
https://your-domain.com/api/webhooks/resend
```

### For Local Development (using ngrok):

1. Install ngrok: [ngrok.com/download](https://ngrok.com/download)
2. Start your Next.js dev server:
   ```bash
   cd venue-assistant
   npm run dev
   ```
3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)
5. Your webhook URL will be:
   ```
   https://abc123.ngrok.io/api/webhooks/resend
   ```

**Note**: The ngrok URL changes each time you restart it. For persistent URLs, consider ngrok's paid plan.

---

## Step 5: Configure Webhook in Resend

1. Go to [resend.com/webhooks](https://resend.com/webhooks)
2. Click "Add Webhook" or "Create Webhook"
3. Configure the webhook:

   **Endpoint URL**: Enter your webhook URL from Step 4
   - Production: `https://your-domain.com/api/webhooks/resend`
   - Development: `https://abc123.ngrok.io/api/webhooks/resend`

   **Events to Subscribe**: Select the following events:
   - ✅ `email.sent` - When an email is sent
   - ✅ `email.delivered` - When an email is delivered to the recipient
   - ✅ `email.bounced` - When an email bounces
   - ✅ `email.opened` - When a recipient opens the email (optional, for tracking)
   - ✅ `email.clicked` - When a recipient clicks a link (optional, for tracking)

4. Click "Create Webhook"

---

## Step 6: Get Your Webhook Secret

After creating the webhook:

1. In the Resend webhooks page, find your newly created webhook
2. Click on it to view details
3. Find the "Signing Secret" section
4. Click "Reveal" to show the secret
5. Copy the webhook secret
6. Add it to your `.env.local`:
   ```
   RESEND_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

---

## Step 7: Test Your Webhook

### Method 1: Using Resend Dashboard
1. In your webhook details page, click "Send Test Event"
2. Select an event type (e.g., "email.delivered")
3. Click "Send"
4. Check your application logs to verify the webhook was received

### Method 2: Send a Real Email
1. Use the Resend API to send a test email
2. Monitor your webhook endpoint logs
3. You should see events like `email.sent` and `email.delivered`

### Verify in Logs:
Check your application console/logs for:
```
Resend webhook received: email.sent
Email sent: { ... }
Resend webhook received: email.delivered
Email delivered: { ... }
```

---

## Complete .env.local Example

After completing all steps, your `.env.local` should include:

```env
# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Features - Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
CLAUDE_MODEL=claude-sonnet-4-20250514

# AI Features - Resend Email Service
RESEND_API_KEY=re_your_actual_key_here
RESEND_WEBHOOK_SECRET=whsec_your_actual_secret_here
RESEND_FROM_EMAIL=noreply@venueassistant.com
RESEND_FROM_NAME=VenueAssistant

# AI Agent Configuration
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT_HOURS=72
AGENT_FOLLOWUP_DELAY_HOURS=24

# AI Feature Flags
ENABLE_AGENT_AUTO_APPROVAL=false
ENABLE_NL_EVENT_CREATION=true
ENABLE_AI_AGENT=true
ENABLE_REAL_TIME_UPDATES=false
```

---

## Troubleshooting

### Webhook not receiving events:
1. **Check the endpoint URL**: Make sure it's publicly accessible
2. **Verify HTTPS**: Resend requires HTTPS endpoints (ngrok provides this automatically)
3. **Check webhook signature**: Ensure `RESEND_WEBHOOK_SECRET` is correct
4. **Review Resend logs**: Go to [resend.com/webhooks](https://resend.com/webhooks) and check delivery attempts
5. **Check application logs**: Look for errors in your Next.js console

### Signature verification failing:
1. Ensure `RESEND_WEBHOOK_SECRET` matches the secret in Resend dashboard
2. Check that you're not modifying the raw request body before verification
3. Verify the webhook endpoint is receiving the correct headers

### Emails not sending:
1. Verify your API key is correct
2. Check domain verification status (if using custom domain)
3. Review Resend dashboard for error messages
4. Check rate limits (Resend has limits on free tier)

---

## Next Steps

Once webhooks are configured:
1. Test sending emails through the Resend API
2. Verify webhook events are being received
3. Continue with Phase 18 to implement the full AI agent email handling
4. Implement the event handlers in `app/api/webhooks/resend/route.ts`

---

## Important Security Notes

⚠️ **Never commit your `.env.local` file to git**
- It contains sensitive API keys and secrets
- The `.gitignore` should already exclude it
- Only use `.env.example` for reference

⚠️ **Webhook Signature Verification**
- Always verify webhook signatures before processing
- This prevents unauthorized requests from malicious actors
- The verification is already implemented in the webhook endpoint

⚠️ **Use Environment Variables**
- Never hardcode API keys in your code
- Always use `process.env.VARIABLE_NAME`
- Different keys for development and production

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Webhooks Guide](https://resend.com/docs/dashboard/webhooks/introduction)
- [Resend API Reference](https://resend.com/docs/api-reference/introduction)
- [ngrok Documentation](https://ngrok.com/docs)
