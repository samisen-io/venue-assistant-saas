# Must Have

Things that are broken, missing, or actively block venue managers from getting value. Ship these first.

## Who We're Building For

We are building for two specific venue types. Every decision in this backlog is filtered through their reality.

**Primary: Independent Banquet Halls & Event Spaces**
Single manager or small team running 1–3 spaces. No sophisticated software today — likely a Google Sheet, a personal email, and a phone. They live and die by leads and vendor coordination. Pain is high, willingness to pay is real ($99–$199/mo is trivial relative to a single booking). There are tens of thousands of these in the US.

**Secondary: Boutique Hotels (1–2 event rooms)**
Small hotels where the GM handles event bookings — no dedicated event coordinator. They charge premium pricing, so the software cost is noise. They may have existing tools (Opera, etc.) but those tools don't handle vendor coordination, proposals, or a standalone event page. Slightly longer sales cycle, but higher ACV.

**What this means for the backlog:** Favor the operator who checks their phone 10x a day and has no IT department. Simplicity and speed-to-value beat completeness. If a feature adds friction for a solo manager, reconsider it. When in doubt, do less and do it well.

---

### M1. Billing — Go-Live Blockers

Subscriptions are coded but not wired up in production. Without this, the product cannot charge customers.

**⚠️ Pricing has been updated from the original code. Before wiring up Stripe, update the plan definitions in `/lib/stripe/config.ts` and the limits in `/lib/subscription/limits.ts` to reflect the new structure below. Do not go live on the old prices.**

#### New Pricing Structure

| Plan | Monthly | Annual (20% off) | Who It's For |
|---|---|---|---|
| **Trial** | Free, 14 days | — | Anyone evaluating |
| **Starter** | $99/mo | $79/mo | Solo banquet hall, 1 space, getting started |
| **Growth** | $199/mo | $159/mo | Banquet hall with 1–3 spaces, active lead volume |
| **Professional** | $299/mo | $239/mo | Boutique hotels, multi-space, needs staff access + advanced AI |
| **Enterprise** | Custom (starts ~$499/mo) | Custom | Groups, chains, multi-property — sales conversation only, no self-serve |

#### Rationale
The old Starter at $49 was underpriced relative to every competitor (Perfect Venue $119, Planning Pod $149, Event Temple $125+). Price signals quality. A banquet hall doing 4 events/month at $3K average earns $12K/month — $99/mo is less than 1% of their revenue. The ROI framing sells itself. Enterprise is no longer a fixed $299 self-serve plan; hotel groups expect a sales conversation and associate a cheap fixed price with a product not built for them.

#### Per-Plan Limits (update `limits.ts`)

| Limit | Trial | Starter | Growth | Professional | Enterprise |
|---|---|---|---|---|---|
| Venues | 1 | 1 | 3 | Unlimited | Unlimited |
| Spaces | 1 | 1 | Unlimited | Unlimited | Unlimited |
| Events/mo | 5 | 25 | Unlimited | Unlimited | Unlimited |
| Vendors | 10 | 50 | Unlimited | Unlimited | Unlimited |
| AI chats/mo | 50 | 200 | 500 | Unlimited | Unlimited |
| Staff users | 0 | 1 | 3 | Unlimited | Unlimited |
| Photos | 10 | 30 | 100 | Unlimited | Unlimited |

#### Implementation Checklist
- [ ] Update Stripe product/price IDs in `/lib/stripe/config.ts` with new monthly + annual price variants
- [ ] Update plan limits in `/lib/subscription/limits.ts` to match table above
- [ ] Add annual billing toggle to the pricing/upgrade UI (show monthly and annual side-by-side, default to annual)
- [ ] Deploy Supabase edge function: `supabase functions deploy stripe-webhook`
- [ ] Set webhook secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Register webhook endpoint in Stripe Dashboard
- [ ] Test webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Switch from Stripe test keys to live keys in production
- [ ] Handle grace period when subscription lapses: show a clear banner, block new event/lead creation, do not delete data
- [ ] Remove Enterprise as a self-serve plan — replace with "Contact us" CTA linking to a booking/inquiry form

