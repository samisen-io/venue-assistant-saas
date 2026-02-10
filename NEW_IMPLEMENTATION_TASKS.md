# VenueManager: Public Venue Pages & AI Conversational Booking — Implementation Task List

This is a comprehensive, sequential task list for implementing the Public Venue Pages with AI-powered Conversational Booking system as defined in `NEW_PRD.md`. Each task should be completed in order, as later tasks depend on earlier ones.

> **Prerequisite**: Phases 0–23 from the original `IMPLEMENTATION_TASKS.md` should be substantially complete before starting this work.

---

## Existing Infrastructure Summary

The following already exists and will be leveraged (not rebuilt):

**Database Tables (18 existing):** `profiles`, `venues`, `spaces`, `event_services`, `vendors`, `clients`, `events`, `vendor_services`, `event_service_requirements`, `event_vendors`, `vendor_reviews`, `vendor_communications`, `client_communications`, `agent_runs`, `vendor_quotes`, `subscriptions`, `usage_tracking`, `webhook_events`

**Existing `venues` columns:** `id`, `owner_id` (**UNIQUE** — one venue per user), `name`, `address`, `city`, `state`, `zip_code`, `phone`, `email`, `venue_type`, `description`, `website`, `contact_name` (added via migration), `created_at`, `updated_at`
> **⚠ Note**: `capacity` is NOT on `venues` — it exists on the `spaces` table. The `database.types.ts` file may show `capacity` on venues but this is stale; the canonical `setup-database.sql` does not include it.

**Existing `spaces` columns:** `id`, `venue_id`, `name`, `capacity`, `space_type` (ballroom, conference_room, meeting_room, outdoor_garden, rooftop, banquet_hall, other), `floor_level`, `square_footage`, `hourly_rate`, `setup_time_minutes`, `cleanup_time_minutes`, `amenities` (TEXT[]), `notes`, `is_active`, `created_at`, `updated_at`

**Existing AI Infrastructure:** `lib/ai/claude.ts` (Claude API client), `lib/ai/prompts/` (5 prompt templates), `lib/agent/` (orchestrator, state machine, quote extractor, vendor communicator)

**Existing Email Infrastructure:** `lib/email/resend.ts` (Resend client), `lib/email/templates/` (4 email templates), `lib/email/parser.ts`

**Existing Subscription Infrastructure:** `lib/stripe/` (client, config), `lib/subscription/` (limits, usage, trial)

**Existing Shared Components:** `EmptyState`, `Loading`, `ErrorMessage`, `Breadcrumbs`, `ViewToggle`, `MobileFilters`, `StatCard`

**Existing Hooks:** `useEvents`, `useVendors`, `useVenues`, `useClients`, `useSpaces`, `useSubscription`, `useCalendarEvents`, `use-toast`

### Key Architectural Constraints (from existing schema)

1. **One venue per user**: `venues.owner_id` has a `UNIQUE` constraint — each user can own exactly one venue. Public page features should account for this (e.g., no venue selection needed in page editor; use the user's single venue).
2. **Events are space-specific**: `events.space_id` is `NOT NULL` — every event is linked to a specific space, not just a venue. The `venue_availability` auto-population logic (Task 1.8) must aggregate across all spaces for a venue.
3. **Double-booking prevention exists**: A database trigger (`prevent_double_booking`) and function (`check_space_availability()`) already enforce no overlapping events per space. The AI availability checker (Task 5.4) can leverage this existing function.
4. **`event_end_time`** column exists on events (added via migration). Combined with `event_time`, gives full time range for availability checking.
5. **`description` and `website`** already exist on venues (in base schema). Task 1.1 correctly does NOT re-add them. The page editor (Task 8.2) should use the existing `description` field.

---

## PHASE 1: DATABASE SCHEMA & MIGRATIONS

### Task 1.1: Extend Venues Table for Public Pages
> **NOTE**: The `venues` table already exists with basic fields. We only need to ADD new columns for public page features.
- [x] Add new columns to existing `venues` table via ALTER TABLE:
  - `slug` (TEXT, UNIQUE) — URL-friendly identifier, auto-generated from name
  - `tagline` (TEXT) — max 120 chars, for hero section
  - `hero_image_url` (TEXT) — main hero image URL
  - `page_status` (TEXT, CHECK IN ('draft', 'published', 'unpublished'), DEFAULT 'draft')
  - `latitude` (DECIMAL) — for Google Maps pin
  - `longitude` (DECIMAL) — for Google Maps pin
  - `social_links` (JSONB) — `{facebook, instagram, linkedin, twitter, youtube, tiktok}`
  - `privacy_settings` (JSONB, DEFAULT '{}') — `{hide_address, hide_phone, hide_email}`
  - `business_hours` (JSONB) — structured hours per day of week
  - `seo_title` (TEXT) — max 60 chars
  - `seo_description` (TEXT) — max 160 chars
  - `seo_keywords` (TEXT)
  - `og_image_url` (TEXT) — Open Graph social sharing image
  - `google_analytics_id` (TEXT)
  - `facebook_pixel_id` (TEXT)
- [x] Create slug generation function (auto-generate from venue name, enforce lowercase/hyphens)
- [x] Add unique index on `slug`
- [x] Backfill slugs for existing venues
- [x] Update RLS policies to allow public read of published venues (currently owner-only)
- [ ] Test migration on existing data

### Task 1.2: Create venue_photos Table
> **NOTE**: No existing photo storage infrastructure. Brand new table.
- [x] Create `venue_photos` table:
  ```sql
  CREATE TABLE venue_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    section_name TEXT NOT NULL DEFAULT 'Main Venue',
    image_url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_section_thumbnail BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create indexes: `idx_venue_photos_venue_id`, `idx_venue_photos_section`
- [x] Enable RLS: venue owner can CRUD, public can read photos of published venues
- [ ] Test RLS policies

### Task 1.3: Extend Spaces Table for Public Display
> **NOTE**: The `spaces` table already exists with `name`, `capacity`, `space_type`, `amenities` (TEXT[]), etc. We only need to ADD columns for public page display. Do NOT create a separate `venue_spaces` table.
- [x] Add new columns to existing `spaces` table via ALTER TABLE:
  - `capacity_standing` (INTEGER) — standing capacity (existing `capacity` becomes seated)
  - `capacity_theater` (INTEGER) — theater-style capacity
  - `capacity_custom` (INTEGER) — custom layout capacity
  - `capacity_custom_label` (TEXT) — label for custom layout
  - `photo_url` (TEXT) — space thumbnail photo for public page
  - `display_order` (INTEGER, DEFAULT 0) — ordering on public page
  - `public_description` (TEXT) — short description for public display (max 250 chars)
- [ ] Rename existing `capacity` to clarify it's seated capacity (or add `capacity_seated` alias)
- [ ] Test migration preserves existing space data

### Task 1.4: Create venue_amenities Table
> **NOTE**: Existing `spaces.amenities` is a TEXT[] per-space. The public page needs venue-LEVEL amenities. New table required.
- [x] Create `venue_amenities` table:
  ```sql
  CREATE TABLE venue_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    amenity_key TEXT NOT NULL,
    amenity_label TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    extra_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venue_id, amenity_key)
  );
  ```
- [x] Enable RLS: venue owner can CRUD, public can read for published venues
- [ ] Seed pre-defined amenity keys: `av_system`, `wifi`, `parking`, `catering_kitchen`, `accessible`, `climate_control`, `outdoor_space`, `green_room`, `stage`, `dance_floor`, `bar_area`, `overnight`

### Task 1.5: Create venue_event_types Table
> **NOTE**: Existing `event_services` table tracks vendor service categories (catering, AV, etc.). This new table tracks what types of EVENTS the venue hosts (weddings, corporate, etc.) — different purpose.
- [x] Create `venue_event_types` table:
  ```sql
  CREATE TABLE venue_event_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    event_type_key TEXT NOT NULL,
    event_type_label TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venue_id, event_type_key)
  );
  ```
- [x] Enable RLS: venue owner can CRUD, public can read for published venues

### Task 1.6: Create venue_packages Table
> **NOTE**: No existing pricing/packages infrastructure. Brand new tables.
- [x] Create `venue_packages` table:
  ```sql
  CREATE TABLE venue_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    pricing_model TEXT CHECK (pricing_model IN ('flat', 'per_person', 'per_hour', 'tiered')) DEFAULT 'flat',
    tiered_pricing JSONB,
    inclusions JSONB,
    is_visible_on_public_page BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create `venue_package_addons` table:
  ```sql
  CREATE TABLE venue_package_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    available_with_packages UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS and create policies for both tables

### Task 1.7: Create venue_testimonials Table
- [x] Create `venue_testimonials` table:
  ```sql
  CREATE TABLE venue_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    client_company TEXT,
    event_type TEXT,
    quote TEXT NOT NULL,
    star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    client_photo_url TEXT,
    event_date DATE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    source TEXT CHECK (source IN ('manual', 'event_import', 'submission_form')) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS: venue owner can CRUD, public can read published testimonials of published venues
