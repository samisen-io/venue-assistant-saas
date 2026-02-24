# Backlog Tasks

Features and tasks that are planned, partially specified, or referenced in PRDs/task files but not yet implemented. Grouped by feature area in rough priority order.

**Legend:** `[P1]` = high priority / blocks revenue · `[P2]` = important but not blocking · `[P3]` = nice to have / phase 2

---

## 1. Stripe & Billing

### 1.1 Webhook Deployment `[P1]`
- [ ] Deploy Supabase edge function: `supabase functions deploy stripe-webhook`
- [ ] Set webhook secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Register webhook endpoint in Stripe Dashboard pointing to the deployed function
- [ ] Test all webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 1.2 Email Notifications (requires Resend) `[P1]`
- [ ] Send email when payment fails (dunning notification)
- [ ] Send reminder email 3 days before trial ends
- [ ] Send reminder email 1 day before trial ends
- [ ] Send confirmation email when subscription is activated
- [ ] Handle grace period and final expiry state when subscription lapses (UI + access cut-off)

### 1.3 Production Readiness `[P2]`
- [ ] Switch from Stripe test keys to live keys in production environment
- [ ] Set up Stripe webhook monitoring and failure alerts
- [ ] Add monthly/annual billing toggle to pricing page with savings callout
- [ ] Document plan limits in customer-facing FAQ
- [ ] Create `PlanGate` component to declaratively gate UI by plan tier

---

## 2. Public Marketplace

> Full spec in `docs/prds/MARKETPLACE_PRD.md` and `docs/tasks/PublicMarketplace_TaskList.md`.
> This is the largest unbuilt surface area.

### 2.1 Database `[P1]`
- [ ] Migration: Add `venue_public_settings` table (visibility, SEO overrides, inquiry settings)
- [ ] Migration: Add `venue_page_views` analytics table
- [ ] Migration: Add `venue_search_queries` tracking table
- [ ] Migration: Add `view_count` and `inquiry_count` columns to `venues`
- [ ] Add `source = 'public_inquiry'` enum value to `leads.source`
- [ ] Add `marketplace_inquiry_data` (jsonb) column to `leads`
- [ ] Create indexes for full-text search on venue name, city, type
- [ ] Test rollback scripts for all migrations

### 2.2 Public Homepage `/` `[P1]`
- [ ] Create public home route (`app/page.tsx`) separate from the authenticated dashboard
- [ ] Hero section with search bar (location, event type, guest count)
- [ ] Featured venues grid (3→2→1 col responsive)
- [ ] `GET /api/public/featured-venues` endpoint
- [ ] Category navigation (weddings, corporate, social, etc.)
- [ ] "How It Works" section with "No account needed" messaging
- [ ] Stats / social proof section
- [ ] "For Venue Managers" CTA section linking to signup
- [ ] Footer with legal links

### 2.3 Venue Search `/venues` `[P1]`
- [ ] Search results page with filter sidebar (desktop) / slide-out drawer (mobile)
- [ ] `GET /api/public/venues/search` endpoint with filters: location, event type, capacity, price range, amenities
- [ ] Sort options: relevance, price asc/desc, rating, newest
- [ ] Grid / List view toggle
- [ ] Pagination (12–24 results per page)
- [ ] URL-sync for all filter state (shareable links)
- [ ] "No results" empty state
- [ ] Skeleton loading state
- [ ] Cache popular queries (Redis or in-memory, 5 min TTL)

### 2.4 Public Venue Detail Page `/{slug}` `[P1]`
- [ ] Large hero image with venue name overlay and sticky inquiry CTA
- [ ] Photo gallery with lightbox modal
- [ ] Sticky sidebar: key info, quick-inquiry button
- [ ] Spaces section with capacity tables
- [ ] Amenities, pricing packages, availability calendar sections
- [ ] Reviews / testimonials section
- [ ] Location map embed
- [ ] `GET /api/public/venues/:slug` endpoint (public, no auth)

### 2.5 Inquiry Form & Lead Creation `[P1]`
- [ ] Inline inquiry form: name, email, phone, event type, date, guest count, message
- [ ] Spam prevention: honeypot field + rate limiting (already have `rateLimit` util)
- [ ] `POST /api/public/inquiries` → creates lead with `source = 'public_inquiry'`
- [ ] Send confirmation email to inquirer (Resend)
- [ ] Send notification email to venue manager (Resend)
- [ ] Success state / thank-you modal

### 2.6 SEO `[P2]`
- [ ] Per-venue dynamic `<head>` meta tags (title, description, og:image)
- [ ] Schema.org `LocalBusiness` / `EventVenue` markup on venue detail pages
- [ ] Dynamic sitemap (`/sitemap.xml`) including all published venue slugs
- [ ] Robots.txt

### 2.7 Venue Manager Public Listing Settings `[P2]`
- [ ] "Public Listing" section in dashboard settings
- [ ] Toggle: enable/disable public listing visibility
- [ ] SEO override fields (title, description, og image)
- [ ] Inquiry settings (auto-reply on/off, response time promise)
- [ ] `PUT /api/venues/:id/public-settings` endpoint
- [ ] "Public Inquiry" badge/filter on leads list

---

## 3. Public Venue Pages (Editor)

> Most of the editor is built. These are remaining gaps from `docs/tasks/PUBLIC_PAGES_TASKS.md`.

