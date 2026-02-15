# Product Requirements Document (PRD)
## VenueAssistant: Public-Facing Marketplace Pivot

**Version:** 1.0
**Date:** February 14, 2026
**Owner:** Prashant
**Status:** Ready for Development

---

## Executive Summary

VenueAssistant will pivot from a B2B venue management tool to a **two-sided marketplace** where venue seekers (event planners, individuals planning events) can discover and contact venues, while venue managers use a separate portal to manage their listings and handle incoming leads.

**Core Value Proposition:**
- **For Venue Seekers:** "Find and contact the perfect venue for your event in minutes—no account required"
- **For Venue Managers:** "Get more customers through our platform while managing your operations efficiently"

**Strategic Shift:**
- **Current:** Landing page targets venue managers (B2B sales page)
- **New:** Landing page targets venue seekers (public marketplace)
- **Venue Manager Access:** Move to `/for-venues` or `/business` portal

---

## Problem Statement

### Current State Issues

**For Venue Seekers:**
1. Hard to discover venues in one place
2. Each venue has different booking processes
3. Can't easily compare venues
4. Have to create accounts just to inquire
5. Slow response times from venues

**For Venue Managers:**
1. Hard to get discovered by new customers
2. Marketing is expensive and ineffective
3. Miss opportunities due to slow response times
4. Scattered leads across email, phone, social media

**Current Landing Page Problem:**
- Our landing page sells to venue managers (features, pricing, sign-up)
- But we have no way for public users to discover venues
- Missing the opportunity to be a marketplace that brings value to both sides

---

## Solution Overview

### Three-Part Transformation

**1. Public Marketplace Homepage (New Landing Page)**
- Hero section targeting venue seekers
- Search functionality (location, date, capacity, event type)
- Featured venues showcase
- Browse by city, event type, venue type
- Trust signals (reviews, number of venues, success stories)

**2. Venue Discovery & Search**
- Public venue listings (no login required)
- Search and filter functionality
- Individual venue detail pages (public profiles)
- Simple inquiry forms (name, email, event details)
- No account creation required for venue seekers

**3. Venue Manager Portal**
- Separate landing page at `/for-venues` or `/business`
- Current dashboard becomes the manager portal
- Manage public venue listing
- Receive and respond to leads
- All existing functionality remains

---

## Feature Requirements

### PART 1: Public Marketplace Homepage

#### 1.1 Hero Section

**Requirements:**

**Visual Elements:**
- Large hero image or video (people at events, diverse venue types)
- Headline: "Find Your Perfect Event Venue"
- Subheadline: "Browse hundreds of venues, check availability, get instant quotes—all in one place"
- Prominent search bar (city, date, guest count)
- Trust signals: "500+ venues • 10,000+ events hosted • No account required"

**Search Bar (Primary CTA):**
- Input fields:
  - Where: City/location autocomplete
  - When: Date picker (optional)
  - Guests: Number input (optional)
  - Event Type: Dropdown (Wedding, Corporate, Party, etc.) (optional)
- "Search Venues" button
- Or: "Browse All Venues" link

**Secondary CTAs:**
- "List Your Venue" button (links to `/for-venues`)
- "How It Works" link (scroll to explanation section)

**Design Specs:**
- Hero height: 70vh on desktop, 50vh on mobile
- Search bar: Prominent, white card with shadow
- Clean, modern, trustworthy design
- Mobile-responsive search (stacked fields)

**Acceptance Criteria:**
- ✅ Search bar works with partial inputs (location only is fine)
- ✅ Date and guest count are optional
- ✅ Search redirects to `/venues?location=X&date=Y&guests=Z`
- ✅ Hero loads in <2 seconds
- ✅ Mobile search experience is smooth

---

#### 1.2 How It Works Section

**Requirements:**

**Purpose:** Explain the process for venue seekers

**Layout:** 3-4 step cards in a row

**Steps:**
1. **Search & Discover**
   - Icon: 🔍
   - Description: "Browse venues by location, capacity, and event type"

2. **Compare & Choose**
   - Icon: ⭐
   - Description: "View photos, amenities, pricing, and real availability"

3. **Contact Directly**
   - Icon: 💬
   - Description: "Submit inquiries and get responses from venues within 24 hours"

4. **Book Your Event**
   - Icon: ✅
   - Description: "Work with the venue to finalize details and confirm your booking"

**Additional Info:**
- "No account needed • 100% free for event planners • Direct communication with venues"

**Acceptance Criteria:**
- ✅ Icons are clear and professional
- ✅ Text is concise and benefit-focused
- ✅ Section is visible above the fold or immediately after hero
- ✅ Mobile-friendly (cards stack vertically)

---

#### 1.3 Featured Venues Section

**Requirements:**

**Purpose:** Showcase popular/premium venues

**Layout:**
- Grid of 6-8 venue cards (3-4 columns desktop, 2 tablet, 1 mobile)
- Each card shows:
  - Primary photo (hero image)
  - Venue name
  - Location (City, State)
  - Capacity range (e.g., "50-300 guests")
  - Event types badges (Wedding, Corporate, etc.)
  - Starting price (if configured to show) or "Request Quote"
  - Quick stats: ⭐ Rating, 📸 # of photos, 📅 Available dates