**Why it matters for our ICP:** A banquet hall manager who signs up and can't pay — or whose card fails silently — is a lost customer. They won't debug it. They'll just leave. And a hotel GM who sees a $49 price tag walks away before reading the features.

---

### M2. Email — Core Notifications

No email is sent today. The `RESEND_API_KEY` is not configured. These are the minimum templates needed to run the business.

- [ ] Add `RESEND_API_KEY` to Vercel environment and Supabase secrets
- [x] Create shared `sendEmail(to, template, data)` utility in `lib/email/` — implemented in `lib/email/resend.ts`
- [x] **Welcome email:** template implemented in `lib/email/templates/welcome.ts` with correct subject and P.S. copy
- [x] **Trial expiring — 3 days out:** template in `lib/email/templates/trialExpiring.ts`; cron at `/api/cron/trial-expiry`
- [x] **Trial expiring — 1 day out:** same template handles both 3-day and 1-day variants
- [x] **Payment failed:** template in `lib/email/templates/paymentFailed.ts`; triggered by Stripe webhook at `/api/webhooks/stripe`
- [x] **New inquiry received (to venue manager):** fires from `/api/venues/public/[slug]/inquiries` via `notifyVenueManager()`
- [x] **Inquiry confirmation (to prospect):** fires from same route via `sendProspectConfirmation()`

Skip for now: lead follow-up sequences, testimonial requests. Add those under Nice to Have once email is working.

**Why it matters for our ICP:** A banquet hall manager is away from their desk constantly — setting up for an event, walking the space, on the phone with a client. Email is how they find out a hot lead just came in. If the notification doesn't fire, the lead goes cold.

---

### M3. Photo Storage

The page editor supports photo uploads but the storage bucket does not exist yet. Photos silently fail.

- [x] Create `venue-photos` Supabase storage bucket (public, max 10 MB per file, jpeg/png/webp only)
- [x] Configure storage RLS: owner can upload/delete, public can read
- [x] `canUploadPhoto` limit check exists in `lib/subscription/limits.ts` and is called from the photos API — returns a clear error message when the limit is reached

**Why it matters for our ICP:** For an independent banquet hall, photos *are* the product. A venue page without photos is dead. A boutique hotel competing on ambiance loses its entire value proposition without imagery. This is not optional.

---

### M4. Public Page — Basic Gaps

The per-venue public page is the core marketing surface and the #1 reason a banquet hall signs up. A few loose ends block it from being reliable.

- [x] Unpublished venue pages return 404 — `app/[venueSlug]/page.tsx` checks `page_status !== "published"` and calls `notFound()`
- [x] Preview tokens wired up — `app/[venueSlug]/preview/page.tsx` verifies token via `/api/venues/preview-verify`, token generation at `/api/venues/[venueId]/preview-token`
- [x] Honeypot field on inquiry form — `_hp` field checked in `/api/venues/public/[slug]/inquiries` route; bots silently succeed, lead is not created

**Why it matters for our ICP:** The public page replaces the venue's website. When a banquet hall manager tells their cousin "check out our new page," it has to work perfectly. A broken page is a direct hit to their credibility with real prospects.

---

### M5. Proposals — With E-Signature

API stubs exist. Venue managers need a way to send a proposal and get a confirmed answer — without a phone-tag loop.

- [x] Venue manager can create a proposal from a lead — UI in `components/leads/LeadDetail.tsx`
- [x] PDF generation — `lib/proposals/pdfGenerator.ts` implemented end-to-end
- [x] Send proposal via email — `/api/proposals/[proposalId]/send` sends via Resend with PDF attachment
- [x] **Client-facing acceptance page** — `app/proposals/[token]/page.tsx` + `ProposalAcceptanceView.tsx`
- [x] **E-signature capture** — name, timestamp, and IP stored on `proposals` table via `/api/proposals/public/[token]` POST
- [x] **Acceptance notification** — `lib/email/templates/proposalAccepted.ts`; lead status auto-updated to `won`
- [x] Status tracking — `draft → sent → viewed → accepted / declined`; `viewed_at` set on first public URL open
- [x] Venue manager sees proposal status on the lead detail page

