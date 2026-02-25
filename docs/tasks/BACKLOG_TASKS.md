# Backlog Tasks

## Who We're Building For

We are building for two specific venue types. Every decision in this backlog is filtered through their reality.

**Primary: Independent Banquet Halls & Event Spaces**
Single manager or small team running 1–3 spaces. No sophisticated software today — likely a Google Sheet, a personal email, and a phone. They live and die by leads and vendor coordination. Pain is high, willingness to pay is real ($99–$199/mo is trivial relative to a single booking). There are tens of thousands of these in the US.

**Secondary: Boutique Hotels (1–2 event rooms)**
Small hotels where the GM handles event bookings — no dedicated event coordinator. They charge premium pricing, so the software cost is noise. They may have existing tools (Opera, etc.) but those tools don't handle vendor coordination, proposals, or a standalone event page. Slightly longer sales cycle, but higher ACV.

**What this means for the backlog:** Favor the operator who checks their phone 10x a day and has no IT department. Simplicity and speed-to-value beat completeness. If a feature adds friction for a solo manager, reconsider it. When in doubt, do less and do it well.

---

## Must Have

Things that are broken, missing, or actively block venue managers from getting value. Ship these first.

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
- [ ] Create shared `sendEmail(to, template, data)` utility in `lib/email/` (may already exist as a stub — wire it up)
- [ ] **Trial expiring — 3 days out:** subject "Your trial ends in 3 days", CTA to upgrade
- [ ] **Trial expiring — 1 day out:** subject "Last day of your trial", urgent CTA
- [ ] **Payment failed:** subject "Action required — payment failed", link to billing portal
- [ ] **New inquiry received (to venue manager):** notify when a public inquiry form is submitted, include prospect name, event type, date, guest count
- [ ] **Inquiry confirmation (to prospect):** "We received your inquiry and will be in touch" auto-reply

Skip for now: lead follow-up sequences, testimonial requests, welcome email. Add those under Nice to Have once email is working.

**Why it matters for our ICP:** A banquet hall manager is away from their desk constantly — setting up for an event, walking the space, on the phone with a client. Email is how they find out a hot lead just came in. If the notification doesn't fire, the lead goes cold.

---

### M3. Photo Storage

The page editor supports photo uploads but the storage bucket does not exist yet. Photos silently fail.

- [ ] Create `venue-photos` Supabase storage bucket (public, max 10 MB per file, jpeg/png/webp only)
- [ ] Configure storage RLS: owner can upload/delete, public can read
- [ ] Wire the existing `canUploadPhoto` limit check to the upload UI — show a clear error toast when the plan limit is reached rather than a silent failure

**Why it matters for our ICP:** For an independent banquet hall, photos *are* the product. A venue page without photos is dead. A boutique hotel competing on ambiance loses its entire value proposition without imagery. This is not optional.

---

### M4. Public Page — Basic Gaps

The per-venue public page is the core marketing surface and the #1 reason a banquet hall signs up. A few loose ends block it from being reliable.

- [ ] Verify unpublished venue pages return 404 (not a broken/empty page) on the public route
- [ ] Wire up preview tokens: `preview_tokens` table and API exist — connect `app/[venueSlug]/preview/page.tsx` so managers can share a preview link before publishing (24-hour expiry)
- [ ] Add spam protection to the inquiry form: honeypot field (a hidden input that bots fill in)

**Why it matters for our ICP:** The public page replaces the venue's website. When a banquet hall manager tells their cousin "check out our new page," it has to work perfectly. A broken page is a direct hit to their credibility with real prospects.

---

### M5. Proposals — Basic Version

API stubs exist. Venue managers need a way to send a proposal to a prospect. Keep it simple.

- [ ] Venue manager can create a proposal from a lead: fill in event details, package selection, pricing
- [ ] Generate a clean PDF (`/lib/proposals/pdfGenerator.ts` exists — ensure it works end-to-end)
- [ ] Send proposal via email (Resend): HTML email body + PDF attachment
- [ ] Status tracking: `draft → sent → accepted / declined` (skip "viewed" tracking for now)
- [ ] Venue manager can see proposal status on the lead detail page

