# Product Requirements Document (PRD)
## VenueManager: Public Marketplace & AI Conversational Booking

**Version:** 2.0 (consolidated)
**Date:** February 14, 2026
**Owner:** Prashant, SamisenAI
**Status:** Ready for Development

> **Consolidation note:** This document merges two PRDs:
> - *Public Venue Pages with AI Conversational Booking* (v1.0, Feb 10, 2026)
> - *Public-Facing Marketplace Pivot* (v1.0, Feb 14, 2026)
> The marketplace PRD is the strategic umbrella; the venue pages/AI chat PRD provides detailed per-venue specs.

---

## Executive Summary

VenueManager will pivot from a B2B venue management tool to a **two-sided marketplace** where venue seekers can discover and contact venues, while venue managers use a separate portal to manage their listings and handle incoming leads.

Each venue gets a professional public page with AI-powered conversational inquiry, transforming the platform into a full marketplace. Prospects can view photos, check availability, and engage in natural language conversations with an AI assistant that qualifies leads and generates proposals automatically.

**Core Value Propositions:**
- **For Venue Seekers:** "Find and contact the perfect venue in minutes—no account required"
- **For Venue Managers:** "Get a professional 24/7 AI booking assistant. Prospects check availability, get instant quotes, and book—while you focus on running great events."

**Strategic Shift:**
- **Current:** Landing page targets venue managers (B2B sales page)
- **New:** Landing page is a public marketplace for venue seekers
- **Venue Manager Access:** Moves to `/for-venues` landing page + `/dashboard` portal

---

## Problem Statement

**For Venues:**
1. Responding to inquiries is time-consuming (10-15 emails per booking)
2. Hard to get discovered by new customers; marketing is expensive
3. Prospects want instant answers about availability/pricing
4. Venues lose bookings to competitors who respond faster
5. Creating custom quotes/proposals takes 30-60 minutes each
6. No professional web presence for event bookings

**For Event Planners/Clients:**
1. Hard to discover venues in one place
2. Can't check availability without calling/emailing
3. Have to create accounts just to inquire
4. Want to compare venues quickly
5. Need to describe complex event requirements

---

## Solution Overview

### Four-Part System

1. **Public Marketplace Homepage** — Discovery, search, and browsing for venue seekers
2. **Individual Venue Pages** — Per-venue public pages with photos, availability calendar, and AI chat
3. **AI Conversational Inquiry** — Natural language chat that qualifies leads and generates proposals
4. **Page Management Dashboard** — Backend tools for venue managers to control their public page and leads

---

## PART 1: Public Marketplace Homepage

### 1.1 Hero Section

**Visual Elements:**
- Large hero image/video (people at events, diverse venue types)
- Headline: "Find Your Perfect Event Venue"
- Subheadline: "Browse hundreds of venues, check availability, get instant quotes—all in one place"
- Prominent search bar (city, date, guest count)
- Trust signals: "500+ venues • 10,000+ events hosted • No account required"

**Search Bar (Primary CTA):**
- Where: City/location autocomplete
- When: Date picker (optional)
- Guests: Number input (optional)
- Event Type: Dropdown (Wedding, Corporate, Party, etc.) (optional)
- "Search Venues" button; "Browse All Venues" link

**Secondary CTAs:**
- "List Your Venue" button → `/for-venues`
- "How It Works" link (scroll to section)

**Design Specs:**
- Hero height: 70vh desktop, 50vh mobile
- Search bar: White card with shadow, prominent

**Acceptance Criteria:**
- ✅ Search works with partial inputs (location only is sufficient)
- ✅ Search redirects to `/venues?location=X&date=Y&guests=Z`
- ✅ Hero loads in <2 seconds
- ✅ Mobile search is smooth

---

### 1.2 How It Works Section

**Steps (3-4 cards in a row):**
1. **Search & Discover** — Browse venues by location, capacity, event type
2. **Compare & Choose** — View photos, amenities, pricing, real availability
3. **Contact Directly** — Submit inquiries and get responses within 24 hours
4. **Book Your Event** — Work with the venue to finalize and confirm

"No account needed • 100% free for event planners • Direct communication with venues"

---

### 1.3 Featured Venues Section