### 3.1 Storage `[P1]`
- [ ] Create `venue-photos` Supabase storage bucket (public, max 10 MB, jpeg/png/webp)
- [ ] Configure storage RLS policies (owner can write, public can read)
- [ ] Enforce photo count limit per subscription tier in upload route (already has `canUploadPhoto` — wire to UI with error toast)

### 3.2 Page Preview `[P2]`
- [ ] Preview in new tab via shareable token (24-hour expiry) — `preview_tokens` table exists, wire up `app/[venueSlug]/preview/page.tsx`
- [ ] Verify unpublished venue pages return 404 on the public route

### 3.3 Availability Calendar `[P2]`
- [ ] Mobile swipe left/right to change months
- [ ] Keyboard navigation (tab to dates, Enter to select)
- [ ] Color-blind accessible color scheme for booked/available/tentative
- [ ] Consider auto-populating from existing `events` table

### 3.4 Testimonials `[P3]`
- [ ] Display layout options: carousel / grid / list
- [ ] Testimonial request automation: trigger email N days after event completion (Resend)

### 3.5 Analytics Export `[P3]`
- [ ] CSV / PDF export for page analytics
- [ ] Date range selector: 7d / 30d / 90d / custom

---

## 4. AI Chat

> Chat widget is implemented. These are remaining gaps.

### 4.1 Improvements `[P2]`
- [ ] Availability checking as AI tool/function call (query `venue_availability` table)
- [ ] Spam / trolling detection in AI system prompt
- [ ] Stage-based conversation flow enforcement (Initial → Qualification → Refinement → Conversion)
- [ ] Confidence scoring on extracted event data (surface to venue manager)

### 4.2 Escalation & Follow-up `[P2]`
- [ ] Configurable escalation rules per venue (number of messages, keywords, time of day)
- [ ] Human handoff: when escalated, notify venue manager with full conversation context
- [ ] Follow-up automation:
  - No response in 24 h → send follow-up email
  - No response in 3 days → create reminder task
  - Proposal viewed but no reply in 2 days → send nudge email

---

## 5. Proposals

> API stubs exist. Full generation and delivery not yet built.

- [ ] AI-assisted proposal content generation (cover page, pricing breakdown, package modeling)
- [ ] Venue manager preview before sending
- [ ] Proposal delivery state tracking: Draft → Sent → Viewed → Accepted / Declined / Expired
- [ ] Send proposal via email (Resend) with tracking pixel or link-open event
- [ ] PDF generation for proposals (`pdf` export route)

---

## 6. Analytics Dashboard

- [ ] `/dashboard/analytics` page with venue-level metrics
  - Page views and unique visitors over time
  - Chat opens and message counts
  - Leads created and conversion funnel
  - Top inquiry sources
- [ ] `GET /api/venues/:id/analytics` endpoint
- [ ] Charts: line chart for views over time, funnel chart for conversion
- [ ] Date range selector (7d / 30d / 90d / custom)
- [ ] CSV / PDF export

---

## 7. Email Infrastructure (Resend)

> Currently no email is sent anywhere. All email tasks are blocked on Resend setup.

- [ ] Add `RESEND_API_KEY` to environment and Supabase secrets
- [ ] Create email templates (React Email or HTML):
  - Welcome / onboarding
  - Trial expiring (3 days, 1 day)
  - Payment failed
  - Inquiry received (venue manager)
  - Inquiry confirmation (prospect)
  - Proposal sent
  - Lead follow-up / nudge
- [ ] Shared `sendEmail(to, template, data)` utility in `lib/email/`

---

## 8. Testing Gaps

- [ ] Auth setup test is flaky — improve `tests/auth.setup.ts` to retry on slow cold start
- [ ] Add Playwright tests for subscription limit enforcement in the UI (upgrade prompt shown when limit hit)
- [ ] Add Playwright test for public inquiry form end-to-end (submit → lead created → confirmation shown)
- [ ] Add tests for proposal creation and status transitions
- [ ] Performance test: venue search page loads in <2 s with 100+ venues
- [ ] Security test: RLS prevents cross-tenant data access for `conversations` and `leads`
- [ ] Accessibility audit: keyboard navigation and screen reader testing on public pages

---

## 9. Phase 2 (Explicitly Out of Scope for Now)

Captured here for visibility — do not start without a separate planning session.

- [ ] **Timeline generation** — visual event run-of-show builder
- [ ] **Communication hub** — in-app messaging + email templates for vendor coordination
- [ ] **Advanced analytics** — cohort analysis, revenue attribution, benchmarking
- [ ] **Mobile app** — React Native or PWA
- [ ] **AI vendor matching** — GPT-powered recommendations beyond current score-based algorithm
- [ ] **Team collaboration** — multiple staff users per venue, roles & permissions
- [ ] **Payment processing** — deposit collection, invoice generation, payment links
- [ ] **Marketplace reviews** — public star ratings and written reviews from event clients
- [ ] **White-label / agency tier** — manage multiple client venues under one account

---

## Source References

| Area | Primary Source |
|------|---------------|
| Stripe & Billing | `docs/tasks/STRIPE_SUBSCRIPTION_TASKS.md` |
| Public Marketplace | `docs/tasks/PublicMarketplace_TaskList.md`, `docs/prds/MARKETPLACE_PRD.md` |
| Public Venue Pages (editor) | `docs/tasks/PUBLIC_PAGES_TASKS.md` |
| AI Chat & Proposals | `docs/prds/MARKETPLACE_PRD.md` §3.2–3.4 |
| Phase 2 | `CLAUDE.MD` — "Features Out of Scope" |
