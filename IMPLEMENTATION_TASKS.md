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

## PHASE 12: POLISH & ENHANCEMENTS

### Task 12.1: Add Loading States
- [x] Review all pages and ensure loading states are present
- [x] Use Skeleton/Loading components for content loading

### Task 12.2: Add Error Handling
- [x] Review major API routes and ensure proper error handling
- [x] Add ErrorMessage components to main pages

### Task 12.3: Add Toast Notifications
- [x] Integrated shadcn toast for success/error feedback

### Task 12.4: Improve Form Validation
- [ ] Review all forms and ensure validation is comprehensive
- [ ] Add helpful error messages for each field
- [ ] Add inline validation (on blur)
- [ ] Prevent duplicate submissions

### Task 12.5: Add Confirmation Dialogs
- [x] Add confirmation for major actions (Event Completion, Deletions)

### Task 12.6: Optimize Mobile Responsiveness
- [ ] Review all pages on mobile/tablet
- [ ] Ensure sidebar collapses on mobile
- [ ] Ensure tables are scrollable or stack on mobile
- [ ] Ensure forms are usable on mobile
- [ ] Test touch interactions

### Task 12.7: Add Empty States
- [ ] Add EmptyState component to:
  - Venues list (no venues)
  - Vendors list (no vendors)
  - Events list (no events)
  - Dashboard (no upcoming events)
- [ ] Include helpful messages and action buttons

### Task 12.8: Improve Navigation
- [ ] Add breadcrumbs to detail pages
- [ ] Highlight active nav item in sidebar
- [ ] Add back buttons where appropriate
- [ ] Ensure consistent navigation patterns

### Task 12.9: Add Data Persistence
- [ ] Review forms and add autosave (optional)
- [ ] Persist filter/sort preferences in localStorage
- [ ] Remember last selected venue

### Task 12.10: Accessibility Improvements
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add proper ARIA labels
- [ ] Ensure sufficient color contrast
- [ ] Test with screen reader (basic)

---

## PHASE 13: TESTING & SEED DATA

### Task 13.1: Create Seed Data
- [ ] Create script or manual process to add test data:
  - 2-3 test venues
  - 10-15 test vendors across different categories
  - 5-8 test events (mix of statuses)
  - Some vendor assignments
  - Some vendor reviews

### Task 13.2: Test Core Workflows
- [ ] Test signup → onboarding → create venue
- [ ] Test create event → match vendors → assign vendors
- [ ] Test budget tracking with different scenarios
- [ ] Test complete event → review vendors → check updated scores
- [ ] Test RLS: create second user and verify data isolation

### Task 13.3: Test Vendor Matching Algorithm
- [ ] Create vendors with different characteristics:
  - High reliability, high cost
  - Low reliability, low cost
  - Medium reliability, medium cost
- [ ] Create event with specific budget
- [ ] Run matching and verify scores are calculated correctly
- [ ] Verify ranking is correct

### Task 13.4: Test Budget Calculations
- [ ] Create event with budget breakdown
- [ ] Assign vendors with quoted costs
- [ ] Verify budget summary calculates correctly
- [ ] Add actual costs (after event)
- [ ] Verify variance calculations

### Task 13.5: Test Performance Updates
- [ ] Submit review for a vendor
- [ ] Verify vendor metrics update:
  - total_events incremented
  - on_time_count updated
  - on_time_percentage recalculated
  - avg_quality_rating updated
  - reliability_score recalculated
- [ ] Submit multiple reviews and verify cumulative updates

### Task 13.6: Edge Case Testing
- [ ] Test deleting a venue with events/vendors
- [ ] Test deleting a vendor assigned to an event
- [ ] Test duplicate vendor assignments
- [ ] Test budget with no assigned vendors
- [ ] Test matching with no vendors in category
- [ ] Test form validation edge cases

---

## PHASE 14: DEPLOYMENT PREPARATION

### Task 14.1: Environment Configuration
- [ ] Create production Supabase project (if separate from dev)
- [ ] Set up production environment variables
- [ ] Configure Supabase auth for production URLs

### Task 14.2: Performance Optimization
- [ ] Add database indexes for common queries
- [ ] Optimize API routes (reduce unnecessary queries)
- [ ] Add caching where appropriate
- [ ] Lazy load components if needed
- [ ] Optimize images (if any)

### Task 14.3: Security Review
- [ ] Review RLS policies thoroughly
- [ ] Ensure no service role key exposed to client
- [ ] Review API routes for auth checks
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Validate all user inputs on server side

### Task 14.4: SEO & Metadata
- [ ] Add proper page titles for all pages
- [ ] Add meta descriptions
- [ ] Add Open Graph tags
- [ ] Create favicon

### Task 14.5: Error Tracking
- [ ] Set up error tracking (Sentry, LogRocket, or similar) - optional
- [ ] Add error boundaries
- [ ] Log errors to console in dev, to service in prod

---

## PHASE 15: DEPLOYMENT

### Task 15.1: Deploy to Vercel
- [ ] Create Vercel account (if needed)
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Verify deployment successful

### Task 15.2: Post-Deployment Testing
- [ ] Test signup/login on production
- [ ] Test creating venues, vendors, events
- [ ] Test vendor matching
- [ ] Test budget tracking
- [ ] Test performance reviews
- [ ] Verify RLS working in production

### Task 15.3: Monitor & Fix Issues
- [ ] Monitor application logs
- [ ] Fix any production-specific bugs
- [ ] Monitor performance
- [ ] Set up uptime monitoring (optional)

---

## PHASE 16: DOCUMENTATION & HANDOFF

### Task 16.1: Update Documentation
- [ ] Update README.md with:
  - Project overview
  - Setup instructions
  - Environment variables
  - Deployment instructions
- [ ] Document API routes
- [ ] Document component structure
- [ ] Add comments to complex algorithms

### Task 16.2: Create User Guide (Optional)
- [ ] Write basic user guide
- [ ] Include screenshots
- [ ] Explain key features and workflows

---

## SUCCESS CRITERIA CHECKLIST

After completing all tasks, verify the following:

### Functionality
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

- Work through tasks sequentially in order
- Each task should be fully completed before moving to the next
- Test each feature immediately after implementing
- If you encounter issues with a task, document the problem and potential solutions
- Keep the UI simple and focused - avoid over-engineering
- Prioritize functionality over aesthetics for MVP
- Refer to PRD (`VenueAssistant_MicroSaaS_PRD.md`) for detailed specifications
- Refer to `CLAUDE.MD` for architectural context

Good luck! 🚀
