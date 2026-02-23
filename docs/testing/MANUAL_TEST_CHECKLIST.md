# VenueAssistant Manual Test Checklist

This checklist is designed for manual regression testing after every release. It covers the Public Marketplace, Venue Manager Portal, AI Features, and Core Infrastructure.

**Legend:**
- [ ] **Pass**: Feature works as expected.
- [ ] **Fail**: Feature is broken or buggy.
- [ ] **N/A**: Feature not applicable for this release/environment.

---

## PART 1: PUBLIC MARKETPLACE (Venue Seeker Experience)

### 1.1 Homepage (`/`)
- [ ] **Hero Section**: Verify headline, subheadline, and background image load correctly.
- [ ] **Search Bar**:
  - [ ] Enter a location (e.g., "Dallas") and verify autocomplete/input.
  - [ ] Select a date and guest count.
  - [ ] Click "Search" and verify redirection to `/venues` with correct query parameters.
- [ ] **Featured Venues**: Verify 6-8 venue cards are displayed with images, names, and ratings.
- [ ] **Browse by Category**: Click on a category (e.g., "Weddings") and verify redirection to filtered search results.
- [ ] **Social Proof**: Verify stats and testimonials are visible.
- [ ] **Footer**: Verify all links (About, Contact, Login, etc.) work.

### 1.2 Search Results (`/venues`)
- [ ] **Listing Display**: Verify venue cards show image, name, location, capacity, and price/quote.
- [ ] **Filters**:
  - [ ] **Location**: Filter by city/zip.
  - [ ] **Date**: Select a date; verify unavailable venues are hidden (if "Show available only" is checked).
  - [ ] **Guest Count**: Filter by min/max guests.
  - [ ] **Event Type**: Select "Wedding" or "Corporate".
  - [ ] **Price**: Adjust price range slider.
- [ ] **Sorting**: Test sorting by "Price: Low to High" and "Highest Rated".
- [ ] **Pagination/Load More**: Scroll down or click next page to see more results.
- [ ] **Empty State**: Apply strict filters to generate zero results and verify the "No venues found" message.

### 1.3 Public Venue Page (`/venues/[slug]`)
- [ ] **Hero**: Verify venue name, location, and "Request Quote" buttons are visible.
- [ ] **Photo Gallery**:
  - [ ] Click "View Photos" to open the lightbox.
  - [ ] Swipe/click through photos.
- [ ] **Info Sections**: Verify About, Amenities, and Location (Map) sections render.
- [ ] **Spaces**: Verify list of spaces (e.g., Ballroom, Garden) with capacities.
- [ ] **Pricing**: Verify Packages are displayed (if enabled).
- [ ] **Availability Calendar**:
  - [ ] Verify the calendar widget loads.
  - [ ] Check that past dates are disabled.
  - [ ] Hover over dates to see status (Available/Booked).
- [ ] **Inquiry Form (Fallback)**:
  - [ ] Fill out Name, Email, Date, Guest Count.
  - [ ] Submit form and verify success message.
  - [ ] Verify confirmation email is received (if email service configured).

### 1.4 AI Chat Widget (Conversational Booking)
- [ ] **Widget Toggle**: Click the chat bubble icon to open/close the chat.
- [ ] **Initial Greeting**: Verify the AI sends a welcome message based on venue settings.
- [ ] **Conversation Flow**:
  - [ ] Send a message: "I'm looking for a wedding venue for 150 people in June."
  - [ ] Verify AI asks qualifying questions (date flexibility, budget, etc.).
- [ ] **Availability Check**: Ask "Is June 15th available?" and verify AI checks real-time availability.
- [ ] **Pricing Estimate**: Ask "How much would it cost?" and verify AI provides a range based on packages.
- [ ] **Lead Capture**:
  - [ ] Provide contact info (Name/Email) in chat.
  - [ ] Verify AI acknowledges and suggests next steps (e.g., "I'll have the manager contact you").

---

## PART 2: VENUE MANAGER PORTAL (B2B Side)

### 2.1 Authentication & Onboarding
- [ ] **Sign Up**: Create a new account via `/signup`.
- [ ] **Onboarding**: Complete the initial venue setup wizard (Name, Address, Type).
- [ ] **Login**: Log in with an existing account via `/login`.
- [ ] **Forgot Password**: Verify the password reset flow initiates.
- [ ] **Logout**: Verify logout redirects to the public homepage or login page.

### 2.2 Dashboard Home (`/dashboard`)
- [ ] **Stats Cards**: Verify "Total Events", "Active Leads", "Revenue" stats load.
- [ ] **Upcoming Events**: Verify the list of next 5 events is correct.
- [ ] **Recent Leads**: Verify new leads from the marketplace appear here.

