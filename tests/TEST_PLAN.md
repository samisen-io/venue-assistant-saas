# Playwright Test Plan

Tracks planned, in-progress, and completed test work beyond the initial smoke tests.

## Status Key
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

---

## Completed

### Smoke / Navigation Tests
- [x] Public pages (homepage, login, signup, pricing, legal)
- [x] Auth guards — all 9 protected routes redirect unauthenticated users
- [x] Dashboard home stat cards and sections
- [x] Events, Vendors, Leads, Venues, Spaces, Calendar, Settings navigation
- [x] Mobile responsiveness (375px viewport)
- [x] Performance baselines (homepage <5s, login <4s)
- [x] Security — protected route redirects, API route boundaries

### CRUD Flow Tests (`crud-flows.spec.ts`)
- [x] Space: create via form, validation errors, edit, detail page
- [x] Client: create via form, validation errors, edit, detail page
- [x] Vendor: create via form, validation errors, edit, detail page
- [x] Event: create via form, validation errors, past date rejection, edit, detail page, cancellation
- [x] Lead: create via API, detail page, status update, mark as lost

### Form Validation Edge Cases (`form-validation.spec.ts`)
- [x] Email format — vendor (invalid, empty) and client (invalid, valid)
- [x] Phone format — vendor (letters fail, formatted digits pass)
- [x] Field length min — space name, event name, vendor name, client contact name
- [x] Field length max — space name, event name (incl. boundary at 100), vendor name
- [x] Numeric boundaries — event guest count, budget, space capacity (min + max)
- [x] URL format — vendor website (invalid, missing scheme, valid, empty/optional)

---

## Backlog

### 1. End-to-End Workflow Tests (`e2e-workflows.spec.ts`)

#### Lead → Event Conversion
- [ ] Create a lead via API, convert it to an event via the UI (`/api/leads/{id}/convert-to-event`), verify the new event appears in the events list
- [ ] Converted event inherits the lead's event type, guest count, and estimated budget
- [ ] Original lead status changes to `converted` after conversion

#### Event → Vendor Assignment
- [ ] Create an event and a vendor via API, navigate to the event detail, assign the vendor, verify the vendor appears in the event's vendor list
- [ ] Contact a vendor from the event detail page and verify the outreach is logged

#### Venue → Publish Flow
- [ ] Create a venue via API, add a space, navigate to venue settings, publish the venue, verify it becomes accessible at the public `/v/{slug}` URL
- [ ] Unpublish the venue and verify the public URL returns 404/not-found

#### Event Review Flow
- [ ] Navigate to `/events/{id}/review`, verify review page loads with event summary

---

### 2. Error & Edge Case Handling (`error-handling.spec.ts`)

#### Space Booking Conflict (409)
- [ ] Create two events via API on the same space with overlapping times, verify the 409 conflict response is returned
- [ ] Submit the event creation form with a conflicting space/time and verify the conflict error message is shown in the UI

#### Subscription Limit (403 LIMIT_REACHED)
- [ ] Mock `POST /api/events` to return `{ code: "LIMIT_REACHED" }` with status 403, submit the event creation form, verify the upgrade prompt modal appears
- [ ] Same mock for `POST /api/vendors` — verify upgrade prompt
- [ ] Same mock for `POST /api/spaces` — verify upgrade prompt

#### API Failure — Error Toast
- [ ] Mock `POST /api/events` to return 500, submit the form, verify an error toast is shown and the user stays on the form page
- [ ] Mock `POST /api/vendors` to return 500 — verify error toast
- [ ] Mock `POST /api/clients` to return 500 — verify error toast

#### Space Delete Blocked (409 SPACE_HAS_EVENTS)
- [ ] Create a space with an active event via API, attempt to delete the space via API, verify the 409 `SPACE_HAS_EVENTS` response

---

### 3. AI Features — Mocked (`ai-features-mocked.spec.ts`)