- [ ] Create public testimonial submission endpoint (for post-event testimonial requests)

### Task 1.8: Create venue_availability Table
> **NOTE**: Existing `spaces/availability` API handles per-space time-slot conflict detection. This new table provides a simple per-venue per-DATE availability status for the public calendar. Different granularity and purpose.
- [x] Create `venue_availability` table:
  ```sql
  CREATE TABLE venue_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('available', 'tentative', 'booked')) DEFAULT 'available',
    note TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venue_id, date)
  );
  ```
- [x] Create indexes: `idx_venue_availability_venue_date`, `idx_venue_availability_status`
- [x] Enable RLS: venue owner can CRUD, public can read for published venues
- [ ] Consider auto-populating from existing `events` table (sync events → availability). **Note**: Events are per-space (`space_id NOT NULL`), so sync logic must aggregate across ALL spaces for the venue. A date is "booked" only if ALL spaces are booked that day; "tentative" if some spaces are booked. Also leverage existing `event_end_time` column and `check_space_availability()` DB function for conflict detection.

### Task 1.9: Create venue_calendar_settings Table
- [x] Create `venue_calendar_settings` table:
  ```sql
  CREATE TABLE venue_calendar_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL UNIQUE,
    show_availability BOOLEAN DEFAULT true,
    setup_buffer_days INTEGER DEFAULT 0,
    teardown_buffer_days INTEGER DEFAULT 0,
    min_advance_booking_days INTEGER DEFAULT 14,
    max_advance_booking_months INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS

### Task 1.10: Create venue_blackout_dates Table
- [x] Create `venue_blackout_dates` table:
  ```sql
  CREATE TABLE venue_blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS

### Task 1.11: Create AI Chat Tables (conversations + messages)
> **NOTE**: The existing `vendor_communications` table handles AI agent ↔ vendor email threads. These new tables handle public prospect ↔ AI chat on the venue page. Completely different flow.
- [x] Create `conversations` table:
  ```sql
  CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    prospect_email TEXT,
    prospect_name TEXT,
    prospect_phone TEXT,
    prospect_company TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('active', 'completed', 'escalated')) DEFAULT 'active',
    extracted_data JSONB,
    lead_id UUID,
    message_count INTEGER DEFAULT 0,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create `conversation_messages` table:
  ```sql
  CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    extracted_data JSONB,
    suggested_actions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create indexes: `idx_conversations_venue_id`, `idx_conversations_status`, `idx_conv_messages_conversation_id`
- [ ] Enable RLS: venue owner can read conversations for their venues, public can read/write their own conversation (via session_id)

### Task 1.12: Create leads Table
> **NOTE**: No existing leads infrastructure. The existing `clients` table tracks known event organizers. Leads are pre-client prospects from AI chat.
- [x] Create `leads` table:
  ```sql
  CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    source TEXT CHECK (source IN ('ai_chat', 'manual', 'phone', 'email', 'referral')) DEFAULT 'ai_chat',
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    company TEXT,
    event_type TEXT,
    event_date DATE,
    date_is_flexible BOOLEAN DEFAULT false,
    guest_count INTEGER,
    estimated_budget DECIMAL(10,2),
    requirements JSONB,
    status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost')) DEFAULT 'new',
    lost_reason TEXT,
    priority_score INTEGER DEFAULT 0 CHECK (priority_score BETWEEN 0 AND 100),
    assigned_to UUID REFERENCES profiles(id),
    conversation_id UUID,
    ai_insights JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create `lead_activities` table:
  ```sql
  CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('created', 'email_sent', 'email_opened', 'proposal_sent', 'proposal_viewed', 'call_scheduled', 'call_completed', 'note_added', 'status_changed', 'assigned')) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create indexes on venue_id, status, priority_score, contact_email
- [x] Enable RLS: venue owner can CRUD leads for their venues
- [x] Add FK from `conversations.lead_id` -> `leads.id` after both tables exist

### Task 1.13: Create proposals Table
- [x] Create `proposals` table:
  ```sql
  CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    reference_number TEXT UNIQUE NOT NULL,
    event_summary JSONB NOT NULL,
    pricing_breakdown JSONB NOT NULL,
    inclusions JSONB,
    terms_and_policies TEXT,
    total_estimated DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    valid_until DATE,
    status TEXT CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')) DEFAULT 'draft',
    pdf_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS

### Task 1.14: Create venue_ai_settings Table
- [x] Create `venue_ai_settings` table:
  ```sql
  CREATE TABLE venue_ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tone TEXT CHECK (tone IN ('professional', 'friendly', 'casual', 'luxury', 'custom')) DEFAULT 'friendly',
    custom_tone_description TEXT,
    response_length TEXT CHECK (response_length IN ('concise', 'balanced', 'detailed')) DEFAULT 'balanced',
    greeting_message TEXT DEFAULT 'Hi! I''m here to help you plan your event. Tell me about what you''re planning!',
    after_hours_message TEXT,
    business_hours_start TIME,
    business_hours_end TIME,
    business_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    suggest_alternative_dates BOOLEAN DEFAULT true,
    upsell_addons BOOLEAN DEFAULT false,
    mention_promotions BOOLEAN DEFAULT false,
    request_contact_after_messages INTEGER DEFAULT 3,
    auto_send_proposal BOOLEAN DEFAULT false,
    escalate_capacity_threshold INTEGER DEFAULT 20,
    escalate_min_days_away INTEGER DEFAULT 14,
    escalate_on_budget_concerns BOOLEAN DEFAULT true,
    escalate_on_complex_questions BOOLEAN DEFAULT true,
    escalate_on_negative_sentiment BOOLEAN DEFAULT true,
    escalate_after_messages INTEGER DEFAULT 10,
    show_pricing_in_chat BOOLEAN DEFAULT true,
    require_manager_approval_for_quotes BOOLEAN DEFAULT false,
    manager_name TEXT,
    manager_email TEXT,
    ai_pricing_rules JSONB DEFAULT '{"small_event_max_guests": 50, "medium_event_max_guests": 150}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS
- [ ] Note: `ai_pricing_rules` stores AI package suggestion rules (small→basic, medium→standard, large→premium per PRD 3.1.5)

