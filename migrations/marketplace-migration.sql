-- =====================================================
-- PUBLIC MARKETPLACE - MIGRATIONS
-- =====================================================
-- Run this file AFTER public-pages-migration.sql on an existing database.
-- All statements are idempotent (safe to re-run).
-- Adds support for: marketplace discovery, search tracking,
-- venue public settings, page view analytics, and public inquiries.
-- =====================================================


-- =====================================================
-- MIGRATION 29: Add view_count and inquiry_count to venues
-- =====================================================
-- Counters for marketplace analytics on the venues table.
-- =====================================================

ALTER TABLE venues ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;


-- =====================================================
-- MIGRATION 30: Create venue_public_settings Table
-- =====================================================
-- Marketplace visibility, featured status, search keywords,
-- and auto-respond configuration per venue.
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_public_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_visible_on_marketplace BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  search_keywords TEXT[] DEFAULT '{}',
  auto_respond_enabled BOOLEAN DEFAULT false,
  auto_respond_message TEXT,
  response_time_goal TEXT CHECK (response_time_goal IN ('1h', '4h', '12h', '24h', '48h')) DEFAULT '24h',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_public_settings_venue_id ON venue_public_settings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_public_settings_visible ON venue_public_settings(is_visible_on_marketplace) WHERE is_visible_on_marketplace = true;
CREATE INDEX IF NOT EXISTS idx_venue_public_settings_featured ON venue_public_settings(featured) WHERE featured = true;

ALTER TABLE venue_public_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_public_settings' AND policyname = 'Users can view own venue public settings'
  ) THEN
    CREATE POLICY "Users can view own venue public settings"
      ON venue_public_settings FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_public_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_public_settings' AND policyname = 'Users can insert own venue public settings'
  ) THEN
    CREATE POLICY "Users can insert own venue public settings"
      ON venue_public_settings FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_public_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_public_settings' AND policyname = 'Users can update own venue public settings'
  ) THEN
    CREATE POLICY "Users can update own venue public settings"
      ON venue_public_settings FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_public_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_public_settings' AND policyname = 'Public can read marketplace-visible venue settings'
  ) THEN
    CREATE POLICY "Public can read marketplace-visible venue settings"
      ON venue_public_settings FOR SELECT
      USING (is_visible_on_marketplace = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_public_settings' AND policyname = 'Service role can manage venue public settings'
  ) THEN
    CREATE POLICY "Service role can manage venue public settings"
      ON venue_public_settings FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 31: Create venue_page_views Table
-- =====================================================
-- Tracks individual page views for marketplace analytics.
-- Separate from page_analytics (which tracks events on
-- the venue's own public page). This tracks views from
-- marketplace search results and venue detail pages.
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  source TEXT CHECK (source IN ('marketplace_search', 'marketplace_featured', 'direct', 'referral', 'social')) DEFAULT 'direct',
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  session_id TEXT,
  search_query_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_page_views_venue_id ON venue_page_views(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_page_views_created_at ON venue_page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_venue_page_views_venue_date ON venue_page_views(venue_id, created_at);
CREATE INDEX IF NOT EXISTS idx_venue_page_views_source ON venue_page_views(source);

ALTER TABLE venue_page_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_page_views' AND policyname = 'Users can view own venue page views'
  ) THEN
    CREATE POLICY "Users can view own venue page views"
      ON venue_page_views FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_page_views.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_page_views' AND policyname = 'Service role can manage venue page views'
  ) THEN
    CREATE POLICY "Service role can manage venue page views"
      ON venue_page_views FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 32: Create venue_search_queries Table
-- =====================================================
-- Tracks search queries on the marketplace for analytics
-- and search optimization.
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT,
  location TEXT,
  event_type TEXT,
  guest_count INTEGER,
  event_date DATE,
  filters JSONB,
  results_count INTEGER DEFAULT 0,
  ip_hash TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_search_queries_created_at ON venue_search_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_venue_search_queries_location ON venue_search_queries(location);