Skip: AI-assisted content generation, full DocuSign audit trail, complex signature certificate.

**Why it matters for our ICP:** Right now the close loop is: send PDF → client calls back → manager manually updates the lead. With e-signature the loop becomes: client clicks Accept → lead auto-updates to won → manager gets a notification. A trial user who sends their first proposal and watches a client accept it digitally will convert to paid before the trial ends. This is the single clearest ROI moment in the product.

---

### M6. Analytics Dashboard — Basic

Venue managers need to see whether their public page is working. Keep it to one simple page — plus one number visible on every login.

- [x] **Hero metric on the main dashboard (not buried in analytics):** "Leads this month: X" with a trend arrow (↑ vs last month). Visible every login. This is the number they care about — put it front and centre.
- [x] Analytics page implemented at `/venues/[venueId]/analytics` — page views, leads captured, AI chat count, top inquiry source, date range toggle
- [x] `GET /api/venues/:id/analytics` endpoint implemented
- [x] Date range toggle: 7d / 30d / 90d

Skip: CSV export, PDF export, funnel charts, cross-venue comparison.

**Why it matters for our ICP:** A banquet hall manager who just paid $99–$199/mo will ask "is this working?" within the first two weeks. If they can't see leads coming in, they'll cancel. The hero metric on the main dashboard — leads this month with a trend arrow — is what makes them open the app weekly and attribute business growth to the product. This is retention insurance.

---

### M7. AI Chat — Core Gaps

The chat widget is live but has two gaps that hurt quality.

- [x] Add spam/trolling guard to the system prompt: instruct the AI to stay on-topic and politely disengage from off-topic or abusive messages
- [x] Wire availability checking as a real tool call: `lib/ai/tools/availabilityChecker.ts` is now called from the chat route; dates are extracted from user messages and results injected into the AI prompt
- [x] **Graceful fallback message:** exact fallback text added to system prompt; AI is instructed to use it for unknowns and pivot to email capture

Skip: stage-based conversation flow enforcement, confidence score surfacing to managers.

**Why it matters for our ICP:** "Is June 14th available?" is the single most common question a venue gets. If the AI answers it accurately, it converts. If it guesses wrong, it destroys trust with a real prospect. The fallback message handles everything the AI can't answer by routing it back to the manager — so no inquiry falls through the cracks.

---

### M8. Security — Baseline

- [ ] Enable Supabase Auth MFA (TOTP) — settings page shows an "Enable" button for 2FA but it is not wired up; needs Supabase TOTP integration
- [ ] **Account deletion:** `DELETE /api/account` — endpoint does not exist yet
- [ ] **Data export:** `GET /api/account/export` — endpoint does not exist yet
- [ ] Privacy policy page and cookie consent banner on public venue pages — privacy page exists at `app/(legal)/privacy/page.tsx`; cookie consent banner is missing

**Why it matters for our ICP:** Boutique hotel GMs in particular will ask about data security before signing up. A missing privacy policy or no data export option creates friction during evaluation. These are table-stakes trust signals.

---

### M9. Testing — Reliability Fixes

- [ ] Fix flaky auth setup test in `tests/auth.setup.ts` — add retry logic for slow cold starts
- [ ] Add Playwright test: public inquiry form → lead created → confirmation shown
- [ ] Add Playwright test: subscription limit hit → upgrade prompt shown in UI

---

### M10. Onboarding Flow — New User Activation

A new user who lands on an empty dashboard with no guidance will leave within 10 minutes. No product tour needed — just a visible 5-step checklist that gets them to a live page before their first session ends.

#### Setup Checklist (shown on dashboard until completed, auto-hides after all steps done or after 7 days)

| Step | Action | Completes When |
|---|---|---|
| 1 | Name your venue | Venue name saved |
| 2 | Add your first space | First space record created |
| 3 | Upload 3 photos | Photo count ≥ 3 |
| 4 | Preview your public page | Preview link opened |
| 5 | Copy your page link | (manual tick or clipboard event) |

