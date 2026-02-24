# Automated Test Task Plan

Based on `docs/testing/MANUAL_TEST_CHECKLIST.md`, current Playwright coverage in `tests/`, and the actual implemented codebase.

---

## Assessment of Previous Plan

The previous plan had several critical misalignments with the actual codebase:

1. **Phase 2 was invalid**: Tasks 2.1–2.3 described a public marketplace (`/venues` search, location filters, price sliders, pagination) that does not exist. The app uses `[venueSlug]` for individual public venue pages — it is a SaaS product, not a venue marketplace.
2. **All existing tests are structure/presence tests**: Every spec checks if headings or buttons are visible. None test CRUD operations, form submissions, or data persistence.
3. **Three entire modules are untested**: `/clients`, `/spaces`, and `/onboarding` have no coverage.
4. **AI tests are stubs**: `ai-features.spec.ts` mostly navigates to a page and either passes trivially or calls `test.skip()`. No AI business outcome is validated.
5. **No API integration layer exists**: Tasks A.1/A.2 were planned but never started.
6. **RLS tests are not implemented**: Only referenced conceptually; no actual cross-tenant assertions exist.
7. **No subscription/billing flow**: Stripe checkout and usage-limit enforcement are uncovered.
8. **No venue public page editor tests**: The page editor at `/venues/[venueId]/public-page` is entirely untested.

---

## Goal

Replace all structure-only tests with business-outcome tests. Add coverage for every implemented module. Achieve a state where CI catches regressions in CRUD, business logic, AI workflows, auth, and security.

---

## Scope

- **In scope**: E2E (Playwright), API integration tests, security/RLS assertions, performance budgets.
- **Out of scope**: Visual snapshot diffing, exhaustive cross-browser matrix beyond configured Playwright projects, Phase 2 marketplace features (not yet built).

---

## Current Baseline (honest)

| File | What it actually tests |
|---|---|
| `public-marketplace.spec.ts` | Page presence, heading text, link `href` attributes |
| `manager-portal.spec.ts` | Page loads, button/search-input visibility — no mutations |
| `ai-features.spec.ts` | Navigation to pages; most paths end in `test.skip()` |
| `mobile-responsiveness.spec.ts` | Viewport overflow checks and layout visibility |
| `performance-security.spec.ts` | Load time thresholds, redirect-to-login guards |

**Gap**: Zero tests validate that creating, editing, or deleting data works. Zero tests verify data persists after a page reload.

---

## Phase 1: Foundation (P0 — prerequisite for everything else)

### Task 1.1 — Seed & Teardown Infrastructure

- Create `tests/fixtures/seed.ts`: programmatic helper that calls `POST /api/seed` with an authenticated service-role token and returns known IDs (eventId, vendorId, clientId, leadId, spaceId, venueId, venueSlug).
- Create `tests/fixtures/teardown.ts`: delete test-created records by ID after each test (use Supabase service-role client directly).
- Add `TEST_SUPABASE_SERVICE_ROLE_KEY` and `TEST_SUPABASE_URL` to `TEST_ENV_CONTRACT.md`.
- Extend `tests/helpers/requirements.ts` with helpers: `requireSeedData()`, `getTestIds()`.
- **Done criteria**: Any test file can call `getTestIds()` and receive valid DB-backed IDs deterministically.

### Task 1.2 — Auth Helper Consolidation

- Create `tests/helpers/auth.ts` with `loginAs(page, email, password)` and `loginAsTestUser(page)` helpers.
- Add `data-testid="logout-button"` and `data-testid="user-menu"` to the dashboard layout so logout flows use stable locators.
- **Done criteria**: No test file duplicates login logic; logout test is stable across 3 consecutive runs.

### Task 1.3 — `data-testid` Attribute Baseline

Identify and add `data-testid` attributes to the 10 most-clicked interactive elements:
1. Sidebar nav links (events, vendors, leads, clients, spaces, calendar, venues, settings)
2. Primary CTA buttons on each list page (Create Event, Add Vendor, Add Client, Add Space, New Venue)
3. Status dropdowns on event and lead detail pages
4. Publish/Unpublish toggle on public page editor
5. AI chat bubble on public venue page
6. Proposal "Generate" and "Send" buttons on lead detail
- **Done criteria**: All 10 targets have `data-testid`; tests referencing them pass without text-matching.

### Task 1.4 — CI Pipeline

- Add GitHub Actions workflow (`.github/workflows/test.yml`) with stages:
  1. `lint` — ESLint
  2. `build` — `next build`
  3. `playwright-smoke` — run only `@smoke`-tagged tests (chromium only, fastest path)
  4. `playwright-full` — nightly full suite across all Playwright projects
- Upload HTML reports and traces as artifacts on failure.
- Block PRs on smoke failures; nightly is advisory only.
- **Done criteria**: PRs fail if any `@smoke`-tagged test fails; nightly report is linkable.

---

## Phase 2: Auth & Onboarding Flows (P0)

### Task 2.1 — Signup → Onboarding → Dashboard Happy Path

- Create `tests/e2e/auth-onboarding.spec.ts`.
- Use a disposable email (timestamp-based unique address) to sign up via the UI form.
- Assert redirect to `/onboarding` after signup.
- Complete the onboarding wizard steps (venue name, address, type).
- Assert redirect to `/dashboard` with the newly created venue in context.
- Assert the new user/venue is cleaned up in `afterEach`.
- **Done criteria**: Full new-user journey completes without errors in 3 consecutive runs. Tag: `@smoke`.