**Interaction:**
- Click card → Navigate to venue detail page
- Hover → Slight elevation/shadow effect
- Image: Lazy load, optimized for web

**Data Source:**
- Pull from `venues` table where `page_status = 'published'`
- Filter: Featured flag OR highest-rated OR recently added
- Randomize or rotate selection

**CTA:**
- "View All Venues" button at bottom

**Acceptance Criteria:**
- ✅ Cards are visually appealing and consistent
- ✅ Images load quickly (lazy loading)
- ✅ Mobile layout is clean (1 column)
- ✅ Clicking card navigates to correct venue page
- ✅ Section hidden if no published venues

---

#### 1.4 Browse by Category Section

**Requirements:**

**Purpose:** Help users navigate by common search patterns

**Categories to Display:**

**By Event Type:**
- Weddings 💒
- Corporate Events 💼
- Birthday Parties 🎉
- Conferences 🎤
- Galas & Fundraisers 🍾
- Private Parties 🥂

**By Venue Type:**
- Banquet Halls
- Hotels
- Outdoor Venues
- Historic Buildings
- Rooftop Spaces
- Unique Venues

**By Location (Top Cities):**
- Show top 8-10 cities with most venues
- Example: "Dallas • Austin • Houston • San Antonio..."

**Layout:**
- Tabbed interface or separate sections
- Large clickable cards/buttons
- Icon + label per category
- Click → Navigate to filtered search results

**Acceptance Criteria:**
- ✅ Categories are clickable and navigate to filtered results
- ✅ URLs are clean: `/venues?event_type=wedding`
- ✅ Icons match the category theme
- ✅ Section is scannable (clear labels)
- ✅ Mobile: Categories remain accessible

---

#### 1.5 Social Proof Section

**Requirements:**

**Purpose:** Build trust with testimonials and stats

**Content:**

**Success Stats:**
- Large numbers with labels:
  - "500+ Venues"
  - "10,000+ Events Hosted"
  - "50+ Cities"
  - "4.8★ Average Rating"

**Testimonials/Success Stories:**
- 2-3 testimonials from event planners who found venues through the platform
- Each shows:
  - Quote (max 200 chars)
  - Name, event type
  - Photo (optional)

**Venue Manager Quote (Optional):**
- "Since joining VenueAssistant, we've received 50+ qualified leads per month"
- Encourages venue managers to join

**Design:**
- Stats: Large bold numbers, grid layout
- Testimonials: Card-based, with quote icon
- Background: Subtle accent color or image

**Acceptance Criteria:**
- ✅ Stats are dynamic (pull from database)
- ✅ Testimonials are real and authentic
- ✅ Mobile layout stacks vertically
- ✅ Section builds credibility

---

#### 1.6 Call-to-Action for Venue Managers

**Requirements:**

**Purpose:** Convert venue managers who land on public page

**Content:**
- Headline: "Are you a venue manager?"
- Subtext: "Join our platform and get more bookings"
- Benefits list:
  - ✓ Reach thousands of event planners
  - ✓ Manage inquiries in one place
  - ✓ Get 24/7 AI booking assistant
  - ✓ Professional public venue page
- CTA: "List Your Venue" button → `/for-venues`
- Secondary: "Learn More" link

**Design:**
- Contrasting section (different background color)
- Clear visual separation from venue seeker content
- Not too prominent (secondary to main search CTA)

**Acceptance Criteria:**
- ✅ Button links to venue manager landing page
- ✅ Benefits are clear and compelling
- ✅ Section is visible but not distracting from main purpose

---

#### 1.7 Footer

**Requirements:**

**Content:**

**Navigation Links:**
- Browse Venues
- How It Works
- For Venue Managers
- About Us
- Contact
- Help/FAQ

**Quick Links:**
- Search by City
- Search by Event Type
- Popular Venues

**Legal:**
- Privacy Policy
- Terms of Service
- Cookie Policy

**Social:**
- Facebook, Instagram, LinkedIn icons

**Newsletter Signup (Optional):**
- "Get venue inspiration and tips"
- Email input + Subscribe button

**Acceptance Criteria:**
- ✅ All links work
- ✅ Footer is clean and organized
- ✅ Mobile-friendly (stacked layout)
- ✅ Legal links open in new tab

---

### PART 2: Venue Search & Discovery

#### 2.1 Search Results Page

**URL:** `/venues?location=dallas&date=2026-03-15&guests=100&type=corporate`

**Requirements:**

**Layout:**
- Left sidebar: Filters (desktop) or collapsible (mobile)
- Main content: Venue cards/list
- Top bar: Search summary, sort options, view toggle (grid/list)

**Search Summary:**
- "Showing 24 venues in Dallas for 100 guests"
- Edit search: Inline inputs to modify location, date, guests
- Clear filters button

**Sort Options:**
- Relevance (default)
- Price: Low to High
- Price: High to Low
- Capacity: Largest First
- Highest Rated
- Most Recently Added

