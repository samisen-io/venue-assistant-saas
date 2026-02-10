# Stripe Subscription Management - Implementation Tasks

## Overview

This document outlines all tasks required to implement subscription management using Stripe for the Venue Manager SaaS application.

**Approach**: Use Stripe Checkout for new subscriptions and Stripe Customer Portal for subscription management (cancel/upgrade/downgrade).

**Webhook Strategy**: Use Supabase Edge Functions for webhooks (more reliable than Vercel endpoints) + auto-sync from Stripe on page load as fallback.

---

## Phase 1: Stripe Setup & Configuration

### 1.1 Stripe Account Setup
- [x] Create Stripe account (if not exists)
- [x] Get API keys (publishable key and secret key)
- [x] Add keys to environment variables:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`

### 1.2 Product & Pricing Configuration (Stripe Dashboard)
- [x] Create products in Stripe Dashboard for each plan tier:
  - Starter plan ($49/month)
  - Professional plan ($149/month)
  - Enterprise plan ($299/month)
- [x] Configure pricing for each product:
  - Monthly billing option
  - Annual billing option (with discount) - optional
- [x] Copy price IDs from Stripe Dashboard to `.env.local`:
  - `STRIPE_STARTER_PRICE_ID`
  - `STRIPE_PROFESSIONAL_PRICE_ID`
  - `STRIPE_ENTERPRISE_PRICE_ID`
- [x] Plan limits defined in code (`lib/stripe/config.ts`)

### 1.3 Customer Portal Configuration (Stripe Dashboard)
- [x] Enable Customer Portal in Stripe settings
- [x] Configure portal features:
  - Allow customers to update payment methods
  - Allow subscription cancellation
  - Allow plan switching (upgrades/downgrades)
  - Enable invoice history
- [x] Set cancellation behavior (end of period vs immediate)
- [x] Configure proration behavior for upgrades/downgrades
- [x] Add branding (logo, colors) to match Venue Manager

### 1.4 Webhook Configuration (Stripe Dashboard)
- [ ] Add webhook endpoint in Stripe Dashboard:
  - URL: `https://ccyrwgfnvrilqmxlllrd.supabase.co/functions/v1/stripe-webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- [ ] Copy new webhook secret to Supabase secrets

---

## Phase 2: Database Schema Updates

### 2.1 Subscriptions Table
- [x] `subscriptions` table exists with fields:
  - user_id, stripe_customer_id, stripe_subscription_id
  - plan_tier, status, current_period_start, current_period_end
  - cancel_at_period_end, trial_ends_at

### 2.2 Usage Tracking Table
- [x] `usage_tracking` table exists with fields:
  - user_id, month, spaces_created, events_created, vendors_created

### 2.3 Row Level Security
- [x] RLS policies in place (users can only read their own subscription)

---

## Phase 3: Backend API Implementation

### 3.1 Stripe SDK Setup
- [x] Stripe SDK installed (`stripe` package)
- [x] Stripe client utility (`lib/stripe/client.ts`)
- [x] Plan config and helpers (`lib/stripe/config.ts`)

### 3.2 Checkout Session API
- [x] `/api/subscription` POST route:
  - Accepts price ID
  - Creates or retrieves Stripe customer
  - Creates checkout session
  - Returns session URL for redirect

### 3.3 Customer Portal API
- [x] `/api/subscription/portal` POST route:
  - Gets user's Stripe customer ID
  - Creates billing portal session
  - Returns portal URL for redirect

### 3.4 Webhook Handler (Supabase Edge Function)
- [x] `supabase/functions/stripe-webhook/index.ts` created
- [x] Verify webhook signature using Web Crypto API
- [x] Handle subscription events:
  - `checkout.session.completed` - New subscription created
  - `customer.subscription.updated` - Plan changed, renewed, etc.
  - `customer.subscription.deleted` - Subscription canceled
  - `invoice.payment_succeeded` - Payment successful
  - `invoice.payment_failed` - Payment failed
- [x] Update database subscription record on each event
- [x] Store events in `webhook_events` table for auditing
- [ ] Deploy function: `supabase functions deploy stripe-webhook`
- [ ] Set secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

### 3.5 Subscription Status API
- [x] `/api/subscription` GET route - Returns current user's subscription
- [x] Auto-sync from Stripe if no local subscription found
- [x] `/api/subscription/plans` route - Returns available plans
- [x] `/api/subscription/usage` route - Returns current usage stats
- [x] `/api/subscription/sync` route - Sync subscription from checkout session

