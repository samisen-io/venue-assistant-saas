# Automated Test Task Plan

Based on `docs/testing/MANUAL_TEST_CHECKLIST.md` and current Playwright coverage in `tests/`.

## Goal
Build reliable automated regression coverage for all critical manual checklist flows, prioritizing business-critical booking, lead, and manager workflows.

## Scope
- In scope: E2E (Playwright), API integration tests, contract tests for key endpoints, security guard tests, mobile regression, performance budgets.
- Out of scope for now: visual snapshot diffs for every page, exhaustive cross-browser permutations beyond configured Playwright projects.

## Current Baseline
- Existing Playwright suites:
1. `tests/public-marketplace.spec.ts`
2. `tests/manager-portal.spec.ts`
3. `tests/ai-features.spec.ts`
4. `tests/mobile-responsiveness.spec.ts`
5. `tests/performance-security.spec.ts`
- Gap pattern: many tests validate page presence/structure, but fewer validate end-to-end business outcomes, data persistence, and async side effects.

## Phase 1: Stabilize Foundation (P0)
### Task 1.1 Test Data Strategy
- Create deterministic seed fixtures for:
1. Published venue with slug and packages.
2. Unpublished venue.
3. Manager user with at least 2 venues.
4. Leads/events/vendors/spaces with known IDs.
- Add environment contract doc in `docs/testing/` for required vars (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_VENUE_SLUG`).
- Done criteria: test runs no longer skip critical scenarios because of missing data.

### Task 1.2 Playwright Reliability Hardening
- Add reusable helpers for login, venue selection, and resilient locators (`data-testid` where needed).
- Remove flaky text-only selectors from high-value flows.
- Add retry policy only for known flaky specs; avoid masking real failures.
- Done criteria: 3 consecutive local runs pass with no flaky reruns for P0 specs.

### Task 1.3 CI Gate
- Add CI workflow stages:
1. Lint.
2. Build.
3. Playwright smoke (`public`, `auth`, `dashboard`).
4. Nightly full E2E suite.
- Publish HTML artifacts and traces on failure.
- Done criteria: PRs blocked on smoke failures; nightly reports available.

## Phase 2: Public Marketplace Business Flows (P0)
### Task 2.1 Homepage Search Journey
- Automate full search interaction from `/` to `/venues` query params validation.
- Validate location/date/guest inputs and resulting filter state on results page.
- Maps to checklist: 1.1 homepage search.
- Done criteria: test asserts redirect URL and visible filtered results state.

### Task 2.2 Search Results Functional Filters
- Add combinational filter tests for location, date availability, guest range, event type, price, sort, pagination, empty state.
- Use seeded known venues to assert positive and zero-result outcomes.
- Maps to checklist: 1.2 search results.
- Done criteria: each filter dimension has at least one positive and one negative assertion.

### Task 2.3 Public Venue Inquiry Flow
- Automate inquiry form submit on `/venues/[slug]` with success toast/message.
- Verify backend side effect via API/db assertion (lead record created).
- Validate unpublished venue returns not-available behavior.
- Maps to checklist: 1.3 public venue page + part of 5.3.
- Done criteria: submission produces persisted lead tied to expected venue.

## Phase 3: Manager Portal Core Workflows (P0)
### Task 3.1 Auth + Onboarding Happy Path
- Automate signup (disposable identity), onboarding wizard completion, login, logout, forgot-password request initiation.
- Maps to checklist: 2.1.
- Done criteria: new user reaches dashboard with created venue context.

### Task 3.2 Lead Management Flow
- Validate incoming leads appear in `/leads`.
- Open lead detail, verify transcript visibility, change status, assert persisted status.
- Maps to checklist: 2.4.
- Done criteria: lead status survives page refresh/API refetch.

### Task 3.3 Event Management Flow
- Create event via manual form.
- Create event via natural-language input and verify extracted fields.
- Validate event detail tabs, status change, and conflict detection when assigning overlapping space/time.
- Maps to checklist: 2.5 and 2.6 overlap checks.
- Done criteria: conflicting booking attempt is blocked with explicit UI error.

### Task 3.4 Venue/Public Page Management Flow
- In page editor: update basic info, upload photo, add space, add package, adjust AI settings.
- Validate preview and publish/unpublish effect on public URL.
- Maps to checklist: 2.3.
- Done criteria: published state changes public accessibility in real-time (or after documented propagation delay).

## Phase 4: AI Agent Workflows (P1)
### Task 4.1 AI Chat Conversational Booking
- Test chat open/close, greeting, qualifying question exchange, availability question, pricing estimate response.
- Validate lead capture from chat persists as lead with transcript.
- Maps to checklist: 1.4.
- Done criteria: chat interaction creates retrievable lead/transcript data.

### Task 4.2 Vendor Outreach Agent
- Trigger outreach on event vendors tab.
- Assert communication log creation.
- Simulate vendor reply webhook/test endpoint and validate status transition and quote extraction.
- Maps to checklist: 3.1.
- Done criteria: lifecycle transitions (`pending -> contacted -> available`) are asserted.

### Task 4.3 Proposal Generation
- Generate proposal PDF from lead.
- Validate PDF metadata/content markers and send action result.
- Maps to checklist: 3.2.
- Done criteria: proposal record exists and send action returns success with delivery log.

## Phase 5: Mobile, Performance, and Security Depth (P1)
### Task 5.1 Mobile Flow Parity
- Expand beyond layout checks to functional checks:
1. Public search filters in slide-out.
2. Venue page CTA sticky/accessible.
3. Dashboard hamburger navigation interactions.
4. Full-screen chat behavior.
- Maps to checklist: Part 4.
- Done criteria: mobile tests validate interaction, not only visibility/overflow.

### Task 5.2 Security/RLS Assertions
- Add authenticated multi-user fixture tests:
1. User A attempts User B resource URLs.
2. API-level unauthorized/forbidden checks for leads/venues/events.
- Maps to checklist: 5.2 and 5.3.
- Done criteria: every forbidden access returns 401/403 or controlled not-found.

### Task 5.3 Performance Budgets
- Tighten performance thresholds toward checklist target:
1. Home and venue pages under 2 seconds in CI-controlled baseline.
2. Add optional Lighthouse CI job for key public routes.
- Maps to checklist: 5.1.
- Done criteria: budget failures surface as CI errors with report links.

## API and Integration Test Layer (P0.5)
### Task A.1 Add API Integration Suite
- Add integration tests for critical routes:
1. `app/api/clients/route.ts`
2. `app/api/events/[eventId]/route.ts`
3. `app/api/leads/[leadId]/convert-to-event/route.ts`
4. venue analytics and publish/unpublish related endpoints.
- Use seeded test DB and service-role test credentials in CI secrets.
- Done criteria: route contracts and auth boundaries validated without UI.

### Task A.2 Async Workflow Contract Tests
- Add tests for Inngest/background handlers using mock providers (email/AI/Stripe).
- Validate payload schema, idempotency guards, and failure retries.
- Done criteria: deterministic pass/fail for async workflow logic.

## Suggested File Backlog
1. `tests/e2e/public-search-flow.spec.ts`
2. `tests/e2e/public-inquiry-flow.spec.ts`
3. `tests/e2e/manager-onboarding.spec.ts`
4. `tests/e2e/lead-lifecycle.spec.ts`
5. `tests/e2e/event-conflict-detection.spec.ts`
6. `tests/e2e/page-editor-publish.spec.ts`
7. `tests/e2e/ai-chat-lead-capture.spec.ts`
8. `tests/e2e/vendor-outreach-agent.spec.ts`
9. `tests/e2e/proposal-generation.spec.ts`
10. `tests/integration/api/*.test.ts`

## Prioritization
1. P0: Booking/lead creation paths, auth/onboarding, event conflict prevention, CI stability.
2. P1: AI agent depth, proposal delivery assertions, expanded mobile functional parity.
3. P2: Wider browser matrix, visual regression, non-critical route permutations.

## Definition of Done
- Critical checklist items have automated coverage with stable passing tests.
- CI runs smoke tests on PRs and full regression nightly.
- Failures produce actionable traces/screenshots/logs.
- Test data is deterministic and documented.
- Security and RLS boundaries are explicitly validated by automated tests.

## Execution Order (Recommended)
1. Implement Phase 1 (data + reliability + CI).
2. Complete Phase 2 and 3 P0 business flows.
3. Add API/integration layer tasks A.1 and A.2.
4. Implement Phase 4 AI workflows.
5. Finish Phase 5 mobile/performance/security depth.
