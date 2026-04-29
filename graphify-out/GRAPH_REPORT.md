# Graph Report - venue-assistant-saas  (2026-04-29)

## Corpus Check
- 464 files · ~243,809 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1422 nodes · 1711 edges · 37 communities detected
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 490 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 265|Community 265]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 126 edges
2. `createServiceRoleClient()` - 51 edges
3. `toast()` - 37 edges
4. `getAuthorizedVenue()` - 30 edges
5. `GET()` - 21 edges
6. `sendEmail()` - 18 edges
7. `Phase 1: Database Schema & Migrations (Public Pages)` - 18 edges
8. `Must Have Tasks (M1-M14)` - 17 edges
9. `useToast()` - 14 edges
10. `resolveVenueWithFallback()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createClient()`  [INFERRED]
  app/api/venues/route.ts → lib/supabase/server.ts
- `GET()` --calls--> `resolveVenue()`  [INFERRED]
  app/api/cron/agent-monitor/route.ts → lib/venues/resolveVenue.ts
- `buildAdminClient()` --calls--> `createClient()`  [INFERRED]
  tests/event-conflict.spec.ts → lib/supabase/server.ts
- `checkRateLimit()` --calls--> `DELETE()`  [INFERRED]
  proxy.ts → app/api/events/[eventId]/vendors/[associationId]/route.ts
- `sitemap()` --calls--> `createServiceRoleClient()`  [INFERRED]
  app/sitemap.ts → lib/supabase/server.ts

