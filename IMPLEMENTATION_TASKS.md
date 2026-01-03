# VenueAssistant Implementation Task List

This is a comprehensive, sequential task list for implementing the complete VenueAssistant Micro-SaaS application. Each task should be completed in order, as later tasks depend on earlier ones.

---

## PHASE 0: PROJECT SETUP & CONFIGURATION

### Task 0.1: Initialize Next.js Project
- [x] Run `npx create-next-app@latest venue-assistant --typescript --tailwind --app`
- [x] Confirm TypeScript, Tailwind CSS, and App Router are enabled
- [x] Initialize git repository and create initial commit
- [x] Create `.env.local` and `.env.example` files

### Task 0.2: Install Core Dependencies
- [x] Install Supabase packages: `npm install @supabase/supabase-js @supabase/ssr`
- [x] Install shadcn/ui: `npx shadcn-ui@latest init`
- [x] Install additional dependencies:
  - `npm install zod react-hook-form @hookform/resolvers`
  - `npm install date-fns` (for date formatting)
  - `npm install lucide-react` (for icons)

### Task 0.3: Install shadcn/ui Components
- [x] `npx shadcn-ui@latest add button`
- [x] `npx shadcn-ui@latest add card`
- [x] `npx shadcn-ui@latest add form`
- [x] `npx shadcn-ui@latest add input`
- [x] `npx shadcn-ui@latest add select`
- [x] `npx shadcn-ui@latest add table`
- [x] `npx shadcn-ui@latest add dialog`
- [x] `npx shadcn-ui@latest add badge`
- [x] `npx shadcn-ui@latest add alert`
- [x] `npx shadcn-ui@latest add dropdown-menu`
- [x] `npx shadcn-ui@latest add tabs`
- [x] `npx shadcn-ui@latest add progress`
- [x] `npx shadcn-ui@latest add label`
- [x] `npx shadcn-ui@latest add textarea`
- [x] `npx shadcn-ui@latest add separator`
- [x] `npx shadcn-ui@latest add skeleton`
- [x] `npx shadcn-ui@latest add toast`

### Task 0.4: Supabase Project Setup
- [x] Create new Supabase project at https://supabase.com
- [x] Note down project URL and API keys (anon key and service role key)
- [x] Add environment variables to `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [x] Update `.env.example` with placeholder values

### Task 0.5: Create Supabase Database Schema
- [x] Open Supabase SQL Editor
- [x] Create `profiles` table with all fields and constraints
- [x] Create `venues` table with all fields and constraints
- [x] Create `vendors` table with all fields and constraints
- [x] Create `events` table with all fields and constraints
- [x] Create `event_vendors` table with all fields and constraints
- [x] Create `vendor_reviews` table with all fields and constraints
- [x] Create all indexes as specified in PRD
- [x] Verify all tables created successfully

### Task 0.6: Configure Row Level Security (RLS)
- [x] Enable RLS on `profiles` table
- [x] Enable RLS on `venues` table
- [x] Enable RLS on `vendors` table
- [x] Enable RLS on `events` table
- [x] Enable RLS on `event_vendors` table
- [x] Enable RLS on `vendor_reviews` table
- [x] Create RLS policy: "Users can view own profile" on `profiles`
- [x] Create RLS policy: "Users can update own profile" on `profiles`
- [x] Create RLS policy: "Users can view own venues" on `venues`
- [x] Create RLS policy: "Users can insert own venues" on `venues`
- [x] Create RLS policy: "Users can update own venues" on `venues`
- [x] Create RLS policy: "Users can delete own venues" on `venues`
- [x] Create RLS policy: "Users can view vendors for own venues" on `vendors`
- [x] Create RLS policy: "Users can insert vendors for own venues" on `vendors`
- [x] Create RLS policy: "Users can update vendors for own venues" on `vendors`
- [x] Create RLS policy: "Users can delete vendors for own venues" on `vendors`
- [x] Create similar RLS policies for `events`, `event_vendors`, and `vendor_reviews`
- [x] Test RLS policies with test queries

### Task 0.7: Configure Supabase Authentication
- [x] Enable email authentication in Supabase dashboard
- [x] Configure email templates (optional)
- [x] Set up redirect URLs for auth callbacks
- [x] Configure password requirements

---

## PHASE 1: CORE INFRASTRUCTURE

### Task 1.1: Create Supabase Client Utilities
- [x] Create `lib/supabase/client.ts` (browser client)
  - Export `createBrowserClient` function
- [x] Create `lib/supabase/server.ts` (server client)
  - Export `createServerClient` function for Server Components
  - Export `createServerActionClient` for Server Actions
- [x] Create `lib/supabase/middleware.ts` (auth middleware)
  - Handle session refresh
  - Set up auth state management

### Task 1.2: Create Type Definitions
- [x] Generate TypeScript types from Supabase schema
  - Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts`
- [x] Create `lib/types/index.ts` with custom types:
  - `Profile` type
  - `Venue` type
  - `Vendor` type
  - `Event` type
  - `EventVendor` type
  - `VendorReview` type
  - `VendorMatchResult` type
  - `BudgetSummary` type
  - Form input types for all entities

### Task 1.3: Create Utility Functions
- [x] Create `lib/utils/cn.ts` - className merger utility (usually comes with shadcn)
- [x] Create `lib/utils/format.ts`:
  - `formatCurrency(amount: number): string`
  - `formatDate(date: Date | string): string`
  - `formatTime(time: string): string`
  - `formatPercentage(value: number): string`
- [x] Create `lib/utils/validation.ts`:
  - Zod schemas for all forms
  - `eventFormSchema`
  - `vendorFormSchema`
  - `venueFormSchema`
  - `profileFormSchema`
  - `reviewFormSchema`

### Task 1.4: Create Algorithm Functions
- [x] Create `lib/algorithms/vendorMatching.ts`:
  - `calculateMatchScore(vendor: Vendor, event: Event): number`
  - `rankVendorsByMatch(vendors: Vendor[], event: Event): VendorWithScore[]`
  - Implement scoring formula:
    - Reliability: 40% weight
    - Cost fit: 30% weight
    - Experience: 20% weight
    - On-time history: 10% weight
- [x] Create `lib/algorithms/budgetCalculations.ts`:
  - `calculateBudgetVariance(budgeted: number, actual: number): number`
  - `calculateVariancePercentage(budgeted: number, actual: number): number`
  - `getBudgetStatus(percentage: number): "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET"`
  - `calculateCategoryBreakdown(event: Event, assignments: EventVendor[]): BudgetBreakdown`