**View Toggle:**
- Grid view (default): 2-3 columns of cards
- List view: Single column with more details

**Pagination:**
- Show 12-24 results per page
- Load more button OR infinite scroll
- Page numbers at bottom

**Acceptance Criteria:**
- ✅ Search parameters reflected in URL
- ✅ Filters work instantly (no page reload)
- ✅ Sort updates results correctly
- ✅ Mobile filters accessible via slide-out panel
- ✅ No results state: "No venues found. Try adjusting your filters"

---

#### 2.2 Filter Sidebar

**Requirements:**

**Available Filters:**

**Location:**
- City/ZIP autocomplete
- Distance radius slider (5, 10, 25, 50 miles)

**Date & Availability:**
- Date picker
- Show only venues with availability on selected date
- "Flexible dates" checkbox

**Guest Count:**
- Number input or range slider
- Min/max capacity

**Event Type:**
- Checkboxes:
  - Wedding
  - Corporate Event
  - Birthday Party
  - Conference
  - Gala/Fundraiser
  - Private Party
  - Other

**Venue Type:**
- Checkboxes:
  - Banquet Hall
  - Hotel
  - Outdoor Venue
  - Historic Building
  - Rooftop
  - Restaurant
  - Other

**Price Range:**
- Slider: $$ to $$$$
- Or: Min/Max input fields
- (Only for venues that show pricing)

**Amenities:**
- Checkboxes:
  - Parking
  - WiFi
  - AV Equipment
  - Catering
  - Outdoor Space
  - Accessible
  - Bar Service

**Capacity:**
- Seated: [min] to [max]
- Standing: [min] to [max]

**Filter Actions:**
- "Apply Filters" button (mobile)
- "Clear All" button
- Active filters shown as removable badges

**Acceptance Criteria:**
- ✅ Filters persist in URL (shareable link)
- ✅ Multiple filters work together (AND logic)
- ✅ Filter counts show how many venues match each option
- ✅ Mobile filters slide out smoothly
- ✅ Clearing filters resets search

---

#### 2.3 Venue Card (in Search Results)

**Requirements:**

**Card Content:**

**Image:**
- Primary venue photo (hero image)
- Photo count badge: "12 photos"
- Favoriting (future): Heart icon to save (requires account)

**Venue Info:**
- Venue name (H3, bold)
- Location: City, State (icon + text)
- Distance: "2.5 miles away" (if location searched)
- Capacity: "Up to 300 guests"
- Event types: Badges (max 3 visible)

**Pricing:**
- Starting price: "From $2,500" (if configured to show)
- Or: "Request Quote"
- Pricing model note: "per event" or "per person"

**Quick Stats:**
- Rating: ⭐ 4.8 (24 reviews)
- Availability: "Available Mar 15" or "Check dates"

**Amenities (Icons):**
- Show 4-5 key amenities as icons
- Parking 🅿️, WiFi 📶, AV 🎤, Catering 🍽️

**CTA:**
- "View Details" button (primary)
- "Request Quote" button (secondary)

**Interaction:**
- Click anywhere on card → Navigate to venue detail page
- Hover → Slight shadow/elevation

**Acceptance Criteria:**
- ✅ Card is visually appealing and scannable
- ✅ Image loads quickly (optimized, lazy)
- ✅ All info is legible on mobile
- ✅ Card click navigates correctly
- ✅ Fallback image if venue has no photo

---

#### 2.4 Venue Detail Page (Public Profile)

**URL:** `/{venue-slug}` or `/venues/{venue-slug}`

**Requirements:**

**Layout Sections:**

1. **Hero Section**
   - Large hero image (full width)
   - Venue name overlay (H1)
   - Location (city, state)
   - Quick actions: "Request Quote" | "Check Availability"

2. **Photo Gallery**
   - Grid of photos (6-8 visible)
   - Click to open lightbox
   - Swipe/arrow navigation in lightbox

3. **Overview Card (Sticky Sidebar on Desktop)**
   - Capacity: "Up to 300 guests"
   - Event types supported
   - Starting price or "Request Quote"
   - Availability calendar (mini view)
   - "Send Inquiry" button (opens form)

4. **About Section**
   - Venue description (rich text)
   - Max 500-1000 words

5. **Spaces & Capacity**
   - List of event spaces
   - Each space shows:
     - Name, capacity, photo thumbnail
     - Setup options (banquet, theater, cocktail)

6. **Amenities**
   - Grid of amenities with icons
   - Grouped: Facilities, Services, Accessibility

7. **Availability Calendar** (if enabled by venue)
   - Month view calendar
   - Color-coded: Available (green) | Booked (gray) | Tentative (yellow)
   - Click date → Pre-fills inquiry form

8. **Pricing & Packages** (if venue shows pricing)
   - Package cards (Basic, Standard, Premium)
   - Each shows: Name, Price, What's included
   - "Get Custom Quote" option

9. **Reviews & Testimonials** (if any)
   - Star rating summary
   - List of reviews
   - Filters: Most recent, Highest rated