### Task 1.15: Create venue_page_versions Table
> **NOTE**: PRD requires "Version History" with last 10 published versions and ability to restore.
- [x] Create `venue_page_versions` table:
  ```sql
  CREATE TABLE venue_page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    published_by UUID REFERENCES profiles(id),
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Enable RLS: venue owner can read/restore versions
- [ ] Implement auto-snapshot on publish (keep last 10 versions, delete older)

### Task 1.16: Create page_analytics Table
- [x] Create `page_analytics` table:
  ```sql
  CREATE TABLE page_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT CHECK (event_type IN ('page_view', 'chat_opened', 'lead_captured', 'cta_click', 'gallery_view', 'calendar_click', 'phone_click', 'email_click', 'scroll_depth', 'element_click', 'social_click')) NOT NULL,
    metadata JSONB,
    referrer TEXT,
    user_agent TEXT,
    ip_hash TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [x] Create indexes: `idx_page_analytics_venue_date`, `idx_page_analytics_event_type`
- [x] Enable RLS: venue owner can read analytics for their venues

### Task 1.17: Regenerate TypeScript Types
- [ ] Regenerate database types from Supabase: `npx supabase gen types typescript`
- [x] Create `lib/types/public-page.types.ts`:
  - `VenuePublicPage` (combined venue + spaces + amenities + packages + photos + testimonials)
  - `VenuePhoto`, `VenueAmenity`, `VenueEventType`
  - `VenuePackage`, `VenuePackageAddon`
  - `VenueTestimonial`
  - `VenueAvailability`, `CalendarSettings`, `BlackoutDate`
  - `VenueAISettings`
  - `PageAnalyticsEvent`
- [x] Create `lib/types/conversation.types.ts`:
  - `Conversation`, `ConversationMessage`
  - `ExtractedEventData`, `SuggestedAction`
  - `ChatRequest`, `ChatResponse`
- [x] Create `lib/types/lead.types.ts`:
  - `Lead`, `LeadActivity`, `LeadFilters`
  - `LeadPriorityScore`
- [x] Create `lib/types/proposal.types.ts`:
  - `Proposal`, `PricingBreakdown`, `ProposalStatus`
- [x] Verify all types compile correctly

---

## PHASE 2: FILE STORAGE & IMAGE MANAGEMENT

### Task 2.1: Set Up Supabase Storage
> **NOTE**: No existing storage bucket infrastructure. Brand new.
- [ ] Create `venue-photos` storage bucket in Supabase dashboard
- [ ] Set bucket to public (CDN delivery for published venue photos)
- [ ] Configure max file size (10MB)
- [ ] Configure allowed MIME types (image/jpeg, image/png, image/webp)
- [ ] Create storage policies:
  - Venue owners can upload/delete photos for their venues
  - Public read access for published venue photos

### Task 2.2: Create Image Upload Utilities
- [x] Create `lib/storage/upload.ts`:
  - `uploadVenuePhoto(venueId, file, section): Promise<string>` — returns public URL
  - `deleteVenuePhoto(path): Promise<void>`
  - `uploadHeroImage(venueId, file): Promise<string>`
  - `uploadTestimonialPhoto(venueId, file): Promise<string>`
- [x] Create `lib/storage/optimize.ts`:
  - Client-side image compression before upload (target <500KB)
  - Resize to max 2000px width
  - Convert to WebP where supported
- [ ] Test upload and retrieval

### Task 2.3: Create Photo Upload Component
- [x] Create `components/shared/PhotoUploader.tsx`:
  - Drag-and-drop support
  - Click to upload
  - Upload progress indicator
  - Preview after upload
  - File size/type validation with clear error messages
  - Bulk upload support (multiple files)
- [ ] Test with various file types and sizes

---

## PHASE 3: PUBLIC VENUE PAGE (FRONTEND)

### Task 3.1: Create Public Page Route & Layout
- [x] Create `app/[venueSlug]/page.tsx` � main public venue page (Server Component)
- [x] Create `app/[venueSlug]/layout.tsx` � public page layout (NO dashboard sidebar, standalone layout)
- [x] Implement dynamic slug-based routing via `params.venueSlug`
- [x] Add `generateMetadata()` for SEO (title, description, OG tags from venue data)
- [x] Add Schema.org structured data (EventVenue type with name, address, geo, capacity, amenities)
- [x] Handle 404 for invalid/non-existent slugs
- [x] Handle unpublished pages (show "This page is not currently available" message)

### Task 3.2: Create Public Page Data API
- [x] Create `app/api/venues/public/[slug]/route.ts`:
  - `GET` — Returns full venue public page data:
    - Venue info (name, tagline, description, hero_image, contact, social_links, privacy_settings)
    - Spaces (via existing `spaces` table, filtered by `is_active`)
    - Amenities (via new `venue_amenities` table)
    - Event types (via new `venue_event_types` table)
    - Packages (via new `venue_packages` table, filtered by `is_visible_on_public_page`)
    - Photos (via new `venue_photos` table, ordered by `display_order`)
    - Testimonials (via new `venue_testimonials` table, filtered by `is_published`)
  - Only return data for venues with `page_status = 'published'`
  - No auth required (public endpoint)
- [ ] Test API returns correct data structure

### Task 3.3: Create Hero Section Component
- [x] Create `components/public-page/HeroSection.tsx`:
  - Large hero image with gradient overlay
  - Venue name, location (city, state), tagline overlay
  - Two CTAs: "Check Availability" and "Start Planning"
  - Responsive: 60vh desktop, 40vh mobile
- [x] Implement auto-contrast detection for text readability on light/dark hero images
- [ ] Test on various image types (light/dark backgrounds)

### Task 3.4: Create Photo Gallery Component
- [x] Create `components/public-page/PhotoGallery.tsx`:
  - Multiple gallery sections with labels (from `venue_photos.section_name`)
  - Grid layout: 3 cols desktop, 2 cols tablet, 1 col mobile
  - Lazy loading (load 6 initially, more on scroll)
  - Section hidden if no photos in that section
  - Section thumbnail display (from `is_section_thumbnail` flag)
- [x] Create `components/public-page/Lightbox.tsx`:
  - Full-screen photo viewer
  - Swipe/arrow navigation, zoom, close button
  - Keyboard support (Esc, arrows)
  - Photo caption display
- [ ] Test touch gestures and keyboard navigation

### Task 3.5: Create Venue Details Section
- [x] Create `components/public-page/VenueSpaces.tsx`:
  - List of spaces from existing `spaces` table
  - Shows: name, space_type icon (Lucide), capacity (seated/standing/theater)
  - Grid layout: 2 cols desktop, 1 col mobile
  - Cards with subtle borders/shadows
- [x] Create `components/public-page/AmenitiesList.tsx`:
  - Checklist of venue amenities from `venue_amenities` with Lucide icons
  - Icon mapping: amenity_key → Lucide icon
- [x] Create `components/public-page/EventTypeBadges.tsx`:
  - Tags/badges for supported event types from `venue_event_types`

### Task 3.6: Create Availability Calendar Component
- [x] Create `components/public-page/AvailabilityCalendar.tsx`:
  - Month-view calendar using `venue_availability` data
  - Color coding: green (available), yellow (tentative), gray (booked)
  - Past dates grayed out
  - Previous/next month navigation
  - Show next 12 months
  - Hover tooltips with status details
  - Click available date → opens AI chat pre-filled with that date
- [x] Create `app/api/venues/public/[slug]/availability/route.ts`:
  - `GET ?month=2026-03` — returns availability for month
  - Respects blackout dates, buffer days, lead time from `venue_calendar_settings`
  - 5-minute cache headers
- [ ] Implement mobile swipe left/right to change months
- [ ] Test color-blind accessibility (not relying only on color — add icons/patterns)
- [ ] Test keyboard navigation (tab to dates, enter to select)

### Task 3.7: Create Location & Contact Section
- [x] Create `components/public-page/LocationContact.tsx`:
  - Embedded Google Maps using venue's `latitude`/`longitude`
  - "Get Directions" link
  - Contact info: address, phone (click-to-call), email (mailto)
  - Business hours display from `venues.business_hours`
  - Social media links with icons from `venues.social_links`
  - Respects `venues.privacy_settings` (hide specific info)
  - Section hidden if venue opts to hide all contact info