**Layout:** Grid of 6–8 venue cards (3-4 col desktop, 2 tablet, 1 mobile)

**Each card shows:**
- Primary photo, venue name, location
- Capacity range, event type badges
- Starting price or "Request Quote"
- Quick stats: ⭐ Rating, 📸 # photos, 📅 Available dates

**Data Source:** `venues` where `page_status = 'published'`, sorted by featured flag / rating / recent

**Acceptance Criteria:**
- ✅ Cards visually appealing, images lazy-loaded
- ✅ Clicking card navigates to correct venue page
- ✅ Section hidden if no published venues

---

### 1.4 Browse by Category Section

**By Event Type:** Weddings, Corporate Events, Birthday Parties, Conferences, Galas, Private Parties

**By Venue Type:** Banquet Halls, Hotels, Outdoor Venues, Historic Buildings, Rooftop Spaces, Unique Venues

**By Location:** Top 8–10 cities with most venues

**Interaction:** Click → `/venues?event_type=wedding` (clean filtered URLs)

---

### 1.5 Social Proof Section

**Success Stats:** "500+ Venues", "10,000+ Events Hosted", "50+ Cities", "4.8★ Average Rating" (dynamic from DB)

**Testimonials:** 2–3 testimonials from event planners who found venues through the platform

---

### 1.6 CTA for Venue Managers

Contrasting section:
- Headline: "Are you a venue manager?"
- Benefits: Reach thousands of planners, manage inquiries in one place, 24/7 AI assistant, professional public page
- CTA: "List Your Venue" → `/for-venues`

---

### 1.7 Footer

Navigation: Browse Venues, How It Works, For Venue Managers, About, Contact, Help/FAQ

Quick Links: Search by City, Search by Event Type, Popular Venues

Legal: Privacy Policy, Terms of Service, Cookie Policy

---

## PART 2: Venue Search & Discovery

### 2.1 Search Results Page

**URL:** `/venues?location=dallas&date=2026-03-15&guests=100&type=corporate`

**Layout:**
- Left sidebar: Filters (desktop) or collapsible (mobile)
- Main content: Venue cards/list
- Top bar: Search summary, sort options, view toggle (grid/list)

**Sort Options:** Relevance, Price (low/high), Capacity, Highest Rated, Most Recent

**Pagination:** 12–24 results/page, load more or infinite scroll

**Acceptance Criteria:**
- ✅ Search params in URL (shareable links)
- ✅ Filters work without page reload
- ✅ Mobile filters in slide-out panel
- ✅ Empty state: "No venues found. Try adjusting your filters."

---

### 2.2 Filter Sidebar

**Available Filters:**
- Location (city/ZIP + radius slider)
- Date & Availability (date picker, flexible dates checkbox)
- Guest Count (range)
- Event Type (multi-select checkboxes)
- Venue Type (multi-select checkboxes)
- Price Range (slider or min/max)
- Amenities (Parking, WiFi, AV, Catering, Outdoor, Accessible, Bar)
- Capacity (seated/standing min-max)

Active filters shown as removable badges. Filters persist in URL.

---

### 2.3 Venue Card (Search Results)

**Content:** Hero image, photo count badge, venue name, location, distance, capacity, event type badges, pricing or "Request Quote", rating, amenity icons

**CTAs:** "View Details" (primary), "Request Quote" (secondary)

---

### 2.4 Venue Detail Page (Public Profile)

**URL:** `/{venue-slug}` or `/venues/{venue-slug}`

**Sections:**
1. Hero (full-width image, venue name overlay, quick action CTAs)
2. Photo Gallery (grid + lightbox)
3. Overview Card (sticky sidebar desktop): capacity, event types, pricing, availability, "Send Inquiry" button
4. About Section (venue description)
5. Spaces & Capacity (list with setup options)
6. Amenities (icon grid)
7. Availability Calendar (color-coded: green/yellow/gray)
8. Pricing & Packages (if venue shows pricing)
9. Reviews & Testimonials
10. Location & Contact (embedded map, phone, email, hours)
11. Inquiry Form (fixed sidebar desktop, sticky bottom bar mobile)

**SEO:** H1 = venue name, schema.org EventVenue markup, Open Graph tags