- [ ] `onboarding_steps_completed` JSONB field on the `venues` table (or `users`) — stores array of completed step IDs
- [ ] Checklist component on the main dashboard: shows "X of 5 steps complete" progress bar, each step links directly to the relevant section
- [ ] Mark steps complete automatically based on data state (step 2 completes when first space is created, step 3 when photo count hits 3, etc.)
- [ ] Hide checklist permanently once all steps complete OR after 7 days — don't nag returning users
- [ ] **Empty state copy for every major section** (currently all say "No data yet"):
  - Leads: "No leads yet — share your page link to start getting inquiries" + "Share page link" button
  - Events: "No events yet — convert a lead to book your first event" + "View leads" button
  - Vendors: "No vendors added — add your preferred caterers and photographers" + "Add vendor" button
  - Proposals: "No proposals sent — create one from any lead" + "View leads" button

Skip: interactive product tours, tooltips, in-app video walkthroughs. Text + checklist is enough for this ICP.

**Why it matters for our ICP:** Users who complete activation steps within the first 3 days are 3–4x more likely to convert to paid. A solo banquet hall owner who lands on a blank dashboard and doesn't know what to do next will close the tab and not come back. The checklist makes the path to value obvious without needing a support call.

---

### M11. Trial Expiry Experience

The trial lifecycle needs more than emails. The in-app experience at the moment of expiry determines whether a user upgrades or disappears — and what their prospects see in the meantime.

- [ ] **In-app countdown banner:** appears on the dashboard from day 10 onward. "Your trial ends in X days — upgrade to keep your page live." Sticky at top, dismissible once per day, includes a direct upgrade CTA button.
- [ ] **Expired trial state:** when trial lapses, show a single full-screen upgrade prompt. Block creation of new events/leads but do NOT delete any data. Show the pricing options and a clear CTA.
- [ ] **Public page on trial expiry:** do NOT serve a 404. Render a holding page: "This venue is updating their booking system — check back soon." Include the venue name. A real prospect landing during expiry should not see a broken page.
- [ ] **Smart upgrade pre-selection:** pre-select the plan based on usage during trial (e.g. if they created 2 spaces, default to Growth not Starter). Reduces friction at the payment step.

**Why it matters for our ICP:** A 404 on a venue's public page during trial expiry is catastrophic — a real prospect lands, sees a broken page, and the venue manager has no idea. The holding page keeps their credibility intact and gives them a concrete reason to upgrade immediately rather than quietly churn.

---

### M12. Demo Environment

Every cold email, LinkedIn message, and sales call will link to a demo. Without a pre-populated demo, prospects see an empty shell and have to imagine what the product looks like. That imagination gap kills conversion.

#### Demo Venue: "The Grand Oak Event Space"
A fictional but realistic independent banquet hall. Should feel like a real venue a prospect could find in Nashville or Austin.

- [ ] Create a seed script at `scripts/seed-demo.ts` that populates a dedicated demo account:
  - 1 venue: "The Grand Oak Event Space", Nashville TN, banquet/wedding category
  - 2 spaces: "The Grand Ballroom" (capacity 250) and "The Garden Terrace" (capacity 80)
  - 6 photos across both spaces (use Unsplash placeholder images — real-looking, not generic stock)
  - 5 leads in different pipeline stages: new, contacted, proposal sent, won, lost
  - 3 past events with realistic names (e.g. "Chen-Patel Wedding Reception", "Hartley Corporate Dinner Q1")
  - 2 sent proposals (one accepted, one pending)
  - 4 vendors: caterer, photographer, florist, AV company
  - Published public page with AI chat enabled and accurate availability data
- [ ] Demo account is read-only for any visitor — no mutations. Use a `is_demo` flag on the account and guard all write endpoints.
- [ ] Deploy to production at a fixed URL: `/demo` (or redirect to `/venues/grand-oak-event-space`)
- [ ] AI chat on the demo page must answer availability questions accurately using the seeded event data

**Why it matters for our ICP:** Every outreach email will link to this page. A venue manager who explores the Grand Oak demo and sees a working AI chat, a professional proposal, and a clean lead pipeline will have zero imagination gap. This is the single most important sales asset before real customer testimonials exist.

---

