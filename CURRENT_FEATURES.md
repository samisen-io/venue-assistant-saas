# Current Features — Venue Assistant SaaS

> A production-ready SaaS platform for venue managers. Features intelligent vendor matching, budget tracking, AI-powered chat, public-facing pages, lead generation, and subscription-based monetization.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui, Supabase, Stripe, Anthropic Claude API, Resend, Inngest, Playwright

---

## Table of Contents

1. [Authentication & Onboarding](#1-authentication--onboarding)
2. [Multi-Venue Management](#2-multi-venue-management)
3. [Space / Room Management](#3-space--room-management)
4. [Event Management](#4-event-management)
5. [Vendor Management](#5-vendor-management)
6. [Vendor Matching Engine](#6-vendor-matching-engine)
7. [Vendor Performance & Reviews](#7-vendor-performance--reviews)
8. [Vendor Communication & Outreach](#8-vendor-communication--outreach)
9. [Budget Tracking](#9-budget-tracking)
10. [Client Management](#10-client-management)
11. [Lead Management](#11-lead-management)
12. [Proposal Generation](#12-proposal-generation)
13. [Public Venue Pages (Marketplace)](#13-public-venue-pages-marketplace)
14. [AI-Powered Chat & Lead Capture](#14-ai-powered-chat--lead-capture)
15. [Public Inquiry Forms](#15-public-inquiry-forms)
16. [AI Agent System (Automated Outreach)](#16-ai-agent-system-automated-outreach)
17. [Subscription & Billing](#17-subscription--billing)
18. [Email System](#18-email-system)
19. [Notifications](#19-notifications)
20. [Dashboard & Analytics](#20-dashboard--analytics)
21. [Calendar Integration](#21-calendar-integration)
22. [Data Model Overview](#22-data-model-overview)

---

## 1. Authentication & Onboarding

- Email/password signup with OTP verification (multi-step)
- Login, forgot password, and password reset flows
- Email verification
- First-time onboarding wizard (`/onboarding/venue-setup`)
- User profile CRUD (`GET/PUT /api/profile`)
- Protected routes with automatic redirects
- Row-Level Security (RLS) for complete multi-tenant data isolation

---

## 2. Multi-Venue Management

- Full venue CRUD with fields: name, address, city, state, zip, phone, email, type, description, website, tagline, hero image, social links (JSONB), coordinates, business hours
- Unique slug generation and validation for public URLs
- Publish/unpublish venue public pages
- Page version history with restore capability
- Venue-level analytics tracking
- **Subscription-enforced venue limits:**
  - Trial: 1 venue
  - Starter: 1 venue
  - Professional: 3 venues
  - Enterprise: unlimited

**Key routes:** `GET/POST /api/venues`, `GET/PUT/DELETE /api/venues/[venueId]`, `GET /api/venues/check-limit`, `POST /api/venues/[venueId]/publish`

---

## 3. Space / Room Management

- Space CRUD: name, capacity, type (ballroom, conference room, meeting room, garden, rooftop, etc.), floor level, square footage, hourly rate
- Default 60-minute setup/cleanup time buffers per space
- Per-space amenities and notes
- **Availability checking:** real-time conflict detection for overlapping bookings (includes setup/cleanup buffer)
- Filter available spaces by date, time, and minimum capacity
- API blocks deletion if active events exist on the space

**Key routes:** `GET/POST /api/spaces`, `GET /api/spaces/availability`, `GET/PUT/DELETE /api/spaces/[spaceId]`

---

## 4. Event Management

- Event CRUD: name, type, date, start/end time, guest count, budget, description, special requirements
- Status tracking: `planning`, `confirmed`, `in_progress`, `completed`, `cancelled`
- Link events to a space and (optionally) a client
- Service requirements per event (many-to-many with budget allocation per service)
- **Double-booking prevention:** database trigger rejects overlapping space reservations (respects setup/cleanup times)
- Dedicated cancel endpoint (`POST /api/events/[eventId]/cancel`)
- Calendar query with filters: venue, space, status, event type, date range

**Key routes:** `GET/POST /api/events`, `GET/PUT/DELETE /api/events/[eventId]`, `POST /api/events/[eventId]/cancel`, `GET /api/calendar`

---

## 5. Vendor Management

- Vendor CRUD: name, contact info (name, email, phone), cost structure, cost per unit, website, notes
- Soft delete (`is_active` flag)
- **Performance metrics** (auto-calculated):
  - Reliability score (0–100)
  - Total events served
  - On-time delivery count and percentage
  - Average quality rating (1–5 stars)
- Service categorization: many-to-many relationship between vendors and event services
- Vendor assignment to events with primary/backup roles, quoted/actual costs, confirmation status
- **Outreach lifecycle:** `pending → contacted → available → confirmed / rejected`

**Key routes:** `GET/POST /api/vendors`, `GET/PUT/DELETE /api/vendors/[vendorId]`, `GET/POST /api/events/[eventId]/vendors`

---

## 6. Vendor Matching Engine

Scoring algorithm (`/lib/algorithms/vendorMatching.ts`) ranks vendors 0–100 using weighted criteria:

| Factor | Weight | Calculation |
|---|---|---|
| Reliability score | 30% | Historical reliability (0–100) |
| Cost fit | 25% | Estimated cost vs. budget allocation |
| Experience | 20% | Past events × 5, capped at 100 |
| On-time history | 10% | On-time delivery percentage |
| Service overlap | 15% | % of required services covered |

Returns ranked list with estimated costs and human-readable match reasons per vendor.

---

## 7. Vendor Performance & Reviews

- Post-event review submission: 5-star quality rating, on-time delivery flag, cost accuracy, "would use again", notes
- Automatic aggregation of performance metrics on each review
- Performance history timeline per vendor

**Key routes:** `GET/POST /api/vendors/[vendorId]/reviews`

---

## 8. Vendor Communication & Outreach

- Send outreach emails to vendors (professional templates via Resend)
- Full communication history per vendor/event association
- **Vendor response handling:** parse inbound emails, update availability/quote status
- **Quote management:** receive, store, approve, and reject vendor quotes
  - Quote fields: status (`pending`, `approved`, `rejected`, `expired`), valid-until date, quote breakdown (JSONB)
- Communication tracking: direction (outbound/inbound), email/thread ID, delivery status, read tracking, follow-up flags

**Key routes:**
- `POST /api/events/[eventId]/vendors/[associationId]/contact`
- `POST /api/events/[eventId]/vendors/[associationId]/response`
- `GET /api/events/[eventId]/vendors/[associationId]/communications`
- `POST/GET /api/quotes`, `POST /api/quotes/[quoteId]/approve`, `POST /api/quotes/[quoteId]/reject`

---

## 9. Budget Tracking

- Per-event: total budget vs. spent, quoted vs. actual cost tracking
- Per-service budget allocation within an event
- Per-vendor cost tracking (quoted and actual)
- Variance analysis: under/on-track/over budget
- Guest-count-based cost estimation during vendor matching

**Key files:** `/lib/algorithms/budgetCalculations.ts`, `/lib/algorithms/budgetComparison.ts`

---

## 10. Client Management

- Client CRUD: company name, contact name, email, phone, notes, notification preferences
- Client communication log: booking confirmations, updates, cancellations, general messages, reminders
- Link communications to specific events

**Key routes:** `GET/POST /api/clients`, `GET/PUT/DELETE /api/clients/[clientId]`, `GET /api/clients/[clientId]/communications`

---

## 11. Lead Management

- Lead CRUD with full lifecycle: `new → contacted → proposal_sent → follow_up_sent → closed_won / closed_lost`
- Lead sources: `manual`, `inquiry_form`, `chat`, `web_inquiry`
- Lead details: contact info, event type, date, guest count, estimated budget
- **Auto-priority scoring (0–100):** high 80+, medium 60–79, low <60
- Activity timeline per lead (all interactions logged)
- **Convert lead to event:** pre-populates event form from lead data
- Deduplication: avoids creating duplicate leads from the same conversation

**Key routes:** `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/[leadId]`, `POST /api/leads/[leadId]/convert-to-event`, `GET/POST /api/leads/[leadId]/activities`

---

## 12. Proposal Generation

- Generate proposals from event details with dynamic pricing (packages + add-ons)
- Unique reference numbers, valid-until dates
- **PDF generation** with venue branding (`/lib/proposals/pdfGenerator.ts`)
- Send proposals via email (Resend) with HTML body and PDF attachment
- Status tracking: `draft`, `sent`, `viewed`, `accepted`, `rejected`, `expired`
- Track send/view/accept timestamps and rejection reasons

**Key routes:** `GET/POST /api/proposals/[proposalId]`, `POST /api/proposals/[proposalId]/send`

**Key files:** `/lib/proposals/proposalGenerator.ts`, `/lib/proposals/pricingCalculator.ts`, `/lib/proposals/pdfGenerator.ts`

---

## 13. Public Venue Pages (Marketplace)

Each venue can publish a SEO-optimized public page at `/[venueSlug]`.

### Page Sections
- Hero (image + tagline)
- About / description
- Photo gallery with lightbox
- Event types offered
- Pricing packages and add-ons
- Spaces overview
- Amenities list
- Availability calendar
- Testimonials carousel
- Location and contact info
- Social media links
- AI chat widget
- Inquiry form

### Page Editor (CMS)
- Real-time page editor with live preview panel
- Section-specific editors: BasicInfo, PhotosMedia, EventTypes, PricingSettings, Amenities, Spaces, AvailabilityCalendar, Testimonials, ContactSocial, SEO, BlackoutDates, AIChatSettings
- Publish checklist (pre-publish validation)
- Changes summary panel
- Version history with one-click restore
- Preview tokens for sharing unpublished pages

**Key routes:** `GET /api/venues/public/[slug]`, `POST /api/venues/[venueId]/publish`, `GET/POST /api/venues/[venueId]/versions`, `POST /api/venues/[venueId]/versions/[versionId]/restore`, `GET /api/venues/[venueId]/preview-token`

---

## 14. AI-Powered Chat & Lead Capture

Embeddable chat widget on public venue pages powered by Anthropic Claude.

- Multi-turn conversations with session management and full history
- Rate limiting: 30 messages/hour per IP
- Per-venue message quotas (subscription-based)
- **Natural language understanding:** extracts event details (date, guest count, event type, budget, special requirements) with confidence scoring
- **Context-aware suggested actions** by conversation stage:
  - Early: "Check dates", "See pricing"
  - Mid: "Get quote", "Speak to manager"
  - Late: "Request proposal", "Schedule tour"
  - Escalation: "Share email", "Call venue"
- **Intelligent escalation:** detects when to hand off to a human; requests contact info before escalating
- **Auto-lead generation:** creates a lead from conversation data when sufficient info is collected (threshold-based, deduplication)
- Configurable per-venue: system prompt, escalation rules, response tone

**Key routes:** `POST /api/venues/public/[slug]/chat`

**Key files:** `/lib/ai/claude.ts`, `/lib/ai/prompts/venueChat.ts`, `/lib/ai/extraction/chatDataExtractor.ts`, `/lib/ai/escalation.ts`, `/lib/ai/tools/availabilityChecker.ts`, `/lib/ai/tools/pricingEstimator.ts`

---

## 15. Public Inquiry Forms

- Web inquiry form on public pages: name, email, phone, event type, date, guest count, message
- Rate limiting: 10 submissions/hour per IP
- Auto-creates a lead record on submission
- Email notification to venue on new inquiry

**Key route:** `POST /api/venues/public/[slug]/inquiries`

---

## 16. AI Agent System (Automated Outreach)

Background agent that automates vendor outreach for an event.

- Manual or automated trigger; supports targeting specific vendors
- **Progress tracking:** vendors targeted, contacted, responded, quotes received
- Error tracking, retry logic, and stale-agent detection via cron
- Full structured log (JSONB) per agent run
- Inbound email webhook: parses vendor replies, extracts quotes/availability, updates records

**Key routes:** `POST /api/agent/start`, `GET /api/agent/status`, `POST /api/agent/process-reply`, `GET /api/cron/agent-monitor`

**Key files:** `/lib/agent/orchestrator.ts`, `/lib/agents/webhook-processor.ts`

---

## 17. Subscription & Billing

### Plans

| Plan | Price | Venues | Events/mo | Vendors | AI Chats/mo |
|---|---|---|---|---|---|
| Trial | Free (14 days) | 1 | 5 | 10 | 50 |
| Starter | $49/mo | 1 | 10 | 50 | 100 |
| Professional | $149/mo | 3 | 50 | unlimited | 500 |
| Enterprise | $299/mo | unlimited | unlimited | unlimited | unlimited |

### Stripe Integration
- Checkout session creation and subscription management
- Webhook handling for subscription lifecycle events
- Customer creation and management
- Stripe Customer Portal (manage payment method, invoices, cancellation)

### Limit Enforcement
- Checked before creating venues, events, vendors, leads, photos, AI chat messages
- Graceful limit-exceeded responses (no silent failures)
- Monthly usage reset tracked in `usage_tracking` table

**Key routes:** `GET/POST /api/subscription`, `POST /api/subscription/portal`, `GET /api/subscription/plans`, `POST /api/subscription/trial`, `GET /api/subscription/usage`, `POST /api/webhooks/stripe`

**Key files:** `/lib/stripe/config.ts`, `/lib/subscription/limits.ts`, `/lib/subscription/usage.ts`, `/lib/subscription/trial.ts`

---

## 18. Email System

- Transactional email via **Resend** with HTML and text, attachment support
- **Templates:** booking confirmation, proposal (with PDF attachment), vendor outreach, vendor confirmation, lead alert, testimonial request, lead follow-up sequences
- **Inbound email webhook:** receives vendor replies, links to original thread, parses content (quote, availability, acceptance)
- Email delivery tracking: sent, delivered, bounced, opened, replied

**Key files:** `/lib/email/resend.ts`, `/lib/email/parser.ts`, `/lib/email/templates/`

---

## 19. Notifications

- In-app notifications for: new lead, lead status change, new conversation, proposal viewed
- Read/unread status with priority (high/medium/low)
- Deep links to relevant pages
- Retrieve last 20 notifications; mark individual or bulk as read

**Key routes:** `GET /api/notifications`, `PUT /api/notifications`

---

## 20. Dashboard & Analytics

- Manager dashboard: upcoming events, recent leads, active conversations, proposal status, vendor status overview, quick actions
- Venue-level analytics: page visits, chat engagement, lead source breakdown, conversion tracking, popular time slots
- Page-level analytics via `page_analytics` table

**Key routes:** `GET /api/venues/[venueId]/analytics`, `GET /api/page-analytics`

---

## 21. Calendar Integration

- Month/week/day calendar views (react-big-calendar)
- Color coding by event status and type
- Space availability overlay with booked and blacked-out dates
- Blackout dates: venue-wide or space-specific with reason tracking
- Configurable calendar settings: working hours, availability rules, booking windows

**Key routes:** `GET /api/calendar`, `GET /api/calendar/availability`

---

## 22. Data Model Overview

### Core Tables (15)
`profiles`, `venues`, `spaces`, `event_services`, `vendors`, `clients`, `vendor_services`, `events`, `client_communications`, `event_service_requirements`, `event_vendors`, `vendor_reviews`, `agent_runs`, `vendor_communications`, `vendor_quotes`

### Public Pages / Marketplace Tables (21)
`venue_photos`, `venue_amenities`, `venue_event_types`, `venue_packages`, `venue_package_addons`, `venue_testimonials`, `venue_availability`, `venue_calendar_settings`, `venue_blackout_dates`, `venue_ai_settings`, `venue_page_versions`, `page_analytics`, `leads`, `lead_activities`, `conversations`, `conversation_messages`, `proposals`, `subscriptions`, `usage_tracking`, `webhook_events`, `preview_tokens`

**Total: 36 tables** with full RLS policies for multi-tenant isolation.

---

## Stats at a Glance

| Metric | Count |
|---|---|
| API routes | ~77 |
| React components | ~141 |
| Database tables | 36 |
| Subscription tiers | 4 |
| E2E test files | 7 (93 tests) |
| External integrations | 4 (Stripe, Resend, Anthropic, Inngest) |