### Task 2.2 — Login & Logout

- Convert existing `2.1 Authentication` tests from structure checks to actual flow assertions:
  - Login with valid credentials → assert dashboard URL.
  - Login with invalid credentials → assert specific error message.
  - Logout via `data-testid="logout-button"` → assert redirect to `/login` or `/`.
- **Done criteria**: Login/logout cycle is validated end-to-end. Tag: `@smoke`.

### Task 2.3 — Password Reset Initiation

- Navigate to "Forgot Password" from login page.
- Fill in test email, submit.
- Assert success message appears (no email delivery assertion needed in CI).
- **Done criteria**: Form submission returns a success state without crashing.

---

## Phase 3: Core CRUD Flows (P0)

All tasks in this phase must: (a) create a record via the UI, (b) assert it appears in the list, (c) open the detail/edit page, (d) edit a field, (e) assert the edit persists after reload, (f) delete the record, (g) assert it is gone.

### Task 3.1 — Event CRUD + Status Lifecycle

- Create `tests/e2e/event-crud.spec.ts`.
- **Create**: Fill the manual event form (`/events/new`) with all required fields. Submit. Assert redirect to event detail page.
- **Read**: Assert event name, date, and guest count are visible on detail page.
- **Edit**: Navigate to `/events/[eventId]/edit`. Change event name. Save. Assert new name persists after reload.
- **Status change**: Change status dropdown to "Confirmed". Assert status label updates. Reload and assert persistence.
- **Delete / Cancel**: Trigger cancel action. Assert event no longer appears in `/events` list.
- **Done criteria**: Full lifecycle validated without manual intervention. Tag: `@smoke` for create+read.

### Task 3.2 — Vendor CRUD

- Create `tests/e2e/vendor-crud.spec.ts`.
- **Create**: Fill `/vendors/new` form (name, category, contact). Submit.
- **Read**: Assert vendor appears in `/vendors` list with correct category badge.
- **Edit**: Open `/vendors/[vendorId]/edit`. Change cost structure. Save. Assert change persists.
- **Delete**: Delete vendor. Assert gone from list.
- **Done criteria**: Full lifecycle validated.

### Task 3.3 — Client CRUD

- Create `tests/e2e/client-crud.spec.ts`.
- **Create**: Fill `/clients/new` form (name, email, phone). Submit.
- **Read**: Assert client appears in `/clients` list.
- **Edit**: Open `/clients/[clientId]/edit`. Change name. Save. Assert persists.
- **Delete**: Delete client. Assert gone.
- **Done criteria**: Full lifecycle validated. (Currently zero coverage for this module.)

### Task 3.4 — Space CRUD

- Create `tests/e2e/space-crud.spec.ts`.
- **Create**: Fill `/spaces/new` form (name, capacity, type). Submit.
- **Read**: Assert space appears in `/spaces` list.
- **Edit**: Open `/spaces/[spaceId]/edit`. Change capacity. Save. Assert persists.
- **Delete**: Delete space. Assert gone.
- **Done criteria**: Full lifecycle validated. (Currently zero coverage for this module.)

### Task 3.5 — Venue CRUD + Public Page Editor

- Create `tests/e2e/venue-management.spec.ts`.
- **Create**: Fill `/venues/new` form. Submit.
- **Edit Basic Info**: Open `/venues/[venueId]/edit`. Change name. Save. Assert persists.
- **Public Page Editor** (`/venues/[venueId]/public-page`):
  - Update tagline. Save. Assert change is visible in preview.
  - Add a space entry. Assert it appears in the spaces list.
  - Toggle AI tone setting. Save. Assert new value is selected on reload.
- **Publish/Unpublish**: Click publish toggle. Assert status badge changes. Navigate to `/{venueSlug}` and assert the page is publicly accessible. Unpublish. Assert `/{venueSlug}` returns not-found or 404.
- **Done criteria**: Publish/unpublish cycle validated end-to-end.

---

## Phase 4: Business Logic Flows (P0)

### Task 4.1 — Lead Lifecycle (CRM)

- Create `tests/e2e/lead-lifecycle.spec.ts`.
- Use seed data to have a known lead in the DB.
- Navigate to `/leads`. Assert the seeded lead appears.
- Open lead detail. Assert chat transcript section is visible.
- Change status to "Qualified". Assert status label updates. Reload and assert persistence.
- Change status to "Won". Assert.
- Verify "Convert to Event" action (if visible) navigates to `/events/new` pre-filled or creates an event directly.
- **Done criteria**: Status changes persist across reloads. Tag: `@smoke` for list load.

### Task 4.2 — Space Conflict Detection

- Create `tests/e2e/event-conflict.spec.ts`.
- Use seed data: space S with an existing event on date D.
- Create a new event attempting to assign space S on the same date/time D.
- Assert the UI shows an explicit conflict warning or blocks the save action.
- Assert no duplicate booking record is created.
- **Done criteria**: Conflicting booking attempt produces a visible error. This is a hard safety requirement.

### Task 4.3 — Vendor Matching Score Display