### Task 1.5: Create Root Layout
- [x] Update `app/layout.tsx`:
  - Add proper HTML structure
  - Import global CSS
  - Add metadata (title, description)
  - Add font configuration (if needed)
- [x] Update `app/globals.css`:
  - Configure Tailwind layers
  - Add custom CSS variables for colors
  - Add utility classes

### Task 1.6: Create Middleware
- [x] Create `middleware.ts` in root:
  - Set up Supabase auth middleware
  - Handle session refresh
  - Protect dashboard routes
  - Redirect unauthenticated users to login

---

## PHASE 2: AUTHENTICATION & ONBOARDING

### Task 2.1: Create Auth Layout
- [x] Create `app/(auth)/layout.tsx`:
  - Simple centered layout for auth pages
  - Add logo/branding
  - Minimal styling

### Task 2.2: Create Login Page
- [x] Create `app/(auth)/login/page.tsx`:
  - Email input field
  - Password input field
  - "Forgot Password" link (can be placeholder)
  - Login button
  - Link to signup page
- [x] Add form validation using react-hook-form + Zod
- [x] Implement login logic using Supabase auth
- [x] Handle success: redirect to `/dashboard`
- [x] Handle errors: display error messages
- [x] Add loading state during submission

### Task 2.3: Create Signup Page
- [x] Create `app/(auth)/signup/page.tsx`:
  - Email input field
  - Password input field
  - Confirm password input field
  - Full name input field
  - Signup button
  - Link to login page
- [x] Add form validation (password match, email format)
- [x] Implement signup logic using Supabase auth
- [x] On success: create profile in `profiles` table
- [x] Redirect to onboarding: `/onboarding/venue-setup`
- [x] Handle errors: display error messages
- [x] Add loading state

### Task 2.4: Create Auth Callback Route
- [x] Create `app/api/auth/callback/route.ts`:
  - Handle Supabase auth callback
  - Exchange code for session
  - Redirect to appropriate page

### Task 2.5: Create Onboarding Pages
- [x] Create `app/onboarding/layout.tsx`:
  - Progress indicator
  - Clean layout
- [x] Create `app/onboarding/venue-setup/page.tsx`:
  - Form to create first venue:
    - Venue name (required)
    - Address
    - City
    - State
    - Zip code
    - Phone
    - Email
    - Capacity
    - Venue type dropdown
  - Submit button
  - Skip button (redirect to dashboard)
- [x] Implement venue creation API call
- [x] On success: redirect to `/dashboard`

### Task 2.6: Create Profile API Routes
- [x] Create `app/api/profile/route.ts`:
  - `GET /api/profile`: Fetch current user's profile
  - `PUT /api/profile`: Update current user's profile
- [x] Add authentication checks
- [x] Handle errors gracefully

---

## PHASE 3: DASHBOARD LAYOUT & NAVIGATION

### Task 3.1: Create Dashboard Layout Components
- [x] Create `components/layout/Sidebar.tsx`:
  - Logo/branding at top
  - Navigation links:
    - Dashboard
    - Events
    - Vendors
    - Venues
    - Settings
  - Active link highlighting
  - User info at bottom
  - Logout button
- [x] Create `components/layout/Header.tsx`:
  - Venue selector dropdown (if multiple venues)
  - Page title
  - User avatar/menu
- [x] Create `components/layout/Footer.tsx` (optional)

### Task 3.2: Create Dashboard Layout
- [x] Create `app/(dashboard)/layout.tsx`:
  - Integrate Sidebar component
  - Integrate Header component
  - Main content area with proper spacing
  - Responsive layout (sidebar collapses on mobile)
  - Verify authentication (redirect if not logged in)
  - Fetch user profile and venues

### Task 3.3: Create Shared Components
- [x] Create `components/shared/Loading.tsx`:
  - Spinner component
  - Skeleton loaders
- [x] Create `components/shared/EmptyState.tsx`:
  - Icon
  - Message
  - Action button (optional)
- [x] Create `components/shared/ErrorMessage.tsx`:
  - Error icon
  - Error message
  - Retry button (optional)

---

## PHASE 4: VENUE MANAGEMENT

### Task 4.1: Create Venue API Routes
- [x] Create `app/api/venues/route.ts`:
- [x] Create `app/api/venues/[venueId]/route.ts`:
... (All checked)

### Task 4.7: Create useVenues Hook
- [x] Create `hooks/useVenues.ts`:
  - `useVenues()`: Fetch all venues
  - Handle loading, error states
  - Use SWR or React Query for caching (optional)

---

## PHASE 5: VENDOR MANAGEMENT

### Task 5.1: Create Vendor API Routes
- [x] Create `app/api/vendors/route.ts`
- [x] Create `app/api/vendors/[vendorId]/route.ts`

### Task 5.2: Create Vendor Components
- [x] Create `components/vendors/VendorCard.tsx`
- [x] Create `components/vendors/VendorForm.tsx`

### Task 5.3: Create Vendors List Page
- [x] Create `app/(dashboard)/vendors/page.tsx`

### Task 5.4: Create New Vendor Page
- [x] Create `app/(dashboard)/vendors/new/page.tsx`

### Task 5.5: Create Vendor Profile Page
- [x] Create `app/(dashboard)/vendors/[vendorId]/page.tsx` (Integrated into List/Edit for now)

### Task 5.6: Create Edit Vendor Page
- [x] Create `app/(dashboard)/vendors/[vendorId]/edit/page.tsx`

### Task 5.7: Create useVendors Hook
- [x] Create `hooks/useVendors.ts`:
  - `useVendors(venueId?, category?, search?)`: Fetch vendors with filters
  - Handle loading, error states

---

## PHASE 6: EVENT MANAGEMENT

### Task 6.1: Create Event API Routes
- [x] Create `app/api/events/route.ts`
- [x] Create `app/api/events/[eventId]/route.ts`

### Task 6.2: Create Event Components
- [x] Create `components/events/EventCard.tsx`
- [x] Create `components/events/EventForm.tsx`

### Task 6.3: Create Events List Page
- [x] Create `app/(dashboard)/events/page.tsx`

### Task 6.4: Create New Event Page
- [x] Create `app/(dashboard)/events/new/page.tsx`

### Task 6.5: Create Event Detail Page
- [x] Create `app/(dashboard)/events/[eventId]/page.tsx`

### Task 6.6: Create Edit Event Page
- [x] Create `app/(dashboard)/events/[eventId]/edit/page.tsx`

### Task 6.7: Create useEvents Hook
- [x] Create `hooks/useEvents.ts`:
  - `useEvents(venueId?, status?, search?)`: Fetch events with filters
  - `useEvent(eventId)`: Fetch single event
  - Handle loading, error states

---