---

### 2.5 Inquiry Form (No Account Required)

**Fields:**
- Name*, Email*, Phone (optional), Company (optional)
- Event Type*, Event Date*, Guest Count*, Description (max 500 chars)
- Budget Range (optional dropdown)
- ☐ Request a site tour / ☐ Receive pricing info
- Privacy policy checkbox

**Backend Actions:**
1. Create lead in `leads` table (`source: "public_inquiry"`)
2. Notify venue manager (email + in-app)
3. Send confirmation email to inquirer
4. Spam prevention: honeypot, rate limiting (max 3/email/day), optional reCAPTCHA

**Acceptance Criteria:**
- ✅ Works without account
- ✅ Venue manager notified within 30 seconds
- ✅ Confirmation email within 1 minute

---

## PART 3: Individual Venue Pages — AI Conversational Inquiry

### 3.1 Chat Interface (Frontend)

**Placement:** Embedded section on venue page + floating widget (bottom-right)

**UI Components:**
- Multiline text input with placeholder: "Describe your event in your own words..."
- Example suggestions: "I need a venue for 100 people in May", "Corporate retreat, 80 attendees"
- Chat history (user vs AI messages with distinct styling)
- Typing indicator while AI generates response
- AI-generated action buttons ("Check these dates", "Get a quote", "Speak to manager")

**Acceptance Criteria:**
- ✅ AI responses within 3 seconds
- ✅ Works on mobile without keyboard obscuring input
- ✅ Message history persists on page reload (session storage)

---

### 3.2 AI Conversation Engine (Backend)

**Core Functionality:**
- Parse natural language inquiry
- Extract structured data: event type, date, guest count, budget, requirements
- Check availability against venue calendar
- Provide pricing estimates from venue's packages
- Handle multi-turn conversations with clarifying questions
- Determine when to hand off to human

**AI Model:** Claude API (Anthropic) — custom system prompt per venue containing venue details, availability, pricing, tone/brand voice

**Conversation Flow (4 Stages):**

**Stage 1 — Initial Understanding:**
User: "I need a venue for a corporate event in March"
AI extracts: event type + timeframe, asks for guest count and specific dates

**Stage 2 — Qualification:**
User provides date + guest count → AI checks calendar and capacity → responds with availability + estimated pricing

**Stage 3 — Refinement:**
User specifies setup style, catering → AI provides updated pricing breakdown with package tiers

**Stage 4 — Conversion:**
User provides email + requests proposal → AI creates lead, generates proposal PDF, notifies venue manager

**Edge Cases:**
- Date unavailable → Offer nearby available dates
- Over capacity → Suggest space combinations or standing reception
- Too complex → Escalate to human with captured context

**System Prompt Template Variables:**
`{venue_name}`, `{venue_type}`, `{city}`, `{spaces_with_capacities}`, `{amenities_list}`, `{base_price}`, `{catering_range}`, `{available_dates_json}`, `{conversation_history}`, `{user_message}`

**API Endpoint:**
```
POST /api/venues/{slug}/chat
Request: { message, conversation_id, user_email? }
Response: { conversation_id, ai_response, extracted_data, suggested_actions, should_create_lead, escalate_to_human }
```

**Data Extraction Schema:**
```json
{
  "event_type": "corporate|wedding|social|conference|gala|other",
  "guest_count": "integer or range",
  "date": "YYYY-MM-DD or null",
  "date_flexibility": "exact|flexible|date_range",
  "budget": "integer or null",
  "requirements": { "catering": bool, "av_setup": bool, "custom": [] },
  "contact_info": { "name": null, "email": null, "phone": null },
  "confidence_score": 0.0-1.0
}
```

**Acceptance Criteria:**
- ✅ AI extracts event details with >85% accuracy
- ✅ AI checks availability correctly (0 errors)
- ✅ Response time <3 seconds (p95)
- ✅ AI never invents availability or pricing not in system

---

### 3.3 Lead Capture & CRM Integration

**Automatic Lead Creation Triggers:**
1. User provides email in conversation
2. User requests proposal/quote
3. User clicks "Speak to manager"
4. Conversation reaches 5+ messages (high intent)
5. AI confidence score for booking intent >70%