- Navigate to a seeded event's Vendors tab.
- Click "Match Vendors".
- Assert vendor recommendation cards appear with a score value (numeric or percentage).
- Assert at least one vendor card has a score > 0.
- Assign a vendor from recommendations. Assert it appears in the assigned vendors list.
- **Done criteria**: Matching UI produces results and assignment persists.

### Task 4.4 — Calendar Integration

- Navigate to `/calendar`.
- Assert a seeded event appears on the correct date cell.
- Switch from Month to Week view. Assert event is still visible.
- Click the event on the calendar. Assert navigation to the event detail page.
- **Done criteria**: Calendar renders real data; click-through navigation works.

### Task 4.5 — Budget Tracking on Event Detail

- Navigate to a seeded event detail.
- Open the Budget tab.
- Assert budget summary shows total budget, allocated amount, and variance.
- Edit a vendor's quoted cost. Assert the variance recalculates.
- **Done criteria**: Budget figures update in response to vendor cost changes.

---

## Phase 5: AI Workflow Flows (P1)

### Task 5.1 — Natural Language Event Creation (End-to-End)

- Replace the stub in `ai-features.spec.ts` with a real flow.
- Navigate to `/events/new`.
- Select the Natural Language / AI tab.
- Type: `"Birthday party for 80 guests on March 15th, budget $5000"`.
- Assert the AI extraction fills form fields: guest count (~80), a date near March 15th, a budget of $5000.
- Submit the extracted form. Assert event is created and visible in `/events` list.
- **Done criteria**: NLP extraction populates at least 3 of 4 expected fields.

### Task 5.2 — AI Chat → Lead Capture (Public Venue Page)

- Extend `ai-features.spec.ts` chat tests with a full conversation flow.
- Open chat on `/{TEST_VENUE_SLUG}`.
- Send: `"I'm looking to book a corporate event for 100 people in July."`.
- Assert AI replies with a qualifying question.
- Provide name and email in chat.
- Assert AI acknowledges and indicates a follow-up.
- As the test manager user, navigate to `/leads`. Assert a new lead with the provided name/email is visible.
- **Done criteria**: Chat interaction creates a persisted lead record.

### Task 5.3 — Vendor Outreach Agent Lifecycle

- Create `tests/e2e/vendor-outreach.spec.ts`.
- Navigate to a seeded event's agent page (`/events/[eventId]/agent`).
- Trigger the "Engage Vendors with AI" action.
- Assert communication log shows at least one entry with "Pending" or "Contacted" status.
- Simulate a vendor reply via `POST /api/events/[eventId]/vendors/[associationId]/response` (test endpoint).
- Assert the vendor status updates to "Available" or "Responded".
- **Done criteria**: Agent lifecycle transitions are validated. If real email is in scope, use a test/mock email address.

### Task 5.4 — Proposal Generation & Send

- Create `tests/e2e/proposal-flow.spec.ts`.
- Navigate to a seeded lead's detail page.
- Click "Generate Proposal".
- Assert a loading state appears, then a proposal preview or download link.
- Click "Send to Client".
- Assert a success toast or delivery confirmation message.
- Assert a proposal record exists (via API assertion or UI log).
- **Done criteria**: Proposal generation completes without error; send action returns success.

---

## Phase 6: Subscription & Billing (P1)

### Task 6.1 — Subscription Page & Plan Display

- Navigate to `/settings/subscription`.
- Assert current plan name is visible (Starter or Pro).
- Assert usage stats (leads used / limit, photos used / limit) are displayed with correct values against seeded data.
- **Done criteria**: Plan and usage information render correctly with real data.

### Task 6.2 — Usage Limit Enforcement

- Using a seed account at or near its plan limit:
- Attempt to create one more record than the limit allows (e.g., add a photo when at photo limit).
- Assert a limit-reached error or upgrade prompt appears.
- Assert the record was NOT created.
- **Done criteria**: Hard limits are enforced in the UI with a clear message.

### Task 6.3 — Stripe Checkout Initiation

- Click the "Upgrade" button on `/settings/subscription`.
- Assert a redirect to a Stripe checkout URL (contains `stripe.com` or `checkout.stripe.com`).
- (No payment submission needed in CI — redirect assertion is sufficient.)
- **Done criteria**: Upgrade flow routes to Stripe without error.

---

## Phase 7: Security & RLS (P0)

### Task 7.1 — Cross-Tenant Data Isolation (RLS)

- Create `tests/e2e/security-rls.spec.ts`.
- Provision two test accounts (User A and User B) via seed.
- Log in as User A. Note the ID of User A's venue.
- Log in as User B. Attempt to navigate to `/venues/[userA-venueId]/edit`.
- Assert redirect or "Not Found" — User B cannot see User A's data.
- Repeat for leads, events, clients: attempt to fetch User A's resource URLs as User B.
- **Done criteria**: Every cross-tenant URL access returns a redirect, 403, or controlled not-found.

### Task 7.2 — API-Level Auth Boundaries

- Expand `tests/performance-security.spec.ts` beyond route guards:
- For each key API endpoint, send an unauthenticated request and assert 401:
  - `GET /api/events`
  - `POST /api/events`
  - `GET /api/leads`
  - `PATCH /api/leads/[leadId]`
  - `GET /api/venues/[venueId]/public-page` (manager-only fields)
- **Done criteria**: Every endpoint returns 401 (not 200 or 500) when called without a session token.

### Task 7.3 — Public vs. Private Venue Data