- [ ] Test click-to-call on mobile
- [ ] Test with hidden contact info scenarios

### Task 3.8: Create Testimonials Section
- [x] Create `components/public-page/TestimonialsCarousel.tsx`:
  - Card-based carousel with quote icon
  - Shows: quote, client_name, client_company, event_type, star_rating
  - Auto-rotate every 8 seconds, pause on hover
  - Manual navigation: arrows and dots
  - Section hidden if no published testimonials
- [ ] Test with varying numbers of testimonials (0, 1, 3, 5)

### Task 3.9: Create Footer CTA Section
- [x] Create `components/public-page/FooterCTA.tsx`:
  - "Ready to plan your event?" headline
  - "Start Planning" button → opens AI chat
  - "Call Us" / "Email Us" secondary CTAs (if contact info provided)
  - Full-width accent background
- [ ] Test keyboard accessibility

### Task 3.10: Create Pricing Display Section
- [x] Create `components/public-page/PricingPackages.tsx`:
  - Display packages from `venue_packages` where `is_visible_on_public_page = true`
  - Package cards with name, description, price, inclusions
  - "Starting at $X" for venues using range pricing
  - "Contact for pricing" fallback if no packages visible
- [x] Respect venue's pricing display settings from `venue_ai_settings`

### Task 3.11: Mobile Optimization Pass
- [ ] Review all public page sections on mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] Ensure min 16px font size, 44x44px tap targets
- [ ] Test on iOS Safari, Chrome, Firefox
- [ ] Ensure no horizontal scrolling on any viewport
- [ ] Optimize images for mobile (Next.js Image with srcSet)
- [ ] Test with slow 4G simulation (target <3s load time)

---

## PHASE 4: AI CHAT INTERFACE (FRONTEND)

### Task 4.1: Create Chat Widget Container
- [ ] Create `components/public-page/ChatWidget.tsx`:
  - Floating chat button (bottom-right corner)
  - Expands to chat panel on click
  - Full-screen modal on mobile
  - Embedded section option (below fold, in dedicated section)
- [ ] Add open/close animations
- [ ] Focus management (focus goes to input when chat opened)

### Task 4.2: Create Chat Message Components
- [ ] Create `components/chat/ChatMessage.tsx`:
  - User messages (right-aligned, accent color)
  - AI messages (left-aligned, neutral background)
  - Timestamps
  - Typing indicator animation (three dots)
- [ ] Create `components/chat/SuggestedActions.tsx`:
  - Clickable action buttons from AI `suggested_actions`
  - Examples: "Check these dates", "Get a quote", "Speak to manager"
- [ ] Create `components/chat/DataCard.tsx`:
  - Structured data cards inline in chat (pricing summary, available dates)

### Task 4.3: Create Chat Input Component
- [ ] Create `components/chat/ChatInput.tsx`:
  - Multiline, auto-expanding textarea
  - Placeholder: "Describe your event in your own words..."
  - Send button (and Enter to send, Shift+Enter for newline)
  - Disabled state while AI is generating
- [ ] Create `components/chat/ChatSuggestions.tsx`:
  - Example suggestions for empty conversations:
    - "I need a venue for 100 people in May"
    - "Corporate retreat for 2 days, 80 attendees"
    - "Wedding reception, 200 guests, September"

### Task 4.4: Create Chat Container Component
- [ ] Create `components/chat/ChatContainer.tsx`:
  - Combines messages, input, suggestions
  - Auto-scroll to latest message
  - Message history management
  - Loading states, error handling (retry failed messages)
- [ ] Persist conversation_id in sessionStorage (survives page reload)
- [ ] Test multi-turn conversation flow
- [ ] Test mobile keyboard doesn't obscure input field

### Task 4.5: Create useChat Hook
- [ ] Create `hooks/useChat.ts`:
  - `sendMessage(text)`: POST to chat API, get AI response
  - `messages`: Array of conversation messages
  - `isLoading`: AI is generating response
  - `conversationId`: Current conversation ID (null until first message)
  - `suggestedActions`: Current suggested actions from last AI response
  - Handle conversation creation on first message
  - Handle pre-filled data (date from calendar click)

---

## PHASE 5: AI CONVERSATION ENGINE (BACKEND)

### Task 5.1: Create Venue Chat System Prompt Builder
> **NOTE**: Leverages existing `lib/ai/claude.ts` client and prompt patterns from `lib/ai/prompts/`. New prompt specific to venue public chat.
- [ ] Create `lib/ai/prompts/venueChat.ts`:
  - `buildVenueChatPrompt(venue, settings, spaces, packages, availability): string`
  - Includes: venue details, space capacities, amenities, pricing packages
  - Includes: current availability for next 6 months
  - Includes: tone/voice from `venue_ai_settings`
  - Includes: escalation rules, response format guidelines
  - Includes: what AI can/cannot promise (estimated ranges, not exact quotes)
  - Includes: conversation flow stages per PRD:
    1. Initial Understanding (extract event type, timeframe)
    2. Qualification (guest count, specific dates, check capacity/availability)
    3. Refinement (setup style, catering, add-ons, pricing estimate)
    4. Conversion (proposal request, email capture, lead creation)
  - Includes: edge case handling (date unavailable → suggest alternatives, out of capacity → suggest combinations, budget concerns → suggest starter packages)
- [ ] Test prompt generation with various venue configurations

### Task 5.2: Create Event Data Extraction Logic
> **NOTE**: Existing `lib/ai/prompts/eventExtraction.ts` extracts events from NL descriptions. New extractor is for ongoing CHAT context (multi-turn, incremental extraction). Different flow.
- [ ] Create `lib/ai/extraction/chatDataExtractor.ts`:
  - `extractEventData(conversationMessages): ExtractedEventData`
  - Extract: event_type, guest_count, date, date_flexibility, budget, requirements, contact_info, urgency, confidence_score
  - Runs after each AI response to accumulate structured data
- [ ] Test with various multi-turn conversation patterns

### Task 5.3: Create Chat API Endpoint
- [ ] Create `app/api/venues/public/[slug]/chat/route.ts`:
  - `POST` — Process chat message
  - Request: `{ message, conversation_id?, user_email?, pre_filled_date? }`
  - Response: `{ conversation_id, ai_response, extracted_data, suggested_actions, should_create_lead, escalate_to_human }`
  - On first message: create conversation in DB, load venue context
  - On subsequent messages: load conversation history, append new message
  - Call Claude API via existing `lib/ai/claude.ts` with venue-specific system prompt
  - Store all messages in `conversation_messages` table
  - Update `conversations.extracted_data` incrementally
  - Update `conversations.message_count` and `last_message_at`
- [ ] Add rate limiting using existing `lib/utils/rateLimit.ts` (e.g., 30 messages per IP per hour)
- [ ] Add spam/trolling detection: AI prompt includes instructions to end abusive conversations gracefully
- [ ] Test response time (<3 seconds p95)

### Task 5.4: Implement Availability Checking in Chat
> **NOTE**: The database already has a `check_space_availability(space_id, date, start_time, end_time)` function and `prevent_double_booking` trigger (Migration 4). The existing `lib/algorithms/space-availability.ts` also handles per-space availability. This new checker operates at the VENUE level (across all spaces) for public-facing chat, and additionally consults `venue_availability`, `venue_blackout_dates`, and `venue_calendar_settings`.
- [ ] Create `lib/ai/tools/availabilityChecker.ts`:
  - `checkAvailability(venueId, date): AvailabilityResult`
  - `suggestAlternativeDates(venueId, date, range): AlternativeDate[]`
  - Queries `venue_availability` table first; falls back to checking events across all spaces (using existing `check_space_availability()` DB function pattern)
  - Respects `venue_blackout_dates` and `venue_calendar_settings` (buffer, lead time)