**Lead Data Captured:**
- Contact: name, email, phone, company
- Event: type, date, flexibility, guest count, estimated budget, requirements
- AI conversation: transcript, extracted data, confidence score, recommended package
- Priority score (0–100), next action, assigned_to, source = "ai_chat"

**Notifications:**
- Email to prospect (confirmation within 1 minute)
- Email to venue manager (lead alert with AI confidence score + recommended next steps)
- In-app notification (within 30 seconds)
- SMS for high-priority leads (optional)

---

### 3.4 Proposal Generation (AI-Assisted)

**Trigger:** User says "send proposal" + provides email + AI has sufficient info

**Proposal Contents:**
1. Cover page (logo, title, reference number, valid-until date)
2. Event summary (type, date, guests, contact)
3. Venue details (recommended space, floor plan, photos, amenities)
4. Pricing breakdown (venue rental, per-person, add-ons, tax, deposit, payment schedule)
5. What's included per package
6. Policies & terms (cancellation, payment, insurance)
7. Next steps CTA ("Book Now" / "Schedule Tour")

**Pricing Calculation:**
```
subtotal = base_venue_rental + (guest_count × per_person_rate) + av_setup + add_ons
total = subtotal + (subtotal × tax_rate)
deposit = total × deposit_percentage
```

**Delivery:** Generate PDF, email to prospect, store in lead record, optional venue manager review before sending

**Status Tracking:** Sent → Viewed → Accepted / Declined / Expired

**Acceptance Criteria:**
- ✅ Proposal generates in <5 seconds
- ✅ Pricing calculations 100% accurate
- ✅ Venue manager can preview before sending
- ✅ Tracking shows when prospect opens proposal

---

## PART 4: Page Management Dashboard

### 4.1 Page Editor Interface

**Access:** Dashboard → My Venues → [Venue] → "Edit Public Page"

**Style:** Live preview (WYSIWYG) — left panel = editor, right panel = live preview. Device preview: Desktop / Tablet (768px) / Mobile (375px).

#### 4.1.1 Basic Information
- Venue name, tagline, location (address autocomplete)
- Public URL slug: `venuemanager.pro/{slug}` (uniqueness validated in real-time)
- Page status: Published / Draft / Unpublished
- Auto-save every 30 seconds

#### 4.1.2 Photos & Media
- Hero image upload (min 1920×1080px, crop tool)
- Gallery sections (named sections, drag-and-drop reorder, captions, alt text)
- Photo limits: Basic 20, Professional 50, Premium unlimited
- Auto-compress images >2MB, max 10MB per photo

#### 4.1.3 Venue Details Editor
- Spaces & Capacity: name, type, capacity (seated/standing/theater/custom), optional photo
- Amenities checklist (pre-defined + custom amenities)
- Event types (pre-defined + custom types)
- About section (rich text, max 1000 chars)

#### 4.1.4 Availability & Calendar Settings
- Toggle: "Show real-time availability on public page"
- Buffer days (setup/teardown)
- Blackout dates (date range + optional reason)
- Minimum/maximum advance booking lead time

#### 4.1.5 Pricing & Packages
- Package builder: name, description, base price, pricing model (flat/per person/per hour/tiered)
- Tiered pricing example: base + per-person rates by guest range
- Inclusions checklist, add-ons
- Display settings: show exact pricing vs. "Starting at $X" vs. "Contact for pricing"
- AI pricing guidance: auto-suggest packages by event size/type

#### 4.1.6 AI Chat Settings
- Tone & voice: Professional / Friendly / Casual / Luxury / Custom
- Response length: Concise / Balanced / Detailed
- Proactive features: suggest alternatives, upsell add-ons, request contact info after N messages
- Escalation rules (configurable triggers)
- Custom greeting message (max 200 chars)
- After-hours message + business hours

#### 4.1.7 Contact Information & Social
- Phone, public email, business hours, social media links
- Map settings (show/hide, Google Maps embed)
- Privacy options: hide address, phone, or email

#### 4.1.8 SEO & Marketing
- Page title (max 60 chars) + meta description (max 160 chars)
- Google search result preview (updates live)
- Open Graph image for social sharing
- Analytics toggle, Google Analytics/Facebook Pixel IDs

