# Multi-Venue Support — Implementation Tasks

## Overview

Allow users to manage multiple venues. The first venue (created at onboarding) becomes the default. The user always operates in the context of a **single active venue**, switchable via a header dropdown. Multiple venues are gated behind the Professional+ tier.

---

## Constraints & Decisions

| Decision | Rationale |
|----------|-----------|
| Active venue stored in React Context + localStorage | No global state lib needed; persists across page refreshes |
| Active venue sent to API via `X-Venue-Id` request header | Cleaner than query params; works uniformly across all routes |
| RLS validates ownership | Server never trusts the header alone — RLS ensures the user owns the venue |
| Multiple venues = Professional+ | Starter/Trial users locked to 1 venue; upgrade prompt on attempt |
| Venues page added to sidebar | Replaces the current hidden `/venues` route |
| Sidebar links remain unchanged in structure | They already don't encode venueId in the path; context handles scoping |

---

## Phase 1 — Database Migration

**Goal:** Remove the one-venue-per-user hard constraint.

### Tasks

- [x] **1.1** Write and run migration SQL to drop `UNIQUE` constraint on `venues.owner_id`
  ```sql
  ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_owner_id_key;
  ```
  - Verify: `SELECT COUNT(*) FROM venues GROUP BY owner_id HAVING COUNT(*) > 1;` should now be possible
  - Add this migration to `migrations/all-migrations.sql` as Migration 12 (or next number)

- [x] **1.2** Verify RLS policies still hold for multi-venue
  - Run SQL to confirm all policies on `spaces`, `vendors`, `clients`, `events`, `leads` still check `venues.owner_id = auth.uid()` (they do — no changes needed, confirmed in diagnosis)

- [x] **1.3** Add `is_default` column to `venues` table
  ```sql
  ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
  -- Set existing venues as default
  UPDATE venues SET is_default = true WHERE is_default IS NULL OR is_default = false;
  ```
  - This marks which venue is the user's default (fallback when no active venue in localStorage)

---

## Phase 2 — Venue Context Provider

**Goal:** Create a client-side context that holds the active venue, exposes it app-wide, and persists it.

### Tasks

- [x] **2.1** Create `lib/context/VenueContext.tsx`
  - State: `venues: Venue[]`, `activeVenue: Venue | null`, `isLoading: boolean`
  - On mount: fetch `/api/venues`, set active to:
    1. Venue matching `localStorage.getItem("activeVenueId")` if it belongs to user
    2. Else the venue with `is_default = true`
    3. Else `venues[0]`
  - Expose: `activeVenue`, `venues`, `setActiveVenue(venue)`, `isLoading`
  - `setActiveVenue` persists to `localStorage.setItem("activeVenueId", venue.id)`

- [x] **2.2** Create `hooks/useVenueContext.ts`
  - `useVenueContext` is exported directly from `lib/context/VenueContext.tsx` (no separate file needed)

- [x] **2.3** Wrap dashboard layout with provider
  - In `app/(dashboard)/layout.tsx`: wrap children with `<VenueProvider>`
  - Provider fetches venues once at the layout level — no per-component fetching

- [x] **2.4** Create `lib/utils/venueHeader.ts` helper
  ```ts
  // Returns headers object with X-Venue-Id set (or {} if venueId is undefined)
  export function withVenueHeader(venueId?: string): Record<string, string> {
    return venueId ? { "X-Venue-Id": venueId } : {}
  }
  ```
  - Used in: `hooks/useClients.ts`, `hooks/useLeads.ts` (4 spots), `app/(dashboard)/events/page.tsx`, `app/(dashboard)/vendors/page.tsx`, `app/(dashboard)/spaces/page.tsx`, `app/(dashboard)/dashboard/page.tsx`

---

## Phase 3 — Sidebar Updates

**Goal:** Sidebar reads from context, shows Venues as a nav item, scope is always the active venue.

### Tasks

- [x] **3.1** Refactor `components/layout/Sidebar.tsx`
  - Remove internal `fetch("/api/venues")` — use `useVenueContext()` instead
  - Remove internal `venueId` state
  - "Public Page" link: `/venues/${activeVenue.id}/public-page`
  - "Analytics" link: `/venues/${activeVenue.id}/analytics`
  - Show active venue name in the sidebar (small label above nav items or below logo)

- [x] **3.2** Add **Venues** nav item to sidebar
  - Position: between "Settings" and bottom actions
  - Icon: `MapPin` from lucide-react (instead of Building2)
  - Route: `/venues`
  - Visible always (all tiers can see their venues list)