10. **Location & Contact**
    - Embedded map
    - Address
    - Phone number (click-to-call)
    - Email (click-to-email)
    - Business hours

11. **Inquiry Form (Fixed or Section)**
    - Simple form (covered in 2.5)
    - Fixed on desktop sidebar
    - Or: Sticky bottom bar on mobile

**SEO Elements:**
- H1: Venue name
- Meta title: "{Venue Name} - {Event Types} in {City}"
- Meta description: Excerpt from venue description
- Schema markup: EventVenue type
- Open Graph tags for social sharing

**Acceptance Criteria:**
- ✅ Page loads in <2 seconds
- ✅ All sections are optional (show only if venue configured)
- ✅ Mobile responsive (sections stack)
- ✅ Images are optimized
- ✅ Inquiry form is always accessible
- ✅ Schema markup validates

---

#### 2.5 Inquiry Form (No Account Required)

**Requirements:**

**Purpose:** Allow venue seekers to contact venue without creating account

**Form Fields:**

**Contact Information:**
- Name* (text)
- Email* (email validation)
- Phone (optional, formatted)
- Company (optional, for corporate events)

**Event Details:**
- Event Type* (dropdown)
- Event Date* (date picker)
  - Or: "I'm flexible with dates" checkbox
- Guest Count* (number)
- Event Description (textarea, max 500 chars)
  - Placeholder: "Tell us about your event..."

**Budget (Optional):**
- Budget Range (dropdown)
  - Under $5,000
  - $5,000 - $10,000
  - $10,000 - $25,000
  - $25,000 - $50,000
  - $50,000+
  - Prefer not to say

**Additional Options:**
- ☐ Request a site tour
- ☐ Receive venue's pricing information
- ☐ Subscribe to venue updates

**Privacy:**
- Checkbox: "I agree to the privacy policy" (required)
- Note: "Your information will only be shared with this venue"

**CTA:**
- "Send Inquiry" button (primary)
- "Cancel" or close (secondary)

**Behavior After Submission:**
- Show success message:
  - "✓ Your inquiry has been sent!"
  - "The venue will respond within 24-48 hours"
  - "We've sent a confirmation to {email}"
- Redirect option: "Browse More Venues" button
- Email confirmation to user:
  - Subject: "Your inquiry to {Venue Name}"
  - Body: Summary of inquiry, venue contact info

**Backend Actions:**
1. Create lead record in `leads` table
2. Set source: "public_inquiry"
3. Store all event details
4. Notify venue manager (email, in-app notification)
5. Send confirmation email to inquirer
6. Optionally: Add to email marketing list (if subscribed)

**Spam Prevention:**
- Simple honeypot field (hidden)
- Rate limiting: Max 3 inquiries per email per day
- Optional: reCAPTCHA (light, non-intrusive)

**Acceptance Criteria:**
- ✅ Form validates all required fields
- ✅ Email format validation works
- ✅ Form submits successfully
- ✅ Success message displays
- ✅ Venue manager receives notification within 30 seconds
- ✅ Confirmation email sent to inquirer within 1 minute
- ✅ Form works on mobile without keyboard issues
- ✅ Spam prevention blocks obvious bots

---

### PART 3: Venue Manager Landing Page & Portal

#### 3.1 New Venue Manager Landing Page

**URL:** `/for-venues` or `/business`

**Purpose:** Separate landing page to acquire venue manager customers

**Requirements:**

**Hero Section:**
- Headline: "Grow Your Event Venue Business"
- Subheadline: "Get more bookings with our all-in-one platform: public listing, AI assistant, lead management"
- CTA: "Start Free Trial" or "Get Started"
- Secondary: "Schedule Demo"
- Hero image: Venue manager using dashboard (screenshot or photo)

**Value Propositions:**
1. **Get Discovered**
   - "Reach thousands of event planners searching for venues"
   - Public listing on marketplace

2. **Automate Inquiries**
   - "24/7 AI booking assistant answers questions instantly"
   - Reduce time spent responding

3. **Manage Everything**
   - "CRM, calendar, vendors, budgets—all in one place"
   - Streamline operations

**Features Section:**
- Public Venue Page
- AI Conversational Booking
- Lead Management
- Calendar & Availability
- Vendor Management
- Event Planning Tools
- Analytics Dashboard

**Pricing Tiers:**
- Basic: $X/month
- Professional: $Y/month
- Enterprise: Custom pricing
- (Reuse existing pricing structure)

**Social Proof:**
- Testimonials from venue managers
- Success metrics: "Venues on our platform get 3x more inquiries"
- Logos of venues using the platform

**How It Works (for Venue Managers):**
1. Create your venue profile
2. Upload photos and set pricing
3. Leads come to you automatically
4. Manage bookings in one dashboard

**CTA (Bottom):**
- "Join 500+ Venues on Our Platform"
- "Start Free Trial" button

**Acceptance Criteria:**
- ✅ Clear differentiation from public marketplace
- ✅ CTAs lead to signup/trial flow
- ✅ Benefits are compelling for venue managers
- ✅ Page converts visitors to signups
- ✅ Mobile responsive

---