## PHASE 7: DASHBOARD HOME PAGE

### Task 7.1: Create Dashboard Stats Components
- [x] Create `components/dashboard/StatCard.tsx`
  - [x] Icon and Value support
  - [x] Trend indicator
  - [x] Stylized design

### Task 7.2: Create Dashboard Home Page
- [x] Create `app/(dashboard)/dashboard/page.tsx`
  - [x] Dynamic stats fetching
  - [x] Upcoming events list
  - [x] Quick actions and navigation

---

## PHASE 8: VENDOR MATCHING ENGINE

### Task 8.1: Create Vendor Matching API Routes
- [x] Create `app/api/events/[eventId]/vendors/route.ts`
- [x] Implement ranking algorithm in `lib/algorithms/vendorMatching.ts`
- [x] Implement vendor assignment via POST

### Task 8.2: Create Vendor Matching Components
- [x] Create `components/events/VendorMatching.tsx`
  - [x] Show match scores and reasons
  - [x] Direct assignment support

### Task 8.3: Create Vendor Matching Page
- [x] Integrated into `app/(dashboard)/events/[eventId]/page.tsx` Vendors tab

### Task 8.4: Implement Vendor Assignment Logic
- [x] Test vendor assignment flow
- [x] Add DELETE endpoint for event_vendors
- [x] Add PUT endpoint for event_vendors (confirmation)

---

## PHASE 9: BUDGET TRACKING

### Task 9.1: Create Budget API Routes
- [x] Integrated into `api/events/[eventId]/vendors` GET

### Task 9.2: Create Budget Components
- [x] Create `components/events/EventBudget.tsx`
  - [x] Summary cards with progress
  - [x] Detailed expense table
  - [x] Variance highlighting

### Task 9.3: Create Budget Tracking Page
- [x] Integrated into `app/(dashboard)/events/[eventId]/page.tsx` Budget tab

### Task 9.4: Implement Budget Update Logic
- [x] Automatic variance calculation in UI
- [x] Support for actual vs quoted costs

---

## PHASE 10: VENDOR PERFORMANCE TRACKING

### Task 10.1: Create Review API Routes
- [x] Create `app/api/vendors/[vendorId]/reviews/route.ts`
- [x] Implement automatic reliability score updates on review submission

### Task 10.2: Implement Reliability Score Calculation
- [x] Implement `calculateReliabilityScore` in `lib/algorithms/vendorMatching.ts`

### Task 10.3: Create Review Components
- [x] Integrated into Review Page

### Task 10.4: Create Review Modal/Page
- [x] Create `app/(dashboard)/events/[eventId]/review/page.tsx`
  - [x] Multi-vendor review form
  - [x] Quality, On-time, and Cost accuracy tracking

### Task 10.5: Add Review Trigger to Event Completion
- [x] Add "Complete Event" button to Event Details
- [x] Automatic redirect to review page

### Task 10.6: Display Reviews on Vendor Profile
- [x] Update vendor profile page to show reviews
- [x] Created vendor detail page at `app/(dashboard)/vendors/[vendorId]/page.tsx`
- [x] Created vendor reviews API endpoint at `app/api/vendors/[vendorId]/reviews/route.ts`
- [x] Updated VendorCard component to link to detail page

---

## PHASE 11: SETTINGS & USER PROFILE

### Task 11.1: Create Settings Page
- [x] Create `app/(dashboard)/settings/page.tsx`
  - [x] Personal info form
  - [x] Security placeholders
  - [x] Notification placeholders

### Task 11.2: Implement Profile Update
- [x] Create profile update form
- [x] Implement PUT /api/profile

---

## PHASE 12: TESTING & SEED DATA

### Task 12.1: Create Seed Data
- [x] Create seed data utility in `lib/utils/seedData.ts`
- [x] Create seed API endpoint at `/api/seed`
- [x] Add "Refresh Demo Data" button to sidebar
- [x] Generate comprehensive test data:
  - 3 test venues
  - 11 test vendors across different categories
  - 6 test events (mix of statuses)
  - Vendor assignments
  - Vendor reviews
- [x] Create SQL trigger for automatic profile creation (user must run in Supabase)
- [x] Test seed data generation works end-to-end

### Task 12.2: Test Core Workflows
- [x] Test signup → onboarding → create venue
- [x] Test create event → match vendors → assign vendors
- [x] Test budget tracking with different scenarios
- [x] Test complete event → review vendors → check updated scores
- [x] Test RLS: create second user and verify data isolation

### Task 12.3: Test Vendor Matching Algorithm
- [ ] Create vendors with different characteristics:
  - High reliability, high cost
  - Low reliability, low cost
  - Medium reliability, medium cost
- [ ] Create event with specific budget
- [ ] Run matching and verify scores are calculated correctly
- [ ] Verify ranking is correct

### Task 12.4: Test Budget Calculations
- [ ] Create event with budget breakdown
- [ ] Assign vendors with quoted costs
- [ ] Verify budget summary calculates correctly
- [ ] Add actual costs (after event)
- [ ] Verify variance calculations

### Task 12.5: Test Performance Updates
- [ ] Submit review for a vendor
- [ ] Verify vendor metrics update:
  - total_events incremented
  - on_time_count updated
  - on_time_percentage recalculated
  - avg_quality_rating updated
  - reliability_score recalculated
- [ ] Submit multiple reviews and verify cumulative updates

### Task 12.6: Edge Case Testing
- [ ] Test deleting a venue with events/vendors
- [ ] Test deleting a vendor assigned to an event
- [ ] Test duplicate vendor assignments
- [ ] Test budget with no assigned vendors
- [ ] Test matching with no vendors in category
- [ ] Test form validation edge cases

---

## PHASE 13: AI INFRASTRUCTURE SETUP

> **Note**: Phases 13-20 implement the AI-powered features from `PRD_Update_Instructions_AI_Agent.md`. These add natural language event creation, automated vendor communication, and a communication dashboard.

### Task 13.1: Install AI & Email Dependencies
- [x] Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- [x] Install Resend SDK: `npm install resend`
- [x] Install Inngest (optional for background jobs): `npm install inngest`
- [ ] Verify all dependencies installed correctly (run `npm install` in venue-assistant directory)

