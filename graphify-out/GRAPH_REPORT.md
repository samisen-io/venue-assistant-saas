# Graph Report - app+docs  (2026-04-29)

## Corpus Check
- 169 files · ~103,994 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 575 nodes · 667 edges · 38 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 149 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core API Route Handlers|Core API Route Handlers]]
- [[_COMMUNITY_AI Features & Marketplace Strategy|AI Features & Marketplace Strategy]]
- [[_COMMUNITY_AI Conversation Engine & Testing|AI Conversation Engine & Testing]]
- [[_COMMUNITY_AppSumo Integration|AppSumo Integration]]
- [[_COMMUNITY_Secondary API Endpoints|Secondary API Endpoints]]
- [[_COMMUNITY_Automated Test Suite|Automated Test Suite]]
- [[_COMMUNITY_Dashboard Pages & Routes|Dashboard Pages & Routes]]
- [[_COMMUNITY_Pre-Launch & Feature Flags|Pre-Launch & Feature Flags]]
- [[_COMMUNITY_Calendar & Date Utilities|Calendar & Date Utilities]]
- [[_COMMUNITY_Public Venue Page UI|Public Venue Page UI]]
- [[_COMMUNITY_Media, Storage & PDF|Media, Storage & PDF]]
- [[_COMMUNITY_Proposal & Error Pages|Proposal & Error Pages]]
- [[_COMMUNITY_Vendor Review API|Vendor Review API]]
- [[_COMMUNITY_Event Management API|Event Management API]]
- [[_COMMUNITY_Venue CRUD API|Venue CRUD API]]
- [[_COMMUNITY_Budget Tracking API|Budget Tracking API]]
- [[_COMMUNITY_Availability Scheduling API|Availability Scheduling API]]
- [[_COMMUNITY_Multi-Venue Management UI|Multi-Venue Management UI]]
- [[_COMMUNITY_Lead Management API|Lead Management API]]
- [[_COMMUNITY_Event Scheduling API|Event Scheduling API]]
- [[_COMMUNITY_Notification & Settings|Notification & Settings]]
- [[_COMMUNITY_Module Cluster 21|Module Cluster 21]]
- [[_COMMUNITY_Module Cluster 22|Module Cluster 22]]
- [[_COMMUNITY_Module Cluster 24|Module Cluster 24]]
- [[_COMMUNITY_Module Cluster 25|Module Cluster 25]]
- [[_COMMUNITY_Module Cluster 27|Module Cluster 27]]
- [[_COMMUNITY_Module Cluster 28|Module Cluster 28]]
- [[_COMMUNITY_Module Cluster 30|Module Cluster 30]]
- [[_COMMUNITY_Module Cluster 31|Module Cluster 31]]
- [[_COMMUNITY_Module Cluster 32|Module Cluster 32]]
- [[_COMMUNITY_Module Cluster 33|Module Cluster 33]]
- [[_COMMUNITY_Module Cluster 35|Module Cluster 35]]
- [[_COMMUNITY_Module Cluster 36|Module Cluster 36]]
- [[_COMMUNITY_Module Cluster 37|Module Cluster 37]]
- [[_COMMUNITY_Module Cluster 38|Module Cluster 38]]
- [[_COMMUNITY_Module Cluster 39|Module Cluster 39]]
- [[_COMMUNITY_Module Cluster 40|Module Cluster 40]]
- [[_COMMUNITY_Module Cluster 92|Module Cluster 92]]