- Assert that a published venue's public API (`/api/venues/public/[slug]`) returns venue data.
- Assert that an unpublished venue's public slug returns 404 or `{ published: false }`.
- Assert that private manager fields (e.g., revenue, lead emails) are NOT present in the public API response.
- **Done criteria**: Public API leaks no private manager data.

---

## Phase 8: Mobile Functional Parity (P1)

Replace all layout-only mobile tests with interaction tests:

### Task 8.1 — Mobile Dashboard Navigation

- On iPhone viewport: assert hamburger menu button is visible.
- Click hamburger. Assert slide-out nav opens with all nav links visible.
- Click "Events" link. Assert navigation to `/events` succeeds.
- **Done criteria**: Mobile nav is interactive, not just visible.

### Task 8.2 — Mobile Public Venue Page Inquiry Flow

- On iPhone viewport: navigate to `/{TEST_VENUE_SLUG}`.
- Assert "Request Quote" button or inquiry CTA is accessible without horizontal scrolling.
- Tap the CTA. Assert the inquiry form opens/scrolls into view.
- Fill and submit the form. Assert success message.
- **Done criteria**: Inquiry form is completable on mobile.

### Task 8.3 — Mobile Chat Widget Full-Screen

- On iPhone viewport: open AI chat on public venue page.
- Assert chat panel fills the screen (height ≥ viewport height × 0.9).
- Send a test message. Assert reply appears.
- **Done criteria**: Chat is fully interactive in mobile full-screen mode.

---

## Phase 9: Performance Budgets (P1)

### Task 9.1 — Tighten Load Time Thresholds

- Update `performance-security.spec.ts` thresholds to match the manual checklist target (2 seconds):
  - Homepage: < 2000ms (down from 5000ms)
  - Login page: < 2000ms (down from 4000ms)
  - Public venue page (when `TEST_VENUE_SLUG` is set): < 2500ms
- **Done criteria**: Failures surface in CI when page load exceeds budget.

### Task 9.2 — Dashboard Load Budget

- Add authenticated performance test for `/dashboard` load time.
- Target: < 3000ms to first meaningful content (stat cards visible).
- **Done criteria**: Dashboard load budget tracked in CI.

---

## API Integration Test Layer (P0.5)

The app has **76 API routes**, **4 Inngest functions**, and **3 webhook handlers**. The previous plan covered 12 routes superficially. This section covers all critical paths with specific test cases.

### Route Inventory Summary

| Resource | Routes | Methods | External Services |
|---|---|---|---|
| Events | 9 routes | GET/POST/PUT/DELETE | Supabase, conflict detection |
| Vendors | 3 routes | GET/POST/PUT/DELETE | Supabase |
| Venues (private) | 18 routes | GET/POST/PUT/DELETE | Supabase, Stripe (limits) |
| Venues (public) | 5 routes | GET/POST | Anthropic (chat), Supabase |
| Spaces | 3 routes | GET/POST/PUT/DELETE | Supabase, conflict detection |
| Leads | 5 routes | GET/POST/PUT/DELETE | Supabase |
| Clients | 3 routes | GET/POST/PUT/DELETE | Supabase |
| Quotes | 4 routes | GET/POST/PUT | Supabase |
| Proposals | 3 routes | GET/PUT/DELETE/POST | Supabase, Resend |
| Communications | 2 routes | GET | Supabase |
| Agent (AI outreach) | 3 routes | GET/POST | Supabase, Inngest |
| AI services | 1 route | GET/POST | Anthropic |
| Subscription | 6 routes | GET/POST | Stripe, Supabase |
| Calendar | 2 routes | GET | Supabase |
| Profile | 1 route | GET/PUT | Supabase |
| Notifications | 1 route | GET/PUT | Supabase |
| Cron | 2 routes | GET | Supabase, Inngest |
| Inngest handler | 1 route | GET/POST/PUT | Inngest |
| Webhooks | 3 routes | POST | Stripe, Resend, Inngest |
| Seed | 1 route | POST | Supabase |

---

### Task A.1 — API Test Infrastructure

- Create `tests/integration/` directory.
- Create `tests/integration/helpers/api-client.ts`:
  - `authenticatedRequest(method, path, body?)` — uses a test user's JWT from `auth.setup.ts` session state.
  - `unauthenticatedRequest(method, path, body?)` — sends request with no auth headers.
  - `adminRequest(method, path, body?)` — uses service-role key for seeding/cleanup.
- Add `TEST_BASE_URL` to `TEST_ENV_CONTRACT.md` (defaults to `http://localhost:3000` for local; set to Vercel preview URL in CI).
- Configure Jest or Vitest for integration test runner (separate from Playwright, runs headless).
- **Done criteria**: All three request helpers work and integration tests run as a separate CI stage.

---

### Task A.2 — Events API

Create `tests/integration/events.test.ts`.

**Auth boundaries (test first):**
- `GET /api/events` with no auth → assert 401.
- `POST /api/events` with no auth → assert 401.
- `GET /api/events/[otherUsersEventId]` as wrong user → assert 403 or 404.

**CRUD contracts:**
- `POST /api/events` with valid body → assert 201, response has `id`, `name`, `status: "planning"`.
- `GET /api/events/[eventId]` → assert full event shape including nested `space`, `client`, `vendors`.
- `PUT /api/events/[eventId]` with `{ name: "Updated Name" }` → assert 200, response `name` is updated.
- `POST /api/events/[eventId]/cancel` → assert 200, event `status` is `"cancelled"`.
- `DELETE /api/events/[eventId]` → assert 204, subsequent GET returns 404.