#### 4.1.9 Testimonials
- Add/edit/remove testimonials with quote, name, company, event type, star rating, date
- Display settings: carousel / grid / list
- Auto-request automation: send testimonial request N days post-event

---

### 4.2 Page Preview & Publishing

**Live Preview Pane:** Updates in real-time (<500ms delay)

**Preview in New Tab:** `/{slug}?preview=true&token={auth_token}` — shows unpublished changes, shareable for 24 hours

**Publish Button States:** "Publish" / "Publish Changes" / "Published ✓"

**Pre-Publish Checklist Modal:**
- ✅ Hero image uploaded
- ✅ At least 5 photos in gallery
- ✅ Venue details complete
- ✅ Pricing configured
- ✅ AI chat settings configured
- ⚠️ No SEO description (warning, not blocker)

**Version History:** Last 10 versions, restore any version

**Unpublish:** Shows "This page is not currently available" to public

---

### 4.3 Page Analytics Dashboard

**Overview Cards:** Page Views, Inquiries Started, Leads Captured, Conversion Rate (with trend indicators)

**Traffic Sources:** Direct, Google Search, Social Media, Referral, Email

**Visitor Behavior:** Time on page, scroll depth per section, most clicked elements

**Inquiry Analytics:** Total inquiries, sources (AI chat vs. form vs. phone), average response time, inquiry→booking rate

**AI Chat Performance:** Conversations started, avg messages, lead capture rate, escalation rate, most common questions, avg response time

**SEO Performance:** Search impressions, CTR, avg position, top keywords

**Date Range:** Last 7/30/90 days or custom

**Export:** PDF, CSV, Excel

---

### 4.4 Lead Management (Enhanced)

**Lead Sources:** Manual, ai_chat, public_inquiry (from marketplace), phone, email, referral

**Lead Notification Settings:**
- In-app real-time notifications
- Email (immediate / hourly digest / daily digest / off), priority filter
- SMS for high-priority leads (optional)

**Lead Detail Page:**
- Contact card + event details card
- Priority score indicator (🔥 High / ⚡ Medium / 🟢 Low)
- AI conversation transcript (collapsible)
- AI Insights Panel: extracted data, recommended next steps, similar past events
- Quick Actions: Send Proposal, Schedule Tour, Send Email, Mark Won/Lost, Add Notes
- Activity Timeline (all actions with timestamps)
- Lead Status: New → Contacted → Qualified → Proposal Sent → Negotiating → Won / Lost

**Follow-Up Automation:**
- No response in 24h → Send follow-up email
- No response in 3 days → Schedule reminder task
- Proposal viewed but no response in 2 days → Send nudge email

**Response Templates (from public inquiries):**
- "Thank you for your inquiry"
- "We're available on your date"
- "Sorry, we're booked on that date"
- "Here's our pricing information"

---

### 4.5 Venue Manager Landing Page (`/for-venues`)

**Hero:** "Grow Your Event Venue Business" + sign up CTA

**Value Props:** Get Discovered (marketplace reach), Automate Inquiries (24/7 AI), Manage Everything (CRM + ops)

**Sections:** Features list, pricing tiers, social proof (testimonials + metrics), how-it-works (4 steps), bottom CTA

---

## PART 5: Technical Architecture

### Routing & Navigation

**Public Site (No Auth):**
- `/` → Public marketplace homepage
- `/venues` → Search results
- `/venues?location=X&date=Y&guests=Z` → Filtered search
- `/{venue-slug}` → Venue detail page
- `/for-venues` → Venue manager landing page
- `/login` → Venue manager login
- `/signup` → Venue manager signup

**Manager Portal (Auth Required):**
- `/dashboard` → Manager dashboard
- `/dashboard/events` → Events
- `/dashboard/vendors` → Vendors
- `/dashboard/leads` → Leads (with public inquiry source)
- `/dashboard/public-listing` → Manage public venue page
- `/dashboard/analytics` → Page analytics

**Redirect:** `/` when authenticated → `/dashboard` OR stay on public homepage (TBD)

---

### Database Schema

