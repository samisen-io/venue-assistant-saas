# VenueManager Micro-SaaS - Product Requirements Document
## For Claude Code Implementation

---

## PROJECT OVERVIEW

**Product Name**: VenueManager  
**Type**: Micro-SaaS Web Application  
**Target Users**: Event venue managers (hotels, banquet halls, conference centers)  
**Core Value**: Streamline vendor coordination, budget tracking, and performance management for venue events

**Tech Stack**:
- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel
- **Emails**: Resend (optional for MVP)

---

## MVP FEATURE SET

### **Phase 1 Features (Build First)**

1. **Authentication & Onboarding**
2. **Venue Management** (multi-tenant support)
3. **Event Management** (CRUD + dashboard)
4. **Vendor Database** (CRUD + categorization)
5. **Vendor Matching Engine** (score-based recommendations)
6. **Budget Tracking** (real-time variance)
7. **Vendor Performance Tracking** (post-event ratings)

### **Out of Scope for MVP**
- Timeline generation (Phase 2)
- Communication hub/email templates (Phase 2)
- Advanced reporting/analytics (Phase 2)
- Mobile app (Phase 2)
- AI-powered matching (Phase 2 - use simple algorithm first)

---

## DATABASE SCHEMA

```sql
-- Users table (managed by Supabase Auth)
-- We'll extend with a profiles table

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues (multi-tenant: one user can manage multiple venues)
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  capacity INTEGER,
  venue_type TEXT, -- hotel, banquet_hall, conference_center, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors (belongs to a venue)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- catering, av, florals, parking, security, entertainment
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  cost_structure TEXT, -- per_person, flat_rate, hourly
  cost_per_unit DECIMAL(10,2), -- cost per person/hour/event
  website TEXT,
  notes TEXT,
  
  -- Performance metrics (calculated fields)
  reliability_score INTEGER DEFAULT 0, -- 0-100
  total_events INTEGER DEFAULT 0,
  on_time_count INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 0,
  avg_quality_rating DECIMAL(3,2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- gala, wedding, conference, corporate, party
  event_date DATE NOT NULL,
  event_time TIME,
  guest_count INTEGER NOT NULL,
  
  -- Budget
  budget_total DECIMAL(10,2) NOT NULL,
  budget_breakdown JSONB DEFAULT '{}', -- { "catering": 5000, "av": 2000, ... }
  actual_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'planning', -- planning, confirmed, in_progress, completed, cancelled
  
  -- Additional info
  description TEXT,
  special_requirements TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event-Vendor Assignments (many-to-many)
CREATE TABLE event_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  
  category TEXT NOT NULL, -- catering, av, etc.
  assignment_type TEXT DEFAULT 'primary', -- primary, backup
  
  -- Costs for this specific assignment
  quoted_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Confirmation status
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, vendor_id)
);

-- Vendor Performance Reviews (post-event)
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  
  -- Performance ratings
  on_time BOOLEAN,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  cost_accurate BOOLEAN,
  would_use_again BOOLEAN,
  
  -- Notes
  notes TEXT,
  
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, vendor_id)
);

-- Indexes for performance
CREATE INDEX idx_venues_owner ON venues(owner_id);
CREATE INDEX idx_vendors_venue ON vendors(venue_id);
CREATE INDEX idx_vendors_category ON vendors(venue_id, category);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_vendors_event ON event_vendors(event_id);
CREATE INDEX idx_event_vendors_vendor ON event_vendors(vendor_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Venues: Users can only access their own venues
CREATE POLICY "Users can view own venues" ON venues
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own venues" ON venues
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own venues" ON venues
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own venues" ON venues
  FOR DELETE USING (auth.uid() = owner_id);

-- Vendors: Users can only access vendors for their venues
CREATE POLICY "Users can view vendors for own venues" ON vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert vendors for own venues" ON vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update vendors for own venues" ON vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete vendors for own venues" ON vendors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );

-- Similar policies for events, event_vendors, and vendor_reviews
-- (Follow same pattern: check venue ownership through joins)
```

---

## APPLICATION STRUCTURE