Skip: AI-assisted content generation, client-facing acceptance portal. The manager emails it; the client replies by phone or email.

**Why it matters for our ICP:** This is how banquet halls close deals. Right now they're emailing Word documents or writing up quotes by hand. A clean, branded PDF proposal with a package breakdown is a direct upgrade. For boutique hotels, a polished proposal signals professionalism and justifies the room rate.

---

### M6. Analytics Dashboard — Basic

Venue managers need to see whether their public page is working. Keep it to one simple page.

- [ ] `/dashboard/analytics` page with:
  - Page views over the last 30 days (line chart)
  - Total leads created this month
  - AI chat message count this month
  - Top inquiry source (chat vs. form vs. manual)
- [ ] `GET /api/venues/:id/analytics` endpoint
- [ ] Date range toggle: 7d / 30d / 90d

Skip: CSV export, PDF export, funnel charts, cross-venue comparison.

**Why it matters for our ICP:** A banquet hall manager who just paid $99–$199/mo will ask "is this working?" within the first two weeks. If they can't see leads coming in, they'll cancel. This dashboard is retention insurance.

---

### M7. AI Chat — Core Gaps

The chat widget is live but has two gaps that hurt quality.

- [ ] Add spam/trolling guard to the system prompt: instruct the AI to stay on-topic and politely disengage from off-topic or abusive messages
- [ ] Wire availability checking as a real tool call: when a visitor asks about dates, the AI should query the `venue_availability` table and return accurate results rather than guessing

Skip: stage-based conversation flow enforcement, confidence score surfacing to managers.

**Why it matters for our ICP:** "Is June 14th available?" is the single most common question a venue gets. If the AI chat answers it accurately, it converts. If it says "I'm not sure, please contact us," it's just a slower version of the contact form. For a banquet hall getting 20 inquiries a week, accurate availability answers in the chat widget is a meaningful time saver.

---

### M8. Security — Baseline

- [ ] Enable Supabase Auth MFA (TOTP) — surface an "Enable two-factor authentication" option in `/dashboard/settings/security`. Make it optional, not required.
- [ ] **Account deletion:** `DELETE /api/account` — hard-delete the user's data, cancel their Stripe subscription first, then delete the Supabase auth user. Show a confirmation dialog with a typed "DELETE" confirmation.
- [ ] **Data export:** `GET /api/account/export` — return a ZIP of the user's venues, events, leads, and clients as JSON. Legal requirement in many markets.
- [ ] Privacy policy page and cookie consent banner on public venue pages

**Why it matters for our ICP:** Boutique hotel GMs in particular will ask about data security before signing up. A missing privacy policy or no data export option creates friction during evaluation. These are table-stakes trust signals.

---

### M9. Testing — Reliability Fixes

- [ ] Fix flaky auth setup test in `tests/auth.setup.ts` — add retry logic for slow cold starts
- [ ] Add Playwright test: public inquiry form → lead created → confirmation shown
- [ ] Add Playwright test: subscription limit hit → upgrade prompt shown in UI

---

## Nice to Have

Genuinely useful for banquet halls and boutique hotels. Build these once Must Haves are stable and paying customers are using the product.

---

### N1. Testimonials — Pull Forward from Original Nice-to-Have

Testimonials show on the public venue page and directly impact lead conversion. For an independent banquet hall competing with larger venues, real testimonials are their strongest trust signal. For a boutique hotel, they reinforce the premium positioning.

- [ ] **Testimonial request email:** triggered manually by the venue manager from the event detail page ("Request testimonial" button). Sends a simple email with a direct link to submit a testimonial for the venue's public page.
- [ ] Wire submitted testimonials to the testimonials carousel on the public page

This is a small addition to the email system (M2 must be live first) with outsized impact on public page conversion. Deliberately pulled up from the original backlog position.

---

### N2. Staff Access (Simplified)