- [ ] Integrate as tool/function the AI can invoke during chat
- [ ] Test with available, tentative, and booked dates

### Task 5.5: Implement Pricing Estimation in Chat
- [ ] Create `lib/ai/tools/pricingEstimator.ts`:
  - `estimatePrice(venueId, eventDetails): PricingEstimate`
  - Queries `venue_packages` and `venue_package_addons`
  - Applies tiered pricing rules from `tiered_pricing` JSONB
  - Returns as ranges ("$8,500–$10,000")
  - Suggests most appropriate package based on event details
- [ ] Test with various event configurations and pricing models

### Task 5.6: Create Fallback Inquiry Form Endpoint
> **NOTE**: PRD specifies `POST /api/venues/:slug/inquiries` as fallback when chat is disabled.
- [ ] Create `app/api/venues/public/[slug]/inquiries/route.ts`:
  - `POST` — Submit structured inquiry form (no AI)
  - Fields: name, email, phone, event_type, event_date, guest_count, message
  - Creates lead directly (skips conversation)
  - Sends notification to venue manager
- [ ] Create `components/public-page/InquiryForm.tsx`:
  - Shown when AI chat is disabled or as alternative to chat
  - Standard contact form with event fields
- [ ] Test form submission → lead creation → notification flow

### Task 5.7: Implement Escalation Logic
- [ ] Create `lib/ai/escalation.ts`:
  - `shouldEscalate(conversation, venueAISettings): { escalate: boolean, reason: string }`
  - Check triggers from `venue_ai_settings`:
    - Guest count exceeds max space capacity by threshold %
    - Event less than X days away
    - Budget concerns detected (sentiment analysis)
    - Complex custom questions
    - Negative sentiment detected
    - Too many messages without resolution
  - Return human-friendly escalation message with manager name
- [ ] Test each escalation trigger independently

---

## PHASE 6: LEAD CAPTURE & CRM

### Task 6.1: Create Lead Management API Routes
- [ ] Create `app/api/leads/route.ts`:
  - `GET` — List leads for user's venue (with filters: status, priority, date range, source)
  - `POST` — Create lead manually
- [ ] Create `app/api/leads/[leadId]/route.ts`:
  - `GET` — Get lead detail with conversation transcript + activities
  - `PUT` — Update lead (status, notes, assigned_to)
  - `DELETE` — Delete lead
- [ ] Create `app/api/leads/[leadId]/activities/route.ts`:
  - `GET` — Get activity timeline
  - `POST` — Add manual activity (note, call, meeting)
- [ ] Test all endpoints with auth

### Task 6.2: Implement Automatic Lead Creation
- [ ] Create `lib/leads/leadCreator.ts`:
  - `shouldCreateLead(conversation): boolean` — triggers:
    - User provides email in conversation
    - User requests proposal/quote
    - User clicks "Speak to manager"
    - Conversation reaches 5+ messages
    - AI confidence_score >0.70 for booking intent
  - `createLeadFromConversation(conversation): Lead`
    - Extract contact info from conversation `extracted_data`
    - Calculate priority score
    - Store conversation_id link
    - Set AI insights (recommended package, next steps)
- [ ] Create `lib/leads/priorityScoring.ts`:
  - `calculatePriorityScore(lead): number` (0-100)
  - Factors: estimated budget size, timeline urgency, contact info completeness, message engagement level
- [ ] Integrate into chat API flow (auto-create lead when triggers met)
- [ ] Prevent duplicate leads for same conversation_id

### Task 6.3: Create Lead Notification System
> **NOTE**: Leverages existing `lib/email/resend.ts` for email delivery. New templates needed.
- [ ] Create `lib/leads/leadNotifier.ts`:
  - `notifyVenueManager(lead, venue): void` — sends email to venue owner/manager
- [ ] Create `lib/email/templates/leadAlert.ts`:
  - Manager notification email: event details, guest count, budget, AI confidence, recommended actions
  - Include links: [View Lead], [View Conversation], [Send Proposal]
- [ ] Create `lib/email/templates/prospectConfirmation.ts`:
  - Prospect confirmation email: thank you, reference number, next steps, expected response time
- [ ] Test email delivery within 1 minute of lead creation

### Task 6.4: Create Lead Dashboard Components
- [ ] Create `components/leads/LeadCard.tsx`:
  - Contact info, event details, priority badge (🔥/⚡/🟢), status, source
- [ ] Create `components/leads/LeadDetail.tsx`:
  - Full lead detail with all sections
  - Contact card, event details, priority indicator
  - Quick action buttons: Send Proposal, Schedule Tour (Calendly/booking link), Send Email, Mark Won/Lost
- [ ] Create `components/leads/ConversationTranscript.tsx`:
  - Collapsible full chat history with timestamps
  - Highlighted extracted data fields
- [ ] Create `components/leads/AIInsightsPanel.tsx`:
  - "What the AI Learned" summary from `leads.ai_insights`
  - Recommended next steps, similar past events
- [ ] Create `components/leads/ActivityTimeline.tsx`:
  - Chronological list of lead activities from `lead_activities`
  - Add manual activity form
- [ ] Create `components/leads/LeadStatusDropdown.tsx`:
  - Status selector; prompts for `lost_reason` when "Lost" selected

### Task 6.5: Create Leads Dashboard Page
- [ ] Create `app/(dashboard)/leads/page.tsx`:
  - List of all leads with filters (status, priority, date range, source)
  - Search by contact name/email/company
  - Sort by date, priority, status
  - Quick status update from list view
- [ ] Create `app/(dashboard)/leads/[leadId]/page.tsx`:
  - Full lead detail page integrating all lead components
- [ ] Test page rendering and data loading

### Task 6.6: Create useLeads Hook
- [ ] Create `hooks/useLeads.ts`:
  - `useLeads(filters)`: Fetch leads with filters for user's venue
  - `useLead(leadId)`: Fetch single lead with conversation + activities
  - `useLeadActivities(leadId)`: Fetch activity timeline
  - Handle loading, error states

---

## PHASE 7: PROPOSAL GENERATION

### Task 7.1: Create Proposal Generation Logic
- [ ] Create `lib/proposals/proposalGenerator.ts`:
  - `generateProposal(lead, venue, packages): Proposal`
  - Auto-select package based on event details (guest count, type)
  - Calculate pricing breakdown from `venue_packages` and `venue_package_addons`
  - Generate reference number (INQ-YYYY-NNNN format)
  - Set valid_until (30 days default)
- [ ] Create `lib/proposals/pricingCalculator.ts`:
  - `calculateTotalPrice(eventDetails, package, addons): PricingBreakdown`
  - Handle all pricing models: flat, per_person, per_hour, tiered
  - Calculate subtotal, tax, deposit
- [ ] Test pricing accuracy with various scenarios

### Task 7.2: Create Proposal PDF Generation
- [ ] Install PDF generation library (`@react-pdf/renderer` or `jspdf`)
- [ ] Create `lib/proposals/pdfGenerator.ts`:
  - `generateProposalPDF(proposal, venue): Buffer`
  - Sections: cover page, event summary, venue details (with space photos), pricing breakdown, inclusions, terms, next steps
  - Include floor plan/layout diagram if available (space photo + capacity info)
  - Professional formatting with venue branding
- [ ] Upload generated PDF to Supabase Storage (`proposals` bucket)
- [ ] Test PDF generation quality

### Task 7.3: Create Proposal API Routes
- [ ] Create `app/api/leads/[leadId]/proposal/route.ts`:
  - `POST` — Generate proposal (and optionally send)
  - `GET` — Get existing proposal for lead
- [ ] Create `app/api/proposals/[proposalId]/route.ts`:
  - `GET` — Get proposal detail
  - `PUT` — Update proposal before sending
- [ ] Create `app/api/proposals/[proposalId]/send/route.ts`:
  - `POST` — Send proposal email to prospect (leverages existing Resend client)