#### NLP Event Creation
- [ ] Mock `POST /api/ai/extract-event` to return a structured event payload, paste natural language into the NLP input, verify the form fields are pre-populated with the extracted data
- [ ] Verify that submitting the pre-populated form creates the event successfully

#### Chat Widget (Public Venue Page)
- [ ] Mock `POST /api/venues/public/{slug}/chat` to return a canned AI response, open the chat widget, send a message, verify the mocked response is rendered
- [ ] Verify chat input clears after message is sent

#### Proposal Generation
- [ ] Mock `POST /api/leads/{id}/proposal` to return a proposal object, trigger proposal generation from the lead detail page, verify success feedback is shown

#### AI Agent (Event)
- [ ] Navigate to `/events/{id}/agent`, verify the agent page loads
- [ ] Mock `POST /api/agent/start` to return a job ID, start the agent, verify the status polling begins

---

### 4. Search & Filtering (`search-filtering.spec.ts`)

#### Events
- [ ] Create two events via API with distinct names, search by name, verify only the matching event appears
- [ ] Filter events by status `planning` — verify only planning events are shown
- [ ] Filter events by status `cancelled` — verify only cancelled events are shown
- [ ] Clear the search — verify both events reappear

#### Vendors
- [ ] Create two vendors via API, search by name, verify only the matching vendor appears
- [ ] Search returns no results for a non-matching term — verify empty state

#### Leads
- [ ] Filter leads by `status=new` — verify only new leads are shown
- [ ] Filter leads by `status=contacted` — verify correctly filtered
- [ ] Search leads by contact name — verify correct result

#### Clients
- [ ] Search clients by contact name — verify correct result
- [ ] Search clients by email — verify correct result

---

### 5. Form Validation Edge Cases (`form-validation.spec.ts`) ✅

#### Email Format
- [x] Submit vendor form with an invalid email (`notanemail`) — verify inline error
- [x] Submit vendor form with an empty email — verify required error
- [x] Submit client form with an invalid email — verify inline error
- [x] Submit client form with a valid email — verify no error

#### Phone Format
- [x] Submit vendor form with letters in the phone field — verify inline error
- [x] Submit vendor form with formatted phone `(555) 123-4567` — verify no error

#### Field Length — Minimum
- [x] Space name with 1 character — verify `min 2 chars` error on blur
- [x] Event name with 1 character — verify `min 2 chars` error on blur
- [x] Vendor name with 1 character — verify `min 2 chars` error on submit
- [x] Client contact name with 1 character — verify `Contact name is required` on submit

#### Field Length — Maximum
- [x] Space name with 101 characters — verify `max 100 chars` error on blur
- [x] Event name with 101 characters — verify `max 100 chars` error on blur
- [x] Event name with exactly 100 characters — verify no error
- [x] Vendor name with 101 characters — verify `max 100 chars` error on submit

#### Numeric Boundaries
- [x] Event `guest_count = 0` — verify `min 1` error on blur
- [x] Event `budget_total = 0` — verify `Budget must be greater than $0` on blur
- [x] Event `guest_count = 1` — verify no error
- [x] Space `capacity = 0` — verify `min 1` error on blur
- [x] Space `capacity = 10001` — verify `Capacity seems too large` on blur

#### URL Format
- [x] Vendor form with `not-a-url` — verify inline error on submit
- [x] Vendor form with `example.com` (missing scheme) — verify inline error
- [x] Vendor form with `https://example.com` — verify no error
- [x] Vendor form with empty website (optional field) — verify no error

---

## Notes

- All tests use `PW_` prefix on created records for easy identification
- Cleanup is handled in `test.afterEach` via the authenticated `request` fixture
- AI tests use `page.route()` to intercept and stub API calls — no real AI tokens consumed
- Run with: `npx playwright test` (all) or `npx playwright test tests/crud-flows.spec.ts` (single file)