### Task 13.2: Configure Environment Variables
- [x] Add to `.env.local`:
  - `ANTHROPIC_API_KEY=sk-ant-xxxxx`
  - `CLAUDE_MODEL=claude-sonnet-4-20250514`
  - `RESEND_API_KEY=re_xxxxx`
  - `RESEND_WEBHOOK_SECRET=whsec_xxxxx`
  - `RESEND_FROM_EMAIL=noreply@venueassistant.com`
  - `RESEND_FROM_NAME=VenueAssistant`
  - `AGENT_MAX_RETRIES=3`
  - `AGENT_TIMEOUT_HOURS=72`
  - `AGENT_FOLLOWUP_DELAY_HOURS=24`
  - `ENABLE_AGENT_AUTO_APPROVAL=false`
  - `ENABLE_NL_EVENT_CREATION=true`
  - `ENABLE_AI_AGENT=true`
  - `ENABLE_REAL_TIME_UPDATES=false`
- [x] Update `.env.example` with placeholder values

### Task 13.3: Set Up External Services
- [x] Create Anthropic API account at console.anthropic.com
- [x] Get Anthropic API key and test access
- [x] Create Resend account at resend.com
- [x] Verify domain or use resend.dev for testing
- [x] Get Resend API key
- [x] Configure Resend webhook endpoint
- [x] Get webhook secret from Resend

---

## PHASE 14: AI DATABASE SCHEMA

### Task 14.1: Create vendor_communications Table
- [x] Run SQL script from `ai-features-schema.sql` in Supabase SQL Editor
- [x] Verify `vendor_communications` table created with all fields
- [x] Verify indexes created successfully
- [x] Test RLS policies

### Task 14.2: Create vendor_quotes Table
- [x] Verify `vendor_quotes` table created with all fields
- [x] Verify indexes created successfully
- [x] Test RLS policies

### Task 14.3: Create agent_runs Table
- [x] Verify `agent_runs` table created with all fields
- [x] Verify indexes created successfully
- [x] Test RLS policies