- [ ] Test full proposal generate → send flow

### Task 7.4: Create Proposal Email Template
> **NOTE**: Leverages existing `lib/email/resend.ts` for sending. New template only.
- [ ] Create `lib/email/templates/proposal.ts`:
  - Professional email with proposal summary inline
  - PDF download link
  - CTA: "Accept Proposal" / "Schedule Tour"
- [ ] Test email formatting and delivery

### Task 7.5: Create Proposal Components
- [ ] Create `components/proposals/ProposalPreview.tsx`:
  - Preview proposal before sending
  - Edit pricing, inclusions, terms
  - Send / Save Draft buttons
- [ ] Create `components/proposals/ProposalStatusBadge.tsx`:
  - Status indicator (draft, sent, viewed, accepted, declined, expired)

---

## PHASE 8: PAGE MANAGEMENT DASHBOARD (BACKEND EDITOR)

### Task 8.1: Create Page Editor Layout
- [ ] Create `app/(dashboard)/venues/[venueId]/public-page/page.tsx`:
  - Split view: editor (left) + live preview (right) on desktop
  - Stacked view on tablet/mobile
  - Tab navigation for editor sections
  - Publish button (top-right)
  - Auto-save indicator
- [ ] Create `app/(dashboard)/venues/[venueId]/public-page/layout.tsx` if needed

### Task 8.2: Create Basic Information Editor
- [ ] Create `components/page-editor/BasicInfoEditor.tsx`:
  - Venue name (from existing `venues.name`), tagline (new), description (existing)
  - Location (existing address/city/state/zip + new lat/lng geocoding)
  - URL slug editor with real-time uniqueness validation
  - Page status toggle (Published/Draft/Unpublished)
  - Auto-save every 30 seconds
- [ ] Create `app/api/venues/check-slug/route.ts`:
  - `GET ?slug=xxx` — returns slug availability
- [ ] Test real-time slug validation

### Task 8.3: Create Photos & Media Editor
- [ ] Create `components/page-editor/PhotosMediaEditor.tsx`:
  - Hero image upload with crop tool (uses `PhotoUploader` from Phase 2)
  - Gallery sections manager (add/rename/delete sections)
  - Photo upload per section (bulk upload)
  - Drag-and-drop reordering within sections
  - Caption and alt text editing per photo
  - Set section thumbnail toggle per photo
  - Delete photo with confirmation
- [ ] Enforce photo limits based on subscription tier (using existing `lib/subscription/limits.ts` pattern)
- [ ] Test bulk upload, reordering, and deletion

### Task 8.4: Create Venue Details Editor
- [ ] Create `components/page-editor/SpacesEditor.tsx`:
  - Reads from / writes to existing `spaces` table
  - Add new capacity fields (standing, theater, custom)
  - Add photo_url and display_order
  - Drag-and-drop reordering
- [ ] Create `components/page-editor/AmenitiesEditor.tsx`:
  - Pre-defined amenity checkboxes + custom amenity text fields
  - Writes to `venue_amenities` table
- [ ] Create `components/page-editor/EventTypesEditor.tsx`:
  - Pre-defined event type checkboxes + custom types
  - Writes to `venue_event_types` table
- [ ] Create `components/page-editor/AboutEditor.tsx`:
  - Rich text editor (bold, italic, bullets, links) for `venues.description`
  - Max 1000 chars

### Task 8.5: Create Availability & Calendar Settings Editor
- [ ] Create `components/page-editor/CalendarSettingsEditor.tsx`:
  - Toggle: show/hide availability on public page
  - Buffer days (setup/teardown)
  - Lead time settings (min advance / max advance booking)
- [ ] Create `components/page-editor/BlackoutDatesEditor.tsx`:
  - Add/remove blackout date ranges with optional reason
- [ ] Test settings apply correctly to public calendar API

### Task 8.6: Create Pricing & Packages Editor
- [ ] Create `components/page-editor/PackagesEditor.tsx`:
  - Add/edit/delete packages
  - Fields: name, description, base_price, pricing_model, tiered_pricing config, inclusions
  - Visibility toggle (show/hide on public page)
- [ ] Create `components/page-editor/AddonsEditor.tsx`:
  - Add/edit/delete add-ons with name, description, price, package restrictions
- [ ] Create `components/page-editor/PricingSettingsEditor.tsx`:
  - Show exact pricing: Yes/No
  - Show pricing in AI chat: Yes/No
  - Require manager approval: Yes/No
- [ ] Test tiered pricing configuration saves and reads correctly

### Task 8.7: Create AI Chat Settings Editor
- [ ] Create `components/page-editor/AIChatSettingsEditor.tsx`:
  - Tone dropdown (Professional/Friendly/Casual/Luxury/Custom)
  - Custom tone description field
  - Response length (Concise/Balanced/Detailed)
  - Greeting message editor (max 200 chars)
  - After-hours message and business hours
  - Proactive features toggles (suggest dates, upsell, request contact, auto-proposal)
  - Escalation rules configuration
  - Contact capture timing (after X messages)
  - Manager name/email for escalation

### Task 8.8: Create Contact & Social Editor
- [ ] Create `components/page-editor/ContactSocialEditor.tsx`:
  - Phone, email, business hours (writes to existing `venues` fields + new `business_hours` JSONB)
  - Social media URLs (Facebook, Instagram, LinkedIn, Twitter, YouTube, TikTok)
  - Map settings (show/hide, auto lat/lng from address)
  - Privacy options (hide address/phone/email)

### Task 8.9: Create SEO & Marketing Editor
- [ ] Create `components/page-editor/SEOEditor.tsx`:
  - Page title (auto-generated or custom, max 60 chars)
  - Meta description (auto-generated or custom, max 160 chars)
  - Keywords
  - Google search result preview (live)
  - OG image upload
  - Google Analytics ID, Facebook Pixel ID

### Task 8.10: Create Testimonials Editor
- [ ] Create `components/page-editor/TestimonialsEditor.tsx`:
  - Add/edit/delete testimonials
  - Fields: quote, name, company, event_type, star_rating, photo, event_date
  - Published toggle per testimonial
  - Drag-and-drop reorder
  - "Import from Past Events" button → select completed event, pre-fill client info
  - Display settings: carousel/grid/list layout, auto-rotate speed (5/8/10 seconds)
- [ ] Create testimonial request automation:
  - Toggle: "Auto-request testimonials after events"
  - Send request X days after event ends
  - Public submission form URL (creates unpublished testimonial for review)
  - Create `lib/email/templates/testimonialRequest.ts`
  - Create `app/api/venues/[venueId]/testimonials/submit/route.ts` (public endpoint)

### Task 8.11: Create Page Editor API Routes
- [ ] Create `app/api/venues/[venueId]/public-page/route.ts`:
  - `GET` — Get all public page data for editor (joins all related tables)
  - `PUT` — Batch save public page changes
- [ ] Create `app/api/venues/[venueId]/photos/route.ts`:
  - `POST` — Upload photo(s)
  - `PUT` — Reorder photos
  - `DELETE` — Delete photo
- [ ] Create `app/api/venues/[venueId]/amenities/route.ts`:
  - `GET`, `PUT` — Bulk set amenities
- [ ] Create `app/api/venues/[venueId]/event-types/route.ts`:
  - `GET`, `PUT` — Bulk set event types
- [ ] Create `app/api/venues/[venueId]/packages/route.ts`:
  - Full CRUD for venue packages and add-ons
- [ ] Create `app/api/venues/[venueId]/testimonials/route.ts`:
  - Full CRUD for testimonials
- [ ] Create `app/api/venues/[venueId]/ai-settings/route.ts`:
  - `GET` and `PUT` for AI chat settings
- [ ] Create `app/api/venues/[venueId]/calendar-settings/route.ts`:
  - `GET` and `PUT` for calendar settings + blackout dates