```
venue-assistant/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Main dashboard (events overview)
│   │   ├── events/
│   │   │   ├── page.tsx                 # Events list
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Create new event
│   │   │   └── [eventId]/
│   │   │       ├── page.tsx             # Event detail view
│   │   │       ├── edit/
│   │   │       │   └── page.tsx         # Edit event
│   │   │       ├── vendors/
│   │   │       │   └── page.tsx         # Vendor matching for event
│   │   │       └── budget/
│   │   │           └── page.tsx         # Budget tracking for event
│   │   ├── vendors/
│   │   │   ├── page.tsx                 # Vendors list
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Add new vendor
│   │   │   └── [vendorId]/
│   │   │       ├── page.tsx             # Vendor profile
│   │   │       └── edit/
│   │   │           └── page.tsx         # Edit vendor
│   │   ├── venues/
│   │   │   ├── page.tsx                 # Venues list
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Add new venue
│   │   │   └── [venueId]/
│   │   │       ├── page.tsx             # Venue details
│   │   │       └── edit/
│   │   │           └── page.tsx         # Edit venue
│   │   ├── settings/
│   │   │   └── page.tsx                 # User settings
│   │   └── layout.tsx                   # Dashboard layout (sidebar)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts             # Supabase auth callback
│   │   ├── events/
│   │   │   ├── route.ts                 # GET /api/events, POST /api/events
│   │   │   └── [eventId]/
│   │   │       ├── route.ts             # GET/PUT/DELETE /api/events/:id
│   │   │       ├── vendors/
│   │   │       │   └── route.ts         # Match vendors to event
│   │   │       └── budget/
│   │   │           └── route.ts         # Budget operations
│   │   ├── vendors/
│   │   │   ├── route.ts                 # GET /api/vendors, POST /api/vendors
│   │   │   └── [vendorId]/
│   │   │       ├── route.ts             # GET/PUT/DELETE /api/vendors/:id
│   │   │       └── reviews/
│   │   │           └── route.ts         # POST vendor review
│   │   ├── venues/
│   │   │   ├── route.ts                 # GET /api/venues, POST /api/venues
│   │   │   └── [venueId]/
│   │   │       └── route.ts             # GET/PUT/DELETE /api/venues/:id
│   │   └── profile/
│   │       └── route.ts                 # GET/PUT /api/profile
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   └── globals.css
├── components/
│   ├── ui/                              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventList.tsx
│   │   └── EventStatusBadge.tsx
│   ├── vendors/
│   │   ├── VendorCard.tsx
│   │   ├── VendorForm.tsx
│   │   ├── VendorList.tsx
│   │   ├── VendorMatchList.tsx          # Shows ranked vendors for event
│   │   └── VendorReliabilityScore.tsx
│   ├── budget/
│   │   ├── BudgetSummary.tsx
│   │   ├── BudgetBreakdown.tsx
│   │   └── BudgetAlert.tsx
│   └── shared/
│       ├── Loading.tsx
│       ├── EmptyState.tsx
│       └── ErrorMessage.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser client
│   │   ├── server.ts                    # Server client
│   │   └── middleware.ts                # Auth middleware
│   ├── utils/
│   │   ├── cn.ts                        # className utility
│   │   ├── format.ts                    # Date/number formatting
│   │   └── validation.ts                # Form validation helpers
│   ├── algorithms/
│   │   ├── vendorMatching.ts            # Vendor matching algorithm
│   │   └── budgetCalculations.ts        # Budget variance calculations
│   └── types/
│       └── database.types.ts            # TypeScript types from Supabase
├── hooks/
│   ├── useEvents.ts
│   ├── useVendors.ts
│   ├── useVenues.ts
│   └── useUser.ts
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## DETAILED FEATURE SPECIFICATIONS

### **1. Authentication & Onboarding**

#### **Sign Up Flow**
```tsx
// app/(auth)/signup/page.tsx

- Email/password sign up form
- Fields: email, password, confirm password, full name
- Submit → Create Supabase user → Redirect to venue setup

POST /api/auth/signup
{
  email: string
  password: string
  full_name: string
}

On success:
- Create profile in profiles table
- Redirect to /onboarding/venue-setup
```

#### **Login Flow**
```tsx
// app/(auth)/login/page.tsx

- Email/password login form
- "Forgot password" link
- Submit → Supabase auth → Redirect to /dashboard

POST /api/auth/login
{
  email: string
  password: string
}

On success:
- Set session cookie
- Redirect to /dashboard
```

#### **Onboarding**
```tsx
// app/onboarding/venue-setup/page.tsx

First-time user wizard:
Step 1: Create your first venue
- Venue name
- Address
- Capacity
- Type (dropdown)