### Task 14.4: Generate Updated TypeScript Types
- [x] Regenerate database types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts`
- [x] Verify new tables included in types
- [x] Create `lib/types/agent.types.ts`
- [x] Create `lib/types/communication.types.ts`
- [x] Create `lib/types/quote.types.ts`

---

## PHASE 15: AI CLIENT INFRASTRUCTURE

### Task 15.1: Create Claude API Client
- [x] Create `lib/ai/claude.ts` with client wrapper
- [x] Implement error handling for rate limits and API errors
- [x] Test Claude client with simple prompt
- [x] Verify API key is working

### Task 15.2: Create Resend Email Client
- [x] Create `lib/email/resend.ts` with email client
- [x] Implement email sending utility
- [x] Test sending email via Resend
- [x] Verify delivery works

### Task 15.3: Create Email Parser Utility
- [x] Create `lib/email/parser.ts`
- [x] Implement `parseVendorEmail()` function
- [x] Implement `extractThreadId()` function
- [x] Implement `extractQuoteNumbers()` function
- [x] Test with sample vendor emails

### Task 15.4: Create AI Prompt Templates
- [x] Create `lib/ai/prompts/eventExtraction.ts`
- [x] Create `lib/ai/prompts/emailDrafting.ts`
- [x] Create `lib/ai/prompts/emailAnalysis.ts`
- [x] Create `lib/ai/prompts/quoteExtraction.ts`
- [x] Create `lib/ai/prompts/followUp.ts`

---

## PHASE 16: AGENT CORE LOGIC

### Task 16.1: Create Agent Orchestrator
- [x] Create `lib/agent/orchestrator.ts`
- [x] Implement `startAgent()` function
- [x] Implement `processVendorReplies()` function
- [x] Implement `checkAgentStatus()` function
- [x] Implement main agent loop logic
- [x] Test with mock data

### Task 16.2: Create Vendor Communicator
- [x] Create `lib/agent/vendorCommunicator.ts`
- [x] Implement `draftOutreachEmail()` function
- [x] Implement `sendEmail()` function
- [x] Implement `draftFollowUpEmail()` function
- [x] Test email drafting with Claude

### Task 16.3: Create Quote Extractor
- [x] Create `lib/agent/quoteExtractor.ts`
- [x] Implement `analyzeVendorReply()` function
- [x] Implement `extractQuoteDetails()` function
- [x] Implement `validateQuote()` function
- [x] Test with sample emails

### Task 16.4: Create State Machine
- [x] Create `lib/agent/stateMachine.ts`
- [x] Define vendor states
- [x] Implement `getVendorState()` function
- [x] Implement `transitionState()` function
- [x] Test state transitions

---

## PHASE 17: NATURAL LANGUAGE EVENT CREATION

### Task 17.1: Create Event Extraction API
- [x] Create `app/api/ai/extract-event/route.ts`
- [x] Implement POST endpoint
- [x] Test with various input formats
- [x] Verify date and budget parsing

### Task 17.2: Create NL Event Form Component
- [x] Create `components/events/NaturalLanguageEventForm.tsx`
- [x] Add textarea and extract button
- [x] Implement loading and error states
- [x] Test component rendering

### Task 17.3: Create Event Extraction Preview Component
- [x] Create `components/events/EventExtractionPreview.tsx`
- [x] Display extracted fields
- [x] Add edit functionality
- [x] Test with extracted data

### Task 17.4: Update New Event Page
- [x] Update `app/(dashboard)/events/new/page.tsx`
- [x] Add tabs for Quick Create and Manual Form
- [x] Integrate NL components
- [x] Test end-to-end NL event creation

### Task 17.5: Create useEventExtraction Hook
- [x] Create `hooks/useEventExtraction.ts`
- [x] Implement extraction logic
- [x] Test hook in component

---

## PHASE 18: AI VENDOR COMMUNICATION AGENT

### Task 18.1: Create Agent API Routes
- [x] Create `app/api/agent/start/route.ts`
- [x] Create `app/api/agent/process-reply/route.ts`
- [x] Create `app/api/agent/status/route.ts`
- [x] Test agent start endpoint

### Task 18.2: Create Email Webhook Handlers
- [x] Create `app/api/webhooks/resend/route.ts`
- [x] Implement webhook signature verification
- [x] Create `app/api/webhooks/email-status/route.ts`
- [x] Test webhook with Resend

### Task 18.3: Create Email Helper APIs
- [x] Create `app/api/email/send/route.ts`
- [x] Create `app/api/email/draft/route.ts`
- [x] Test email sending and drafting

### Task 18.4: Update Event Detail Page
- [x] Add "Engage Vendors with AI Agent" button
- [x] Add confirmation modal
- [x] Integrate agent start flow
- [x] Test button integration

### Task 18.5: Create Agent Components
- [x] Create `components/agent/AgentActivityLog.tsx` (optional)
- [x] Create `components/agent/AgentStatusBadge.tsx`
- [x] Create `components/agent/AgentProgressBar.tsx`
- [x] Test components

### Task 18.6: Create useAgent Hook
- [x] Create `hooks/useAgent.ts`
- [x] Implement agent status polling
- [x] Test hook

---

## PHASE 19: COMMUNICATION DASHBOARD

### Task 19.1: Create Communications API Routes
- [x] Create `app/api/communications/route.ts`
- [x] Create `app/api/communications/thread/route.ts`
- [x] Create `app/api/communications/[communicationId]/route.ts`
- [x] Test APIs

### Task 19.2: Create Quotes API Routes
- [x] Create `app/api/quotes/route.ts`
- [x] Create `app/api/quotes/[quoteId]/approve/route.ts`
- [x] Create `app/api/quotes/[quoteId]/reject/route.ts`
- [x] Test quote approval/rejection

### Task 19.3: Create Communication Components
- [x] Create `components/communications/CommunicationDashboard.tsx`
- [x] Create `components/communications/ThreadView.tsx`
- [x] Create `components/communications/EmailMessage.tsx`
- [x] Create `components/communications/VendorResponseStatus.tsx`
- [x] Test components

### Task 19.4: Create Quote Components
- [x] Create `components/quotes/QuoteCard.tsx`
- [x] Create `components/quotes/QuoteComparison.tsx`
- [x] Create `components/quotes/QuoteApprovalModal.tsx`
- [x] Test components

### Task 19.5: Create Communications Dashboard Page
- [x] Create `app/(dashboard)/events/[eventId]/communications/page.tsx`
- [x] Integrate components
- [x] Test page rendering

### Task 19.6: Create Communication Hooks
- [x] Create `hooks/useCommunications.ts`
- [x] Create `hooks/useQuotes.ts`
- [x] Test hooks

---

## PHASE 20: EMAIL TEMPLATES & AI TESTING

### Task 20.1: Create Email Templates
- [x] Create `lib/email/templates/vendorOutreach.ts`
- [x] Create `lib/email/templates/followUp.ts`
- [x] Create `lib/email/templates/confirmation.ts`
- [x] Test templates

### Task 20.2: Test Natural Language Event Creation
- [x] Test with various input descriptions
- [x] Test date and budget parsing
- [x] Test vendor category identification
- [x] Test edit functionality
- [x] Test fallback to manual form

### Task 20.3: Test AI Agent Communication
- [x] Test agent start with matched vendors
- [x] Test email sending to vendors
- [x] Test webhook reception
- [x] Test reply processing and quote extraction
- [x] Test follow-up generation
- [x] Test agent completion

### Task 20.4: Test Communication Dashboard
- [x] Test communications list display
- [x] Test filtering and search
- [x] Test thread view
- [x] Test quote approval flow
- [x] Test quote rejection flow

### Task 20.5: Integration Testing
- [x] Test end-to-end: NL input → Extract → Match → Agent → Quotes → Approve
- [x] Test with multiple vendors per category
- [x] Test concurrent events
- [x] Test email threading

### Task 20.6: Security & Performance Testing
- [x] Verify webhook signature validation
- [x] Test RLS on new tables
- [x] Test event extraction performance (< 2s)
- [x] Test email drafting performance (< 3s)
- [x] Test dashboard load time (< 500ms)

---

## PHASE 21: UX POLISH & ENHANCEMENTS

### Task 21.1: Add Loading States
- [x] Review all pages and ensure loading states are present
- [x] Use Skeleton/Loading components for content loading

### Task 21.2: Add Error Handling
- [x] Review major API routes and ensure proper error handling
- [x] Add ErrorMessage components to main pages

### Task 21.3: Add Toast Notifications
- [x] Integrated shadcn toast for success/error feedback

### Task 21.4: Improve Form Validation
- [x] Review all forms and ensure validation is comprehensive
- [x] Add helpful error messages for each field
- [x] Add inline validation (on blur)
- [x] Prevent duplicate submissions

### Task 21.5: Add Confirmation Dialogs
- [x] Add confirmation for major actions (Event Completion, Deletions)
- [x] Add confirmation for Refresh Demo Data

### Task 21.6: Add Empty States
- [x] Add EmptyState component to:
  - Venues list (no venues)
  - Vendors list (no vendors)
  - Events list (no events)
  - Dashboard (no upcoming events)
- [x] Include helpful messages and action buttons

### Task 21.7: Improve Navigation
- [x] Add breadcrumbs to detail pages
- [x] Highlight active nav item in sidebar (was already done)
- [x] Add back buttons where appropriate (vendor detail page has back button)
- [x] Ensure consistent navigation patterns

### Task 21.8: Add Data Persistence (Optional)
- [ ] Persist filter/sort preferences in localStorage (skipped - optional)
- [ ] Remember last selected venue (skipped - optional)
- [ ] Remember user preferences (skipped - optional)

---

## PHASE 22: MOBILE & ACCESSIBILITY

### Task 22.1: Optimize Mobile Responsiveness
- [ ] Review all pages on mobile/tablet
- [ ] Ensure sidebar collapses on mobile
- [ ] Ensure tables are scrollable or stack on mobile
- [ ] Ensure forms are usable on mobile
- [ ] Test touch interactions
- [ ] Test landscape and portrait modes

### Task 22.2: Accessibility Improvements
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add proper ARIA labels
- [ ] Ensure sufficient color contrast
- [ ] Test with screen reader (basic)
- [ ] Add focus indicators
- [ ] Ensure proper heading hierarchy

---

## PHASE 23: SUBSCRIPTION & BILLING

> **Note**: This phase implements a monetization layer with tiered subscriptions using Stripe. Users must subscribe to access the application beyond a trial period.

### Pricing Tiers
- **Starter**: $49/mo (1 space, 10 events/month, 50 vendors)
- **Professional**: $149/mo (3 spaces, 50 events/month, unlimited vendors)
- **Enterprise**: $299/mo (unlimited spaces, unlimited events, API access)

### Task 23.1: Stripe Account Setup
- [ ] Create Stripe account at https://stripe.com
- [ ] Get Stripe API keys (publishable and secret)
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Get webhook signing secret
- [ ] Add to `.env.local`:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx`
  - `STRIPE_SECRET_KEY=sk_test_xxxxx`
  - `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
  - `STRIPE_STARTER_PRICE_ID=price_xxxxx`
  - `STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxx`
  - `STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx`
- [ ] Update `.env.example` with placeholder values

### Task 23.2: Install Stripe Dependencies
- [ ] Install Stripe packages: `npm install stripe @stripe/stripe-js`
- [ ] Verify installation successful

### Task 23.3: Create Stripe Products & Prices
- [ ] Create "Starter" product in Stripe Dashboard
  - Set price: $49/month recurring
  - Add metadata: `max_spaces=1, max_events_per_month=10, max_vendors=50`
  - Copy Price ID to environment variable
- [ ] Create "Professional" product in Stripe Dashboard
  - Set price: $149/month recurring
  - Add metadata: `max_spaces=3, max_events_per_month=50, max_vendors=unlimited`
  - Copy Price ID to environment variable
- [ ] Create "Enterprise" product in Stripe Dashboard
  - Set price: $299/month recurring
  - Add metadata: `max_spaces=unlimited, max_events_per_month=unlimited, max_vendors=unlimited, api_access=true`
  - Copy Price ID to environment variable
- [ ] Test products visible in Stripe Dashboard

### Task 23.4: Create Subscription Database Schema
- [ ] Create `subscriptions` table in Supabase:
  ```sql
  CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'professional', 'enterprise', 'trial')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Create `usage_tracking` table:
  ```sql
  CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    spaces_created INTEGER DEFAULT 0,
    events_created INTEGER DEFAULT 0,
    vendors_created INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
  );
  ```
