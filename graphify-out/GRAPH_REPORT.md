# Graph Report - venue-assistant-saas  (2026-04-29)

## Corpus Check
- 457 files · ~240,003 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1405 nodes · 1684 edges · 35 communities detected
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 475 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 262|Community 262]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 123 edges
2. `createServiceRoleClient()` - 45 edges
3. `toast()` - 35 edges
4. `getAuthorizedVenue()` - 30 edges
5. `GET()` - 21 edges
6. `Phase 1: Database Schema & Migrations (Public Pages)` - 18 edges
7. `sendEmail()` - 17 edges
8. `Must Have Tasks (M1-M14)` - 17 edges
9. `useToast()` - 14 edges
10. `resolveVenueWithFallback()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createClient()`  [INFERRED]
  app/api/events/[eventId]/route.ts → lib/supabase/server.ts
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
Nodes (93): GET(), POST(), AgentOrchestrator, getAgentOrchestrator(), extractQuoteFromReply(), NotFound(), POST(), GET() (+85 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (44): handleStartAgent(), rankVendorsByMatch(), handleFormSubmit(), fetchEventVendors(), handleConfirm(), handleContact(), handleMarkAvailable(), handleMarkNotAvailable() (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (92): AI Chat Widget (Claude-Powered), AI Agent for Vendor Outreach, Anthropic Claude API, app/api/appsumo/redeem/route.ts, GET /api/public/venues/search Endpoint, app/redeem/page.tsx, appsumo_codes Database Table, AppSumo Launch & Distribution Plan (+84 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (86): AI Chat Conversation Flow (4 Stages), AI Conversation Engine (4-Stage Flow, Claude API), lib/ai/escalation.ts — Escalation Logic, lib/analytics/tracker.ts, app/api/venues/public/[slug]/route.ts — Public Page Data API, API Integration Test Layer (tests/integration/*), Automated Test Phase 1: Foundation (Seed, Auth, data-testid, CI), Automated Test Phase 3: Core CRUD Flows (+78 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (54): DELETE(), handleEmailBounced(), handleEmailClicked(), handleEmailComplained(), handleEmailDelivered(), handleEmailOpened(), handleEmailSent(), processWebhookEvent() (+46 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (40): draftFollowUpEmail(), draftOutreachEmail(), sendConfirmationEmail(), sendFollowUpEmail(), sendVendorOutreach(), updateVendorOutreachStatus(), askClaude(), askClaudeForJSON() (+32 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (40): GET(), PUT(), GET(), PUT(), DELETE(), GET(), PUT(), GET() (+32 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): addHours(), calculateDaysBetween(), calculateDurationHours(), checkSpaceAvailability(), doTimeRangesOverlap(), findAvailableSpaces(), getConflictingEvents(), getNextAvailableSlot() (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (30): GET(), shouldEscalate(), buildExtractionPrompt(), fallbackSearch(), POST(), hashIp(), trackEvent(), extractDatesFromMessage() (+22 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (18): useVenueContext(), EditClientPage(), EditEventPage(), EditSpacePage(), EditVendorPage(), EditVenuePage(), useToast(), useAddActivity() (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.1
Nodes (25): GET(), getAuthedVenueIdForLead(), POST(), GET(), getAuthedVenueIdForProposal(), PUT(), generateProposalPDF(), textLines() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): handleVendorDecision(), PUT(), POST(), generateConfirmationHTML(), generateConfirmationPlainText(), generateConfirmationSubject(), generateFollowUpHTML(), generateFollowUpPlainText() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (7): executeAction(), handleAction(), renderActionItem(), actionRequiresConfirmation(), getActionLabel(), getStatusBadgeClasses(), getStatusColor()

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (5): fetchDashboardData(), fetchEvents(), fetchSpaces(), withVenueHeader(), fetchVendors()

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (14): canvasToBlob(), mergeOptions(), optimizeImageFile(), readImageBitmap(), scaleDimensions(), supportsWebP(), buildStoragePath(), deleteVenuePhoto() (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (9): calculateBudgetVariance(), calculateVarianceAmount(), checkQuoteAgainstBudget(), compareBudget(), determineStatusFromResponse(), formatVarianceAmount(), getBudgetStatusMessage(), shouldFlagForAttention() (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (6): analyzeVendorReply(), extractQuoteDetails(), buildEmailAnalysisPrompt(), validateEmailAnalysis(), buildQuoteExtractionPrompt(), validateQuoteExtraction()

### Community 17 - "Community 17"
Cohesion: 0.27
Nodes (6): extractAttachments(), extractEmailBody(), extractThreadId(), parseTextEmail(), parseVendorEmail(), stripHtml()

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (11): Feature Flags (ENABLE_NL_EVENT_CREATION, ENABLE_AI_AGENT, ENABLE_REAL_TIME_UPDATES), Final Pre-Launch Deployment Checklist, Pre-Launch Guide for VenueManager, Pre-Launch Icon Generation (PNG from SVG), Pre-Launch OG Image Creation, Pre-Launch Vercel Environment Variables Setup, Setup Guide Environment Variables, AI Agent & Webhook Setup Guide (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (5): buildAdminClient(), getTestUserId(), seedTestFixtures(), getTestIds(), requireSeedData()

### Community 20 - "Community 20"
Cohesion: 0.44
Nodes (7): calculateVendorMetrics(), canSendFollowUp(), getDaysSinceLastOutbound(), getHoursSince(), getRecommendedAction(), getVendorCommunicationSummary(), getVendorState()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (3): SpaceSelector(), useSpaceAvailability(), useSpaces()

### Community 22 - "Community 22"
Cohesion: 0.32
Nodes (3): fetchQuotes(), handleApproveQuote(), handleRejectQuote()

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (2): handleSave(), textToInclusions()

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (2): handleAISearch(), performAISearch()

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (1): SectionErrorBoundary

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (3): createLeadFromConversation(), calculatePriorityScore(), priorityFromExtractedData()

### Community 27 - "Community 27"
Cohesion: 0.4
Nodes (3): POST(), buildEventExtractionPrompt(), validateEventExtraction()

### Community 31 - "Community 31"
Cohesion: 0.5
Nodes (2): AnalyticsDashboard(), useAnalytics()

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (2): loginAs(), loginAsTestUser()

### Community 37 - "Community 37"
Cohesion: 0.83
Nodes (3): useCanCreate(), useSubscription(), useUsage()

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (4): Design System Color Palette, Design System Components (shadcn/ui), VenueManager Design System, Design System Typography

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (2): changed(), ChangesSummaryPanel()

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (2): handleExtract(), handleKeyDown()

### Community 262 - "Community 262"
Cohesion: 1.0
Nodes (1): One Venue Per User Architectural Constraint

## Knowledge Gaps
- **69 isolated node(s):** `Next.js App Router`, `Vercel Deployment`, `Vendor Matching Engine`, `AppSumo Lifetime Deal Badge`, `app/api/webhooks/appsumo/route.ts (Refund Webhook)` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (8 nodes): `ProposalPreview.tsx`, `addItem()`, `handleSave()`, `inclusionsToText()`, `initLineItems()`, `removeItem()`, `textToInclusions()`, `updateItem()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (7 nodes): `SearchResults.tsx`, `applyFilters()`, `clearFilters()`, `handleAISearch()`, `handlePageChange()`, `handleSortChange()`, `performAISearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (6 nodes): `SectionErrorBoundary.tsx`, `SectionErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (4 nodes): `AnalyticsDashboard()`, `page.tsx`, `useAnalytics.ts`, `useAnalytics()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `loginAs()`, `loginAsTestUser()`, `logout()`, `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (3 nodes): `ChangesSummaryPanel.tsx`, `changed()`, `ChangesSummaryPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `NaturalLanguageEventForm.tsx`, `handleExtract()`, `handleKeyDown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 262`** (1 nodes): `One Venue Per User Architectural Constraint`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 14`, `Community 15`, `Community 19`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `createServiceRoleClient()` connect `Community 4` to `Community 8`, `Community 26`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `getAuthorizedVenue()` connect `Community 6` to `Community 0`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 122 inferred relationships involving `createClient()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`createClient()` has 122 INFERRED edges - model-reasoned connections that need verification._
- **Are the 44 inferred relationships involving `createServiceRoleClient()` (e.g. with `sitemap()` and `GET()`) actually correct?**
  _`createServiceRoleClient()` has 44 INFERRED edges - model-reasoned connections that need verification._
- **Are the 32 inferred relationships involving `toast()` (e.g. with `handleRedeem()` and `onSubmit()`) actually correct?**
  _`toast()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `getAuthorizedVenue()` (e.g. with `GET()` and `PUT()`) actually correct?**
  _`getAuthorizedVenue()` has 29 INFERRED edges - model-reasoned connections that need verification._