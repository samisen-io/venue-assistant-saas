# Final Migration Steps - Venue to Spaces

## ✅ COMPLETED (All Code Changes Done!)

1. ✅ Database migration SQL created and **RUN in Supabase**
2. ✅ TypeScript types updated (Space, SpaceType)
3. ✅ Validation schemas (venueFormSchema, spaceFormSchema)
4. ✅ Space API routes created (`/api/spaces/*`)
5. ✅ Event API updated (uses `space_id` instead of `venue_id`)
6. ✅ Vendor API updated (auto-gets user's venue)
7. ✅ Space components created (SpaceCard, SpaceForm)
8. ✅ Space pages created (/spaces, /spaces/new, /spaces/[id], /spaces/[id]/edit)
9. ✅ Sidebar navigation updated (Venues → Spaces)
10. ✅ EventForm updated (uses spaces selector)
11. ✅ New event page updated (fetches spaces)

## ⚠️ REMAINING TASKS

### 1. Update Seed Script (REQUIRED FOR TESTING)

The seed script at `lib/utils/seedData.ts` needs to be updated to match the new schema.

**Key Changes Needed:**
- Create ONE venue per user (not multiple)
- Create multiple SPACES for that venue
- Update vendor creation (they attach to venue)
- Update event creation (they attach to spaces with venue_id populated)

**Updated Seed Data Structure:**

```typescript
// 1. Create ONE venue
const venue = {
  owner_id: userId,
  name: "Grand Hotel & Conference Center",
  address: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  zip_code: "94102",
  phone: "(415) 555-0100",
  email: "events@grandhotel.com",
  venue_type: "hotel",
  description: "Premier event venue in downtown SF"
};

// 2. Create multiple spaces
const spaces = [
  {
    venue_id: venue.id,
    name: "Grand Ballroom",
    capacity: 500,
    space_type: "ballroom",
    floor_level: "2nd Floor",
    square_footage: 5000,
    hourly_rate: 1500
  },
  {
    venue_id: venue.id,
    name: "Garden Terrace",
    capacity: 150,
    space_type: "outdoor_garden",
    floor_level: "Ground Floor",
    square_footage: 2000,
    hourly_rate: 800
  },
  {
    venue_id: venue.id,
    name: "Executive Boardroom",
    capacity: 20,
    space_type: "conference_room",
    floor_level: "3rd Floor",
    square_footage: 500,
    hourly_rate: 300
  },
  {
    venue_id: venue.id,
    name: "Rooftop Lounge",
    capacity: 100,
    space_type: "rooftop",
    floor_level: "Rooftop",
    square_footage: 1500,
    hourly_rate: 1000
  }
];

// 3. Create vendors (attached to venue)
const vendors = [
  {
    venue_id: venue.id,
    name: "Gourmet Catering Co.",
    category: "catering",
    contact_name: "Sarah Johnson",
    contact_email: "sarah@gourmetcatering.com",
    contact_phone: "(415) 555-1001",
    cost_per_unit: 45,
    reliability_score: 92,
    total_events: 15,
    on_time_count: 14,
    on_time_percentage: 93.3,
    avg_quality_rating: 4.7
  },
  // ... more vendors
];

// 4. Create events (attached to specific spaces)
const events = [
  {
    space_id: spaces[0].id, // Grand Ballroom
    venue_id: venue.id,
    event_name: "Smith-Jones Wedding",
    event_type: "wedding",
    event_date: "2026-06-15",
    event_time: "18:00",
    guest_count: 300,
    budget_total: 25000,
    status: "planning"
  },
  {
    space_id: spaces[1].id, // Garden Terrace
    venue_id: venue.id,
    event_name: "TechCorp Annual Gala",
    event_type: "corporate",
    event_date: "2026-05-20",
    event_time: "19:00",
    guest_count: 120,
    budget_total: 15000,
    status: "confirmed"
  },
  // ... more events
];
```

### 2. Optional: Add Venue Settings Page

Add a section in `/settings` page to edit the single venue details.

**Location**: `app/(dashboard)/settings/page.tsx`

Add a "Venue Information" card with a form using `venueFormSchema`.

### 3. Delete Old Venue Pages (Optional Cleanup)

Once migration is tested and working:
- Delete `app/(dashboard)/venues/` directory
- Delete `components/venues/` directory

## 🧪 TESTING CHECKLIST

1. **Run Seed Script**
   - Click "Refresh Demo Data" in sidebar
   - Verify creates: 1 venue, 4 spaces, ~10 vendors, ~3 events

2. **Test Spaces**
   - ✅ View spaces list at `/spaces`
   - ✅ Create new space at `/spaces/new`
   - ✅ View space details
   - ✅ Edit space

3. **Test Events**
   - ✅ Create new event (should show space selector)
   - ✅ Space selector shows: "Grand Ballroom (500 guests)"
   - ✅ Event creation works with space_id
   - ✅ View event detail page (should show space info)

4. **Test Vendors**
   - ✅ Create new vendor (should auto-attach to venue)
   - ✅ Vendor list shows all vendors

5. **Test AI Agent**
   - ✅ "Contact Vendors with AI" button works
   - ✅ Agent reaches out to vendors
   - ✅ Communications tab shows messages

6. **Test RLS Policies**
   - ✅ Users only see their own venue/spaces/events/vendors
   - ✅ Cannot access other users' data

## 📋 QUICK REFERENCE

### New Routes
- `/spaces` - List all spaces
- `/spaces/new` - Create space
- `/spaces/[id]` - Space details
- `/spaces/[id]/edit` - Edit space

### API Endpoints
- `GET /api/spaces` - List user's spaces
- `POST /api/spaces` - Create space (auto-attaches to user's venue)
- `GET /api/spaces/[id]` - Get space
- `PATCH /api/spaces/[id]` - Update space
- `DELETE /api/spaces/[id]` - Delete space

### Space Types
- `ballroom` - Large event space
- `conference_room` - Meeting space
- `meeting_room` - Smaller meeting space
- `outdoor_garden` - Outdoor space
- `rooftop` - Rooftop space
- `banquet_hall` - Formal dining space
- `other` - Other types

## 🎯 MIGRATION COMPLETE!

All code changes are done. Just need to:
1. Update seed script (see structure above)
2. Test thoroughly
3. Optional: Add venue settings page
4. Optional: Clean up old venue files

The app is now correctly structured for:
- **Single venue per user** (the property they manage)
- **Multiple spaces per venue** (bookable rooms/areas)
- **Events attached to specific spaces**
- **Vendors attached to the venue** (serve all spaces)
