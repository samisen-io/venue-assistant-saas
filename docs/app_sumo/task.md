# AppSumo Launch Implementation Tasks

- `[/]` 1. Database & Schema Updates
  - `[x]` Create `appsumo_codes` table in database migration.
  - `[ ]` Apply migration to the database.
- `[x]` 2. AppSumo Redemption Logic
  - `[x]` Create `lib/appsumo/redemption.ts` for validation and upgrade logic.
  - `[x]` Create `app/api/appsumo/redeem/route.ts` API endpoint.
  - `[x]` Create `app/redeem/page.tsx` for the redemption UI.
- `[x]` 3. Subscription & Limits Adjustments
  - `[x]` Update `lib/subscription/limits.ts` to map AppSumo tiers to plan limits.
  - `[x]` Update `components/subscription/SubscriptionBanner.tsx` to hide warnings for LTD users.
- `[x]` 4. Onboarding & Support (Must Haves)
  - `[x]` Implement `components/dashboard/OnboardingChecklist.tsx` (M10).
  - `[x]` Implement `components/shared/SupportWidget.tsx` (M13).
- `[x]` 5. Demo Environment
  - `[x]` Create `scripts/seed-demo.ts` (M12).