#### 3.2 Portal Access & Navigation

**Requirements:**

**Current Dashboard Access:**
- URL changes from `/dashboard` to `/portal` or `/manager` (optional)
- OR: Keep `/dashboard` (authenticated users only)
- Public homepage is separate from portal

**Navigation Changes:**

**Top Navigation (Public Site):**
- Logo (links to public homepage)
- Search Venues
- How It Works
- For Venue Managers (dropdown)
  - List Your Venue
  - Manager Login
  - Pricing
- Login/Sign Up (for venue managers)

**Portal Navigation (Authenticated):**
- Logo (links to manager dashboard, not public homepage)
- Sidebar navigation (existing structure)
- User menu: Profile, Settings, Logout
- "View My Public Page" link (opens venue public profile)

**Login Flow:**
- Login page accessible from top nav "Login" link
- After login → Redirect to manager dashboard (`/dashboard`)
- Public pages remain accessible without login

**Acceptance Criteria:**
- ✅ Clear separation between public site and manager portal
- ✅ Unauthenticated users see public homepage by default
- ✅ Authenticated users land in portal dashboard
- ✅ "View My Public Page" opens venue's public profile in new tab
- ✅ Navigation is intuitive on both sides

---

#### 3.3 Lead Management (Enhanced for Public Inquiries)

**Requirements:**

**Lead Sources:**
- Existing: Manual, referral, etc.
- New: "Public Inquiry" (from marketplace inquiry form)

**Lead Record (from Public Inquiry):**
- All fields captured in inquiry form
- Source: "Public Inquiry - Marketplace"
- Priority score: Calculated based on event details
- Status: "New"
- Assigned to: Venue owner (default)

**Lead Notification:**
- Email to venue manager:
  - Subject: "🔥 New Inquiry: {Event Type} - {Guest Count} guests"
  - Body: Event details, contact info, link to lead
- In-app notification (real-time)
- SMS (optional, for high-priority leads)

**Lead Detail Page:**
- Shows all inquiry form data
- Contact card (name, email, phone)
- Event card (type, date, guests, budget, description)
- Source: "Public Inquiry from Marketplace"
- Actions:
  - Send Proposal
  - Schedule Tour
  - Send Email
  - Mark as Won/Lost
  - Add Notes

**Response Templates:**
- Pre-built email templates for common responses:
  - "Thank you for your inquiry"
  - "We're available on your date"
  - "Sorry, we're booked on that date"
  - "Here's our pricing information"

**Follow-Up Automation:**
- Auto-send "thank you" email to inquirer (venue manager can customize)
- Reminder to venue manager if no response in 24 hours

**Acceptance Criteria:**
- ✅ Public inquiries create leads in dashboard
- ✅ Venue manager receives notification within 30 seconds
- ✅ Lead detail shows all inquiry information
- ✅ Response templates save time
- ✅ Follow-up reminders work correctly

---

#### 3.4 Public Listing Management

**Requirements:**

**Access:**
- Dashboard → My Venues → [Select Venue] → "Manage Public Listing"
- Or: Dashboard → "Public Page" tab

**Settings:**

**Listing Visibility:**
- Toggle: "Show on public marketplace"
  - ON: Venue appears in search results
  - OFF: Venue hidden from marketplace (direct link only)

**Search Optimization:**
- Featured listing (premium tier): Appears higher in search
- Keywords: Tags for better search matching
- SEO settings (covered in existing PRD)

**Inquiry Settings:**
- Auto-respond: Toggle to send auto-reply to inquiries
- Custom auto-reply message (editable)
- Response time goal: 24h, 48h, etc. (shown to inquirers)

**Preview & Analytics:**
- "Preview Public Listing" button → Opens venue page in new tab
- Analytics: Views, inquiries, conversion rate (from existing PRD)

**Acceptance Criteria:**
- ✅ Visibility toggle works (venue appears/disappears from search)
- ✅ Preview shows exactly what public sees
- ✅ Settings save successfully
- ✅ Analytics track marketplace-specific metrics

---

### PART 4: Technical Implementation

#### 4.1 Routing & Navigation Changes

**Requirements:**

**URL Structure:**

**Public Site (No Auth):**
- `/` → Public marketplace homepage
- `/venues` → Search results page
- `/venues?location=X&date=Y&guests=Z` → Filtered search
- `/{venue-slug}` OR `/venues/{venue-slug}` → Venue detail page
- `/for-venues` → Venue manager landing page
- `/how-it-works` → Explainer page
- `/login` → Venue manager login
- `/signup` → Venue manager signup

**Manager Portal (Auth Required):**
- `/dashboard` → Manager dashboard (existing)
- `/dashboard/events` → Events management (existing)
- `/dashboard/vendors` → Vendors (existing)
- `/dashboard/leads` → Leads (enhanced with public inquiries)
- `/dashboard/public-listing` → Manage public venue page
- `/dashboard/settings` → Settings

**Redirects:**
- Root `/` (if authenticated) → `/dashboard` OR stay on public homepage (decision needed)
- `/login` (if already authenticated) → `/dashboard`