- [ ] Create indexes:
  - `CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);`
  - `CREATE INDEX idx_subscriptions_status ON subscriptions(status);`
  - `CREATE INDEX idx_usage_tracking_user_month ON usage_tracking(user_id, month);`
- [ ] Enable RLS on both tables
- [ ] Create RLS policies for `subscriptions`:
  - "Users can view own subscription"
  - "Users can update own subscription"
- [ ] Create RLS policies for `usage_tracking`:
  - "Users can view own usage"
- [ ] Regenerate TypeScript types

### Task 23.5: Create Stripe Client Utilities
- [ ] Create `lib/stripe/client.ts`:
  - Export `stripe` server-side client
  - Add error handling
- [ ] Create `lib/stripe/config.ts`:
  - Export plan configurations
  - Export plan limits
  - Export price IDs
- [ ] Test Stripe client connection

### Task 23.6: Create Subscription Utilities
- [ ] Create `lib/subscription/limits.ts`:
  - `getPlanLimits(tier: string): PlanLimits`
  - `checkSpaceLimit(userId: string): boolean`
  - `checkEventLimit(userId: string): boolean`
  - `checkVendorLimit(userId: string): boolean`
  - `canCreateSpace(userId: string): Promise<boolean>`
  - `canCreateEvent(userId: string): Promise<boolean>`
  - `canCreateVendor(userId: string): Promise<boolean>`
- [ ] Create `lib/subscription/usage.ts`:
  - `trackSpaceCreation(userId: string): Promise<void>`
  - `trackEventCreation(userId: string): Promise<void>`
  - `trackVendorCreation(userId: string): Promise<void>`
  - `getCurrentUsage(userId: string): Promise<Usage>`
  - `resetMonthlyUsage()`: Run monthly via cron
- [ ] Test utility functions

### Task 23.7: Create Subscription API Routes
- [ ] Create `app/api/subscription/route.ts`:
  - `GET /api/subscription`: Fetch current user's subscription
  - `POST /api/subscription`: Create subscription (redirect to Stripe Checkout)
- [ ] Create `app/api/subscription/portal/route.ts`:
  - `POST /api/subscription/portal`: Create Stripe Customer Portal session
- [ ] Create `app/api/subscription/usage/route.ts`:
  - `GET /api/subscription/usage`: Get current month's usage
- [ ] Test all endpoints

### Task 23.8: Create Stripe Webhook Handler
- [ ] Create `app/api/webhooks/stripe/route.ts`:
  - Verify webhook signature
  - Handle `customer.subscription.created`
  - Handle `customer.subscription.updated`
  - Handle `customer.subscription.deleted`
  - Handle `invoice.payment_succeeded`
  - Handle `invoice.payment_failed`
  - Update `subscriptions` table accordingly
  - Log all events
- [ ] Test webhook locally with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Verify webhook updates database correctly

### Task 23.9: Create Subscription Components
- [ ] Create `components/subscription/PricingCard.tsx`:
  - Display plan name, price, features
  - "Subscribe" button
  - Highlight current plan
- [ ] Create `components/subscription/PricingTable.tsx`:
  - Display all three pricing tiers
  - Feature comparison
  - CTAs for each tier
- [ ] Create `components/subscription/SubscriptionBadge.tsx`:
  - Show current plan tier
  - Show status (active, trial, etc.)
- [ ] Create `components/subscription/UsageBar.tsx`:
  - Show current usage vs limit
  - Progress bar visualization
  - Warning when approaching limit
- [ ] Create `components/subscription/UpgradePrompt.tsx`:
  - Modal prompting upgrade when limit reached
  - Link to pricing page
- [ ] Test all components

### Task 23.10: Create Pricing Page
- [ ] Create `app/(marketing)/pricing/page.tsx`:
  - Display PricingTable component
  - Add FAQ section
  - Add testimonials (optional)
  - CTA to sign up
- [ ] Create marketing layout if needed
- [ ] Test page rendering and styling

### Task 23.11: Create Subscription Management Page
- [ ] Create `app/(dashboard)/settings/subscription/page.tsx`:
  - Display current plan and status
  - Show billing cycle dates
  - Display current usage with UsageBar components
  - "Manage Subscription" button (opens Stripe Customer Portal)
  - "Upgrade Plan" button
  - "Cancel Subscription" button (with confirmation)
- [ ] Test subscription management flow

### Task 23.12: Implement Trial Logic
- [ ] Update signup flow in `app/(auth)/signup/page.tsx`:
  - Create Stripe customer on signup
  - Create subscription record with status='trialing'
  - Set trial_ends_at to 14 days from signup
  - Store in subscriptions table
- [ ] Create `lib/subscription/trial.ts`:
  - `isTrialActive(userId: string): Promise<boolean>`
  - `getDaysRemainingInTrial(userId: string): Promise<number>`
  - `hasTrialExpired(userId: string): Promise<boolean>`
- [ ] Add trial banner to dashboard showing days remaining
- [ ] Test trial creation on signup

### Task 23.13: Add Subscription Checks to API Routes
- [ ] Update `app/api/venues/route.ts`:
  - Check `canCreateSpace()` before POST
  - Return 403 with upgrade message if limit reached
- [ ] Update `app/api/events/route.ts`:
  - Check `canCreateEvent()` before POST
  - Return 403 with upgrade message if limit reached
- [ ] Update `app/api/vendors/route.ts`:
  - Check `canCreateVendor()` before POST
  - Return 403 with upgrade message if limit reached
- [ ] Create middleware to check subscription status on all protected routes
- [ ] Redirect to pricing page if subscription expired
- [ ] Test all limit checks