---

## Phase 4: Frontend Implementation

### 4.1 Pricing Page
- [x] `/pricing` page with plan comparison
- [x] Display features and limits for each plan
- [x] "Get Started" / "Upgrade" buttons per plan
- [x] Handle checkout redirect on plan selection
- [x] FAQ section
- [ ] Monthly/annual toggle with savings (optional enhancement)

### 4.2 Subscription Hook
- [x] `hooks/useSubscription.ts`:
  - `useSubscription()` - fetch current subscription status
  - `useUsage()` - fetch current usage
  - `useCanCreate(resource)` - check if user can create space/event/vendor

### 4.3 Settings/Billing Page
- [x] `/settings/subscription` page
- [x] Display current plan and status
- [x] Show next billing date
- [x] Show "Cancel pending" status if applicable
- [x] "Manage Subscription" button (opens Stripe Portal)
- [x] "Upgrade Plan" button for users on lower tiers
- [x] Auto-loads subscription from Stripe on page load (fallback if webhooks fail)

### 4.4 Checkout Success Page
- [x] `/checkout/success` page syncs subscription immediately after payment
- [x] Shows loading state while syncing
- [x] Handles errors gracefully
- [x] Redirects to subscription settings on success

### 4.5 Upgrade Prompts (Enhancement)
- [x] Create `UpgradePrompt` component for limit warnings
- [x] Show when user approaches or hits plan limits
- [x] Display in relevant contexts:
  - Space/Venue creation (if at limit)
  - Event creation (if at limit)
  - Vendor addition (if at limit)

### 4.6 Plan Limit Indicators
- [x] `UsageBar` component shows usage vs limits
- [x] Display on subscription settings page

---

## Phase 5: Feature Gating & Enforcement

### 5.1 Server-Side Enforcement
- [x] `lib/subscription/limits.ts` utility with:
  - `canCreateSpace(userId)`
  - `canCreateEvent(userId)`
  - `canCreateVendor(userId)`
- [x] Add limit checks to relevant API routes:
  - `/api/venues` (spaces) - Check space limit on POST
  - `/api/events` - Check event limit on POST
  - `/api/vendors` - Check vendor limit on POST

### 5.2 Client-Side Gating
- [x] `useCanCreate` hook for client-side checks
- [ ] Create `PlanGate` component wrapper (optional)
- [x] Disable buttons/features when limit reached
- [x] Show upgrade prompt instead of blocked action

---

## Phase 6: Edge Cases & Error Handling

### 6.1 Payment Failures
- [x] Handle `invoice.payment_failed` webhook
- [x] Update subscription status to `past_due`
- [x] Show banner in app prompting payment update
- [ ] Send email notification about failed payment (via Resend)

### 6.2 Subscription Cancellation
- [x] Handle `cancel_at_period_end` status in webhook
- [x] Show "Cancels at period end" message in UI
- [x] Allow user to reactivate before period ends (via Portal)
- [ ] Handle what happens when subscription fully expires

### 6.3 Downgrade Data Handling
- [x] Soft limit approach implemented (warn but allow access to existing)
- [x] Clear messaging about what happens to data

### 6.4 Trial Period
- [x] Trial duration configured (14 days in `lib/stripe/config.ts`)
- [x] Trial status shown in UI
- [ ] Send reminder emails before trial ends (via Resend)

---

## Phase 7: Testing

### 7.1 Stripe Test Mode
- [ ] Verify using Stripe test API keys during development
- [ ] Test with Stripe test card numbers

### 7.2 Subscription Flows
- [ ] Test new subscription checkout
- [ ] Test upgrade from lower to higher plan
- [ ] Test downgrade from higher to lower plan
- [ ] Test subscription cancellation
- [ ] Test reactivation of canceled subscription
- [ ] Test payment method update

### 7.3 Webhook Testing
- [ ] Deploy Supabase edge function
- [ ] Configure Stripe webhook endpoint
- [ ] Test each webhook event type
- [ ] Verify database updates correctly

### 7.4 Edge Cases
- [ ] Test with expired subscription
- [ ] Test with past_due subscription
- [ ] Test limit enforcement at exact limit
- [ ] Test auto-sync fallback when webhooks fail

---

## Phase 8: Go-Live Checklist

### 8.1 Production Setup
- [ ] Switch to Stripe live API keys
- [ ] Configure production webhook endpoint in Stripe Dashboard (Supabase URL)
- [ ] Set webhook secret in Supabase secrets
- [ ] Test one real transaction (can refund immediately)