Step 2: (Optional) Add your first vendor
- Skip or quick-add form

On complete → Redirect to /dashboard
```

---

### **2. Dashboard (Main View)**

```tsx
// app/(dashboard)/dashboard/page.tsx

Layout:
┌─────────────────────────────────────┐
│ Welcome back, [Name]                │
│ [Selected Venue Dropdown]           │
├─────────────────────────────────────┤
│ STATS ROW                           │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Events│ │Active│ │Budget│         │
│ │This  │ │Vendors│ │Track │         │
│ │Month │ │      │ │      │         │
│ └──────┘ └──────┘ └──────┘         │
├─────────────────────────────────────┤
│ UPCOMING EVENTS                     │
│ ┌─────────────────────────────────┐ │
│ │ [Event Card]                    │ │
│ │ Wedding - May 20, 2024          │ │
│ │ 200 guests | $30,000 budget     │ │
│ │ Status: Planning                │ │
│ │ [View Details] [Match Vendors]  │ │
│ └─────────────────────────────────┘ │
│ [+ Create New Event]                │
└─────────────────────────────────────┘

Data fetching:
- GET /api/events?venue_id={id}&status=planning,confirmed
- Show next 5 upcoming events
- Quick actions: Create event, View all events
```

---

### **3. Event Management**

#### **Events List Page**
```tsx
// app/(dashboard)/events/page.tsx

Features:
- Table view of all events
- Filters: Status (planning, confirmed, completed), Date range
- Sort: By date, by name, by guest count
- Search: By event name
- Actions per row: View, Edit, Delete

Columns:
- Event Name
- Type (badge)
- Date
- Guests
- Budget
- Status (badge with color)
- Actions (dropdown menu)

GET /api/events?venue_id={id}&status={status}&search={query}
```

#### **Create Event Form**
```tsx
// app/(dashboard)/events/new/page.tsx

Form fields:
- Event Name* (text)
- Event Type* (select: gala, wedding, conference, corporate, party, other)
- Event Date* (date picker)
- Event Time (time picker)
- Guest Count* (number)
- Budget Total* (currency input)
- Description (textarea)
- Special Requirements (textarea)

Validation:
- All * fields required
- Guest count > 0
- Budget > 0
- Date must be in future

On submit:
POST /api/events
{
  venue_id: string
  event_name: string
  event_type: string
  event_date: string (ISO)
  event_time: string (HH:MM)
  guest_count: number
  budget_total: number
  description: string
  special_requirements: string
}

On success → Redirect to /events/[eventId]
```

#### **Event Detail Page**
```tsx
// app/(dashboard)/events/[eventId]/page.tsx

Layout:
┌─────────────────────────────────────┐
│ HEADER                              │
│ [Event Name]                        │
│ [Edit] [Delete] [Complete Event]    │
├─────────────────────────────────────┤
│ EVENT INFO CARD                     │
│ Type: Gala                          │
│ Date: May 20, 2024                  │
│ Guests: 200                         │
│ Status: Planning                    │
├─────────────────────────────────────┤
│ BUDGET SUMMARY                      │
│ Total: $30,000                      │
│ Spent: $12,500                      │
│ Remaining: $17,500                  │
│ [View Detailed Budget →]            │
├─────────────────────────────────────┤
│ ASSIGNED VENDORS                    │
│ ┌─────────────────────────────────┐ │
│ │ Catering: Premier Catering      │ │
│ │ Quoted: $5,000 | Confirmed ✓    │ │
│ │ [View Profile] [Remove]         │ │
│ └─────────────────────────────────┘ │
│ [+ Match More Vendors]              │
├─────────────────────────────────────┤
│ ACTIONS                             │
│ [Complete Event & Review Vendors]   │
└─────────────────────────────────────┘

GET /api/events/[eventId]
GET /api/events/[eventId]/vendors (assigned vendors)
```

---

### **4. Vendor Management**

#### **Vendors List**
```tsx
// app/(dashboard)/vendors/page.tsx

Features:
- Card grid or table view toggle
- Filter by category
- Search by name
- Sort by reliability score, name, or category

Each vendor card shows:
- Vendor name
- Category badge
- Reliability score (0-100) with visual indicator
- Contact email
- Cost structure
- [View Profile] button

GET /api/vendors?venue_id={id}&category={cat}&search={query}
```

#### **Add Vendor Form**
```tsx
// app/(dashboard)/vendors/new/page.tsx