**Acceptance Criteria:**
- ✅ Public routes accessible without login
- ✅ Manager routes require authentication
- ✅ Clean URL structure (no ugly query strings)
- ✅ SEO-friendly URLs
- ✅ Redirects work correctly

---

#### 4.2 Database Schema Updates

**New Tables:**

**venue_public_settings:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- is_visible_on_marketplace (boolean, default: true)
- featured (boolean, default: false) -- premium feature
- search_keywords (text[]) -- array of keywords
- auto_respond_enabled (boolean)
- auto_respond_message (text)
- response_time_goal (text) -- "24 hours", "48 hours"
- created_at, updated_at
```

**venue_page_views:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- viewed_at (timestamp)
- ip_address (text) -- hashed for privacy
- referrer (text) -- where they came from
- user_agent (text)
```

**venue_search_queries:**
```sql
- id (uuid, PK)
- search_query (text)
- location (text)
- guest_count (integer)
- event_type (text)
- date (date)
- results_count (integer)
- created_at (timestamp)
```

**Updated Tables:**

**leads:**
- Add column: `source` (enum) - Add "public_inquiry"
- Add column: `marketplace_inquiry_data` (jsonb) - Store inquiry form data

**venues:**
- Add column: `view_count` (integer, default: 0)
- Add column: `inquiry_count` (integer, default: 0)

**Indexes:**
```sql
CREATE INDEX idx_venues_visible ON venues(page_status)
  WHERE page_status = 'published';

CREATE INDEX idx_venues_location ON venues
  USING gist(location); -- for geo search

CREATE INDEX idx_venues_capacity ON venues(capacity);

CREATE INDEX idx_leads_source ON leads(source);
```

**Acceptance Criteria:**
- ✅ Schema migrations run successfully
- ✅ Indexes improve query performance
- ✅ Data integrity maintained

---

#### 4.3 Search & Filter Implementation

**Requirements:**

**Search Algorithm:**

**Query Structure:**
```sql
SELECT * FROM venues
WHERE
  page_status = 'published'
  AND is_visible_on_marketplace = true
  AND (
    -- Location filter
    city ILIKE '%{location}%'
    OR state ILIKE '%{location}%'
    OR zip_code = '{zip}'
  )
  AND (
    -- Capacity filter
    capacity >= {guest_count}
  )
  AND (
    -- Event type filter
    event_types @> ARRAY['{event_type}']
  )
  AND (
    -- Availability filter (if date provided)
    NOT EXISTS (
      SELECT 1 FROM events
      WHERE events.venue_id = venues.id
      AND events.event_date = '{date}'
      AND events.status IN ('confirmed', 'in_progress')
    )
  )
ORDER BY
  CASE WHEN {sort} = 'price_low' THEN base_price ASC
  CASE WHEN {sort} = 'price_high' THEN base_price DESC
  CASE WHEN {sort} = 'capacity_large' THEN capacity DESC
  ELSE view_count DESC -- Relevance/popularity
  END
LIMIT 24 OFFSET {page * 24};
```

**Search Optimizations:**
- Cache popular search results (Redis, 5 min TTL)
- Elasticsearch/Algolia integration (future) for faster search
- Debounce filter inputs (wait 300ms before searching)

**Geo Search (Future Enhancement):**
- Store lat/lng in venues table
- Use PostGIS for distance calculations
- Filter by radius: "Within 25 miles of Dallas"

**Acceptance Criteria:**
- ✅ Search returns results in <500ms
- ✅ Filters combine correctly (AND logic)
- ✅ Sort options work correctly
- ✅ Pagination works
- ✅ No N+1 query issues

---

#### 4.4 Analytics & Tracking

**Requirements:**

**Public Site Analytics:**

**Track:**
- Homepage views
- Search queries (what people search for)
- Venue page views (per venue)
- Inquiry form submissions
- Click-through rate: Search result → Venue page

**Per Venue (Manager Dashboard):**
- Views from marketplace
- Inquiries from marketplace
- Conversion rate: Views → Inquiries
- Top search keywords that led to venue
- Geographic sources (where inquirers are from)

**Platform-Wide (Admin Dashboard):**
- Total marketplace searches
- Top searched locations
- Top searched event types
- Conversion funnel: Homepage → Search → Venue Page → Inquiry

**Implementation:**
- Use PostHog, Plausible, or custom tracking
- No PII tracking (GDPR compliant)
- Event tracking:
  - `marketplace_search`
  - `venue_view`
  - `inquiry_submitted`

**Acceptance Criteria:**
- ✅ Analytics data is accurate
- ✅ Venue managers can see their marketplace performance
- ✅ Tracking is privacy-compliant
- ✅ Reports are actionable

---

### PART 5: Migration & Launch Strategy

#### 5.1 Migration Plan

**Phase 1: Parallel Development (Weeks 1-2)**
- Build public homepage (new route `/`)
- Build search results page (`/venues`)
- Build venue detail page (reuse existing public page from NEW_PRD.md)
- Build inquiry form
- Keep existing landing page at `/for-venues` temporarily

