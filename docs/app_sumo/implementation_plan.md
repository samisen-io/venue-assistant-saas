# AppSumo Launch & Distribution Plan

Targeting AppSumo is a great strategy for rapid user acquisition and early cash flow. However, AppSumo buyers (commonly referred to as "Sumolings") have specific expectations. They expect a seamless redemption process, generous lifetime limits (tiered), and excellent onboarding/support to avoid high refund rates during the 60-day refund window.

This plan outlines the technical and product adjustments needed to pivot our Go-To-Market to AppSumo.

## User Review Required

> [!IMPORTANT]  
> **AppSumo Tier Mapping:** We need to decide what the AppSumo Lifetime Deal (LTD) tiers will give users. A common structure is:
> - **Tier 1 ($49-$59):** Equivalent to "Growth" plan (1-3 venues, moderate AI limits).
> - **Tier 2 ($119-$149):** Equivalent to "Professional" plan (Unlimited venues, higher AI limits).
> - **Tier 3 ($249+):** Agency/Enterprise tier (White-labeling, unlimited everything).
> *Do you agree with mapping the AppSumo tiers directly to our existing plan limits?*

## Open Questions

> [!WARNING]
> 1. **Redemption Method:** The easiest technical approach is to generate a batch of 10,000 unique codes, upload them to AppSumo, and build a `/redeem` page where users enter the code to unlock their account. Do you prefer this CSV method or the more complex AppSumo API webhook integration?
> 2. **Refund Handling:** AppSumo offers a 60-day money-back guarantee. If we use the CSV method, we'll need to manually ingest a "Refunded Codes" list weekly to downgrade those accounts, or build a webhook endpoint for AppSumo to notify us of refunds automatically. How would you like to handle this?

## Proposed Changes

### 1. AppSumo Code Redemption System
We need to bypass the Stripe checkout for AppSumo users and grant them lifetime access via a code.

#### [NEW] `lib/appsumo/redemption.ts`
- Logic to validate redemption codes.
- Logic to upgrade a user's subscription to `appsumo_tier_1`, `appsumo_tier_2`, etc.

#### [NEW] `app/redeem/page.tsx`
- A dedicated landing page for AppSumo buyers.
- Input field for the AppSumo code.
- Auth flow (Signup/Login) wrapped around the redemption.

#### [NEW] `app/api/appsumo/redeem/route.ts`
- API endpoint to process the code, mark it as "used" in the database, and update the user's `subscriptions` record to a lifetime deal with no expiration.

#### [MODIFY] `setup-database.sql` (or new migration)
- Create `appsumo_codes` table: `id`, `code` (unique), `tier` (1, 2, 3), `is_used` (boolean), `user_id` (foreign key), `redeemed_at`.

### 2. Limits & Subscription Overrides
We need the app to recognize AppSumo lifetime deals and apply the correct usage limits without requiring a Stripe subscription.

#### [MODIFY] `lib/subscription/limits.ts`
- Update `getUserLimits(userId)` to check for `appsumo_tier_*` in the user's subscription record.
- Map the AppSumo tiers to the corresponding limits (e.g., Tier 1 = Growth plan limits).

#### [MODIFY] `components/subscription/SubscriptionBanner.tsx`
- Ensure AppSumo users do not see "Trial expiring" or "Payment failed" banners.
- Display an "AppSumo Lifetime Deal" badge in their settings.

### 3. Critical Onboarding & Support (To prevent refunds)
Sumolings will churn and refund if they hit friction. We must prioritize these from the `MUST_HAVE.md` list.

#### [NEW] `components/dashboard/OnboardingChecklist.tsx`
- Implement **M10 (Onboarding Flow)**. A 5-step checklist to guide them to setup their first venue, space, and photo.

#### [NEW] `components/shared/SupportWidget.tsx`
- Implement **M13 (Support Channel)**. A highly visible support email link or basic contact form in the dashboard sidebar. Sumolings ask a lot of questions; capturing them before they refund is key.

#### [NEW] `scripts/seed-demo.ts`
- Implement **M12 (Demo Environment)**. We need a flawless demo for the AppSumo deal page link so prospective buyers can test the AI chat and public pages before buying.

### 4. Optional: AppSumo Refund Webhook
If we decide to automate refunds rather than doing it manually.

#### [NEW] `app/api/webhooks/appsumo/route.ts`
- Endpoint that listens for AppSumo `refund` events.
- Finds the user by the refunded code and revokes their lifetime access (downgrades to Trial/Free).

---

## Verification Plan

### Automated Tests
- Playwright tests to cover the redemption flow:
  - User visits `/redeem` -> enters valid code -> creates account -> gets correct limits.
  - User enters invalid/used code -> sees appropriate error.
- Unit tests for `limits.ts` to ensure AppSumo tiers grant the exact correct limits.

### Manual Verification
- Generate a batch of 10 test codes.
- Walk through the redemption process as a brand new user.
- Verify that the settings page shows "Lifetime Deal" instead of a Stripe billing portal link.
- Verify that the user can create spaces/events up to their specific AppSumo tier limit, and gets blocked when exceeding it.
- Test the demo environment to ensure it loads perfectly for the AppSumo deal page preview.