- [ ] Test all API routes with authentication

### Task 8.12: Create Live Preview Component
- [ ] Create `components/page-editor/LivePreview.tsx`:
  - Renders public page preview using same components from Phase 3
  - Updates in real-time as editor changes (debounced)
  - Device preview modes: desktop, tablet (768px), mobile (375px)

---

## PHASE 9: PAGE PUBLISHING & PREVIEW

### Task 9.1: Implement Publishing Workflow
- [ ] Create `components/page-editor/PublishButton.tsx`:
  - Button states: "Publish" / "Publish Changes" / "Published ✓"
  - Keyboard shortcut: Ctrl+P
- [ ] Create `components/page-editor/PublishChecklist.tsx`:
  - Pre-publish validation modal:
    - ✅ Hero image uploaded
    - ✅ At least 5 gallery photos
    - ✅ At least 1 space defined
    - ✅ Amenities configured
    - ✅ AI chat settings configured
    - ⚠️ No SEO description (warning, not blocker)
    - ⚠️ No pricing packages (warning, not blocker)
  - "Publish Anyway" option for warnings
- [ ] Create `app/api/venues/[venueId]/publish/route.ts`:
  - `POST` — Set `page_status = 'published'`, run validation, return warnings/errors
  - Auto-snapshot current state to `venue_page_versions` table on publish

### Task 9.2: Implement Version History
> **NOTE**: PRD 3.2 requires last 10 published versions with restore functionality.
- [ ] Create `components/page-editor/VersionHistory.tsx`:
  - "View History" button in editor
  - List of last 10 published versions with timestamp, publisher, change summary
  - "Restore this version" button per version
  - Confirmation modal before restore
- [ ] Create `app/api/venues/[venueId]/versions/route.ts`:
  - `GET` — List version history
- [ ] Create `app/api/venues/[venueId]/versions/[versionId]/restore/route.ts`:
  - `POST` — Restore snapshot from version
- [ ] Test restore doesn't break current data

### Task 9.3: Implement Preview Functionality
- [ ] Create `app/[venueSlug]/preview/page.tsx`:
  - Same as public page but shows unpublished/draft changes
  - Requires preview token for access (query param `?token=xxx`)
  - Shows "PREVIEW" banner at top
- [ ] Create `app/api/venues/[venueId]/preview-token/route.ts`:
  - Generate time-limited preview URL (24h expiry)
- [ ] Add "Preview in New Tab" and "Copy Preview Link" buttons to editor

### Task 9.3: Implement Unpublish Functionality
- [ ] Add "Unpublish" option in page editor settings
- [ ] Confirmation modal: "This will take your page offline"
- [ ] Sets `page_status = 'unpublished'`
- [ ] Public page returns "This page is not currently available" for unpublished venues

---

## PHASE 10: PAGE ANALYTICS DASHBOARD

### Task 10.1: Create Analytics Tracking
- [ ] Create `lib/analytics/tracker.ts`:
  - `trackEvent(venueId, eventType, metadata): void`
  - Writes to `page_analytics` table
  - IP hashing for privacy (no raw IPs stored)
- [ ] Create `app/api/venues/public/[slug]/track/route.ts`:
  - `POST` — Public endpoint for tracking page_view, cta_click, gallery_view events
  - Rate limited using existing `lib/utils/rateLimit.ts`
- [ ] Add tracking calls to public page components (page view on load, CTA clicks, gallery opens, calendar clicks)
- [ ] Add scroll depth tracking (Intersection Observer on each section: Hero, Gallery, Details, Calendar, Contact, Testimonials, Footer)
- [ ] Add element click tracking (CTA buttons, phone number, email, social links, gallery photos)

### Task 10.2: Create Analytics API
- [ ] Create `app/api/venues/[venueId]/analytics/route.ts`:
  - `GET ?range=7d|30d|90d|custom&start=&end=`
  - Return aggregated metrics:
    - Page views, inquiries started, leads captured, conversion rate
    - Trends vs previous period
    - Traffic sources breakdown (from referrer)
    - AI chat metrics (conversations started, avg messages, lead capture rate, escalation rate)
    - Visitor behavior: avg time on page, scroll depth per section, most clicked elements
    - Inquiry conversion funnel: views → chat opened → lead captured → proposal sent → won

### Task 10.3: Create Analytics Dashboard Components
> **NOTE**: Can leverage existing `components/dashboard/StatCard.tsx` pattern for metric cards.
- [ ] Create `components/analytics/AnalyticsMetricCard.tsx` (extends StatCard with trend indicator)
- [ ] Create `components/analytics/TrafficSourcesChart.tsx`
- [ ] Create `components/analytics/InquiryAnalytics.tsx`
- [ ] Create `components/analytics/AIChatPerformance.tsx`
- [ ] Create `components/analytics/VisitorBehavior.tsx`:
  - Scroll depth per section (Hero 100%, Gallery 85%, etc.)
  - Most clicked elements
  - Average time on page
- [ ] Create `components/analytics/DateRangeSelector.tsx` (7d, 30d, 90d, custom)

### Task 10.4: Create Analytics Dashboard Page
- [ ] Create `app/(dashboard)/venues/[venueId]/analytics/page.tsx`:
  - Overview metric cards
  - Traffic sources chart
  - Visitor behavior (scroll depth, time on page, most clicked)
  - Inquiry analytics + conversion funnel
  - AI chat performance
  - Date range selector
  - Export button (CSV, PDF)
- [ ] Test with various date ranges
- [ ] Test mobile responsive layout

---

## PHASE 11: LEAD MANAGEMENT INTEGRATION

### Task 11.1: Create Notification System
- [ ] Create `components/layout/NotificationBell.tsx`:
  - Real-time notification badge in existing `Header.tsx`
  - Dropdown notification center
  - Mark as read/unread
- [ ] Create `app/api/notifications/route.ts`:
  - `GET` — Fetch notifications for user
  - `PUT` — Mark as read
- [ ] Add toast notifications for new leads (using existing `use-toast` hook)

### Task 11.2: Create Lead Notification Settings
- [ ] Add notification preferences to `app/(dashboard)/settings/page.tsx`:
  - Email notification toggle and frequency (immediate/digest/off)
  - Priority filter (all leads / high-priority only)
  - Include conversation transcript in email: Yes/No

### Task 11.3: Create Follow-Up Automation
- [ ] Create `lib/leads/followUpAutomation.ts`:
  - Rules: no response in 24h → follow-up email, no response in 3 days → reminder task, proposal viewed but no response in 2 days → nudge
  - `scheduleFollowUp(lead, rule): void`
  - `processScheduledFollowUps(): void` (cron job or Inngest function via existing `lib/inngest/`)
- [ ] Create `lib/email/templates/leadFollowUp.ts`
- [ ] Test automation triggers

### Task 11.4: Add Leads to Dashboard Navigation
- [ ] Update existing `components/layout/Sidebar.tsx` to include "Leads" nav item
- [ ] Add lead count badge to sidebar
- [ ] Update `app/(dashboard)/dashboard/page.tsx` with recent leads summary card
- [ ] Add "Public Page" and "Analytics" links to venue detail/management

---

## PHASE 12: INTEGRATION TESTING

### Task 12.1: Test Public Page End-to-End
- [ ] Venue page loads correctly with all sections populated
- [ ] Page loads in <2 seconds
- [ ] Responsive on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] SEO meta tags and Schema.org structured data render correctly
- [ ] 404 for invalid slugs, offline message for unpublished pages

### Task 12.2: Test AI Chat End-to-End
- [ ] Full conversation flow: initial inquiry → qualification → pricing → proposal request
- [ ] Availability checking returns correct data from `venue_availability`
- [ ] Pricing estimation matches `venue_packages` configuration
- [ ] Escalation triggers fire per `venue_ai_settings`
- [ ] AI response time <3 seconds
- [ ] AI never invents availability or pricing not in the database
- [ ] Rate limiting prevents abuse