**Space conflict detection (critical business rule):**
- Create Event A occupying Space S from 10:00–14:00 on date D.
- `POST /api/events` with Space S, same date D, overlapping time 12:00–16:00 → assert 409 or 400 with conflict error in body.
- Same request with non-overlapping time 14:00–16:00 → assert 201 (allowed).

**Vendor sub-routes:**
- `GET /api/events/[eventId]/vendors` → assert array shape with `vendor_id`, `status`, `role`.
- `POST /api/events/[eventId]/vendors/[associationId]/response` with `{ status: "available", quoted_amount: 1500 }` → assert association status updated.
- `GET /api/events/[eventId]/vendors/[associationId]/communications` → assert array with `direction`, `content`, `sent_at`.

**Subscription limit enforcement:**
- Using a test account at its event creation limit → `POST /api/events` → assert 402 or 403 with limit error.

**Done criteria**: All conflict detection, ownership, and CRUD contracts validated without UI.

---

### Task A.3 — Venues (Private) API

Create `tests/integration/venues-private.test.ts`.

**Auth boundaries:**
- All `GET/POST/PUT/DELETE /api/venues/*` with no auth → assert 401.

**CRUD contracts:**
- `POST /api/venues` with valid body → assert 201, response has `id`, `slug`, `status: "draft"`.
- `GET /api/venues` → assert array, each item has `id`, `name`, `status`.
- `PUT /api/venues/[venueId]` with updated name → assert name persists in subsequent GET.
- `DELETE /api/venues/[venueId]` → assert 204 or 200.

**Slug uniqueness:**
- `GET /api/venues/check-slug?slug=taken-slug` (seed a venue with this slug first) → assert `{ available: false }`.
- `GET /api/venues/check-slug?slug=totally-unique-slug-xyz` → assert `{ available: true }`.

**Publish flow (validation-heavy):**
- `POST /api/venues/[venueId]/publish` on a venue with no hero photo, no spaces → assert 400 with validation errors listing what is missing.
- After seeding: hero photo + at least one space + at least one package → `POST /api/venues/[venueId]/publish` → assert 200 with `versionId`.
- `POST /api/venues/[venueId]/unpublish` → assert 200, subsequent `GET /api/venues/public/[slug]` returns 404.

**Venue sub-resources:**
- `POST /api/venues/[venueId]/photos` with photo data → assert 201, response has `id`, `url`.
- `POST /api/venues/[venueId]/amenities` → assert created.
- `PUT /api/venues/[venueId]/ai-settings` with `{ tone: "friendly" }` → assert `tone` persists in GET.

**Versioning:**
- After two publish actions, `GET /api/venues/[venueId]/versions` → assert at least 2 version entries.
- `POST /api/venues/[venueId]/versions/[versionId]/restore` → assert 200.

**Done criteria**: Publish validation, slug checks, and sub-resource contracts are all verified.

---

### Task A.4 — Venues (Public) API

Create `tests/integration/venues-public.test.ts`.

**No auth required (assert public access works):**
- `GET /api/venues/public/[publishedSlug]` → assert 200, response has `name`, `spaces`, `packages` but NOT `owner_id`, `revenue`, or lead emails.
- `GET /api/venues/public/[unpublishedSlug]` → assert 404.
- `GET /api/venues/public/[publishedSlug]/availability?date=2026-06-15` → assert response has `available: true|false` per space.

**Lead creation from public inquiry:**
- `POST /api/venues/public/[slug]/inquiries` with `{ name, email, event_date, guest_count }` → assert 201, a lead record exists in the DB with `source: "inquiry"`.
- Same request without `email` → assert 400.

**Data leakage check:**
- Parse `GET /api/venues/public/[slug]` response body → assert none of the following keys are present: `owner_id`, `stripe_customer_id`, `revenue_total`, `lead_emails`.

**Done criteria**: Public API exposes correct data and creates leads reliably.

---

### Task A.5 — Leads API

Create `tests/integration/leads.test.ts`.

**Auth boundaries:**
- `GET /api/leads` with no auth → 401.
- `GET /api/leads/[otherUsersLeadId]` as wrong user → 403 or 404.

**CRUD + filtering:**
- `POST /api/leads` with `{ name, email, source: "manual" }` → assert 201.
- `GET /api/leads` → assert array with seeded lead.
- `GET /api/leads?status=new` → assert only leads with `status: "new"` are returned.
- `GET /api/leads?search=John` → assert only leads matching "John" in name/email.
- `PUT /api/leads/[leadId]` with `{ status: "qualified" }` → assert status updated.
- `DELETE /api/leads/[leadId]` → assert 204.

**Business flow routes:**
- `GET /api/leads/[leadId]/activities` → assert array with at least one `created` activity after lead creation.
- `POST /api/leads/[leadId]/convert-to-event` → assert 201, a new event exists linked to the lead's client/date, lead `status` is updated to `"converted"`.
- `GET /api/leads/[leadId]/proposal` → assert proposal object or empty state.

**Done criteria**: Lead filtering, status changes, and the conversion flow are verified.

---

### Task A.6 — Clients, Spaces, Vendors API

