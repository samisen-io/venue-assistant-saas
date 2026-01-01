# Venue-to-Spaces Migration Plan

## Problem Statement
The current data model supports **multi-tenant venues** (one user manages multiple separate venues), but the actual use case is:
- **Single Venue per User**: A user manages ONE venue (e.g., "Grand Hotel")
- **Multiple Spaces per Venue**: That venue has multiple bookable spaces (e.g., "Grand Ballroom", "Garden Terrace", "Conference Room A")

## Current Schema Issues

```
profiles (user)
    ↓
venues (WRONG: treated as separate venues)
    ↓
vendors (attached to venue)
    ↓
events (attached to venue)
```

**Current "venues" table represents**: Separate physical locations
**Should represent**: Bookable spaces within a single venue

## Proposed New Schema

```sql
-- NEW: Venue (one per user - the actual physical property)
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE, -- UNIQUE: one venue per user
  name TEXT NOT NULL, -- e.g., "Grand Hotel & Conference Center"
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  venue_type TEXT, -- hotel, banquet_hall, conference_center, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Spaces (formerly called "venues")
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Grand Ballroom", "Garden Terrace"
  capacity INTEGER,
  space_type TEXT, -- ballroom, conference_room, outdoor, garden, etc.
  floor_level TEXT, -- "1st Floor", "Rooftop", etc.
  amenities TEXT[], -- ["AV Equipment", "Stage", "Dance Floor"]
  square_footage INTEGER,
  hourly_rate DECIMAL(10,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UPDATED: Vendors (now attached to venue, not space)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL, -- attached to venue
  -- ... rest remains the same
);

-- UPDATED: Events (now attached to space)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL, -- changed from venue_id
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL, -- for easy querying
  -- ... rest remains the same
);
```

## Migration Strategy

### Option 1: Clean Migration (Recommended if no production data)
1. Drop existing tables
2. Create new schema
3. Update all code references
4. Re-seed demo data

### Option 2: Data-Preserving Migration (If production data exists)
1. Create new `spaces` table
2. Migrate data: `INSERT INTO spaces SELECT id, owner_id AS venue_id, name, capacity... FROM venues`
3. Create new `venues` table with UNIQUE constraint
4. Update foreign keys in `events`, `vendors`, etc.
5. Drop old `venues` table

## Code Changes Required

### 1. Database Schema
- **File**: SQL migration script
- Create `spaces` table
- Update `venues` table to have UNIQUE constraint on `owner_id`
- Update `events.venue_id` → `events.space_id`
- Add `events.venue_id` for convenience queries

### 2. TypeScript Types
- **File**: `lib/types/index.ts`
```typescript
// NEW
export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  // ... venue-level details
}

// RENAMED from Venue
export interface Space {
  id: string;
  venue_id: string;
  name: string;
  capacity?: number;
  space_type?: string;
  // ... space-level details
}

// UPDATED
export interface Event {
  space_id: string; // changed from venue_id
  venue_id: string; // added for queries
  space?: Space; // relation
  // ...
}
```

### 3. API Routes to Update
- `app/api/venues/*` → Manage single venue (update, not CRUD)
- `app/api/spaces/*` → NEW - CRUD for spaces
- `app/api/events/*` → Update to use space_id
- `app/api/vendors/*` → Keep as-is (still attached to venue)

### 4. Components to Update/Create

**Rename/Update:**
- `components/venues/VenueCard.tsx` → `components/spaces/SpaceCard.tsx`
- `components/venues/VenueForm.tsx` → `components/spaces/SpaceForm.tsx`
- `app/(dashboard)/venues/*` → `app/(dashboard)/spaces/*`

**New Components:**
- `components/venues/VenueSettings.tsx` - Edit venue details
- `app/(dashboard)/settings/venue` - Venue settings page

**Update:**
- `components/events/EventForm.tsx` - Change "Select Venue" → "Select Space"
- `components/layout/Sidebar.tsx` - Change "Venues" → "Spaces"

### 5. Pages to Update

| Current Page | New Page | Changes |
|-------------|----------|---------|
| `/venues` | `/spaces` | List all spaces |
| `/venues/new` | `/spaces/new` | Create new space |
| `/venues/[venueId]` | `/spaces/[spaceId]` | Space details |
| `/venues/[venueId]/edit` | `/spaces/[spaceId]/edit` | Edit space |
| `/settings` | `/settings` | Add venue settings section |

### 6. Onboarding Flow Changes

**Current:** User creates profile → Create first venue → Use app
**New:** User creates profile → Setup venue details → Create first space → Use app

Update `app/(dashboard)/onboarding/page.tsx`:
1. Collect venue information (address, phone, etc.)
2. Create single venue record
3. Optionally create first space

### 7. Navigation Changes

**Sidebar:**
```typescript
const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Events", href: "/events", icon: CalendarDays },
  { title: "Spaces", href: "/spaces", icon: Building }, // Changed
  { title: "Vendors", href: "/vendors", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
];
```

### 8. Validation Schema Updates
- `lib/utils/validation.ts`
```typescript
export const venueFormSchema = z.object({
  name: z.string().min(2, 'Venue name required'),
  address: z.string().min(1, 'Address required'),
  // ... required fields for venue
});

export const spaceFormSchema = z.object({
  name: z.string().min(2, 'Space name required'),
  capacity: z.coerce.number().min(1, 'Capacity required'),
  space_type: z.string().min(1, 'Space type required'),
  // ... space-specific fields
});
```

## UX Improvements After Migration

1. **Settings Page**: Add "Venue Information" section to edit venue details
2. **Dashboard**: Show venue name prominently (e.g., "Grand Hotel Dashboard")
3. **Space Selector**: In event creation, dropdown shows "Grand Ballroom (500 capacity)" instead of generic "Venue 1"
4. **Better Context**: Users understand they're managing spaces within their venue

## Benefits of This Change

1. **Clearer Mental Model**: Matches real-world use case
2. **Better UX**: "Create a space" is clearer than "Create a venue"
3. **Accurate Data**: Vendors are venue-wide (not per-space), events are per-space
4. **Simpler Onboarding**: One venue setup, then manage spaces
5. **Future Features**: Can add space calendars, double-booking prevention, etc.

## Implementation Steps

1. **Phase 1: Database Migration**
   - Create migration SQL script
   - Test in development
   - Backup data if needed

2. **Phase 2: Types & API**
   - Update TypeScript types
   - Create new API routes for spaces
   - Update existing API routes

3. **Phase 3: Components**
   - Rename/create components
   - Update forms and cards

4. **Phase 4: Pages**
   - Rename/update page files
   - Update routing

5. **Phase 5: Testing**
   - Test all CRUD operations
   - Verify RLS policies
   - Test onboarding flow

6. **Phase 6: Documentation**
   - Update CLAUDE.md
   - Update PRD
   - Update README

## Rollback Plan

If migration fails:
1. Restore database from backup
2. Revert code changes via git
3. Redeploy previous version

## Questions to Resolve

1. **Venue Setup**: Should venue setup be during signup or post-signup?
2. **Default Space**: Should we auto-create a default space on venue creation?
3. **Space Types**: What are the standard space types? (ballroom, conference_room, outdoor, etc.)
4. **Amenities**: Should we have a predefined list or free text?
5. **Existing Data**: Do we need to preserve any existing data or can we start fresh?
