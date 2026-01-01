# Venue-to-Spaces Migration Progress

## ✅ COMPLETED

### 1. Database Schema ✅
- Created `migration-venue-to-spaces.sql` with complete new schema
- Includes: venues (one per user), spaces (multiple per venue), updated events/vendors
- All RLS policies defined
- All indexes created

### 2. TypeScript Types ✅
- Added `Space` type export to `lib/types/index.ts`
- Added `SpaceType` enum with: ballroom, conference_room, meeting_room, outdoor_garden, rooftop, banquet_hall, other
- Added "photography" to VendorCategory

### 3. Validation Schemas ✅
- Updated `venueFormSchema` - now requires address, city, state, etc. (property-level details)
- Created `spaceFormSchema` - for bookable spaces with capacity, space_type, etc.

### 4. Space API Routes ✅
- Created `app/api/spaces/route.ts` (GET all spaces, POST new space)
- Created `app/api/spaces/[spaceId]/route.ts` (GET, PATCH, DELETE individual space)

### 5. Event API Updates ✅
- Updated `app/api/events/route.ts`:
  - GET now joins spaces and venues
  - POST accepts `space_id` instead of `venue_id`
  - Automatically populates `venue_id` from space
- Updated `app/api/events/[eventId]/route.ts`:
  - GET now includes spaces in the select

### 6. Vendor API Updates ✅
- Updated `app/api/vendors/route.ts`:
  - POST now automatically gets user's single venue
  - No longer requires venue_id in request body

## 🔄 IN PROGRESS / TODO

### 5. Update Event API
**File**: `app/api/events/route.ts` and `app/api/events/[eventId]/route.ts`
- Change `venue_id` → `space_id` in POST/PATCH handlers
- Add `venue_id` population (fetch from space.venue_id)
- Update SELECT queries to join with spaces

### 6. Update Vendor API
**Files**: `app/api/vendors/route.ts` and `app/api/vendors/[vendorId]/route.ts`
- Vendors now attach to venue (not space)
- Update POST to get user's venue_id
- Keep existing logic mostly intact

### 7. Create Space Components
**Copy and modify from venues:**
- `components/spaces/SpaceCard.tsx` (from VenueCard)
- `components/spaces/SpaceForm.tsx` (from VenueForm)

**New fields in SpaceForm**:
- name, capacity (required)
- space_type dropdown: ballroom, conference_room, meeting_room, outdoor_garden, rooftop, banquet_hall, other
- floor_level (optional text)
- square_footage (optional number)
- hourly_rate (optional number)
- notes (optional textarea)

### 8. Create Space Pages
**Copy and modify from venues:**
- `app/(dashboard)/spaces/page.tsx` - List all spaces
- `app/(dashboard)/spaces/new/page.tsx` - Create space
- `app/(dashboard)/spaces/[spaceId]/page.tsx` - Space details
- `app/(dashboard)/spaces/[spaceId]/edit/page.tsx` - Edit space

### 9. Update Sidebar Navigation
**File**: `components/layout/Sidebar.tsx`
- Change "Venues" → "Spaces"
- Change href `/venues` → `/spaces`
- Change icon from `Store` → `Building2` (or `DoorOpen`)

### 10. Update EventForm
**File**: `components/events/EventForm.tsx`
- Change `venue_id` → `space_id`
- Change "Select Venue" → "Select Space"
- Fetch spaces instead of venues
- Display space info: "Grand Ballroom (500 capacity)"

### 11. Add Venue Settings
**File**: `app/(dashboard)/settings/page.tsx`
- Add "Venue Information" section
- Form to edit venue details (name, address, phone, etc.)
- Uses `venueFormSchema`
- GET/PATCH `/api/venues` (single venue for user)

### 12. Update Onboarding
**File**: `app/(dashboard)/onboarding/page.tsx` (or create if doesn't exist)
- Step 1: Collect venue information
- Step 2: Create first space (optional?)
- Redirect to /spaces or /dashboard

### 13. Update Demo Data (Seed Script)
**File**: `app/api/seed/route.ts`
- Create ONE venue per user
- Create multiple SPACES for that venue
- Create vendors attached to venue
- Create events attached to spaces (with venue_id populated)

Example structure:
```typescript
// 1. Create venue
const venue = await supabase.from('venues').insert({
  owner_id: user.id,
  name: "Grand Hotel & Conference Center",
  address: "123 Main St",
  city: "San Francisco",
  state: "CA",
  zip_code: "94102",
  phone: "(415) 555-1234",
  email: "info@grandhotel.com",
  venue_type: "hotel"
}).single()

// 2. Create spaces
const spaces = [
  { name: "Grand Ballroom", capacity: 500, space_type: "ballroom", floor_level: "2nd Floor" },
  { name: "Garden Terrace", capacity: 150, space_type: "outdoor_garden", floor_level: "Ground Floor" },
  { name: "Executive Boardroom", capacity: 20, space_type: "conference_room", floor_level: "3rd Floor" },
  { name: "Rooftop Lounge", capacity: 100, space_type: "rooftop", floor_level: "Rooftop" }
]

// 3. Create vendors (attached to venue)
// 4. Create events (attached to specific spaces)
```

### 14. Test End-to-End
- Run migration SQL in Supabase
- Run seed script
- Test creating/editing spaces
- Test creating events with space selection
- Test vendor management
- Test AI agent workflow
- Verify all RLS policies work

## FILES TO DELETE (After migration complete)
- `app/(dashboard)/venues/` (entire directory) → replaced by spaces
- Keep `components/venues/` initially for reference, delete after copying to spaces

## CRITICAL: Before Running Migration
1. Backup Supabase database (if any production data)
2. Test migration script in development first
3. Update environment if needed

## Order of Implementation
1. ✅ Database + Types + Validation
2. ✅ Space API
3. Update Event API (uses spaces)
4. Update Vendor API (uses venue)
5. Create Space components
6. Create Space pages
7. Update EventForm
8. Update Sidebar
9. Add Venue settings
10. Update onboarding
11. Update seed script
12. **RUN MIGRATION SQL**
13. Test everything
14. Clean up old files

## Space Types Reference
- `ballroom` - Large event space for weddings, galas
- `conference_room` - Meeting space for corporate events
- `meeting_room` - Smaller meeting spaces
- `outdoor_garden` - Outdoor event space with gardens
- `rooftop` - Rooftop event space
- `banquet_hall` - Formal dining event space
- `other` - Any other type of space