## Hyperedges (group relationships)
- **AppSumo Launch Flow: Redemption, Limits & Onboarding** — appsumo_redemption_flow, lib_subscription_limits, onboarding_checklist_component, support_widget_component, seed_demo_script [EXTRACTED 0.95]
- **Multi-Venue: Context Provider, Header Routing & API Validation** — venue_context_provider, venue_header_helper, resolve_venue_helper, row_level_security [EXTRACTED 0.95]
- **Must Have GTM Build Sequence (M1-M14 ship order)** — m1_billing, m2_email_notifications, m5_proposals_esignature, m10_onboarding_flow, m12_demo_environment, m13_support_channel, m14_ical_feed [EXTRACTED 0.90]
- **AI Chat to Lead Capture Pipeline** — chat_api_endpoint, ai_conversation_engine, lead_creator_lib, leads_table, lead_notifier_lib [EXTRACTED 0.90]
- **Public Venue Page Data Aggregation Flow** — venue_slug_route, api_venues_public_slug, venue_photos_table, venue_packages_table, venue_amenities_table, venue_availability_table, venue_testimonials_table [EXTRACTED 0.95]
- **Subscription Tier Enforcement System** — lib_stripe_config, lib_subscription_limits, stripe_plan_limits, subscriptions_db_table, usage_tracking_db_table, upgrade_prompt_component [EXTRACTED 0.90]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (97): GET(), POST(), addHours(), calculateDaysBetween(), calculateDurationHours(), checkSpaceAvailability(), doTimeRangesOverlap(), findAvailableSpaces() (+89 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (63): DELETE(), handleEmailBounced(), handleEmailClicked(), handleEmailComplained(), handleEmailDelivered(), handleEmailOpened(), handleEmailSent(), processWebhookEvent() (+55 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (45): handleStartAgent(), rankVendorsByMatch(), fetchEventVendors(), handleConfirm(), handleContact(), handleMarkAvailable(), handleMarkNotAvailable(), handleReject() (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (92): AI Chat Widget (Claude-Powered), AI Agent for Vendor Outreach, Anthropic Claude API, app/api/appsumo/redeem/route.ts, GET /api/public/venues/search Endpoint, app/redeem/page.tsx, appsumo_codes Database Table, AppSumo Launch & Distribution Plan (+84 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (86): AI Chat Conversation Flow (4 Stages), AI Conversation Engine (4-Stage Flow, Claude API), lib/ai/escalation.ts — Escalation Logic, lib/analytics/tracker.ts, app/api/venues/public/[slug]/route.ts — Public Page Data API, API Integration Test Layer (tests/integration/*), Automated Test Phase 1: Foundation (Seed, Auth, data-testid, CI), Automated Test Phase 3: Core CRUD Flows (+78 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (40): GET(), PUT(), GET(), PUT(), DELETE(), GET(), PUT(), GET() (+32 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (26): AgentOrchestrator, getAgentOrchestrator(), analyzeVendorReply(), extractQuoteDetails(), extractQuoteFromReply(), calculateVendorMetrics(), canSendFollowUp(), getDaysSinceLastOutbound() (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (30): GET(), shouldEscalate(), buildExtractionPrompt(), fallbackSearch(), POST(), hashIp(), trackEvent(), extractDatesFromMessage() (+22 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (21): getEmailConfig(), getResendClient(), getResendClientInstance(), ResendEmailClient, sendBatchEmails(), sendEmail(), getLeadsNeedingFollowUp(), processAllFollowUps() (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (18): useVenueContext(), EditClientPage(), EditEventPage(), EditSpacePage(), EditVendorPage(), EditVenuePage(), useToast(), useAddActivity() (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.1
Nodes (25): GET(), getAuthedVenueIdForLead(), POST(), GET(), getAuthedVenueIdForProposal(), PUT(), generateProposalPDF(), textLines() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (19): draftFollowUpEmail(), draftOutreachEmail(), sendConfirmationEmail(), sendFollowUpEmail(), sendVendorOutreach(), updateVendorOutreachStatus(), askClaude(), askClaudeForJSON() (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (17): handleVendorDecision(), PUT(), POST(), generateConfirmationHTML(), generateConfirmationPlainText(), generateConfirmationSubject(), generateFollowUpHTML(), generateFollowUpPlainText() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (7): executeAction(), handleAction(), renderActionItem(), actionRequiresConfirmation(), getActionLabel(), getStatusBadgeClasses(), getStatusColor()

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (5): fetchDashboardData(), fetchEvents(), fetchSpaces(), withVenueHeader(), fetchVendors()

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (14): canvasToBlob(), mergeOptions(), optimizeImageFile(), readImageBitmap(), scaleDimensions(), supportsWebP(), buildStoragePath(), deleteVenuePhoto() (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (9): calculateBudgetVariance(), calculateVarianceAmount(), checkQuoteAgainstBudget(), compareBudget(), determineStatusFromResponse(), formatVarianceAmount(), getBudgetStatusMessage(), shouldFlagForAttention() (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (2): getEventClassName(), getEventColor()

### Community 18 - "Community 18"
Cohesion: 0.27
Nodes (9): getCurrentMonthDate(), getCurrentUsage(), trackEventCreation(), trackSpaceCreation(), trackVendorCreation(), trackVenueCreation(), upsertUsage(), GET() (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.27
Nodes (6): extractAttachments(), extractEmailBody(), extractThreadId(), parseTextEmail(), parseVendorEmail(), stripHtml()

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (11): Feature Flags (ENABLE_NL_EVENT_CREATION, ENABLE_AI_AGENT, ENABLE_REAL_TIME_UPDATES), Final Pre-Launch Deployment Checklist, Pre-Launch Guide for VenueManager, Pre-Launch Icon Generation (PNG from SVG), Pre-Launch OG Image Creation, Pre-Launch Vercel Environment Variables Setup, Setup Guide Environment Variables, AI Agent & Webhook Setup Guide (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (5): buildAdminClient(), getTestUserId(), seedTestFixtures(), getTestIds(), requireSeedData()

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (2): handleFormSubmit(), onSubmit()

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (3): SpaceSelector(), useSpaceAvailability(), useSpaces()

### Community 24 - "Community 24"
Cohesion: 0.32
Nodes (3): fetchQuotes(), handleApproveQuote(), handleRejectQuote()

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (2): handleSave(), textToInclusions()

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (2): handleAISearch(), performAISearch()

### Community 27 - "Community 27"
Cohesion: 0.4
Nodes (3): POST(), buildEventExtractionPrompt(), validateEventExtraction()

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (1): SectionErrorBoundary

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (3): createLeadFromConversation(), calculatePriorityScore(), priorityFromExtractedData()

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (2): loginAs(), loginAsTestUser()

### Community 38 - "Community 38"
Cohesion: 0.83
Nodes (3): useCanCreate(), useSubscription(), useUsage()

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (2): AnalyticsDashboard(), useAnalytics()

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (4): Design System Color Palette, Design System Components (shadcn/ui), VenueManager Design System, Design System Typography

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (2): changed(), ChangesSummaryPanel()

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (2): handleExtract(), handleKeyDown()

### Community 265 - "Community 265"
Cohesion: 1.0
Nodes (1): One Venue Per User Architectural Constraint

## Knowledge Gaps
- **69 isolated node(s):** `Next.js App Router`, `Vercel Deployment`, `Vendor Matching Engine`, `AppSumo Lifetime Deal Badge`, `app/api/webhooks/appsumo/route.ts (Refund Webhook)` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (13 nodes): `calendar.ts`, `checkSpaceConflict()`, `convertToCalendarEvents()`, `formatCalendarDate()`, `formatTimeRange()`, `getDayBounds()`, `getEventClassName()`, `getEventColor()`, `getMonthBounds()`, `getWeekBounds()`, `groupEventsBySpace()`, `isEventInDateRange()`, `isToday()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (8 nodes): `page.tsx`, `EventForm.tsx`, `fetchServices()`, `handleFormSubmit()`, `removeService()`, `toggleService()`, `updateServiceBudget()`, `onSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (8 nodes): `ProposalPreview.tsx`, `addItem()`, `handleSave()`, `inclusionsToText()`, `initLineItems()`, `removeItem()`, `textToInclusions()`, `updateItem()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (7 nodes): `SearchResults.tsx`, `applyFilters()`, `clearFilters()`, `handleAISearch()`, `handlePageChange()`, `handleSortChange()`, `performAISearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (6 nodes): `SectionErrorBoundary.tsx`, `SectionErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (4 nodes): `loginAs()`, `loginAsTestUser()`, `logout()`, `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (4 nodes): `AnalyticsDashboard()`, `page.tsx`, `useAnalytics.ts`, `useAnalytics()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `ChangesSummaryPanel.tsx`, `changed()`, `ChangesSummaryPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `NaturalLanguageEventForm.tsx`, `handleExtract()`, `handleKeyDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 265`** (1 nodes): `One Venue Per User Architectural Constraint`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 1`, `Community 5`, `Community 6`, `Community 7`, `Community 10`, `Community 11`, `Community 12`, `Community 15`, `Community 16`, `Community 18`, `Community 21`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `createServiceRoleClient()` connect `Community 1` to `Community 0`, `Community 7`, `Community 8`, `Community 18`, `Community 29`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `sendEmail()` connect `Community 8` to `Community 1`, `Community 6`, `Community 10`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 125 inferred relationships involving `createClient()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`createClient()` has 125 INFERRED edges - model-reasoned connections that need verification._
- **Are the 50 inferred relationships involving `createServiceRoleClient()` (e.g. with `sitemap()` and `GET()`) actually correct?**
  _`createServiceRoleClient()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **Are the 34 inferred relationships involving `toast()` (e.g. with `handleRedeem()` and `onSubmit()`) actually correct?**
  _`toast()` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `getAuthorizedVenue()` (e.g. with `GET()` and `PUT()`) actually correct?**
  _`getAuthorizedVenue()` has 29 INFERRED edges - model-reasoned connections that need verification._