Many banquet halls have 1–2 additional staff: a coordinator, an assistant, or a part-time salesperson. Boutique hotels may have the GM and an events assistant. We don't need enterprise role hierarchies — just two roles: **Owner** and **Staff**.

**What Staff can do:** view and create/edit events, vendors, spaces, clients, leads.
**What only the Owner can do:** delete anything, manage billing, publish the public page, invite/remove staff.

- [ ] Migration: `venue_members` table with fields: `id`, `venue_id`, `user_id` (null until accepted), `email`, `role` (owner | staff), `status` (pending | active | revoked), `invite_token`, `invited_at`, `accepted_at`
- [ ] Update RLS policies to accept active members alongside the owner
- [ ] `POST /api/venues/:id/members` — owner invites by email; sends invite email via Resend
- [ ] `/accept-invite?token=` page — activates membership on click; handles both new and existing users
- [ ] `/dashboard/settings/team` page — list active staff and pending invites; "Invite" button, "Remove" action
- [ ] Allow up to 1 staff member on Starter, 3 on Growth, unlimited on Professional+

Skip: admin role, ownership transfer, "leave venue" self-service.

---

### N3. Google Calendar / iCal Sync

Banquet hall managers and boutique hotel GMs already live in their calendar. Confirmed event bookings should appear there automatically.