**venues** (existing, additions):
```sql
slug (text, unique)
tagline (text)
description (text)
hero_image_url (text)
page_status (enum: draft, published, unpublished)
view_count (integer, default: 0)
inquiry_count (integer, default: 0)
```

**venue_photos:**
```sql
id, venue_id, section_name, image_url, caption, display_order, created_at
```

**venue_spaces:**
```sql
id, venue_id, name, type (enum), capacity_seated, capacity_standing, capacity_theater, description, photo_url, display_order
```

**venue_packages:**
```sql
id, venue_id, name, description, base_price, pricing_model (enum: flat|per_person|per_hour|tiered), inclusions (jsonb), is_visible_on_public_page
```

**venue_public_settings:**
```sql
id, venue_id, is_visible_on_marketplace (bool, default: true), featured (bool), search_keywords (text[]), auto_respond_enabled (bool), auto_respond_message (text), response_time_goal (text)
```

**conversations:**
```sql
id, venue_id, prospect_email, prospect_name, started_at, last_message_at, status (enum: active|completed|escalated), lead_id (nullable FK)
```

**conversation_messages:**
```sql
id, conversation_id, role (enum: user|assistant), content (text), extracted_data (jsonb), created_at
```

**leads** (additions):
```sql
source (enum: manual|ai_chat|public_inquiry|phone|email|referral)
marketplace_inquiry_data (jsonb)
priority_score (integer 0-100)
conversation_id (nullable FK)
```

**venue_page_views:**
```sql
id, venue_id, viewed_at, ip_address (hashed), referrer, user_agent
```

**venue_search_queries:**
```sql
id, search_query, location, guest_count, event_type, date, results_count, created_at
```

**Indexes:**
```sql
CREATE INDEX idx_venues_visible ON venues(page_status) WHERE page_status = 'published';
CREATE INDEX idx_venues_capacity ON venues(capacity);
CREATE INDEX idx_leads_source ON leads(source);
```

---

### API Endpoints

**Public (No Auth):**
```
GET  /api/venues/:slug                        — Venue public page data
GET  /api/venues/:slug/availability?month=    — Calendar availability (5-min cache)
POST /api/venues/:slug/chat                   — AI chat message
POST /api/venues/:slug/inquiries              — Inquiry form submission
GET  /api/venues?location=&date=&guests=      — Search/filter venues
```

**Private (Venue Manager Auth):**
```
PUT  /api/venues/:id                          — Update venue details
POST /api/venues/:id/photos                   — Upload photo
PUT  /api/venues/:id/photos/reorder           — Reorder photos
GET/POST/PUT/DELETE /api/venues/:id/packages  — Package management
GET  /api/venues/:id/leads                    — Leads for venue
GET  /api/leads/:id                           — Lead detail
PUT  /api/leads/:id                           — Update lead
POST /api/leads/:id/proposal                  — Generate & send proposal
GET  /api/venues/:id/analytics                — Page analytics
GET  /api/conversations/:id                   — Conversation transcript
```

---

### Search Implementation

```sql
SELECT * FROM venues
WHERE
  page_status = 'published'
  AND is_visible_on_marketplace = true
  AND city ILIKE '%{location}%'
  AND capacity >= {guest_count}
  AND event_types @> ARRAY['{event_type}']
  AND NOT EXISTS (
    SELECT 1 FROM events
    WHERE events.venue_id = venues.id
    AND events.event_date = '{date}'
    AND events.status IN ('confirmed', 'in_progress')
  )
ORDER BY view_count DESC
LIMIT 24 OFFSET {page * 24};
```

**Optimizations:** Redis cache for popular searches (5-min TTL), debounce filter inputs (300ms), PostGIS geo search (future)

---

## PART 6: Migration & Launch Strategy

### Phase 1: Parallel Development (Weeks 1–2)
- Build public marketplace homepage (new `/`)
- Build search results page (`/venues`)
- Build/reuse venue detail page with AI chat
- Build inquiry form
- Keep existing landing page at `/for-venues` temporarily

### Phase 2: Data Preparation (Week 3)
- Ensure all venues have required fields for public listing
- Upload photos for venues missing them
- Set default pricing visibility
- Enable marketplace visibility for opted-in venues