Create `tests/integration/clients-spaces-vendors.test.ts`.

**Clients:**
- `POST /api/clients` → assert 201 with `id`, `name`.
- `GET /api/clients?search=Jane` → assert filtered by name.
- `GET /api/clients/[clientId]` → assert includes `event_count`.
- `PUT /api/clients/[clientId]` → assert name update persists.
- `DELETE /api/clients/[clientId]` → assert 204.

**Spaces:**
- `POST /api/spaces` → assert 201.
- `GET /api/spaces/availability?spaceId=X&date=D&startTime=T1&endTime=T2` with no conflicts → assert `{ available: true }`.
- Same request with an existing event occupying that slot → assert `{ available: false }`.
- `PUT /api/spaces/[spaceId]` → assert capacity update persists.

**Vendors:**
- `POST /api/vendors` → assert 201, response has `id`, `name`, `category`.
- `GET /api/vendors?venueId=X` → assert filtered to venue's vendors.
- Subscription limit test: at vendor limit → `POST /api/vendors` → assert 402 or 403.
- `POST /api/vendors/[vendorId]/reviews` with `{ rating: 5, comment: "Excellent" }` → assert 201, vendor `reliability_score` is updated.
- `GET /api/vendors/[vendorId]/reviews` → assert review array includes the created review.

**Done criteria**: Subscription limits, availability conflict, and review-score recalculation all verified.

---

### Task A.7 — Quotes Lifecycle API

Create `tests/integration/quotes.test.ts`.

- `GET /api/quotes?eventId=X` → assert array with correct shape (`vendor_id`, `amount`, `status`).
- `PUT /api/quotes/[quoteId]` with `{ amount: 2500 }` → assert amount updated.
- `POST /api/quotes/[quoteId]/approve` → assert `status: "approved"`, verify no other quotes for the same event+service remain approved (only one can be approved at a time — if this is a business rule, assert it).
- `POST /api/quotes/[quoteId]/reject` → assert `status: "rejected"`.
- Auth boundary: `POST /api/quotes/[quoteId]/approve` by wrong user → assert 403 or 404.

**Done criteria**: Quote state machine (pending → approved/rejected) is validated at API level.

---

### Task A.8 — Proposals API

Create `tests/integration/proposals.test.ts`.

- `POST /api/leads/[leadId]/proposal` → assert 201, response has `id`, `status: "draft"`.
- `GET /api/proposals/[proposalId]` → assert proposal shape with `venue`, `packages`, `spaces`.
- `PUT /api/proposals/[proposalId]` with updated content → assert persists.
- `POST /api/proposals/[proposalId]/send`:
  - In CI with Resend mocked/disabled → assert 200 or 202 response (no hard email assertion).
  - Assert `status` changes to `"sent"` and `sent_at` is populated.
- Auth boundary: access another user's proposal → assert 403 or 404.

**Done criteria**: Full proposal lifecycle from draft to sent is verified.

---

### Task A.9 — Subscription & Billing API

Create `tests/integration/subscription.test.ts`.

- `GET /api/subscription` → assert response has `plan`, `status`, `current_period_end`.
- `GET /api/subscription/plans` → assert array with at least 2 plan objects, each having `name`, `price`, `limits`.
- `GET /api/subscription/usage` → assert response has `events_used`, `vendors_used`, `venues_used` with numeric values.
- `POST /api/subscription/trial` (new account) → assert 200, `status: "trial"`, `trial_end` is set in the future.
- `POST /api/subscription` with valid `planId` → assert response has `checkoutUrl` containing `stripe.com` or `checkout.stripe.com`.
- `POST /api/subscription/portal` → assert response has `portalUrl` containing `billing.stripe.com`.
- `POST /api/subscription/sync` → assert 200, subscription record matches Stripe state.

**Done criteria**: Subscription state, usage tracking, and Stripe URL generation verified.

---

### Task A.10 — Agent (AI Outreach) API

Create `tests/integration/agent.test.ts`.

**Feature flag guard:**
- When `ENABLE_AI_AGENT=false` → all `/api/agent/*` routes return 503 or 404 with a clear message. Assert this.

**When `ENABLE_AI_AGENT=true`:**
- `POST /api/agent/start` with `{ eventId, vendorIds: [v1, v2] }` → assert 200, response has `agentRunId`.
  - Assert an `agent_runs` record was created in DB with `status: "running"`.
  - Assert Inngest `agent/outreach.started` event was dispatched (check `agent_runs.inngest_event_id` is set).
- `GET /api/agent/status?agentRunId=X` → assert response has `status`, `progress`, `total_vendors`.
- `POST /api/agent/status` with `{ agentRunId, action: "pause" }` → assert `status: "paused"` in DB.
- `POST /api/agent/status` with `{ agentRunId, action: "resume" }` → assert `status: "running"`.
- `POST /api/agent/status` with `{ agentRunId, action: "cancel" }` → assert `status: "cancelled"`.
- `POST /api/agent/process-reply` with `{ agentRunId }` → assert 200.

**Auth boundary:**
- All agent routes with no auth → assert 401.
- `POST /api/agent/start` with eventId belonging to a different user → assert 403.

**Done criteria**: Agent lifecycle state machine and feature flag guard are verified.

---

### Task A.11 — AI Extract Event API

Create `tests/integration/ai-extract.test.ts`.