**Phase 2: Data Preparation (Week 3)**
- Ensure all venues have required fields for public listing
- Upload photos for venues that don't have them
- Set default pricing visibility settings
- Enable marketplace visibility for opted-in venues

**Phase 3: Soft Launch (Week 4)**
- Deploy public marketplace (hidden, no external links)
- Test with internal team
- Share with 10 friendly venue managers for feedback
- Collect feedback, fix bugs

**Phase 4: Full Launch (Week 5)**
- Switch root `/` to public marketplace homepage
- Redirect old landing page to `/for-venues`
- Update all navigation
- Announce to existing customers
- Marketing push (email, social, blog)

**Phase 5: Optimization (Week 6+)**
- Monitor analytics
- A/B test homepage variants
- Optimize search algorithm
- Improve conversion rates

**Rollback Plan:**
- If major issues: Temporarily redirect `/` back to old landing page
- Fix issues in staging
- Re-deploy when stable

**Acceptance Criteria:**
- ✅ Zero downtime during migration
- ✅ All existing functionality works
- ✅ Venue managers notified of changes
- ✅ Public marketplace is live and functional

---

#### 5.2 Content & SEO Strategy

**Requirements:**

**Homepage SEO:**
- Title: "Find Event Venues | VenueAssistant"
- Meta description: "Discover and book the perfect venue for your wedding, corporate event, or party. Browse hundreds of venues, check availability, and get instant quotes."
- H1: "Find Your Perfect Event Venue"
- Target keywords:
  - "event venue finder"
  - "book event venue online"
  - "find wedding venues"
  - "corporate event spaces"

**Venue Pages SEO:**
- Title: "{Venue Name} - {Event Types} in {City}, {State}"
- Meta description: Auto-generated from venue description
- Schema.org markup: EventVenue, Place
- Local SEO: NAP (Name, Address, Phone) consistency

**City/Category Pages (Future):**
- Create landing pages for popular searches:
  - "/venues/dallas"
  - "/venues/wedding-venues"
  - "/venues/corporate-event-spaces-austin"
- Helps with SEO and organic traffic

**Content Marketing:**
- Blog posts: "How to Choose a Wedding Venue in Dallas"
- Venue spotlights: Feature venues on social media
- Email marketing: "New venues added in your city"

**Acceptance Criteria:**
- ✅ All pages have proper meta tags
- ✅ Schema markup validates
- ✅ Pages indexed by Google within 48 hours
- ✅ Homepage targets correct keywords

---

#### 5.3 Communication Plan

**Requirements:**

**To Existing Venue Manager Customers:**

**Email Announcement:**
- Subject: "🎉 Big News: We're Now a Marketplace!"
- Content:
  - Explain the change (public marketplace launch)
  - Benefits for them (more leads, more visibility)
  - What they need to do:
    - Review public listing settings
    - Upload photos if missing
    - Set pricing visibility preferences
  - CTA: "Optimize Your Listing"
- Timeline: Send 1 week before launch

**In-App Notification:**
- Banner in dashboard:
  - "Your venue is now listed on our public marketplace! [Optimize Listing]"
- Modal on login (first time after launch):
  - Explain new marketplace
  - Encourage them to optimize listing

**Help Resources:**
- Knowledge base article: "How the Marketplace Works"
- Video tutorial: "Optimizing Your Public Listing"
- Webinar: "Getting More Bookings from the Marketplace"

**To Venue Seekers (New Audience):**

**Launch Marketing:**
- Social media posts (Instagram, Facebook, LinkedIn)
- Google Ads (target event planning keywords)
- Partner with event planning blogs/influencers
- Press release: "New Event Venue Marketplace Launches"

