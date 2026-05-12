# Failing Tests Fix Plan

> **Run date:** 2026-05-01  
> **Total results:** 186 tests — 145 passed, **41 failed**, 12 skipped  
> **Total time:** 4.6 minutes  

---

## Overview

Failures fall into five root-cause categories:

| # | Category | Affected tests |
|---|----------|---------------|
| 1 | [Public homepage content mismatch](#1-public-homepage-content-mismatch) | 7 |
| 2 | [Missing database tables / schema gaps](#2-missing-database-tables--schema-gaps) | ~12 |
| 3 | [Missing or broken UI features](#3-missing-or-broken-ui-features) | 6 |
| 4 | [API route runtime errors](#4-api-route-runtime-errors) | 4 |
| 5 | [Auth & environment issues](#5-auth--environment-issues) | 2 |

---

## 1. Public Homepage Content Mismatch

**Failing tests (all in `tests/public-marketplace.spec.ts`)**

| Line | Test |
|------|------|
| 11 | hero section renders headline and CTAs |
| 18 | trust badges are visible |
| 24 | core features section lists key capabilities |
| 33 | AI features section is visible |
| 39 | how it works section has 4 steps |
| 47 | footer renders with navigation links |
| 61 | "View Pricing" links to /pricing |

**Root cause:** `app/page.tsx` is a venue-discovery search page, not the SaaS marketing/landing page the tests expect. The tests check for specific hero text, sections, and footer links that don't exist on the current page.

**What the tests assert:**
- `h1` containing `"Master Your Venue Operations"`
- Elements matching `[data-testid*="trust"]` or text like "trusted by" / "venues trust"
- A section with heading matching `/core features/i` listing ≥3 feature items
- A section matching `/ai/i` or `[data-testid="ai-features"]`
- A section matching `/how it works/i` with exactly 4 step elements
- `<footer>` containing internal nav links
- A link `"View Pricing"` pointing to `/pricing`

**Fix steps:**

1. **Rewrite `app/page.tsx`** as a marketing landing page for venue managers. Must include:
   - Hero section: `<h1>Master Your Venue Operations</h1>` + CTA buttons (Sign Up / View Demo)
   - Trust/social-proof bar: logos or stat badges (e.g., "500+ venues trust us")
   - Core Features section (`data-testid="core-features"` or heading "Core Features"): ≥3 feature cards
   - AI Features section (`data-testid="ai-features"` or heading with "AI"): highlight AI capabilities
   - How It Works section: exactly **4** numbered steps
   - `<footer>` with links to `/pricing`, `/login`, `/signup`, `/terms`, `/privacy`
   - Prominent "View Pricing" link pointing to `/pricing`

2. **Verify `/pricing` page exists.** Create `app/pricing/page.tsx` if missing.

3. **Run smoke:**
   ```bash
   npx playwright test tests/public-marketplace.spec.ts --project=chromium
   ```

---

## 2. Missing Database Tables / Schema Gaps

Several untracked test files exercise routes that exist in code but fail at runtime because the underlying Supabase tables are missing or lack required columns. Each section below describes what table/columns to add and which test validates it.

### 2a. `venue_packages` table

**Failing test:** `tests/venue-packages.spec.ts:14`  
"create, read, update, and delete a venue package via API"

**Route:** `app/api/venues/[venueId]/packages/route.ts`  
**Expected columns:** `id`, `venue_id`, `name`, `description`, `base_price`, `pricing_model`, `tiered_pricing` (jsonb), `inclusions` (jsonb), `is_active`, `created_at`, `updated_at`

**Fix:** Create migration:
```sql
create table if not exists venue_packages (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references venues(id) on delete cascade,
  name        text not null,
  description text,
  base_price  numeric(10,2),
  pricing_model text default 'flat',
  tiered_pricing jsonb,
  inclusions  jsonb,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table venue_packages enable row level security;
create policy "venue_packages_owner" on venue_packages
  using (
    venue_id in (select id from venues where owner_id = auth.uid())
  );
```

### 2b. `venue_marketplace_settings` table

**Failing test:** `tests/venue-marketplace.spec.ts:14`  
"enabling marketplace listing makes venue appear in public search"

**Route:** `app/api/venues/[venueId]/marketplace/route.ts`  
**Expected columns:** `id`, `venue_id`, `is_visible_on_marketplace`, `search_keywords`, `auto_respond_enabled`, `auto_respond_message`, `response_time_goal`, `updated_at`

**Fix:** Create migration:
```sql
create table if not exists venue_marketplace_settings (
  id                    uuid primary key default gen_random_uuid(),
  venue_id              uuid not null unique references venues(id) on delete cascade,
  is_visible_on_marketplace boolean default false,
  search_keywords       text[],
  auto_respond_enabled  boolean default false,
  auto_respond_message  text,
  response_time_goal    integer,
  updated_at            timestamptz default now()
);

alter table venue_marketplace_settings enable row level security;
create policy "venue_marketplace_settings_owner" on venue_marketplace_settings
  using (
    venue_id in (select id from venues where owner_id = auth.uid())
  );
```

### 2c. `client_communications` table

**Failing test:** `tests/client-communications.spec.ts:14`  
"posting a communication to a client persists and is retrievable"

**Route:** `app/api/clients/[clientId]/communications/route.ts`  
**Expected columns:** `id`, `client_id`, `venue_id`, `type`, `subject`, `body`, `sent_at`, `created_at`

**Fix:** Create migration:
```sql
create table if not exists client_communications (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  event_id   uuid references events(id) on delete cascade,
  type       text not null default 'note',
  subject    text,
  body       text not null,
  sent_at    timestamptz default now(),
  created_at timestamptz default now()
);

alter table client_communications enable row level security;
drop policy if exists "client_communications_owner" on client_communications;
create policy "client_communications_owner" on client_communications
  using (
    event_id in (
      select e.id from events e
      join venues v on v.id = e.venue_id
      where v.owner_id = auth.uid()
    )
  );
```

### 2d. `vendor_communications` table

**Failing tests:**
- `tests/vendor-communications.spec.ts:14` — "contacting a vendor on an event creates a communication record"
- `tests/vendor-reviews.spec.ts:23` — indirectly (event_vendors table `outreach_status` column)

**Route:** `app/api/events/[eventId]/vendors/[associationId]/contact/route.ts`  
**Expected columns:** `id`, `event_vendor_id`, `venue_id`, `vendor_id`, `direction`, `subject`, `body`, `created_at`

Also confirm `event_vendors` table has `outreach_status` column (default `'pending'`).

**Fix:** Create migration:
```sql
create table if not exists vendor_communications (
  id               uuid primary key default gen_random_uuid(),
  event_vendor_id  uuid references event_vendors(id) on delete cascade,
  venue_id         uuid not null references venues(id) on delete cascade,
  vendor_id        uuid not null references vendors(id) on delete cascade,
  direction        text not null default 'outbound',
  subject          text,
  body             text,
  created_at       timestamptz default now()
);

alter table vendor_communications enable row level security;
create policy "vendor_communications_owner" on vendor_communications
  using (
    venue_id in (select id from venues where owner_id = auth.uid())
  );

-- Ensure event_vendors has outreach_status
alter table event_vendors
  add column if not exists outreach_status text default 'pending';
```

### 2e. `vendor_reviews` table / `reliability_score` column

**Failing test:** `tests/vendor-reviews.spec.ts:23`  
"submitting a post-event review persists and is retrievable via API" (ran for 2.0 min — likely timeout after DB error)

**Route:** `app/api/vendors/[vendorId]/reviews/route.ts`  
**Expected:** `vendor_reviews` table with columns `id`, `vendor_id`, `event_id`, `rating`, `notes`, `on_time`, `cost_accurate`, `would_use_again`, `created_at`; and `vendors.reliability_score` numeric column.

**Fix:** Create migration:
```sql
create table if not exists vendor_reviews (
  id               uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references vendors(id) on delete cascade,
  event_id         uuid references events(id) on delete set null,
  venue_id         uuid not null references venues(id) on delete cascade,
  rating           integer not null check (rating between 1 and 5),
  notes            text,
  on_time          boolean,
  cost_accurate    boolean,
  would_use_again  boolean,
  created_at       timestamptz default now()
);

alter table vendor_reviews enable row level security;
create policy "vendor_reviews_owner" on vendor_reviews
  using (
    venue_id in (select id from venues where owner_id = auth.uid())
  );

alter table vendors
  add column if not exists reliability_score numeric(5,2) default 0;
```

---

## 3. Missing or Broken UI Features

### 3a. Vendor service-category filter combobox

**Failing test:** `tests/vendor-filter.spec.ts:15`  
"filtering by service category shows only matching vendors"

**Root cause:** The vendors page (`app/(dashboard)/vendors/page.tsx`) has a filter Select component, but the test looks for a `<combobox>` role (ARIA `role="combobox"`) and expects it to be connected to service-category data. If the Select component doesn't render with the correct ARIA role, or if it doesn't read from the `event_services` table to populate options, the test cannot find or interact with it.

**Fix steps:**

1. Confirm `app/(dashboard)/vendors/page.tsx` renders a `<Select>` or `<Combobox>` that has ARIA `role="combobox"` — check with browser devtools.
2. Ensure the vendor filter loads event service categories from `/api/event-services` and passes them as options.
3. Ensure the filter correctly updates the `/api/vendors?service={serviceId}` query param and re-renders the list.
4. If using shadcn `<Select>`, it renders with `role="combobox"` on the trigger — confirm this is present.

**Quick check:**
```bash
npx playwright test tests/vendor-filter.spec.ts --project=chromium --headed
```

### 3b. Checkout success page crash

**Failing test:** `tests/checkout-pages.spec.ts:24`  
"checkout success page renders without crashing"

**Root cause:** `app/(dashboard)/checkout/success/page.tsx` reads a Stripe `session_id` from the URL. If missing, it may throw an unhandled error instead of showing a graceful error state.

**Fix steps:**

1. Open `app/(dashboard)/checkout/success/page.tsx`.
2. Wrap the `session_id` lookup in a null-check — if missing, render the error card directly without calling Stripe:
   ```tsx
   const sessionId = searchParams.get('session_id');
   if (!sessionId) {
     // render error state immediately
   }
   ```
3. Ensure the page never throws to the error boundary on missing session.

### 3c. Dashboard stat cards showing no numeric values

**Failing test:** `tests/manager-portal.spec.ts:78`  
"stat cards are present and each contains a numeric value"

**Root cause:** The dashboard stat cards (`app/(dashboard)/dashboard/page.tsx`) fetch counts from the DB. If the test user has no data or if the API returns null/undefined instead of 0, the cards render "—" or nothing instead of a number.

**Fix steps:**

1. In the dashboard page, ensure stat card values always fall back to `0` when undefined:
   ```tsx
   upcomingEvents={stats?.upcomingEvents ?? 0}
   ```
2. In the dashboard API route, ensure all count queries return `0` on empty result rather than `null`.
3. Alternatively, the test seed (`tests/fixtures/seed.ts`) creates one event — verify the stat card for "Upcoming Events" reflects it.

### 3d. NLP event creation on `/events/new`

**Failing test:** `tests/ai-features.spec.ts:28`  
"mocked extract populates form fields and event is created"

**Root cause:** The test expects a `<textarea>` on the `/events/new` page with placeholder "describe your event in natural language" and a button "extract event details". Either these elements don't exist, or the mocked API response isn't wiring into form field population.

**Fix steps:**

1. Check `app/(dashboard)/events/new/page.tsx` for the NLP textarea. If missing, add:
   ```tsx
   <textarea
     placeholder="Describe your event in natural language"
     data-testid="nlp-input"
   />
   <button data-testid="extract-btn">Extract Event Details</button>
   ```
2. The page should call `POST /api/ai/extract-event` on button click and populate `name`, `date`, `guest_count`, `budget` form fields from the response.
3. The test mocks this endpoint with `page.route(...)`, so the page must use a client-side fetch (not server action) for the extraction.

### 3e. Settings team page selectors

**Failing tests:** `tests/settings-team.spec.ts:16` and `:38`

**Root cause:** The test looks for the owner's email in the page body (`page.getByText(ownerEmail)`) and a `role="button"` or button labeled "Remove" next to non-owner members. The current page (`app/(dashboard)/settings/team/page.tsx`) may render the owner differently.

**Fix steps:**

1. Ensure the team page renders each member's email as visible text (not hidden in a tooltip or aria-label).
2. Ensure the Remove button is visible and labeled "Remove" for all non-owner members.
3. The test also verifies that submitting an empty invite email form does not navigate away — ensure the form validates client-side.

### 3f. Subscription page plan display

**Failing test:** `tests/settings-subscription.spec.ts:6`  
"subscription page shows current plan, usage, and billing action"

**Root cause:** The `/api/subscription` endpoint must return a `plan_tier` field matching `starter | professional | enterprise | trial`. If the test user has no subscription record, it may return `null` or throw.

**Fix steps:**

1. In `app/api/subscription/route.ts`, ensure it returns a default of `{ plan_tier: 'trial', ... }` if no subscription row exists for the user.
2. Ensure the subscription page renders the plan tier badge visibly (not just in a hidden span).
3. Confirm a billing action button exists — either "Manage Subscription" or "Upgrade Plan".

---

## 4. API Route Runtime Errors

### 4a. Vendor reviews route timeout

**Failing test:** `tests/vendor-reviews.spec.ts:23` — ran for **2.0 minutes** (test default timeout is likely 60 s)

This is the slowest failing test. After the DB migration in §2e is applied, the test should pass. However, the full flow (create event → assign vendor → navigate to review page → submit → verify via API) is inherently slow.

**Fix steps:**

1. Apply the `vendor_reviews` migration from §2e.
2. In `app/(dashboard)/events/[eventId]/review/page.tsx`, ensure the star rating buttons have stable selectors (e.g., `data-testid="star-4"` or `aria-label="4 stars"`).
3. Consider increasing the timeout for this single test in the spec file:
   ```ts
   test.setTimeout(90_000);
   ```

### 4b. Vendor communications contact route

**Failing test:** `tests/vendor-communications.spec.ts:14`

After applying the `vendor_communications` migration from §2d, the `POST /api/events/[eventId]/vendors/[associationId]/contact/route.ts` should work. Verify it:
- Inserts a row into `vendor_communications`
- Updates `event_vendors.outreach_status` to `'contacted'`
- Returns `200` with the created record

### 4c. Client communications route

**Failing test:** `tests/client-communications.spec.ts:14`

After the migration from §2c, verify that `app/api/clients/[clientId]/communications/route.ts`:
- Validates `client_id` belongs to the authenticated user's venue (RLS check)
- Returns the newly created record in the GET response

### 4d. Venue marketplace route

**Failing test:** `tests/venue-marketplace.spec.ts:14`

After the migration from §2b, verify `app/api/venues/[venueId]/marketplace/route.ts`:
- Uses upsert (insert-or-update) on `venue_marketplace_settings`
- Returns the current settings on GET
- The test verifies `is_visible_on_marketplace` toggles persist

---

## 5. Auth & Environment Issues

### 5a. New user onboarding flow

**Failing test:** `tests/auth-onboarding.spec.ts:58`  
"new user can complete onboarding and reach dashboard"

**Root cause:** The onboarding test creates a new Supabase user via the admin API, then attempts to complete the email verification step and venue setup form. This can fail if:
- The test email isn't whitelisted to skip OTP in the Supabase test environment
- The `/onboarding/venue-setup` page selectors don't match ("Venue Name", "complete setup" button)
- The `onboarding_complete` flag on the profile table isn't being set

**Fix steps:**

1. Confirm `app/(auth)/signup/page.tsx` redirects to `/onboarding/venue-setup` after signup.
2. Confirm `app/(dashboard)/onboarding/venue-setup/page.tsx` (or wherever the onboarding form lives) renders all fields the test expects:
   - "Venue Name" input
   - "Type" select
   - Address fields: City, State, Zip
   - "Complete Setup" button
3. For CI, configure Supabase to use a "magic link" or "OTP bypass" for test emails matching `*@playwright.test`.
4. Alternatively, skip the full signup flow and use `buildAdminClient()` to create the user + session directly, then navigate to the onboarding page.

### 5b. Missing `.env.local` test variables

Several tests require environment variables that may not be set:

| Variable | Used by |
|----------|---------|
| `TEST_USER_EMAIL` | All authenticated tests |
| `TEST_USER_PASSWORD` | All authenticated tests |
| `TEST_VENUE_SLUG` | Venue-slug-dependent tests |
| `TEST_SUPABASE_URL` | Seed fixture tests |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | Seed fixture tests |

**Fix:** Ensure `.env.local` contains all five variables. The `tests/helpers/requirements.ts` helpers will throw a clear error if any are missing, which shows up as a test failure rather than a skip.

---

## Fix Priority Order

Apply fixes in this order to unblock the most tests fastest:

1. **Database migrations** (§2a–2e) — unblocks ~12 tests across venue-packages, marketplace, communications, and reviews with zero code changes
2. **Homepage rewrite** (§1) — unblocks 7 public-marketplace tests
3. **Subscription API default** (§3f) — unblocks settings-subscription test (1 line change in API route)
4. **Dashboard stat card fallback** (§3c) — unblocks manager-portal stat cards test (1 line change)
5. **Checkout success null-check** (§3b) — unblocks checkout test (small guard clause)
6. **Vendor filter combobox** (§3a) — verify selector, likely already works once DB exists
7. **Settings team selectors** (§3e) — align UI text with test assertions
8. **NLP textarea on events/new** (§3d) — add NLP UI to event creation form
9. **Onboarding flow** (§5a) — most complex fix, involves auth flow
10. **Vendor reviews timeout** (§4a) — apply DB migration + bump test timeout

---

## Migrations Checklist

Create these files under `supabase/migrations/` (or apply via Supabase Studio):

- [ ] `YYYYMMDDHHMMSS_add_venue_packages.sql`
- [ ] `YYYYMMDDHHMMSS_add_venue_marketplace_settings.sql`
- [ ] `YYYYMMDDHHMMSS_add_client_communications.sql`
- [ ] `YYYYMMDDHHMMSS_add_vendor_communications.sql`
- [ ] `YYYYMMDDHHMMSS_add_vendor_reviews.sql`
- [ ] `YYYYMMDDHHMMSS_add_event_vendors_outreach_status.sql`
- [ ] `YYYYMMDDHHMMSS_add_vendors_reliability_score.sql`

---

## Quick Validation Commands

```bash
# Run only the failing test groups
npx playwright test tests/venue-packages.spec.ts tests/venue-marketplace.spec.ts tests/client-communications.spec.ts tests/vendor-communications.spec.ts --project=chromium

npx playwright test tests/public-marketplace.spec.ts --project=chromium

npx playwright test tests/settings-subscription.spec.ts tests/settings-team.spec.ts --project=chromium

npx playwright test tests/vendor-filter.spec.ts tests/checkout-pages.spec.ts --project=chromium

npx playwright test tests/vendor-reviews.spec.ts --project=chromium --timeout=120000
```

After all fixes, run the full suite:
```bash
npm run test:e2e
```
