# Demo Data Refresh Feature

## ⚠️ IMPORTANT: REMOVE BEFORE PRODUCTION

This feature is for **development and demo purposes only** and must be removed before deploying to production.

## What It Does

The "Refresh Demo Data" button in the sidebar allows you to:
1. **Delete all existing data** for the current user (venues, vendors, events, assignments, reviews)
2. **Load fresh demo data** including:
   - 3 demo venues (hotel, conference center, banquet hall)
   - 11 vendors across different categories (catering, A/V, florals, parking, security, entertainment)
   - 6 events (3 upcoming, 3 completed)
   - Event-vendor assignments with costs
   - Performance reviews for completed events

## Files to Remove Before Production

1. **API Endpoint**: `venue-assistant/app/api/seed/route.ts`
2. **Seed Data Utility**: `venue-assistant/lib/utils/seedData.ts`
3. **Sidebar Button**: Remove the "Refresh Demo Data" button from `venue-assistant/components/layout/Sidebar.tsx`

## Demo Data Overview

### Venues
1. **Grand Ballroom Hotel** (San Francisco, CA) - 500 capacity
2. **Riverside Conference Center** (Portland, OR) - 300 capacity
3. **Downtown Banquet Hall** (Seattle, WA) - 200 capacity

### Vendors
- **Catering**: Gourmet Catering Co., Budget Bites, Premium Feast Services
- **A/V**: TechSound Audio Visual, ProAV Solutions
- **Florals**: Bloom & Blossom, Elegant Petals
- **Parking**: VIP Valet Services
- **Security**: SafeGuard Security
- **Entertainment**: DJ Masters Entertainment, Live Band Productions

### Events
**Upcoming:**
1. Annual Tech Conference 2026 (30 days out)
2. Smith-Johnson Wedding (60 days out)
3. Q4 Business Summit (90 days out)

**Completed:**
1. Corporate Gala 2025 (30 days ago)
2. Spring Charity Auction (60 days ago)
3. Holiday Party 2025 (30 days ago)

## How to Remove

### Step 1: Delete Files
```bash
cd venue-assistant
rm app/api/seed/route.ts
rm lib/utils/seedData.ts
```

### Step 2: Update Sidebar
Remove the following from `components/layout/Sidebar.tsx`:
- Import: `RefreshCw` from lucide-react
- Import: `useState` from react
- Import: `useToast` hook
- State: `isSeeding` state variable
- Function: `handleRefreshData` function
- Button: "Refresh Demo Data" button in the render

### Step 3: Test
Verify the application works without the demo data feature.

## Usage During Development

1. Click "Refresh Demo Data" button in sidebar
2. Confirm the warning dialog
3. Wait for data to load (shows spinner animation)
4. Page automatically refreshes to show new data

## Notes

- Uses a native browser `confirm()` dialog for the warning
- Shows toast notification with count of created items
- Automatically redirects to dashboard after seeding
- All data is tied to the current authenticated user
- RLS policies ensure data isolation

---

**Created**: 2026-01-01
**Remember**: Remove this entire feature before production deployment!