### Task 23.14: Add Usage Tracking
- [ ] Update `app/api/venues/route.ts` POST:
  - Call `trackSpaceCreation()` after successful creation
- [ ] Update `app/api/events/route.ts` POST:
  - Call `trackEventCreation()` after successful creation
- [ ] Update `app/api/vendors/route.ts` POST:
  - Call `trackVendorCreation()` after successful creation
- [ ] Test usage tracking increments correctly

### Task 23.15: Add Upgrade Prompts to UI
- [ ] Update `app/(dashboard)/venues/new/page.tsx`:
  - Show UpgradePrompt modal if space limit reached
  - Disable form if limit reached
- [ ] Update `app/(dashboard)/events/new/page.tsx`:
  - Show UpgradePrompt modal if event limit reached
  - Disable form if limit reached
- [ ] Update `app/(dashboard)/vendors/new/page.tsx`:
  - Show UpgradePrompt modal if vendor limit reached
  - Disable form if limit reached
- [ ] Add "Upgrade" link to sidebar for trial/starter users
- [ ] Test upgrade prompts display correctly

### Task 23.16: Implement Checkout Flow
- [ ] Create `app/(dashboard)/checkout/page.tsx`:
  - Accept `priceId` as query parameter
  - Create Stripe Checkout session
  - Redirect to Stripe hosted checkout
  - Handle success/cancel URLs
- [ ] Create `app/(dashboard)/checkout/success/page.tsx`:
  - Display success message
  - Fetch updated subscription
  - Redirect to dashboard after 3 seconds
- [ ] Create `app/(dashboard)/checkout/cancel/page.tsx`:
  - Display cancellation message
  - Link back to pricing page
- [ ] Test complete checkout flow with test card (4242 4242 4242 4242)

### Task 23.17: Add Subscription Hooks
- [ ] Create `hooks/useSubscription.ts`:
  - `useSubscription()`: Fetch current subscription
  - `useUsage()`: Fetch current usage
  - `useCanCreate(resource: 'space' | 'event' | 'vendor')`: Check limits
  - Handle loading and error states
- [ ] Test hooks in components

### Task 23.18: Update Dashboard with Subscription Info
- [ ] Update `app/(dashboard)/dashboard/page.tsx`:
  - Show subscription badge
  - Show usage statistics
  - Show trial countdown if in trial
  - Show upgrade CTA if on starter plan
- [ ] Update `components/layout/Sidebar.tsx`:
  - Show current plan tier
  - Show upgrade button for non-enterprise users
- [ ] Test dashboard displays subscription info correctly

### Task 23.19: Implement Downgrade/Cancellation Logic
- [ ] Handle subscription downgrades:
  - If downgrading from Professional to Starter with 3 spaces, show warning
  - Mark extra spaces as "inactive" or prompt user to delete
  - Implement grace period for compliance
- [ ] Handle subscription cancellation:
  - Set `cancel_at_period_end = true`
  - Allow access until period end
  - Show "Reactivate" button
  - Implement reactivation flow
- [ ] Test downgrade scenarios

### Task 23.20: Add API Access for Enterprise
- [ ] Create `api_keys` table:
  ```sql
  CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    name TEXT NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
  );
  ```
- [ ] Create API key generation utility
- [ ] Create `app/(dashboard)/settings/api-keys/page.tsx` (Enterprise only)
- [ ] Implement API authentication middleware
- [ ] Create API documentation page
- [ ] Test API key creation and usage

### Task 23.21: Test Subscription Features
- [ ] Test trial signup → trial expires → forced to choose plan
- [ ] Test starter plan → hit space limit → upgrade prompt
- [ ] Test professional plan → hit event limit → upgrade prompt
- [ ] Test enterprise plan → unlimited usage
- [ ] Test payment failure → subscription status updates
- [ ] Test plan upgrades (prorated billing)
- [ ] Test plan downgrades (credit applied)
- [ ] Test cancellation → reactivation
- [ ] Test webhook reliability
- [ ] Test usage tracking accuracy
- [ ] Test API key generation (Enterprise)

### Task 23.22: Add Subscription to Seed Data (Optional)
- [ ] Update seed script to create trial subscription for test user
- [ ] Add sample usage data
- [ ] Test seed data includes subscription

---

## PHASE 24: PERFORMANCE OPTIMIZATION

### Task 24.1: Database Optimization
- [ ] Review and add database indexes for common queries
- [ ] Optimize complex queries (vendor matching, budget calculations)
- [ ] Add composite indexes where needed
- [ ] Test query performance with large datasets

### Task 24.2: Frontend Optimization
- [ ] Optimize API routes (reduce unnecessary queries)
- [ ] Add caching where appropriate (React Query or SWR)
- [ ] Lazy load components if needed
- [ ] Optimize images (if any)
- [ ] Code splitting for large pages

### Task 24.3: Performance Testing
- [ ] Test page load times (target < 2 seconds)
- [ ] Test API response times (target < 500ms)
- [ ] Test with slow 3G network
- [ ] Identify and fix performance bottlenecks

---

## PHASE 25: SECURITY & DEPLOYMENT PREPARATION

### Task 25.1: Security Review
- [ ] Review RLS policies thoroughly (including AI tables)
- [ ] Ensure no service role key exposed to client
- [ ] Ensure no AI API keys exposed to client
- [ ] Review API routes for auth checks
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Validate all user inputs on server side
- [ ] Test authentication edge cases
- [ ] Verify password requirements
- [ ] Verify webhook signature validation

### Task 25.2: Environment Configuration
- [ ] Create production Supabase project (if separate from dev)
- [ ] Set up production environment variables (including AI keys)
- [ ] Configure Supabase auth for production URLs
- [ ] Configure Resend production domain
- [ ] Set up domain and SSL
- [ ] Configure webhook endpoints

### Task 25.3: SEO & Metadata
- [ ] Add proper page titles for all pages
- [ ] Add meta descriptions
- [ ] Add Open Graph tags
- [ ] Create favicon
- [ ] Add robots.txt
- [ ] Add sitemap.xml

### Task 25.4: Error Tracking & Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, or similar) - optional
- [ ] Add error boundaries
- [ ] Log errors to console in dev, to service in prod
- [ ] Set up uptime monitoring (optional)
- [ ] Monitor AI API usage and costs

---

## PHASE 26: DEPLOYMENT

### Task 26.1: Pre-Deployment Checklist
- [ ] Remove "Refresh Demo Data" button (production)
- [ ] Verify all environment variables set correctly
- [ ] Test with production Supabase project
- [ ] Test with production Resend account
- [ ] Run final security audit
- [ ] Ensure no console.log in production code
- [ ] Verify AI feature flags set appropriately