Form fields:
- Vendor Name* (text)
- Category* (select: catering, av, florals, parking, security, entertainment, other)
- Contact Name (text)
- Contact Email* (email)
- Contact Phone (tel)
- Cost Structure (select: per_person, flat_rate, hourly)
- Cost Per Unit (currency)
- Website (url)
- Notes (textarea)

POST /api/vendors
{
  venue_id: string
  name: string
  category: string
  contact_name: string
  contact_email: string
  contact_phone: string
  cost_structure: string
  cost_per_unit: number
  website: string
  notes: string
}
```

#### **Vendor Profile Page**
```tsx
// app/(dashboard)/vendors/[vendorId]/page.tsx

Sections:
1. Vendor Info Card
   - Name, category, contact info
   - Website link
   - Notes

2. Performance Metrics
   - Reliability Score: [85/100] (visual gauge)
   - Total Events: 24
   - On-Time Rate: 92%
   - Avg Quality Rating: 4.5/5 ⭐

3. Event History
   - Table of events this vendor worked on
   - Columns: Event Name, Date, Review, Rating

4. Actions
   - [Edit Vendor]
   - [Archive Vendor]

GET /api/vendors/[vendorId]
GET /api/vendors/[vendorId]/reviews
```

---

### **5. Vendor Matching Engine**

```tsx
// app/(dashboard)/events/[eventId]/vendors/page.tsx

Purpose: Match vendors to an event based on category needs

UI Flow:
1. Select categories needed (multi-select checkboxes)
   ☐ Catering
   ☐ AV Equipment
   ☐ Florals
   ☐ Parking
   ☐ Security
   ☐ Entertainment

2. Click "Find Vendors"

3. Show ranked results per category:

   CATERING VENDORS
   ┌─────────────────────────────────┐
   │ 🥇 Premier Catering             │
   │ Match Score: 92/100             │
   │ Reliability: 88 | Cost: $25/pp  │
   │ Estimated: $5,000               │
   │ [Assign as Primary]             │
   └─────────────────────────────────┘
   ┌─────────────────────────────────┐
   │ 🥈 Delicious Events             │
   │ Match Score: 78/100             │
   │ Reliability: 75 | Cost: $22/pp  │
   │ Estimated: $4,400               │
   │ [Assign as Backup]              │
   └─────────────────────────────────┘

4. Assign vendors → Add to event_vendors table

Algorithm (in lib/algorithms/vendorMatching.ts):
```typescript
function calculateMatchScore(
  vendor: Vendor,
  event: Event
): number {
  // Reliability factor (40% weight)
  const reliabilityScore = vendor.reliability_score || 0;
  
  // Cost fit (30% weight)
  const estimatedCost = vendor.cost_per_unit * event.guest_count;
  const budgetPerVendor = event.budget_total / 5; // Assume 5 vendor categories
  const costFit = Math.min(100, (budgetPerVendor / estimatedCost) * 100);
  
  // Experience factor (20% weight)
  const experienceScore = Math.min(100, vendor.total_events * 5);
  
  // On-time history (10% weight)
  const onTimeScore = vendor.on_time_percentage || 50;
  
  const matchScore = 
    (reliabilityScore * 0.4) +
    (costFit * 0.3) +
    (experienceScore * 0.2) +
    (onTimeScore * 0.1);
  
  return Math.round(matchScore);
}
```

API Endpoint:
```typescript
// app/api/events/[eventId]/vendors/route.ts

POST /api/events/[eventId]/vendors/match
{
  categories: string[] // ["catering", "av", "florals"]
}

Response:
{
  matches: {
    catering: [
      {
        vendor_id: string
        name: string
        reliability_score: number
        estimated_cost: number
        match_score: number
        recommendation: "PRIMARY" | "BACKUP"
      }
    ],
    av: [...],
    florals: [...]
  }
}
```

---

### **6. Budget Tracking**