- [x] **3.3** Update `components/layout/MobileSidebar.tsx`
  - Same changes as desktop sidebar (use context, add Venues nav item)

---

## Phase 4 — Header Venue Switcher

**Goal:** Users with multiple venues (Professional+) can switch active venue from the header.

### Tasks

- [x] **4.1** Create `components/layout/VenueSwitcher.tsx`
  - Reads `venues` and `activeVenue` from `useVenueContext()`
  - If `venues.length === 1`: render static label (current venue name, no dropdown)
  - If `venues.length > 1`: render a `Select` / `DropdownMenu` with all venues listed
  - On select: calls `setActiveVenue(venue)` from context
  - Show venue name + city/state (if set) in each option; includes link to /venues for management

- [x] **4.2** Integrate `VenueSwitcher` into `components/layout/Header.tsx`
  - Place between page title and notification bell
  - Only render if `venues.length > 0` (guard for loading state)

---

## Phase 5 — API Route Updates

**Goal:** All venue-scoped API routes read `X-Venue-Id` from the request header and validate ownership via RLS, instead of resolving from `.single()`.

### Tasks

- [x] **5.1** Create `lib/venues/resolveVenue.ts` helper
  ```ts
  // Reads X-Venue-Id header, validates user owns it, returns venue row
  export async function resolveVenue(request: Request, supabase) {
    const venueId = request.headers.get("X-Venue-Id")
    if (!venueId) return { venue: null, error: "No venue selected", status: 400 }
    const { data: venue, error } = await supabase
      .from("venues").select("id, name, owner_id").eq("id", venueId).single()
    if (error || !venue) return { venue: null, error: "Venue not found", status: 404 }
    return { venue, error: null, status: 200 }
  }
  ```
  - Also exports `resolveVenueWithFallback()` which falls back to default/first venue when no header is present

- [x] **5.2** Update `app/api/events/route.ts`
  - Uses `resolveVenueWithFallback()` in both GET and POST handlers

- [x] **5.3** Update `app/api/leads/route.ts`
  - Uses `resolveVenueWithFallback()` in both GET and POST handlers

- [x] **5.4** Update `app/api/clients/route.ts`
  - Uses `resolveVenueWithFallback()` in both GET and POST handlers

- [x] **5.5** Update `app/api/vendors/route.ts`
  - Uses `resolveVenueWithFallback()` unified to header-based approach

- [x] **5.6** Update `app/api/spaces/route.ts`
  - Uses `resolveVenueWithFallback()` in both GET and POST handlers

- [x] **5.7** Update `lib/subscription/limits.ts` — `getUserVenueId` helper
  - `canCreateVenue` added; `canUploadPhoto` / `canSendChatMessage` updated to accept explicit `venueId`

- [x] **5.8** Update client-side fetch calls to pass `X-Venue-Id` header
  - Dashboard page (`app/(dashboard)/dashboard/page.tsx`) passes `X-Venue-Id: activeVenue.id`
  - Other pages (events, vendors, clients, leads, spaces) use `useVenueContext()` to scope requests

---

## Phase 6 — Feature Gating (Multi-Venue = Professional+)

**Goal:** Starter/Trial users can only have 1 venue. Professional users can have up to 3. Enterprise = unlimited.

### Tasks

- [x] **6.1** Update `lib/stripe/config.ts` — rename `maxSpaces` to `maxVenues` across `PLAN_LIMITS`
  - Trial: `maxVenues: 1`
  - Starter: `maxVenues: 1`
  - Professional: `maxVenues: 3`
  - Enterprise: `maxVenues: Infinity`

- [x] **6.2** Update `lib/subscription/limits.ts`
  - `canCreateVenue` checks subscription status and counts existing venues via `owner_id` (direct count, not usage_tracking)

- [x] **6.3** Update `app/api/venues/route.ts` POST handler
  - Uses `canCreateVenue`; new venues created with `is_default: false`

- [x] **6.4** Update `hooks/useSubscription.ts` — `useCanCreate("venue")`
  - Accepts "venue" resource key; "space" is aliased to the same venue logic

- [x] **6.5** Update `app/(dashboard)/venues/page.tsx`
  - "Add Venue" button: checks limit endpoint and shows UpgradePrompt for Starter/Trial users with 1 venue

- [x] **6.6** Update plan feature descriptions in `lib/stripe/config.ts`
  - `maxVenues` values set per plan; descriptions updated accordingly

---

## Phase 7 — Onboarding & Default Venue

**Goal:** The venue created at onboarding is always the default. Clean up the flow.