### 8.2 Monitoring
- [ ] Set up Stripe webhook monitoring in Dashboard
- [ ] Check Supabase function logs for errors
- [ ] Set up alerts for failed webhooks
- [ ] Monitor for failed payments

### 8.3 Documentation
- [ ] Document plan limits and features for marketing
- [ ] Create internal runbook for subscription issues
- [ ] Add FAQ for billing questions on pricing page

---

## Summary: What's Done vs Remaining

### ✅ Completed
| Area | Status |
|------|--------|
| Stripe SDK & Client | Done |
| Plan Configuration (code) | Done |
| Stripe Products & Prices | Done |
| Price IDs in .env.local | Done |
| Customer Portal Configuration | Done |
| Database Schema | Done |
| Checkout API | Done |
| Portal API | Done |
| Webhook Handler (Supabase Edge Function) | Done (needs deploy) |
| Subscription Status API | Done |
| Auto-sync from Stripe | Done |
| Pricing Page | Done |
| Subscription Settings Page | Done |
| Checkout Success Page | Done |
| Usage Tracking Hooks | Done |
| Server-side Limit Functions | Done |
| Limit checks in API routes | Done |
| Upgrade prompts in UI | Done |
| Payment failure/trial/cancellation banners | Done |
| Client-side limit gating | Done |

### 🔲 Remaining
| Task | Priority |
|------|----------|
| Deploy Supabase stripe-webhook function | **High** |
| Configure Stripe webhook in Dashboard | **High** |
| Trial expiration emails | Low |
| Go-live checklist | Before launch |

---

## File Structure

```
supabase/
├── functions/
│   ├── resend-webhook/     # ✅ Email webhook handler
│   │   └── index.ts
│   └── stripe-webhook/     # ✅ Stripe webhook handler (NEW)
│       └── index.ts
├── config.toml             # ✅ Function configurations

lib/
├── stripe/
│   ├── client.ts           # ✅ Stripe SDK initialization
│   └── config.ts           # ✅ Plan definitions and price IDs
├── subscription/
│   ├── limits.ts           # ✅ Server-side limit checks
│   └── trial.ts            # ✅ Trial utilities

app/
├── api/
│   ├── subscription/
│   │   ├── route.ts        # ✅ GET subscription (with auto-sync), POST checkout
│   │   ├── sync/route.ts   # ✅ Sync from checkout session
│   │   ├── portal/route.ts # ✅ Create portal session
│   │   ├── plans/route.ts  # ✅ Get available plans
│   │   └── usage/route.ts  # ✅ Get usage stats
│   └── webhooks/
│       └── stripe/route.ts # ⚠️ Legacy (use Supabase function instead)
├── (marketing)/
│   └── pricing/
│       └── page.tsx        # ✅ Public pricing page
├── (dashboard)/
│   ├── checkout/
│   │   ├── success/page.tsx # ✅ Post-checkout sync
│   │   └── cancel/page.tsx  # ✅ Checkout canceled
│   └── settings/
│       └── subscription/
│           └── page.tsx    # ✅ Billing management UI

components/
├── subscription/
│   ├── PricingTable.tsx    # ✅ Plan comparison grid
│   ├── PricingCard.tsx     # ✅ Individual plan card
│   ├── SubscriptionBadge.tsx # ✅ Plan/status badge
│   ├── UsageBar.tsx        # ✅ Usage progress bar
│   ├── UpgradePrompt.tsx   # ✅ Upgrade dialog for limits
│   ├── TrialBanner.tsx     # ✅ Trial expiration warning
│   └── SubscriptionBanner.tsx # ✅ Combined status banner (trial/payment/cancellation)

hooks/
└── useSubscription.ts      # ✅ Subscription & usage hooks
```

---

## Environment Variables Required

```env
# Stripe (already in .env.example)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (get from Stripe Dashboard after creating products)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## Supabase Secrets Required

```bash
# Set these in Supabase for the edge function
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Next Steps

1. **Deploy Supabase function**: `supabase functions deploy stripe-webhook`
2. **Set Supabase secret**: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
3. **Configure Stripe webhook**: Add endpoint `https://ccyrwgfnvrilqmxlllrd.supabase.co/functions/v1/stripe-webhook` in Stripe Dashboard
4. **Test the flow**: Complete a test subscription and verify it syncs