```tsx
// app/(dashboard)/events/[eventId]/budget/page.tsx

Layout:
┌─────────────────────────────────────┐
│ BUDGET OVERVIEW                     │
│ Total Budget: $30,000               │
│ Spent: $12,500 (42%)                │
│ Remaining: $17,500                  │
│ [Progress Bar: ████░░░░░░░]        │
│                                     │
│ ⚠️ Status: ON TRACK                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ BREAKDOWN BY CATEGORY               │
│ ┌─────────────────────────────────┐ │
│ │ Catering                        │ │
│ │ Budgeted: $10,000               │ │
│ │ Quoted: $5,000                  │ │
│ │ Variance: -$5,000 ✅            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ AV Equipment                    │ │
│ │ Budgeted: $5,000                │ │
│ │ Quoted: $6,500                  │ │
│ │ Variance: +$1,500 ⚠️            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Features:
- Auto-calculate budget breakdown from assigned vendors
- Show variance alerts (>10% over = red, 5-10% = yellow)
- Update actual costs after event
- Export to PDF

GET /api/events/[eventId]/budget

Response:
{
  budget_total: number
  breakdown: {
    catering: {
      budgeted: number
      quoted: number
      actual: number (after event)
      variance: number
    }
  }
  total_quoted: number
  total_actual: number
  variance_percentage: number
  status: "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET"
}
```

---

### **7. Vendor Performance Tracking**

```tsx
// After event completion, prompt user to review vendors

Modal/Page:
┌─────────────────────────────────────┐
│ REVIEW VENDORS FOR [Event Name]    │
│                                     │
│ Vendor: Premier Catering            │
│                                     │
│ Was delivery on time?               │
│ ◉ Yes  ○ No                         │
│                                     │
│ Quality Rating (1-5 stars)          │
│ ⭐⭐⭐⭐⭐                            │
│                                     │
│ Was quoted cost accurate?           │
│ ◉ Yes  ○ No                         │
│                                     │
│ Would you use again?                │
│ ◉ Yes  ○ No                         │
│                                     │
│ Notes (optional)                    │
│ [                                 ] │
│                                     │
│ [Submit Review] [Skip]              │
└─────────────────────────────────────┘

POST /api/vendors/[vendorId]/reviews
{
  event_id: string
  on_time: boolean
  quality_rating: number (1-5)
  cost_accurate: boolean
  would_use_again: boolean
  notes: string
}

On submit:
1. Insert into vendor_reviews table
2. Update vendor performance metrics:
   - Increment total_events
   - Update on_time_count if on_time = true
   - Recalculate on_time_percentage
   - Update avg_quality_rating
   - Recalculate reliability_score

Reliability Score Formula:
reliability_score = 
  (on_time_percentage * 0.4) +
  (avg_quality_rating / 5 * 100 * 0.4) +
  (consistency_bonus * 0.2)

where consistency_bonus = min(20, total_events)
```

---

## API ROUTES SPECIFICATION

### **Events API**

```typescript
// app/api/events/route.ts

GET /api/events?venue_id={id}&status={status}
Response: Event[]

POST /api/events
Body: CreateEventInput
Response: Event

// app/api/events/[eventId]/route.ts

GET /api/events/[eventId]
Response: Event

PUT /api/events/[eventId]
Body: UpdateEventInput
Response: Event

DELETE /api/events/[eventId]
Response: { success: boolean }

// app/api/events/[eventId]/vendors/route.ts

GET /api/events/[eventId]/vendors
Response: EventVendor[]

POST /api/events/[eventId]/vendors/match
Body: { categories: string[] }
Response: VendorMatchResult

POST /api/events/[eventId]/vendors/assign
Body: { vendor_id: string, category: string, assignment_type: string, quoted_cost: number }
Response: EventVendor

// app/api/events/[eventId]/budget/route.ts

GET /api/events/[eventId]/budget
Response: BudgetSummary
```

### **Vendors API**

```typescript
// app/api/vendors/route.ts

GET /api/vendors?venue_id={id}&category={cat}
Response: Vendor[]

POST /api/vendors
Body: CreateVendorInput
Response: Vendor

// app/api/vendors/[vendorId]/route.ts

GET /api/vendors/[vendorId]
Response: Vendor

PUT /api/vendors/[vendorId]
Body: UpdateVendorInput
Response: Vendor

DELETE /api/vendors/[vendorId]
Response: { success: boolean }

// app/api/vendors/[vendorId]/reviews/route.ts

GET /api/vendors/[vendorId]/reviews
Response: VendorReview[]

POST /api/vendors/[vendorId]/reviews
Body: CreateReviewInput
Response: VendorReview
```

### **Venues API**

```typescript
// app/api/venues/route.ts

GET /api/venues
Response: Venue[]

POST /api/venues
Body: CreateVenueInput
Response: Venue

// app/api/venues/[venueId]/route.ts

GET /api/venues/[venueId]
Response: Venue

PUT /api/venues/[venueId]
Body: UpdateVenueInput
Response: Venue

DELETE /api/venues/[venueId]
Response: { success: boolean }
```