**Ongoing Marketing:**
- SEO content (blog posts, guides)
- Email newsletter (venue inspiration, tips)
- Retargeting ads (for visitors who searched but didn't inquire)

**Acceptance Criteria:**
- ✅ All customers notified before launch
- ✅ Help resources available
- ✅ Marketing campaigns running
- ✅ Feedback channels open

---

## User Stories

### For Venue Seekers

**Story 1: Discovering Venues**
> As an event planner, I want to search for venues by location and capacity, so that I can find options that fit my event needs.

**Acceptance Criteria:**
- Can search by city and guest count
- Results show relevant venues
- Can filter by event type, amenities, price

**Story 2: Comparing Options**
> As an event planner, I want to view detailed information about each venue, so that I can compare them and make an informed decision.

**Acceptance Criteria:**
- Venue page shows photos, capacity, amenities, pricing
- Can see availability calendar
- Can view reviews/testimonials

**Story 3: Contacting Venues**
> As an event planner, I want to submit an inquiry without creating an account, so that I can quickly reach out to multiple venues.

**Acceptance Criteria:**
- Inquiry form is simple and quick
- No account required
- Confirmation email sent
- Venue responds within stated timeframe

---

### For Venue Managers

**Story 4: Getting Discovered**
> As a venue manager, I want my venue to appear in marketplace search results, so that I can get more inquiries from potential customers.

**Acceptance Criteria:**
- Venue appears in search when relevant filters match
- Can optimize listing for better visibility
- Analytics show search impressions

**Story 5: Managing Inquiries**
> As a venue manager, I want to receive and respond to marketplace inquiries, so that I can convert them into bookings.

**Acceptance Criteria:**
- Notified immediately when inquiry arrives
- Can view inquiry details in dashboard
- Can respond quickly with templates or custom message

**Story 6: Tracking Performance**
> As a venue manager, I want to see how my public listing is performing, so that I can optimize it for more bookings.

**Acceptance Criteria:**
- Dashboard shows views, inquiries, conversion rate
- Can see which search terms led to views
- Can compare performance month-over-month

---

## Success Metrics

### 3 Months Post-Launch

**Marketplace Adoption:**
- 500+ venue seekers visit homepage per month
- 200+ searches performed per month
- 100+ inquiries submitted per month
- 20+ bookings made through marketplace

**Venue Engagement:**
- 70%+ of venues opt-in to marketplace visibility
- 50%+ of venues have optimized listings (photos, pricing)
- 30%+ of venues receive at least 1 inquiry per month

**Conversion Funnel:**
- Homepage → Search: 40%
- Search → Venue Page: 25%
- Venue Page → Inquiry: 10%
- Inquiry → Booking: 15-20%
- Overall: 0.15-0.2% homepage view → booking

**Business Impact:**
- 30% increase in new venue manager signups (marketplace drives awareness)
- 10% increase in revenue (more active users)
- Customer retention improves (venues see value in marketplace)

---

### 6 Months Post-Launch

**Growth:**
- 2,000+ unique visitors per month
- 50+ new venues added to marketplace
- Top 3 in Google for target keywords (by city)

**Network Effects:**
- More venues → More venue seekers
- More venue seekers → More venues join
- Positive feedback loop established

---

## Risks & Mitigation

### Risk 1: Low Venue Participation

**Impact:** High - Marketplace fails if venues don't opt-in

**Mitigation:**
- Make opt-in default (venues must opt-out)
- Show data: "Venues on marketplace get 3x more inquiries"
- Incentivize: Featured listings for early adopters
- Make setup easy: Pre-fill from existing data

---

### Risk 2: Low Quality Leads

**Impact:** Medium - Venues get spam/unqualified inquiries

**Mitigation:**
- Require all key fields in inquiry form (no optional contact info)
- Spam prevention (honeypot, rate limiting)
- Let venues set qualification criteria
- Show inquiry quality score to venues

---

### Risk 3: Venue Managers Confused by Change

**Impact:** Medium - Churn if change is poorly communicated

**Mitigation:**
- Clear communication before launch
- In-app guidance and tutorials
- Support team ready for questions
- Rollback plan if major backlash

---

### Risk 4: SEO Cannibalization

**Impact:** Low-Medium - Venue's own sites lose rankings

**Mitigation:**
- Use canonical tags if venue has own site
- Unique content on our platform (AI chat, real-time availability)
- Position as complementary, not competitive
- Offer custom domain feature

---

### Risk 5: Scalability Issues

**Impact:** Medium - Site slows down with high traffic

**Mitigation:**
- Load testing before launch
- CDN for images and static assets
- Database query optimization
- Caching for search results
- Monitor performance metrics

---

## Open Questions

1. **Default Visibility:** Should all existing venues be automatically visible on marketplace, or opt-in only?
   - **Recommendation:** Opt-in via email before launch, then default ON for new venues

2. **Pricing Display:** Should we encourage all venues to show pricing, or allow "Request Quote" only?
   - **Recommendation:** Let venues choose, but show data that pricing transparency increases inquiries

3. **Revenue Model:** Do we charge venues for marketplace leads?
   - **Recommendation:** Free for now (included in subscription), potential premium features later (featured listings, priority placement)

4. **Custom Domains:** Should venues be able to use custom domains (events.venuename.com)?
   - **Recommendation:** Phase 2 feature for premium tier

5. **Instant Booking:** Should venue seekers be able to book directly without venue approval?
   - **Recommendation:** No for MVP - inquiries only. Consider for Phase 2 with deposit/payment system

---

## Conclusion

This PRD outlines the transformation of VenueAssistant from a B2B tool to a **two-sided marketplace** that brings value to both venue seekers and venue managers.

**Key Changes:**
1. **Public homepage** becomes a marketplace for venue seekers (not a B2B sales page)
2. **Search & discovery** features allow anyone to find and contact venues
3. **No account required** for venue seekers (frictionless inquiries)
4. **Venue manager landing page** moves to `/for-venues` or `/business`
5. **Existing dashboard** becomes the manager portal with enhanced lead management

**Strategic Benefits:**
- **Network effects:** More venues attract more seekers, more seekers attract more venues
- **Higher value proposition:** Venues join to get customers, not just tools
- **Competitive moat:** Marketplace is harder to replicate than SaaS tool
- **Revenue growth:** More signups from marketplace awareness

**Timeline:** 4-6 weeks to MVP launch

---

**Document Status:** ✅ Ready for Development
**Last Updated:** February 14, 2026
**Version:** 1.0