## God Nodes (most connected - your core abstractions)
1. `Error()` - 116 edges
2. `Phase 1: Database Schema & Migrations (Public Pages)` - 18 edges
3. `Must Have Tasks (M1-M14)` - 17 edges
4. `VenueManager Public Marketplace & AI Conversational Booking PRD v2.0` - 13 edges
5. `Internal Team Guide` - 12 edges
6. `AppSumo Launch & Distribution Plan` - 12 edges
7. `lib/subscription/limits.ts` - 11 edges
8. `AppSumo Launch Implementation Tasks` - 11 edges
9. `Stripe Subscription Management — Implementation Tasks` - 11 edges
10. `POST()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `Error()`  [INFERRED]
  api/clients/[clientId]/communications/route.ts → error.tsx
- `GET()` --calls--> `Error()`  [INFERRED]
  api/venues/[venueId]/public-page/route.ts → error.tsx
- `POST()` --calls--> `Error()`  [INFERRED]
  api/ai/extract-event/route.ts → error.tsx
- `GET()` --calls--> `Error()`  [INFERRED]
  api/events/route.ts → error.tsx
- `GET()` --calls--> `Error()`  [INFERRED]
  api/events/[eventId]/route.ts → error.tsx

## Hyperedges (group relationships)
- **AppSumo Launch Flow: Redemption, Limits & Onboarding** — appsumo_redemption_flow, lib_subscription_limits, onboarding_checklist_component, support_widget_component, seed_demo_script [EXTRACTED 0.95]
- **Multi-Venue: Context Provider, Header Routing & API Validation** — venue_context_provider, venue_header_helper, resolve_venue_helper, row_level_security [EXTRACTED 0.95]
- **Must Have GTM Build Sequence (M1-M14 ship order)** — m1_billing, m2_email_notifications, m5_proposals_esignature, m10_onboarding_flow, m12_demo_environment, m13_support_channel, m14_ical_feed [EXTRACTED 0.90]
- **AI Chat to Lead Capture Pipeline** — chat_api_endpoint, ai_conversation_engine, lead_creator_lib, leads_table, lead_notifier_lib [EXTRACTED 0.90]
- **Public Venue Page Data Aggregation Flow** — venue_slug_route, api_venues_public_slug, venue_photos_table, venue_packages_table, venue_amenities_table, venue_availability_table, venue_testimonials_table [EXTRACTED 0.95]
- **Subscription Tier Enforcement System** — lib_stripe_config, lib_subscription_limits, stripe_plan_limits, subscriptions_db_table, usage_tracking_db_table, upgrade_prompt_component [EXTRACTED 0.90]

## Communities

### Community 0 - "Core API Route Handlers"
Cohesion: 0.02
Nodes (79): DELETE(), GET(), POST(), GET(), Error(), sitemap(), POST(), GET() (+71 more)

### Community 1 - "AI Features & Marketplace Strategy"
Cohesion: 0.05
Nodes (60): AI Chat Widget (Claude-Powered), AI Agent for Vendor Outreach, Anthropic Claude API, GET /api/public/venues/search Endpoint, Backlog Tasks (Priority Index), ICP: Independent Banquet Halls & Event Spaces, ICP: Boutique Hotels (1-2 event rooms), Inngest Background Jobs (+52 more)

### Community 2 - "AI Conversation Engine & Testing"
Cohesion: 0.05
Nodes (56): AI Chat Conversation Flow (4 Stages), AI Conversation Engine (4-Stage Flow, Claude API), lib/ai/escalation.ts — Escalation Logic, lib/analytics/tracker.ts, API Integration Test Layer (tests/integration/*), lib/ai/tools/availabilityChecker.ts, app/api/venues/public/[slug]/chat/route.ts, lib/ai/extraction/chatDataExtractor.ts (+48 more)

### Community 3 - "AppSumo Integration"
Cohesion: 0.1
Nodes (32): app/api/appsumo/redeem/route.ts, app/redeem/page.tsx, appsumo_codes Database Table, AppSumo Launch & Distribution Plan, AppSumo Lifetime Deal Badge, AppSumo Redemption Flow, app/api/webhooks/appsumo/route.ts (Refund Webhook), AppSumo Launch Implementation Tasks (+24 more)

### Community 4 - "Secondary API Endpoints"
Cohesion: 0.12
Nodes (9): PUT(), DELETE(), handleVendorDecision(), PUT(), PUT(), PUT(), GET(), PUT() (+1 more)

### Community 5 - "Automated Test Suite"
Cohesion: 0.13
Nodes (17): Automated Test Phase 1: Foundation (Seed, Auth, data-testid, CI), Automated Test Phase 3: Core CRUD Flows, Automated Test Phase 4: Business Logic Flows, Automated Test Phase 5: AI Workflow Flows, Automated Test Phase 7: Security & RLS, Automated Test Task Plan, VenueAssistant Manual Test Checklist, MVP Database Schema (profiles, venues, vendors, events, event_vendors, vendor_reviews) (+9 more)

### Community 6 - "Dashboard Pages & Routes"
Cohesion: 0.17
Nodes (11): GET(), handleEmailBounced(), handleEmailClicked(), handleEmailDelivered(), handleEmailOpened(), handleEmailSent(), POST(), verifySignature() (+3 more)

### Community 7 - "Pre-Launch & Feature Flags"
Cohesion: 0.18
Nodes (11): Feature Flags (ENABLE_NL_EVENT_CREATION, ENABLE_AI_AGENT, ENABLE_REAL_TIME_UPDATES), Final Pre-Launch Deployment Checklist, Pre-Launch Guide for VenueManager, Pre-Launch Icon Generation (PNG from SVG), Pre-Launch OG Image Creation, Pre-Launch Vercel Environment Variables Setup, Setup Guide Environment Variables, AI Agent & Webhook Setup Guide (+3 more)

### Community 8 - "Calendar & Date Utilities"
Cohesion: 0.39
Nodes (5): addDays(), addMonths(), GET(), parseMonthInput(), toDateOnly()

### Community 9 - "Public Venue Page UI"
Cohesion: 0.29
Nodes (7): app/api/venues/public/[slug]/route.ts — Public Page Data API, AvailabilityCalendar Component, HeroSection Component, PhotoGallery + Lightbox Components, PricingPackages Component, Phase 3: Public Venue Page Frontend, app/[venueSlug]/page.tsx — Public Venue Page Route

### Community 10 - "Media, Storage & PDF"
Cohesion: 0.33
Nodes (6): lib/storage/upload.ts — Photo Upload Utilities, lib/proposals/pdfGenerator.ts (uses pdf-lib), PhotoUploader Component, Phase 2: File Storage & Image Management, Phase 7: Proposal Generation, Supabase venue-photos Storage Bucket

### Community 11 - "Proposal & Error Pages"
Cohesion: 0.4
Nodes (2): NotFound(), ProposalAcceptancePage()

### Community 12 - "Vendor Review API"
Cohesion: 0.4
Nodes (2): GET(), POST()

### Community 13 - "Event Management API"
Cohesion: 0.5
Nodes (2): DELETE(), GET()

### Community 14 - "Venue CRUD API"
Cohesion: 0.5
Nodes (2): DELETE(), GET()

### Community 15 - "Budget Tracking API"
Cohesion: 0.5
Nodes (2): DELETE(), GET()

### Community 16 - "Availability Scheduling API"
Cohesion: 0.6
Nodes (4): addDefaultEndTime(), DELETE(), GET(), PUT()

### Community 17 - "Multi-Venue Management UI"
Cohesion: 0.5
Nodes (2): fetchVenues(), handleSetDefault()

### Community 18 - "Lead Management API"
Cohesion: 0.83
Nodes (3): GET(), getAuthedVenueIdForLead(), POST()

### Community 19 - "Event Scheduling API"
Cohesion: 0.67
Nodes (3): addDefaultEndTime(), GET(), POST()

### Community 20 - "Notification & Settings"
Cohesion: 0.67
Nodes (2): GET(), POST()

### Community 21 - "Module Cluster 21"
Cohesion: 0.83
Nodes (3): GET(), getAuthedVenueIdForProposal(), PUT()

### Community 22 - "Module Cluster 22"
Cohesion: 0.5
Nodes (1): onVerifyOtp()

### Community 24 - "Module Cluster 24"
Cohesion: 0.5
Nodes (1): fetchFilters()

### Community 25 - "Module Cluster 25"
Cohesion: 0.5
Nodes (1): fetchSpaces()

### Community 27 - "Module Cluster 27"
Cohesion: 0.5
Nodes (1): fetchData()

### Community 28 - "Module Cluster 28"
Cohesion: 0.5
Nodes (4): Design System Color Palette, Design System Components (shadcn/ui), VenueManager Design System, Design System Typography

### Community 30 - "Module Cluster 30"
Cohesion: 1.0
Nodes (2): GET(), getSafeNext()

### Community 31 - "Module Cluster 31"
Cohesion: 1.0
Nodes (2): getAuthedVenueId(), POST()

### Community 32 - "Module Cluster 32"
Cohesion: 1.0
Nodes (2): GET(), sanitizeVenueForPublicApi()

### Community 33 - "Module Cluster 33"
Cohesion: 1.0
Nodes (2): extractDatesFromMessage(), POST()

### Community 35 - "Module Cluster 35"
Cohesion: 1.0
Nodes (2): generateICal(), GET()

### Community 36 - "Module Cluster 36"
Cohesion: 1.0
Nodes (2): POST(), validatePageData()

### Community 37 - "Module Cluster 37"
Cohesion: 0.67
Nodes (1): POST()

### Community 38 - "Module Cluster 38"
Cohesion: 1.0
Nodes (2): GET(), POST()

### Community 39 - "Module Cluster 39"
Cohesion: 1.0
Nodes (2): getAuthedVenueIdForProposal(), POST()

### Community 40 - "Module Cluster 40"
Cohesion: 0.67
Nodes (1): fetchData()

### Community 92 - "Module Cluster 92"
Cohesion: 1.0
Nodes (1): One Venue Per User Architectural Constraint

## Knowledge Gaps
- **69 isolated node(s):** `Next.js App Router`, `Vercel Deployment`, `Vendor Matching Engine`, `AppSumo Lifetime Deal Badge`, `app/api/webhooks/appsumo/route.ts (Refund Webhook)` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Proposal & Error Pages`** (5 nodes): `NotFound()`, `not-found.tsx`, `page.tsx`, `generateMetadata()`, `ProposalAcceptancePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vendor Review API`** (5 nodes): `route.ts`, `route.ts`, `route.ts`, `GET()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Event Management API`** (5 nodes): `route.ts`, `DELETE()`, `GET()`, `POST()`, `PUT()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Venue CRUD API`** (5 nodes): `route.ts`, `DELETE()`, `GET()`, `POST()`, `PUT()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Budget Tracking API`** (5 nodes): `route.ts`, `DELETE()`, `GET()`, `POST()`, `PUT()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Multi-Venue Management UI`** (5 nodes): `page.tsx`, `fetchVenues()`, `handleAddVenue()`, `handleSetDefault()`, `handleViewModeChange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notification & Settings`** (4 nodes): `route.ts`, `route.ts`, `GET()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 22`** (4 nodes): `page.tsx`, `onResendOtp()`, `onSubmit()`, `onVerifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 24`** (4 nodes): `fetchFilters()`, `handleEventClick()`, `handleSelectSlot()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 25`** (4 nodes): `page.tsx`, `clearFilters()`, `fetchSpaces()`, `handleViewModeChange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 27`** (4 nodes): `page.tsx`, `fetchData()`, `handleReviewChange()`, `submitReviews()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 30`** (3 nodes): `route.ts`, `GET()`, `getSafeNext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 31`** (3 nodes): `route.ts`, `getAuthedVenueId()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 32`** (3 nodes): `route.ts`, `GET()`, `sanitizeVenueForPublicApi()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 33`** (3 nodes): `route.ts`, `extractDatesFromMessage()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 35`** (3 nodes): `route.ts`, `generateICal()`, `GET()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 36`** (3 nodes): `route.ts`, `POST()`, `validatePageData()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 37`** (3 nodes): `route.ts`, `GET()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 38`** (3 nodes): `route.ts`, `GET()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 39`** (3 nodes): `route.ts`, `getAuthedVenueIdForProposal()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 40`** (3 nodes): `page.tsx`, `fetchData()`, `handleManageSubscription()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Cluster 92`** (1 nodes): `One Venue Per User Architectural Constraint`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Error()` connect `Core API Route Handlers` to `Secondary API Endpoints`, `Dashboard Pages & Routes`, `Calendar & Date Utilities`, `Vendor Review API`, `Availability Scheduling API`, `Lead Management API`, `Event Scheduling API`, `Notification & Settings`, `Module Cluster 21`, `Module Cluster 22`, `Module Cluster 24`, `Module Cluster 25`, `Module Cluster 27`, `Module Cluster 31`, `Module Cluster 32`, `Module Cluster 33`, `Module Cluster 35`, `Module Cluster 36`, `Module Cluster 37`, `Module Cluster 39`, `Module Cluster 40`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `Stripe Subscription Management — Implementation Tasks` connect `AppSumo Integration` to `AI Features & Marketplace Strategy`, `AI Conversation Engine & Testing`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `API Integration Test Layer (tests/integration/*)` connect `AI Conversation Engine & Testing` to `Automated Test Suite`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 115 inferred relationships involving `Error()` (e.g. with `sitemap()` and `GET()`) actually correct?**
  _`Error()` has 115 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Next.js App Router`, `Vercel Deployment`, `Vendor Matching Engine` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core API Route Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `AI Features & Marketplace Strategy` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._