CREATE INDEX IF NOT EXISTS idx_venue_search_queries_event_type ON venue_search_queries(event_type);

ALTER TABLE venue_search_queries ENABLE ROW LEVEL SECURITY;

-- Search queries are system-level data; only service role can insert/read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_search_queries' AND policyname = 'Service role can manage search queries'
  ) THEN
    CREATE POLICY "Service role can manage search queries"
      ON venue_search_queries FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 33: Update leads table for marketplace
-- =====================================================
-- Add 'public_inquiry' to the source CHECK constraint
-- and add marketplace_inquiry_data JSONB column.
-- =====================================================

-- Drop and re-create the source CHECK constraint to include 'public_inquiry'
DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
  -- Re-create with new value
  ALTER TABLE leads ADD CONSTRAINT leads_source_check
    CHECK (source IN ('ai_chat', 'manual', 'phone', 'email', 'referral', 'public_inquiry'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Add marketplace_inquiry_data column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS marketplace_inquiry_data JSONB;

-- Add index for filtering leads by source
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Add RLS policy for service role to insert leads from public inquiries
-- (public visitors won't be authenticated, so service_role handles inserts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Service role can insert leads from public inquiries'
  ) THEN
    CREATE POLICY "Service role can insert leads from public inquiries"
      ON leads FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 34: Search Performance Indexes
-- =====================================================
-- Indexes to support fast marketplace search queries.
-- =====================================================

-- Index for filtering venues visible on marketplace (via join with venue_public_settings)
CREATE INDEX IF NOT EXISTS idx_venues_page_status_published ON venues(page_status) WHERE page_status = 'published';

-- Index for location-based search
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_state ON venues(state);
CREATE INDEX IF NOT EXISTS idx_venues_city_state ON venues(city, state);
CREATE INDEX IF NOT EXISTS idx_venues_zip_code ON venues(zip_code);

-- Index for venue type filtering
CREATE INDEX IF NOT EXISTS idx_venues_venue_type ON venues(venue_type);

-- Index for capacity filtering (on spaces table since capacity is per-space)
CREATE INDEX IF NOT EXISTS idx_spaces_capacity ON spaces(capacity);
CREATE INDEX IF NOT EXISTS idx_spaces_venue_active ON spaces(venue_id, is_active) WHERE is_active = true;

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_venue_event_types_key ON venue_event_types(event_type_key);
CREATE INDEX IF NOT EXISTS idx_venue_event_types_venue_key ON venue_event_types(venue_id, event_type_key);

-- Index for amenity filtering
CREATE INDEX IF NOT EXISTS idx_venue_amenities_key ON venue_amenities(amenity_key);
CREATE INDEX IF NOT EXISTS idx_venue_amenities_venue_key ON venue_amenities(venue_id, amenity_key);

-- Index for package pricing
CREATE INDEX IF NOT EXISTS idx_venue_packages_price ON venue_packages(base_price);
CREATE INDEX IF NOT EXISTS idx_venue_packages_venue_visible ON venue_packages(venue_id, is_visible_on_public_page) WHERE is_visible_on_public_page = true;

-- GIN index for search_keywords array on venue_public_settings
CREATE INDEX IF NOT EXISTS idx_venue_public_settings_keywords ON venue_public_settings USING GIN(search_keywords);

-- Enable pg_trgm extension for trigram-based text search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Text search index for venue name and description
CREATE INDEX IF NOT EXISTS idx_venues_name_trgm ON venues USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_venues_description_trgm ON venues USING GIN(description gin_trgm_ops);


-- =====================================================
-- MARKETPLACE MIGRATION COMPLETE
-- =====================================================
-- Tables created: venue_public_settings, venue_page_views, venue_search_queries
-- Columns added: venues.view_count, venues.inquiry_count, leads.marketplace_inquiry_data
-- Constraints updated: leads.source CHECK (added 'public_inquiry')
-- Indexes created: 20+ indexes for search performance
-- =====================================================