### 2.3 Venue & Page Management
- [ ] **Page Editor** (`/dashboard/venues/[id]/public-page`):
  - [ ] **Basic Info**: Update tagline and description; save.
  - [ ] **Photos**: Upload a new photo; set as hero; delete a photo.
  - [ ] **Spaces**: Add a new space with capacity; save.
  - [ ] **Packages**: Create a new pricing package; save.
  - [ ] **AI Settings**: Change AI tone (e.g., from Formal to Friendly); save.
- [ ] **Preview**: Click "Preview" and verify changes in a new tab.
- [ ] **Publish/Unpublish**: Toggle status and verify visibility on the public marketplace.

### 2.4 Lead Management (CRM)
- [ ] **Lead List** (`/dashboard/leads`):
  - [ ] Verify leads from Public Inquiries and AI Chat appear.
  - [ ] Filter by Status (New, Contacted, Won, Lost).
- [ ] **Lead Detail**:
  - [ ] Open a lead.
  - [ ] **Chat Transcript**: Verify the AI conversation history is visible.
  - [ ] **Actions**: Click "Send Proposal" or "Email".
  - [ ] **Status Change**: Move lead to "Qualified" or "Won".

### 2.5 Event Management
- [ ] **Event List**: Verify list of confirmed bookings.
- [ ] **Create Event**:
  - [ ] Use **Manual Form**: Enter details, select client, select space.
  - [ ] Use **Natural Language**: Type "Wedding for John Doe on Dec 12th, budget 20k" and verify extraction.
- [ ] **Event Detail**:
  - [ ] Verify Overview, Timeline, and Budget tabs.
  - [ ] **Space Selection**: Change the assigned space; verify conflict detection warns if booked.
  - [ ] **Status**: Change status to "Completed".

### 2.6 Calendar & Availability
- [ ] **Calendar View** (`/dashboard/calendar`):
  - [ ] Switch between Month, Week, and Day views.
  - [ ] Verify events appear on correct dates/times.
  - [ ] **Filtering**: Filter by Space or Event Status.
- [ ] **Space Availability**:
  - [ ] Create an event overlapping with an existing one.
  - [ ] Verify the system prevents double-booking (Error message or blocking).

### 2.7 Vendor Management
- [ ] **Vendor List**: Verify list of vendors.
- [ ] **Add Vendor**: Create a new vendor profile.
- [ ] **Vendor Matching**:
  - [ ] Go to an Event -> Vendors tab.
  - [ ] Click "Match Vendors".
  - [ ] Verify AI suggests vendors based on category and budget.

### 2.8 Settings & Subscription
- [ ] **Profile**: Update user name/email.
- [ ] **Subscription**:
  - [ ] Verify current plan (Starter/Pro).
  - [ ] Click "Upgrade" (if applicable) and verify Stripe checkout opens.
  - [ ] Verify usage limits (e.g., max photos/leads) are enforced.

---

## PART 3: AI AGENT WORKFLOWS (Backend/Async)

### 3.1 AI Vendor Outreach Agent
- [ ] **Trigger**: Go to Event -> Vendors -> "Engage Vendors with AI".
- [ ] **Email Sending**:
  - [ ] Verify the agent sends outreach emails to selected vendors.
  - [ ] Check `vendor_communications` logs in the dashboard.
- [ ] **Reply Processing** (Mock/Test):
  - [ ] Simulate a vendor reply (via API or test email).
  - [ ] Verify the Agent analyzes the reply (Quote extraction).
  - [ ] Verify the Vendor Status updates (e.g., "Contacted" -> "Available").

### 3.2 Proposal Generation
- [ ] **Generate**: From a Lead, click "Generate Proposal".
- [ ] **PDF**: Verify the PDF is created with correct venue branding and pricing.
- [ ] **Send**: Click "Send to Client" and verify email delivery.

---

## PART 4: MOBILE RESPONSIVENESS

- [ ] **Public Search**: Verify filters are accessible via slide-out on mobile.
- [ ] **Venue Page**: Verify photos stack and "Request Quote" is sticky or easily accessible.
- [ ] **Manager Dashboard**: Verify sidebar collapses into a hamburger menu.
- [ ] **Chat Widget**: Verify chat takes up full screen on mobile when open.

---

## PART 5: PERFORMANCE & SECURITY

- [ ] **Load Time**: Verify Homepage and Venue Pages load in under 2 seconds.
- [ ] **RLS (Row Level Security)**:
  - [ ] Log in as User A.
  - [ ] Attempt to access User B's venue/leads (via URL manipulation).
  - [ ] Verify access is denied.
- [ ] **Public Access**: Verify unpublished venues return 404 or "Not Available" to public users.

---

## TEST DATA RESET (Optional)

- [ ] **Seed Data**: Run the seed script to reset demo data if needed for clean testing.
```

<!--
[PROMPT_SUGGESTION]Can you create a script to automate the seeding of test data mentioned in the checklist?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]How do I run the unit tests for the AI agent logic?[/PROMPT_SUGGESTION]