### Phase 3: Soft Launch (Week 4)
- Deploy (hidden, no external links)
- Test with internal team + 10 friendly venue managers
- Fix bugs, iterate on AI prompt engineering
- Optimize page load performance

### Phase 4: Full Launch (Week 5)
- Switch `/` to public marketplace
- Redirect old landing page to `/for-venues`
- Announce to existing customers
- Marketing push (email, social, blog)

### Phase 5: Optimization (Week 6+)
- Monitor analytics and conversion funnel
- A/B test homepage variants
- Improve AI accuracy from real conversation data
- Scale infrastructure

**Rollback Plan:** Temporarily redirect `/` back to old landing page if major issues arise.

---

## User Stories

### For Venue Managers

**Setup Public Page** — Upload photos, add venue details, configure pricing, publish and get shareable URL

**Manage Inquiries** — Notified when new inquiry arrives, view full AI conversation, see recommended next steps, send proposal or schedule tour in one click

**Customize AI Behavior** — Choose tone, configure pricing display rules, set escalation triggers, customize greeting

**View Performance** — See page views, inquiries, conversion rate, traffic sources, section engagement; export analytics

### For Venue Seekers

**Discover Venues** — Search by location/capacity/event type, compare venues on search results page

**Get Instant Answers** — Describe event in natural language, AI checks availability and provides pricing estimate, get proposal emailed in minutes

**Contact Without Account** — Inquiry form is simple, no signup required, confirmation email sent immediately

---

## Success Metrics

### 3 Months Post-Launch

**Marketplace Adoption:**
- 500+ unique visitors/month to homepage
- 200+ searches/month
- 100+ inquiries submitted/month
- 20+ bookings via marketplace

**Venue Engagement:**
- 80%+ of venues create a public page
- 70%+ of venues opt-in to marketplace visibility
- 50%+ of venues have optimized listings (photos + pricing)

**AI Performance:**
- 85%+ accuracy extracting event details
- <5% of conversations escalate due to AI failure
- 3+ messages average per conversation
- 60%+ of prospects provide contact info during chat

**Conversion Funnel:**
- Homepage → Search: 40%
- Search → Venue Page: 25%
- Venue Page → Inquiry: 10–20%
- Inquiry → Booking: 15–25%

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI gives inaccurate info | High | Live calendar data, estimate ranges only, venue manager review option, "Report issue" button |
| Low venue participation | High | Opt-in default, show data ("3x more inquiries"), featured listing incentive, <10 min setup |
| AI costs too high | Medium | Tier-based message caps, efficient prompting, cache common responses |
| Low quality leads from marketplace | Medium | Require key fields, spam prevention, lead quality score |
| Venue managers confused by pivot | Medium | Pre-launch email, in-app guidance, support team readiness |
| SEO cannibalization (venue own sites) | Low-Med | Canonical tags, unique AI features, custom domain option (Phase 2) |

---

## Open Questions

1. **Auto-publish to marketplace?** Opt-in or opt-out for existing venues → *Recommend: email opt-in pre-launch, default ON for new venues*
2. **Pricing display default?** Show pricing vs. "Contact for pricing" → *Let venues choose; show data that transparency increases conversions*
3. **AI proposal auto-send?** Automatic vs. venue manager review → *Make configurable per venue*
4. **Instant booking?** Direct booking vs. inquiry only → *Inquiry only for MVP; consider deposits in Phase 2*
5. **Multiple locations?** Separate page per location vs. parent page with selector → *Separate pages for MVP, parent page for enterprise tier*
6. **Revenue from leads?** Free vs. premium per-lead pricing → *Free in subscription for now; featured listings as premium upsell*

---

## Conclusion

This PRD defines VenueManager's transformation into a two-sided marketplace with AI-powered venue pages.

**Key Success Factors:**
1. Beautiful, fast public marketplace (first impression for seekers)
2. Accurate, helpful AI conversations per venue (must actually work)
3. Easy setup for venue managers (target: <10 minutes)
4. Clear ROI for venues (fewer hours spent, more bookings)

**Timeline to MVP:** 4–5 weeks
**Timeline to General Availability:** 8–10 weeks

---

**Document Status:** ✅ Ready for Development
**Last Updated:** February 14, 2026
**Version:** 2.0 (consolidated)