- [ ] **iCal export:** `GET /api/venues/:id/calendar.ics` — returns all confirmed events as an iCal feed. Manager subscribes to this URL in Google Calendar, Apple Calendar, or Outlook. Covers the 80% case with minimal code.
- [ ] Re-generate the feed on event create/update/cancel (it's stateless — any fresh request returns current data)

Skip: two-way Google Calendar OAuth sync. The iCal subscription achieves the same result for these operators.

---

### N4. Discount Codes (Simple)

Banquet halls regularly offer discounts for off-peak bookings (weekday weddings, January corporate events), repeat clients, or referrals. Boutique hotels use them for corporate accounts.

- [ ] Migration: `discount_codes` table — `id`, `venue_id`, `code`, `type` (percent | fixed), `value`, `max_uses` (nullable), `uses_count`, `valid_until` (nullable), `is_active`
- [ ] CRUD UI at `/dashboard/discount-codes` — create, list, deactivate codes
- [ ] Validate and apply a code when creating a proposal: deduct from total, show the discount line in the PDF
- [ ] Increment `uses_count` when a code is used; auto-deactivate when `max_uses` is reached

Skip: time-limited promotional pricing on packages, cross-venue bundle deals.

---

### N5. Email — Follow-Up Templates

Once core email (M2) is working, add these:

- [ ] **Welcome / onboarding email:** sent on first login, links directly to the public page editor with a "your page is 3 steps from live" message
- [ ] **Lead follow-up nudge:** if a lead has been in `contacted` status for 3+ days with no activity, show a reminder badge on the leads list (in-app, not email for now)

Skip: automated email sequences, multi-step nurture flows. A solo manager should decide when to follow up personally.

---

### N6. Public Marketplace — Simple Discovery Page

Individual venue pages work. The marketplace homepage helps prospects find venues when they don't have a direct link. Especially useful for banquet halls that don't have strong SEO yet.

- [ ] Create public home route (`app/page.tsx`) separate from the authenticated dashboard
- [ ] Featured venues grid showing published venues (simple query, no algorithm)
- [ ] `GET /api/public/featured-venues` endpoint — return published venues ordered by `created_at desc`, limit 9
- [ ] Basic search: filter by event type and city/state (simple text match)
- [ ] "For Venue Managers" CTA section linking to `/signup`
- [ ] Footer with links to privacy policy and terms

Skip: Redis caching, URL-synced filter state, category navigation.

---

### N7. SEO Basics

Small but meaningful for organic discovery. Banquet halls and boutique hotels both benefit from local search traffic.

- [ ] Per-venue `<head>` meta tags on the public page: `<title>`, `<meta name="description">`, `og:image`, `og:title`
- [ ] Dynamic sitemap at `/sitemap.xml` including all published venue slugs
- [ ] `robots.txt`

Skip: Schema.org JSON-LD markup. Add it later if SEO becomes a priority.

---

### N8. Availability Calendar — Mobile & Accessibility

Venue managers check availability on their phones constantly — mid-event, between walkthroughs.

- [ ] Mobile swipe left/right to change months on the public availability calendar
- [ ] Color-blind accessible color scheme for booked/available dates (don't rely on red/green alone — add a pattern or icon)
- [ ] Auto-populate the calendar from the `events` table so confirmed events show as booked without manual entry

---

### N9. Simple Activity Feed

For banquet halls and boutique hotels with a small team, a lightweight log of "who did what" is enough. Not an audit log — just a "recent activity" list.

- [ ] Migration: `activity_log` table — `id`, `venue_id`, `actor_email`, `action` (plain text e.g. "Created event Summer Gala"), `created_at`
- [ ] Log entries on: event create/update/delete, lead status change, vendor assignment, proposal sent
- [ ] Show the last 30 entries on `/dashboard/settings/activity` in a simple list: timestamp, who, what
- [ ] Auto-purge entries older than 90 days

Skip: before/after diffs, per-field change tracking, CSV export. A small team doesn't need compliance tooling.

---

## Out of Scope

Worth knowing about, but don't build without a direct customer request. These are either wrong for our ICP or require significant complexity that isn't justified at this stage.

---

**Payment processing (venue→client):** Deposit collection, invoicing, payment reminders. Money movement adds legal risk and reconciliation overhead. Use a Stripe Payment Link as a manual workaround for now. Revisit when customers ask consistently.

**HubSpot / Salesforce integrations:** Independent banquet hall operators and boutique hotel GMs don't use enterprise CRMs. If the target market shifts to hotel chains, revisit.

**Zapier / webhook integrations:** Genuinely useful but requires maintaining a webhook delivery system. Use iCal export as the first integration story. Add webhooks when managers have a specific tool they need to connect.

**Cross-venue performance benchmarking:** Only useful when customers have 2+ venues and are actively growing. Build basic analytics (M6) first; revisit if customers ask.

**Equipment / asset inventory:** Relevant for large conference centers. Banquet halls and boutique hotel event rooms don't need this. Use notes in the space description.

**Full audit log with retention policies:** Enterprise compliance feature. The simple activity feed (N9) is sufficient for a small team.

**POS / ticketing integrations:** Niche and operationally complex. Not needed for venue managers in our ICP.

**Mobile app (React Native / PWA):** The web app is mobile-responsive. A native app adds significant maintenance overhead. Revisit only if managers report the mobile web experience is insufficient.

**AI-powered vendor matching upgrade:** The current score-based algorithm works. Upgrade only if managers are consistently unhappy with vendor suggestions.

**Marketplace public reviews:** Requires moderation, response flows, and trust/safety work. Skip until the marketplace itself has meaningful traffic.

**White-label / agency tier:** Different product and pricing model entirely. Out of scope.

**Timeline / run-of-show builder:** Useful but a separate surface. Banquet hall managers use paper timelines or personal notes apps for this today. Not our problem to solve right now.

**F&B / catering management:** Menus, dietary tracking, catering cost integration. Out of scope for a venue booking tool.

**Two-way Google Calendar OAuth sync:** The iCal feed subscription (N3) achieves the same result for our ICP with a fraction of the complexity.

---

## Source References

| Area | Notes |
|------|-------|
| Stripe & Billing | `docs/tasks/STRIPE_SUBSCRIPTION_TASKS.md` |
| Public Marketplace | `docs/tasks/PublicMarketplace_TaskList.md`, `docs/prds/MARKETPLACE_PRD.md` |
| Public Venue Pages | `docs/tasks/PUBLIC_PAGES_TASKS.md` |
| AI Chat & Proposals | `docs/prds/MARKETPLACE_PRD.md` §3.2–3.4 |
| Last reorganized | 2026-02-25 — scoped for independent banquet halls and boutique hotels; pricing updated to Starter $99, Growth $199, Professional $299, Enterprise custom |