### Task 12.3: Test Lead Capture End-to-End
- [ ] Auto lead creation triggers fire correctly (email provided, proposal requested, 5+ messages, high confidence)
- [ ] Lead includes full conversation transcript and extracted data
- [ ] Venue manager receives email notification within 1 minute
- [ ] Prospect receives confirmation email
- [ ] No duplicate leads for same conversation
- [ ] Priority score calculation is sensible

### Task 12.4: Test Page Editor End-to-End
- [ ] All editor sections save correctly to respective tables
- [ ] Live preview updates within 500ms of changes
- [ ] Photo upload, reorder, delete work correctly
- [ ] Publish checklist catches missing required content
- [ ] Preview link generation and sharing works (token-based)
- [ ] Unpublish flow works

### Task 12.5: Test Proposal Generation
- [ ] Proposal generates with correct pricing from `venue_packages`
- [ ] PDF generation produces readable document
- [ ] Proposal email delivers via Resend
- [ ] Proposal status tracking works (sent → viewed)

### Task 12.6: Test Analytics
- [ ] Page view tracking fires on public page load
- [ ] Chat analytics record correctly
- [ ] Lead conversion metrics calculate correctly
- [ ] Date range filtering works
- [ ] CSV export includes all visible data

### Task 12.7: Security Testing
- [ ] RLS on all new tables enforces multi-tenant isolation
- [ ] Public API endpoints (`/api/venues/public/[slug]/*`) don't expose private data
- [ ] Rate limiting on chat and tracking endpoints prevents abuse
- [ ] No XSS in chat messages or user-generated content (sanitize inputs)
- [ ] Preview tokens expire correctly after 24h
- [ ] Service role key never exposed to client

---

## PHASE 13: PERFORMANCE & SEO OPTIMIZATION

### Task 13.1: Public Page Performance
- [ ] Use Next.js Image component for all photos (automatic optimization, srcSet, lazy loading)
- [ ] Add CDN caching headers for static assets
- [ ] Inline critical CSS for above-the-fold content
- [ ] Minimize Cumulative Layout Shift (CLS)
- [ ] Target Lighthouse score >90

### Task 13.2: SEO Implementation
- [ ] Verify semantic HTML structure (header, nav, main, section, footer)
- [ ] Verify proper heading hierarchy (H1: venue name, H2: section headings)
- [ ] All images have alt text (from `venue_photos.alt_text` or auto-generated)
- [ ] Generate XML sitemap including all published venue pages
- [ ] Configure robots.txt
- [ ] Add LocalBusiness schema markup in addition to EventVenue (for local SEO)
- [ ] Test Schema.org markup with Google Rich Results Test
- [ ] Test social sharing cards (OG tags) on Facebook/LinkedIn
- [ ] Add canonical tag to prevent duplicate content issues if venue has own website

### Task 13.3: Database Performance
- [ ] Review indexes on all new tables for common query patterns
- [ ] Optimize public page data fetch (single query with joins, or parallel queries)
- [ ] Add cache headers on availability API (5-minute cache)
- [ ] Test query performance with realistic data volume

---

## PHASE 14: POLISH & DEPLOYMENT

### Task 14.1: UI/UX Polish
- [ ] Review all new pages for consistent design with existing dashboard (Tailwind + shadcn/ui)
- [ ] Ensure all forms have validation and error messages (using existing Zod + react-hook-form patterns)
- [ ] Add loading states using existing `Loading` / `Skeleton` components
- [ ] Add empty states using existing `EmptyState` component pattern
- [ ] Review accessibility: keyboard nav, ARIA labels, color contrast

### Task 14.2: Error Handling
- [ ] Add error boundaries to public page sections
- [ ] Handle chat API errors gracefully (retry button, friendly message)
- [ ] Handle image upload failures (retry, clear message)
- [ ] Handle offline/network error scenarios

### Task 14.3: Update Navigation & Settings
- [ ] Add "Public Page" link to venue management (Sidebar or venue detail page)
- [ ] Add "Leads" to sidebar nav with count badge
- [ ] Add "Analytics" under venue management
- [ ] Update settings page with lead notification preferences
- [ ] Add "Edit Public Page" quick action on existing venue detail page

### Task 14.4: Update Subscription Tiers
> **NOTE**: Leverages existing `lib/stripe/config.ts` PLAN_LIMITS and `lib/subscription/limits.ts`.
- [ ] Add new limits to `PLAN_LIMITS`:
  - `maxPhotos`: Starter=20, Professional=50, Enterprise=unlimited
  - `maxAIChatMessagesPerMonth`: Starter=100, Professional=500, Enterprise=unlimited
  - `maxLeadsPerMonth`: Starter=20, Professional=100, Enterprise=unlimited
- [ ] Add tier checks to photo upload API, chat API, and lead creation
- [ ] Update `components/subscription/PricingTable.tsx` with new feature comparisons

### Task 14.5: Update Seed Data
> **NOTE**: Leverages existing `lib/utils/seedData.ts` pattern.
- [ ] Extend seed script to create:
  - Venue with public page data (slug, tagline, hero_image, social_links, page_status='published')
  - 10 venue photos across 3 sections
  - 3 spaces with public display fields populated
  - 8 venue amenities
  - 5 venue event types
  - 3 venue packages with different pricing models
  - 2 package add-ons
  - 4 venue testimonials (2 published)
  - Venue calendar settings + 3 blackout dates
  - Venue AI settings
  - 30 days of availability data
  - 3 sample conversations with messages
  - 5 sample leads with activities
  - 1 sample proposal
- [ ] Test seed data generation for all new tables

### Task 14.6: Deployment Preparation
- [ ] Add new environment variables:
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (for embedded maps)
- [ ] Configure Supabase Storage bucket for production
- [ ] Ensure public venue page routing doesn't conflict with existing routes
- [ ] Configure CORS for public API endpoints
- [ ] Run production build locally and verify all features
- [ ] Deploy and smoke test

---

## Summary

| Phase | Description | Key Deliverables | Reuses Existing |
|-------|-------------|------------------|-----------------|
| 1 | Database Schema & Migrations | Extend venues/spaces, 14 new tables (incl. page_versions) | venues, spaces tables |
| 2 | File Storage & Image Management | Storage bucket, upload utils, uploader component | — |
| 3 | Public Venue Page (Frontend) | 9 public page components, route, layout | shadcn/ui, Lucide icons |
| 4 | AI Chat Interface (Frontend) | Chat widget, messages, input, suggestions | use-toast, shadcn/ui |
| 5 | AI Conversation Engine (Backend) | Chat API, prompts, tools, fallback inquiry form | lib/ai/claude.ts, rateLimit |
| 6 | Lead Capture & CRM | Lead API, auto-creation, notifications, dashboard | lib/email/resend.ts, templates |
| 7 | Proposal Generation | Pricing calc, PDF gen (with floor plans), email delivery | lib/email/resend.ts |
| 8 | Page Management Dashboard | 10 editor components, 8+ API routes, testimonial automation | spaces table, subscription/limits |
| 9 | Page Publishing & Preview | Publish checklist, version history, preview tokens, unpublish | — |
| 10 | Page Analytics Dashboard | Tracking (scroll depth, clicks), metrics, visitor behavior | StatCard pattern |
| 11 | Lead Management Integration | Notifications, follow-ups, nav updates | Sidebar, Inngest, use-toast |
| 12 | Integration Testing | E2E tests for all flows | — |
| 13 | Performance & SEO Optimization | Image opt, sitemap, Schema.org, LocalBusiness, canonical | Next.js Image |
| 14 | Polish & Deployment | UI polish, tier updates, seed data, deploy | seedData, subscription limits |
| **Total** | | **~100 tasks across 14 phases** | |