### Task 26.2: Deploy to Vercel
- [ ] Create Vercel account (if needed)
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test custom domain (if applicable)

### Task 26.3: Post-Deployment Testing
- [ ] Test signup/login on production
- [ ] Test creating venues, vendors, events
- [ ] Test vendor matching
- [ ] Test budget tracking
- [ ] Test performance reviews
- [ ] Test natural language event creation
- [ ] Test AI agent (with test vendors)
- [ ] Test communication dashboard
- [ ] Verify RLS working in production (all tables)
- [ ] Test all major workflows end-to-end

### Task 26.4: Monitor & Fix Issues
- [ ] Monitor application logs
- [ ] Monitor AI API usage and costs
- [ ] Fix any production-specific bugs
- [ ] Monitor performance metrics
- [ ] Monitor error rates
- [ ] Check database connection pooling
- [ ] Monitor email deliverability

---

## PHASE 27: DOCUMENTATION & HANDOFF

### Task 27.1: Update Documentation
- [ ] Update README.md with:
  - Project overview
  - Features list (including AI features)
  - Setup instructions
  - Environment variables (including AI keys)
  - Deployment instructions
  - Troubleshooting guide
- [ ] Document API routes (including AI endpoints)
- [ ] Document component structure
- [ ] Add comments to complex algorithms
- [ ] Document database schema (including AI tables)
- [ ] Document AI features and webhook setup

### Task 26.2: Create User Guide (Optional)
- [ ] Write basic user guide
- [ ] Include screenshots
- [ ] Explain key features and workflows
- [ ] Document AI features usage
- [ ] Create video walkthrough (optional)

### Task 27.3: Developer Handoff
- [ ] Create developer onboarding guide
- [ ] Document code architecture
- [ ] Document deployment process
- [ ] Document common issues and fixes
- [ ] Create maintenance guide
- [ ] Document AI agent troubleshooting

---

## SUCCESS CRITERIA CHECKLIST

After completing all tasks, verify the following:

### Core Functionality (Phases 0-11)
- [ ] Users can sign up and create an account
- [ ] Users can create and manage multiple venues
- [ ] Users can add, edit, and view vendors
- [ ] Users can create events with budgets
- [ ] Vendor matching shows ranked recommendations with scores
- [ ] Users can assign vendors to events
- [ ] Budget tracking shows real-time variance
- [ ] Users can complete events and review vendors
- [ ] Vendor reviews update reliability scores
- [ ] Data is isolated per user (RLS working)

### AI Features (Phases 13-20)
- [ ] Users can create events using natural language descriptions
- [ ] AI agent can automatically contact vendors via email
- [ ] AI agent can analyze vendor replies and extract quotes
- [ ] AI agent can negotiate and send follow-up emails
- [ ] Users can view all communications in dashboard
- [ ] Users can approve/reject quotes from dashboard
- [ ] Quote approval automatically assigns vendors and updates budget
- [ ] All agent actions are logged and auditable

### Performance
- [ ] Page load times < 2 seconds
- [ ] API responses < 500ms
- [ ] No console errors in production

### User Experience
- [ ] No broken links
- [ ] All forms have validation with helpful messages
- [ ] Loading states shown during async operations
- [ ] Error messages are user-friendly
- [ ] Mobile responsive (works on tablet)
- [ ] Keyboard accessible

### Code Quality
- [ ] TypeScript types used throughout
- [ ] No ESLint errors
- [ ] Code is well-organized and follows patterns
- [ ] Comments added for complex logic

---

## NOTES FOR AI AGENT

### General Guidelines
- Work through tasks sequentially in order
- Each task should be fully completed before moving to the next
- Test each feature immediately after implementing
- If you encounter issues with a task, document the problem and potential solutions
- Keep the UI simple and focused - avoid over-engineering
- Prioritize functionality over aesthetics for MVP
- Refer to PRD (`VenueAssistant_MicroSaaS_PRD.md`) for detailed specifications
- Refer to `CLAUDE.MD` for architectural context

### Implementation Phases Overview

**CORE MVP (Phases 0-11)**: Essential features for venue management
- Complete these first
- Foundation for all other features

**TESTING (Phase 12)**: Comprehensive testing and seed data
- Test all core workflows
- Ensure data quality and edge cases handled

**AI FEATURES (Phases 13-20)**: Advanced AI-powered features
- Natural language event creation
- Automated vendor communication agent
- Communication dashboard with quote approval
- Requires Anthropic API and Resend accounts
- Adds significant value and differentiation

**POLISH & DEPLOYMENT (Phases 21-26)**: Production readiness
- UX improvements and mobile optimization
- Performance optimization
- Security review and production deployment
- Documentation and handoff

### AI Features Implementation Notes

When implementing Phases 13-20 (AI features):

1. **Prerequisites**:
   - Budget for AI API costs (~$125/month for 1000 events)
   - Anthropic API account with valid API key
   - Resend account with verified domain
   - Understanding of webhook security and Claude API usage

2. **Key Considerations**:
   - Always verify webhook signatures before processing
   - Log all AI agent actions for transparency
   - Implement rate limiting to prevent API abuse
   - Test extensively with mock data before using real vendors
   - Never hardcode API keys - use environment variables
   - Fail gracefully - allow manual fallback if AI fails

3. **Testing Strategy**:
   - Use test email addresses for vendor communication
   - Test webhook handling in development environment
   - Verify RLS policies on new tables
   - Test quote extraction with various email formats
   - Ensure budget constraints are respected

4. **Cost Management**:
   - Monitor Claude API usage closely
   - Cache common email templates to reduce API calls
   - Consider using Claude Haiku for simpler tasks
   - Set up alerts for unexpected cost spikes

5. **Security**:
   - Verify all webhook signatures
   - Validate email addresses before sending
   - Rate limit email sending (max 10/minute)
   - Never expose API keys to client
   - Audit all agent actions

### Quick Reference Files

- **Main PRD**: `VenueAssistant_MicroSaaS_PRD.md` (Core MVP specs)
- **AI Features PRD**: `PRD_Update_Instructions_AI_Agent.md` (AI features specs)
- **Project Context**: `CLAUDE.MD` (Architecture and guidelines)
- **AI Database Schema**: `ai-features-schema.sql` (SQL to run in Supabase)
- **Profile Fix**: `FIX_PROFILE_ISSUE.md` (SQL trigger for user profiles)

### Current Status

**Completed**: Phases 0-11 (Core MVP features)
**In Progress**: Phase 12 (Testing & Seed Data)
**Pending**: Phases 13-20 (AI Features)
**Pending**: Phases 21-26 (Polish, Mobile, Performance, Deployment)

Good luck! 🚀