---

## STYLING & UI GUIDELINES

### **Design System**

**Colors (Tailwind)**:
```
Primary: blue-600
Secondary: slate-600
Success: green-600
Warning: yellow-600
Error: red-600
Background: slate-50
Card: white
Border: slate-200
```

**Typography**:
- Headings: font-semibold
- Body: font-normal
- Small text: text-sm text-slate-600

**Components (shadcn/ui)**:
Install these:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
```

**Layout**:
- Sidebar navigation (fixed left)
- Main content area with max-width container
- Cards with shadow-sm border rounded-lg
- Consistent spacing (p-4, p-6, p-8)

---

## ENVIRONMENT VARIABLES

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Email (for Phase 2)
# RESEND_API_KEY=re_...
```

---

## DEVELOPMENT WORKFLOW

### **Step 1: Project Setup**
```bash
npx create-next-app@latest venue-assistant --typescript --tailwind --app
cd venue-assistant
npm install @supabase/supabase-js @supabase/ssr
npx shadcn-ui@latest init
```

### **Step 2: Database Setup**
1. Create Supabase project
2. Run SQL schema from above
3. Enable RLS policies
4. Get API keys

### **Step 3: Core Structure**
1. Set up Supabase clients (lib/supabase/)
2. Create auth pages (login, signup)
3. Create dashboard layout with sidebar
4. Add middleware for protected routes

### **Step 4: Feature Development Order**
1. ✅ Auth & onboarding
2. ✅ Venue management (create, list, view)
3. ✅ Vendor management (CRUD)
4. ✅ Event management (CRUD)
5. ✅ Vendor matching algorithm
6. ✅ Budget tracking
7. ✅ Performance reviews

### **Step 5: Testing**
- Test with seed data (create 3-5 vendors, 2-3 events)
- Verify RLS policies work correctly
- Test vendor matching scores
- Verify budget calculations

### **Step 6: Deployment**
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Point to production Supabase instance
```

---

## SUCCESS METRICS FOR MVP

**Functionality**:
- ✅ User can sign up, create venue, add vendors
- ✅ User can create event, match vendors to event
- ✅ Vendor matching shows ranked recommendations
- ✅ Budget tracking shows real-time variance
- ✅ Performance reviews update vendor reliability scores

**Performance**:
- Page load < 2s
- API responses < 500ms
- Optimistic UI updates for mutations

**User Experience**:
- No broken links
- Mobile responsive (works on tablet)
- Form validation with helpful error messages
- Loading states for async operations

---

## FUTURE ENHANCEMENTS (Phase 2)

Not in MVP, but noted for later:
1. Timeline generation with templates
2. Email notifications (vendor briefs, reminders)
3. Advanced reporting & analytics
4. Multi-user access (team collaboration)
5. Payment tracking integration
6. Document uploads (contracts, quotes)
7. Calendar integration
8. Vendor marketplace (public vendor directory)
9. AI-powered recommendations (Claude API)
10. Mobile app (React Native)

---

## IMPORTANT NOTES FOR IMPLEMENTATION

1. **Start Simple**: Don't over-engineer. Get CRUD working first.
2. **Use TypeScript**: Leverage Supabase's auto-generated types.
3. **RLS is Critical**: Test that users can only see their own data.
4. **Error Handling**: Always handle errors gracefully (try/catch, error boundaries).
5. **Loading States**: Show spinners/skeletons while fetching data.
6. **Validation**: Both client-side (React Hook Form + Zod) and server-side.
7. **Mobile First**: Design for mobile, enhance for desktop.
8. **Real Data**: Test with realistic vendor/event data, not just "Test Vendor 1".

---

## QUESTIONS TO RESOLVE DURING DEVELOPMENT

1. Should users be able to share venues with team members? (MVP: No)
2. How to handle vendor cost updates over time? (MVP: Manual edit)
3. Should we track vendor availability/calendar? (MVP: No, Phase 2)
4. Export formats needed? (MVP: Just PDF for budget summary)
5. Payment processing integration? (MVP: No, manual tracking only)

---

This document should give Claude Code everything it needs to build VenueManager MVP. Focus on getting the core workflow functional:

**Event Creation → Vendor Matching → Budget Tracking → Performance Review**

Good luck! 🚀