**Feature flag guard:**
- `GET /api/ai/extract-event` → assert response has `{ enabled, configured }` booleans.
- When `ENABLE_NL_EVENT_CREATION=false` → `POST /api/ai/extract-event` → assert 503 or 400.

**When `ENABLE_NL_EVENT_CREATION=true` and `ANTHROPIC_API_KEY` is set:**
- `POST /api/ai/extract-event` with `{ userInput: "Corporate dinner for 60 people on April 10th, budget $8000" }` → assert 200, response has `data.guest_count` ≈ 60, `data.budget` ≈ 8000, `data.event_date` contains April.
- `POST /api/ai/extract-event` with `{ userInput: "hi" }` (too short / no extractable data) → assert 200 with partial or empty extraction, or 400 with validation error — not a 500.
- `POST /api/ai/extract-event` with no body → assert 400.

**Done criteria**: NLP extraction returns structured data for a valid input, and edge cases don't crash the endpoint.

---

### Task A.12 — Communications & Notifications API

Create `tests/integration/comms-notifications.test.ts`.

**Communications:**
- `GET /api/communications?eventId=X` → assert array with `direction`, `content`, `vendor`, `sent_at`.
- `GET /api/communications?eventId=X&direction=inbound` → assert only inbound messages.
- `GET /api/communications/thread?vendorId=V&eventId=E` → assert chronological thread.
- Auth boundary: wrong user's eventId → assert 403 or 404.

**Client communications:**
- `GET /api/clients/[clientId]/communications` → assert array.

**Notifications:**
- `GET /api/notifications` → assert array, each item has `type`, `created_at`.
- `PUT /api/notifications` with `{ ids: [id1, id2] }` → assert 200, `{ success: true }`.

**Done criteria**: Communication thread queries and notification read-marking verified.

---

### Task A.13 — Webhook Handlers

Create `tests/integration/webhooks.test.ts`.

These tests POST simulated webhook payloads directly to the routes.

**Stripe webhook (`POST /api/webhooks/stripe`):**
- Missing `stripe-signature` header → assert 400.
- Invalid signature → assert 400.
- Valid `checkout.session.completed` payload (construct with Stripe test helper or mock) → assert subscription record is created/updated in DB.
- Valid `customer.subscription.deleted` → assert subscription `status` changes to `"cancelled"`.
- Valid `invoice.payment_failed` → assert subscription `status` changes to `"past_due"`.

**Resend email delivery webhook (`POST /api/webhooks/resend`):**
- Missing signature → assert 400.
- Valid `email.delivered` payload → assert the matching `vendor_communications` record `status` is updated to `"delivered"`.
- Valid `email.bounced` payload → assert `status` updated to `"bounced"`.
- Valid `email.opened` payload → assert `read_at` is populated.

**Inbound email webhook (`POST /api/webhooks/email/inbound`):**
- Valid payload matching a known vendor email → assert:
  - A new `vendor_communications` record is created with `direction: "inbound"`.
  - If an active agent run exists for this vendor, the Inngest `vendor/reply.received` event is dispatched (check `agent_run` `last_activity_at` is updated).
- Payload from an unknown sender email → assert 200 with `{ received: true }`, record saved as unmatched.

**Done criteria**: All three webhook handlers correctly process valid payloads and reject invalid signatures.

---

### Task A.14 — Inngest Function Tests

Create `tests/integration/inngest-functions.test.ts`.

Use Inngest's dev server in test mode or a local mock to trigger and assert function outcomes.

**`start-vendor-outreach` function:**
- Send `agent/outreach.started` event with `{ agentRunId, eventId, vendorIds: [v1, v2] }`.
- After function completes: assert 2 `vendor_communications` records exist with `direction: "outbound"`.
- Assert `agent_runs.progress_count` equals 2.
- Assert `agent_runs.status` is `"completed"` or `"waiting_for_replies"`.

**`process-vendor-reply` function:**
- Seed: an agent run with one vendor in "contacted" state and a matching inbound communication.
- Send `vendor/reply.received` event with `{ agentRunId, communicationId }`.
- After function completes: assert vendor association `status` is updated (e.g., `"responded"` or `"available"`).
- Assert any extracted quote is saved.

**`send-follow-up` function:**
- Send `vendor/followup.scheduled` event with `{ agentRunId, vendorId, delayHours: 0 }` (0-hour delay to skip sleep in test).
- After function completes: assert a follow-up communication record exists for the vendor.

**`agent-monitor` cron function:**
- Seed stale agent runs (created > 6 hours ago, status still `"running"`).
- Trigger the cron function directly.
- Assert stale runs are either completed or marked for review.

**Done criteria**: All 4 Inngest functions have at least one deterministic passing test with DB assertions.

---

### Task A.15 — Cron Endpoint Security

Create a section in `tests/integration/security.test.ts`.

- `GET /api/cron/agent-monitor` with no `CRON_SECRET` header in production mode → assert 401.
- `GET /api/cron/agent-monitor` with correct `CRON_SECRET` → assert 200 with `{ success, processedRuns }`.
- `GET /api/cron/process-webhooks` same pattern → assert auth guard works.

**Done criteria**: Cron endpoints are not publicly callable without the cron secret.

---

### Task A.16 — Notifications & Profile API