### M13. Support Channel — Visible Inside the Product

There is currently no visible way to get help inside the product. A solo banquet hall owner who hits a wall will not search for a help centre — they'll cancel.

- [ ] **In-app support link:** "Need help? Email [support@domain]" in the dashboard sidebar footer. Always visible, every page.
- [ ] **Inline FAQ on the onboarding checklist** (M10): three common questions that expand inline:
  - "How do I publish my page?"
  - "Why isn't my AI chat responding?"
  - "How do I change my pricing?"
  Each gets a 2-sentence answer. No separate help centre needed for v1.
- [ ] **Support inbox autoresponder:** configure a reply confirming receipt and setting expectation: "We respond within 24 hours, typically faster." A founder managing 5–10 early customers can handle this volume manually.

Skip: Intercom, Zendesk, knowledge base, in-product chatbot. All over-engineered for this stage.

**Why it matters for our ICP:** Banquet hall owners are not technical. They will get confused. The question is whether confusion turns into a support email (recoverable) or a silent cancellation (not). A visible email address converts confusion into conversation.

---

### M14. iCal Feed — Calendar Sync

Every competitor has calendar sync. Without it, venue managers have to manually update two systems after every booking — your app and their existing Google Calendar. That double-entry friction is a common reason people abandon new software.

- [ ] `GET /api/venues/:id/calendar.ics` — stateless endpoint returning all confirmed events as an RFC 5545 iCal feed
- [ ] Each event in the feed includes: event name, start/end datetime, space name in the location field, client name in the description
- [ ] Subscribe URL shown in `/dashboard/settings` with a "Copy link" button and one-line instructions: "Paste into Google Calendar → Other calendars → From URL"
- [ ] Feed refreshes on every GET request (stateless — no caching needed for v1)

Skip: two-way Google Calendar OAuth sync, Outlook OAuth. The iCal subscription covers 90% of the use case with 5% of the complexity.

**Why it matters for our ICP:** A banquet hall owner who confirms a booking in the app and still has to update their Google Calendar manually will eventually stop using the app for confirmations. The iCal feed makes your system the source of truth without forcing them to abandon their existing tools.

---

## Build Order — Final Push to GTM-Ready

Work in this exact sequence. Dependencies are noted. GTM starts when every Must Have has a green checkbox — not before.

### Week 1 — Make it real for one person
The goal this week is a complete, working end-to-end experience for a single demo user. Nothing else matters until the product can be shown.

1. **M3** (photo storage) — 30 minutes. Unblocks the public page from being embarrassing.
2. **M4** (public page gaps) — Fix the 404, wire preview token, add honeypot.
3. **M7** (AI chat) — Real availability tool call + graceful fallback message. This is the first thing every prospect will test on the demo.
4. **M12** (demo environment) — Seed the Grand Oak account. Build this in parallel with everything else this week. It's your sales asset from day one.

### Week 2 — Make money work
5. **M2** (email) — Wire Resend first. Stripe webhooks trigger emails, so email must exist before billing.
6. **M1** (billing) — Stripe with new pricing. Annual billing toggle. Enterprise removed from self-serve.
7. **M11** (trial expiry) — In-app countdown banner + graceful public page holding state. Wire immediately after billing.

### Week 3 — Make deals close and users stay
8. **M5** (proposals + e-signature) — The acceptance moment is the clearest trial→paid conversion trigger. A user who watches a client accept their first proposal will upgrade.
9. **M6** (analytics + hero metric) — Hero metric on main dashboard first. Then the analytics page. Retention insurance.
10. **M10** (onboarding checklist + empty states) — Mostly frontend. Do alongside M6, same sprint.

### Week 4 — Harden before you scale
11. **M14** (iCal sync) — One endpoint + settings UI. Lightweight.
12. **M13** (support channel) — Sidebar link + inline FAQ + autoresponder. Prevents silent churn.
13. **M8** (security) — MFA, account deletion, data export, privacy policy. Boutique hotel GMs will ask about this.
14. **M9** (testing) — Fix flaky tests, add critical Playwright coverage.

**First cold email goes out after Week 4. Not before.**