### Tasks

- [x] **7.1** Update `app/onboarding/venue-setup/page.tsx`
  - On venue creation, sets `is_default: true` in the insert payload
  - After redirect to `/dashboard`, context provider picks it up automatically

- [x] **7.2** Add "Set as Default" action to `app/(dashboard)/venues/page.tsx`
  - Each venue card/row has "Set as Default" action
  - Calls `PATCH /api/venues/{id}` with `{ is_default: true }`

- [x] **7.3** Update `app/api/venues/[venueId]/route.ts` PATCH handler
  - Handles `is_default`: clears flag on all other user venues, sets it on the target venue in one transaction

---

## Phase 8 — Polish & Edge Cases

- [x] **8.1** Loading state: while context is loading venues, show skeleton in sidebar venue name area and disable venue switcher
- [x] **8.2** If `activeVenueId` in localStorage no longer exists (deleted venue) → fall back to default venue and clear stale localStorage value (handled in VenueContext fallback chain)
- [x] **8.3** After creating a new venue from `/venues/new` → context refreshes its venues list and switches to the new venue
- [x] **8.4** `getAuthorizedVenue` in `lib/venues/editorAuth.ts` already validates ownership correctly — no changes needed
- [x] **8.5** Verify `canUploadPhoto` and `canSendChatMessage` receive correct `venueId` after Phase 5.7 changes
  - `canUploadPhoto(user.id, venueId)` wired into `app/api/venues/[venueId]/photos/route.ts` POST (returns 403 when over limit)
  - `canSendChatMessage(venue.owner_id, venue.id)` wired into `app/api/venues/public/[slug]/chat/route.ts` POST (returns 429 when over limit)
- [x] **8.6** Update `usage_tracking` column in DB: rename `spaces_created` → `venues_created` (Migration 13 in `migrations/all-migrations.sql`; `limits.ts` already reads `venues_created`)
- [x] **8.7** Update seed data script (`lib/utils/seedData.ts`) to support multiple venues per seed user if needed for testing
  - Already seeds two venues: primary (`is_default: true`) and a second boutique venue (`is_default: false`), each with their own spaces, vendors, events, leads, photos, etc.

---

## Dependency Order

```
Phase 1 (DB)
    └─> Phase 2 (Context Provider)
            ├─> Phase 3 (Sidebar)
            ├─> Phase 4 (Header Switcher)
            └─> Phase 5 (API Routes)
                    └─> Phase 6 (Feature Gating)
                            └─> Phase 7 (Onboarding)
                                    └─> Phase 8 (Polish)
```

Phases 3, 4, and 5 can be worked in parallel once Phase 2 is done.

---

## Files Touched Summary

| File | Change |
|------|--------|
| `migrations/all-migrations.sql` | Drop UNIQUE constraint, add `is_default` column |
| `setup-database.sql` | Update venues table definition |
| `lib/context/VenueContext.tsx` | **New** — venue context provider |
| `hooks/useVenueContext.ts` | **New** — context hook |
| `lib/utils/venueHeader.ts` | **New** — fetch header helper |
| `lib/venues/resolveVenue.ts` | **New** — server-side venue resolution helper |
| `lib/stripe/config.ts` | Rename `maxSpaces` → `maxVenues` |
| `lib/subscription/limits.ts` | Rename `canCreateSpace` → `canCreateVenue`, fix `getUserVenueId` |
| `components/layout/Sidebar.tsx` | Use context, add Venues nav item |
| `components/layout/MobileSidebar.tsx` | Same as Sidebar |
| `components/layout/Header.tsx` | Add VenueSwitcher |
| `components/layout/VenueSwitcher.tsx` | **New** — venue dropdown |
| `app/(dashboard)/layout.tsx` | Wrap with VenueProvider |
| `app/(dashboard)/venues/page.tsx` | Add Set as Default, updated gating |
| `app/(dashboard)/dashboard/page.tsx` | Pass X-Venue-Id header |
| `app/onboarding/venue-setup/page.tsx` | Set `is_default: true` |
| `app/api/events/route.ts` | Use `resolveVenue()` |
| `app/api/leads/route.ts` | Use `resolveVenue()` |
| `app/api/clients/route.ts` | Use `resolveVenue()` |
| `app/api/vendors/route.ts` | Use `resolveVenue()` |
| `app/api/venues/route.ts` | Use `canCreateVenue` |
| `app/api/venues/[venueId]/route.ts` | Add PATCH for `is_default` |
| `hooks/useSubscription.ts` | `space` → `venue` resource key |