- `GET /api/profile` → assert `{ id, full_name, email }`.
- `PUT /api/profile` with `{ full_name: "New Name" }` → assert name updated, persists in GET.
- `GET /api/notifications` → assert max 20 items, sorted descending by `created_at`.
- `PUT /api/notifications` with empty `ids` array → assert 200 (no-op, not error).

**Done criteria**: Profile and notification routes have shape and edge-case coverage.

---

## Suggested File Backlog

```
tests/
├── fixtures/
│   ├── seed.ts                           # Task 1.1
│   └── teardown.ts                       # Task 1.1
├── helpers/
│   ├── requirements.ts                   # existing — extend in Task 1.2
│   └── auth.ts                           # Task 1.2
├── e2e/
│   ├── auth-onboarding.spec.ts           # Task 2.1
│   ├── event-crud.spec.ts                # Task 3.1
│   ├── vendor-crud.spec.ts               # Task 3.2
│   ├── client-crud.spec.ts               # Task 3.3
│   ├── space-crud.spec.ts                # Task 3.4
│   ├── venue-management.spec.ts          # Task 3.5
│   ├── lead-lifecycle.spec.ts            # Task 4.1
│   ├── event-conflict.spec.ts            # Task 4.2
│   ├── vendor-matching.spec.ts           # Task 4.3
│   ├── calendar-integration.spec.ts      # Task 4.4
│   ├── ai-nlp-event.spec.ts              # Task 5.1
│   ├── ai-chat-lead.spec.ts              # Task 5.2
│   ├── vendor-outreach.spec.ts           # Task 5.3
│   ├── proposal-flow.spec.ts             # Task 5.4
│   ├── subscription.spec.ts              # Tasks 6.1–6.3
│   └── security-rls.spec.ts              # Task 7.1
└── integration/
    ├── helpers/
    │   └── api-client.ts                 # Task A.1
    ├── events.test.ts                    # Task A.2
    ├── venues-private.test.ts            # Task A.3
    ├── venues-public.test.ts             # Task A.4
    ├── leads.test.ts                     # Task A.5
    ├── clients-spaces-vendors.test.ts    # Task A.6
    ├── quotes.test.ts                    # Task A.7
    ├── proposals.test.ts                 # Task A.8
    ├── subscription.test.ts              # Task A.9
    ├── agent.test.ts                     # Task A.10
    ├── ai-extract.test.ts                # Task A.11
    ├── comms-notifications.test.ts       # Task A.12
    ├── webhooks.test.ts                  # Task A.13
    ├── inngest-functions.test.ts         # Task A.14
    └── security.test.ts                  # Tasks A.15 + 7.2 API guards
```

---

## Prioritization

| Priority | Tasks | Why |
|---|---|---|
| **P0 — Block on failure** | 1.1–1.4, 2.1–2.2, 3.1–3.5, 4.1–4.2, 7.1–7.3, A.1–A.9, A.13, A.15 | Core CRUD, auth, conflict detection, security, webhooks, billing |
| **P1 — Important** | 4.3–4.5, 5.1–5.4, 6.1–6.3, 8.1–8.3, 9.1–9.2, A.10–A.12, A.14, A.16 | AI flows, agent lifecycle, Inngest functions, mobile, performance |
| **P2 — Nice-to-have** | Wider browser matrix, visual regression, Lighthouse CI | Quality-of-life; not blocking |

---

## Execution Order (Recommended)

1. **Phase 1** (Foundation): Tasks 1.1–1.4. Nothing else is stable without these.
2. **API Task A.1** (Infrastructure): Set up `api-client.ts` helper in parallel with Phase 1.
3. **Phase 2** (Auth): Tasks 2.1–2.3. Login must be reliable before anything else.
4. **Phase 3 + API A.2–A.6** (CRUD): Run in parallel — E2E CRUD specs and API contract tests are independent.
5. **Phase 7 + API A.15** (Security): Tasks 7.1–7.3 and A.15. Run early — RLS and auth bugs are silent.
6. **API A.7–A.9** (Quotes, Proposals, Subscription): Complete API coverage for billing-adjacent flows.
7. **Phase 4** (Business Logic): Tasks 4.1–4.5. Requires seeded data from Phase 1.
8. **API A.13** (Webhooks): Test Stripe, Resend, and inbound email handlers.
9. **Phase 5 + API A.10–A.11** (AI): Tasks 5.1–5.4 and A.10–A.11. Requires stable Phase 3 + Phase 4 base.
10. **API A.14** (Inngest): Functions test — requires mocking infrastructure and stable agent API.
11. **Phase 6** (Subscription UI): Tasks 6.1–6.3. Requires Stripe test keys in CI.
12. **API A.12, A.16** (Comms, Notifications, Profile): Lower-risk coverage.
13. **Phases 8–9** (Mobile/Perf): Tasks 8.1–8.3, 9.1–9.2. Polish after all core flows pass.

---

## Definition of Done

- Every implemented feature has at least one test that validates a business outcome (not just page load).
- CRUD flows are validated end-to-end: create → verify persistence → edit → verify persistence → delete → verify gone.
- CI blocks PRs on `@smoke`-tagged test failures.
- All cross-tenant access attempts return 401/403 or controlled not-found.
- AI chat lead capture is validated with a DB assertion.
- Conflict detection is explicitly asserted (not just "page loaded").
- Failures produce traces, screenshots, and logs sufficient to diagnose without a local repro.
- Test data is seeded deterministically and cleaned up after each run.
