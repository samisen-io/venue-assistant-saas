-- =====================================================
-- PUBLIC PAGES & AI BOOKING - MIGRATIONS
-- =====================================================
-- Run this file AFTER all-migrations.sql on an existing database.
-- All statements are idempotent (safe to re-run).
-- Adds support for: public venue pages, AI chat, leads, proposals, analytics.
-- =====================================================


-- =====================================================
-- MIGRATION 12: Extend Venues Table for Public Pages
-- =====================================================
-- Adds slug, tagline, hero image, page status, location,
-- social links, privacy settings, business hours, SEO fields.
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'slug'
  ) THEN
    ALTER TABLE venues ADD COLUMN slug TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'tagline'
  ) THEN
    ALTER TABLE venues ADD COLUMN tagline TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'hero_image_url'
  ) THEN
    ALTER TABLE venues ADD COLUMN hero_image_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'page_status'
  ) THEN
    ALTER TABLE venues ADD COLUMN page_status TEXT DEFAULT 'draft';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE venues ADD COLUMN latitude DECIMAL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE venues ADD COLUMN longitude DECIMAL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE venues ADD COLUMN social_links JSONB;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'privacy_settings'
  ) THEN
    ALTER TABLE venues ADD COLUMN privacy_settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'business_hours'
  ) THEN
    ALTER TABLE venues ADD COLUMN business_hours JSONB;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE venues ADD COLUMN seo_title TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE venues ADD COLUMN seo_description TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'seo_keywords'
  ) THEN
    ALTER TABLE venues ADD COLUMN seo_keywords TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'og_image_url'
  ) THEN
    ALTER TABLE venues ADD COLUMN og_image_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'google_analytics_id'
  ) THEN
    ALTER TABLE venues ADD COLUMN google_analytics_id TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'facebook_pixel_id'
  ) THEN
    ALTER TABLE venues ADD COLUMN facebook_pixel_id TEXT;
  END IF;
END $$;

-- Check constraint on page_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'venues_page_status_check'
  ) THEN
    ALTER TABLE venues ADD CONSTRAINT venues_page_status_check
      CHECK (page_status IN ('draft', 'published', 'unpublished'));
  END IF;
END $$;

-- Slug generation function
CREATE OR REPLACE FUNCTION generate_venue_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(trim(NEW.name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
    final_slug := base_slug;
    LOOP
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM venues WHERE slug = final_slug AND id != NEW.id
      );
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Slug trigger
DROP TRIGGER IF EXISTS generate_venue_slug_trigger ON venues;
CREATE TRIGGER generate_venue_slug_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION generate_venue_slug();

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

-- Backfill slugs for existing venues (with deduplication)
WITH slugs AS (
  SELECT id, name,
    lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g')) as base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'))
      ORDER BY created_at
    ) as rn
  FROM venues WHERE slug IS NULL
)
UPDATE venues SET slug = CASE
  WHEN slugs.rn = 1 THEN slugs.base_slug
  ELSE slugs.base_slug || '-' || slugs.rn
END
FROM slugs WHERE venues.id = slugs.id;

-- Public read policy for published venues
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venues' AND policyname = 'Public can read published venues'
  ) THEN
    CREATE POLICY "Public can read published venues"
      ON venues FOR SELECT
      USING (page_status = 'published');
  END IF;
END $$;


-- =====================================================
-- MIGRATION 13: Extend Spaces Table for Public Display
-- =====================================================
-- Adds capacity variants, photo, display order, description.
-- Does NOT rename existing capacity column.
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'capacity_standing'
  ) THEN
    ALTER TABLE spaces ADD COLUMN capacity_standing INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'capacity_theater'
  ) THEN
    ALTER TABLE spaces ADD COLUMN capacity_theater INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'capacity_custom'
  ) THEN
    ALTER TABLE spaces ADD COLUMN capacity_custom INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'capacity_custom_label'
  ) THEN
    ALTER TABLE spaces ADD COLUMN capacity_custom_label TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE spaces ADD COLUMN photo_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE spaces ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spaces' AND column_name = 'public_description'
  ) THEN
    ALTER TABLE spaces ADD COLUMN public_description TEXT;
  END IF;
END $$;

-- Clarify that existing capacity column is seated capacity
COMMENT ON COLUMN spaces.capacity IS 'Seated capacity (default/primary capacity metric)';

-- Public read policy for spaces of published venues
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'spaces' AND policyname = 'Public can read spaces of published venues'
  ) THEN
    CREATE POLICY "Public can read spaces of published venues"
      ON spaces FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM venues
          WHERE venues.id = spaces.venue_id
          AND venues.page_status = 'published'
        )
      );
  END IF;
END $$;


-- =====================================================
-- MIGRATION 14: Create venue_photos Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_photos (
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

CREATE INDEX IF NOT EXISTS idx_venue_photos_venue_id ON venue_photos(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_section ON venue_photos(venue_id, section_name);

ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_photos' AND policyname = 'Users can view own venue photos'
  ) THEN
    CREATE POLICY "Users can view own venue photos"
      ON venue_photos FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_photos.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_photos' AND policyname = 'Users can insert own venue photos'
  ) THEN
    CREATE POLICY "Users can insert own venue photos"
      ON venue_photos FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_photos.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_photos' AND policyname = 'Users can update own venue photos'
  ) THEN
    CREATE POLICY "Users can update own venue photos"
      ON venue_photos FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_photos.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_photos' AND policyname = 'Users can delete own venue photos'
  ) THEN
    CREATE POLICY "Users can delete own venue photos"
      ON venue_photos FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_photos.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_photos' AND policyname = 'Public can read photos of published venues'
  ) THEN
    CREATE POLICY "Public can read photos of published venues"
      ON venue_photos FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_photos.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 15: Create venue_amenities Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  amenity_key TEXT NOT NULL,
  amenity_label TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  extra_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, amenity_key)
);

ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_amenities' AND policyname = 'Users can view own venue amenities'
  ) THEN
    CREATE POLICY "Users can view own venue amenities"
      ON venue_amenities FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_amenities.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_amenities' AND policyname = 'Users can insert own venue amenities'
  ) THEN
    CREATE POLICY "Users can insert own venue amenities"
      ON venue_amenities FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_amenities.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_amenities' AND policyname = 'Users can update own venue amenities'
  ) THEN
    CREATE POLICY "Users can update own venue amenities"
      ON venue_amenities FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_amenities.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_amenities' AND policyname = 'Users can delete own venue amenities'
  ) THEN
    CREATE POLICY "Users can delete own venue amenities"
      ON venue_amenities FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_amenities.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_amenities' AND policyname = 'Public can read amenities of published venues'
  ) THEN
    CREATE POLICY "Public can read amenities of published venues"
      ON venue_amenities FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_amenities.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 16: Create venue_event_types Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  event_type_key TEXT NOT NULL,
  event_type_label TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, event_type_key)
);

ALTER TABLE venue_event_types ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_event_types' AND policyname = 'Users can view own venue event types'
  ) THEN
    CREATE POLICY "Users can view own venue event types"
      ON venue_event_types FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_event_types.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_event_types' AND policyname = 'Users can insert own venue event types'
  ) THEN
    CREATE POLICY "Users can insert own venue event types"
      ON venue_event_types FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_event_types.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_event_types' AND policyname = 'Users can update own venue event types'
  ) THEN
    CREATE POLICY "Users can update own venue event types"
      ON venue_event_types FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_event_types.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_event_types' AND policyname = 'Users can delete own venue event types'
  ) THEN
    CREATE POLICY "Users can delete own venue event types"
      ON venue_event_types FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_event_types.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_event_types' AND policyname = 'Public can read event types of published venues'
  ) THEN
    CREATE POLICY "Public can read event types of published venues"
      ON venue_event_types FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_event_types.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 17: Create venue_packages Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_packages (
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

ALTER TABLE venue_packages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_packages' AND policyname = 'Users can view own venue packages'
  ) THEN
    CREATE POLICY "Users can view own venue packages"
      ON venue_packages FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_packages.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_packages' AND policyname = 'Users can insert own venue packages'
  ) THEN
    CREATE POLICY "Users can insert own venue packages"
      ON venue_packages FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_packages.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_packages' AND policyname = 'Users can update own venue packages'
  ) THEN
    CREATE POLICY "Users can update own venue packages"
      ON venue_packages FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_packages.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_packages' AND policyname = 'Users can delete own venue packages'
  ) THEN
    CREATE POLICY "Users can delete own venue packages"
      ON venue_packages FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_packages.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_packages' AND policyname = 'Public can read visible packages of published venues'
  ) THEN
    CREATE POLICY "Public can read visible packages of published venues"
      ON venue_packages FOR SELECT
      USING (
        is_visible_on_public_page = true
        AND EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_packages.venue_id AND venues.page_status = 'published')
      );
  END IF;
END $$;


-- =====================================================
-- MIGRATION 18: Create venue_package_addons Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_package_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  available_with_packages UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE venue_package_addons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_package_addons' AND policyname = 'Users can view own venue package addons'
  ) THEN
    CREATE POLICY "Users can view own venue package addons"
      ON venue_package_addons FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_package_addons.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_package_addons' AND policyname = 'Users can insert own venue package addons'
  ) THEN
    CREATE POLICY "Users can insert own venue package addons"
      ON venue_package_addons FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_package_addons.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_package_addons' AND policyname = 'Users can update own venue package addons'
  ) THEN
    CREATE POLICY "Users can update own venue package addons"
      ON venue_package_addons FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_package_addons.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_package_addons' AND policyname = 'Users can delete own venue package addons'
  ) THEN
    CREATE POLICY "Users can delete own venue package addons"
      ON venue_package_addons FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_package_addons.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_package_addons' AND policyname = 'Public can read addons of published venues'
  ) THEN
    CREATE POLICY "Public can read addons of published venues"
      ON venue_package_addons FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_package_addons.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 19: Create venue_testimonials Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_testimonials (
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

ALTER TABLE venue_testimonials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_testimonials' AND policyname = 'Users can view own venue testimonials'
  ) THEN
    CREATE POLICY "Users can view own venue testimonials"
      ON venue_testimonials FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_testimonials.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_testimonials' AND policyname = 'Users can insert own venue testimonials'
  ) THEN
    CREATE POLICY "Users can insert own venue testimonials"
      ON venue_testimonials FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_testimonials.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_testimonials' AND policyname = 'Users can update own venue testimonials'
  ) THEN
    CREATE POLICY "Users can update own venue testimonials"
      ON venue_testimonials FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_testimonials.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_testimonials' AND policyname = 'Users can delete own venue testimonials'
  ) THEN
    CREATE POLICY "Users can delete own venue testimonials"
      ON venue_testimonials FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_testimonials.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_testimonials' AND policyname = 'Public can read published testimonials of published venues'
  ) THEN
    CREATE POLICY "Public can read published testimonials of published venues"
      ON venue_testimonials FOR SELECT
      USING (
        is_published = true
        AND EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_testimonials.venue_id AND venues.page_status = 'published')
      );
  END IF;
END $$;


-- =====================================================
-- MIGRATION 20: Create venue_availability Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('available', 'tentative', 'booked')) DEFAULT 'available',
  note TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, date)
);

CREATE INDEX IF NOT EXISTS idx_venue_availability_venue_date ON venue_availability(venue_id, date);
CREATE INDEX IF NOT EXISTS idx_venue_availability_status ON venue_availability(status);

ALTER TABLE venue_availability ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_availability' AND policyname = 'Users can view own venue availability'
  ) THEN
    CREATE POLICY "Users can view own venue availability"
      ON venue_availability FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_availability.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_availability' AND policyname = 'Users can insert own venue availability'
  ) THEN
    CREATE POLICY "Users can insert own venue availability"
      ON venue_availability FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_availability.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_availability' AND policyname = 'Users can update own venue availability'
  ) THEN
    CREATE POLICY "Users can update own venue availability"
      ON venue_availability FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_availability.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_availability' AND policyname = 'Users can delete own venue availability'
  ) THEN
    CREATE POLICY "Users can delete own venue availability"
      ON venue_availability FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_availability.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_availability' AND policyname = 'Public can read availability of published venues'
  ) THEN
    CREATE POLICY "Public can read availability of published venues"
      ON venue_availability FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_availability.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 21: Create venue_calendar_settings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_calendar_settings (
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

ALTER TABLE venue_calendar_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_calendar_settings' AND policyname = 'Users can view own venue calendar settings'
  ) THEN
    CREATE POLICY "Users can view own venue calendar settings"
      ON venue_calendar_settings FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_calendar_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_calendar_settings' AND policyname = 'Users can insert own venue calendar settings'
  ) THEN
    CREATE POLICY "Users can insert own venue calendar settings"
      ON venue_calendar_settings FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_calendar_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_calendar_settings' AND policyname = 'Users can update own venue calendar settings'
  ) THEN
    CREATE POLICY "Users can update own venue calendar settings"
      ON venue_calendar_settings FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_calendar_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_calendar_settings' AND policyname = 'Public can read calendar settings of published venues'
  ) THEN
    CREATE POLICY "Public can read calendar settings of published venues"
      ON venue_calendar_settings FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_calendar_settings.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 22: Create venue_blackout_dates Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE venue_blackout_dates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_blackout_dates' AND policyname = 'Users can view own venue blackout dates'
  ) THEN
    CREATE POLICY "Users can view own venue blackout dates"
      ON venue_blackout_dates FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_blackout_dates.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_blackout_dates' AND policyname = 'Users can insert own venue blackout dates'
  ) THEN
    CREATE POLICY "Users can insert own venue blackout dates"
      ON venue_blackout_dates FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_blackout_dates.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_blackout_dates' AND policyname = 'Users can update own venue blackout dates'
  ) THEN
    CREATE POLICY "Users can update own venue blackout dates"
      ON venue_blackout_dates FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_blackout_dates.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_blackout_dates' AND policyname = 'Users can delete own venue blackout dates'
  ) THEN
    CREATE POLICY "Users can delete own venue blackout dates"
      ON venue_blackout_dates FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_blackout_dates.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_blackout_dates' AND policyname = 'Public can read blackout dates of published venues'
  ) THEN
    CREATE POLICY "Public can read blackout dates of published venues"
      ON venue_blackout_dates FOR SELECT
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_blackout_dates.venue_id AND venues.page_status = 'published'));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 23: Create venue_ai_settings Table
-- =====================================================
-- Private to venue owner (no public read).
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_ai_settings (
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
  ai_pricing_rules JSONB DEFAULT '{"small_event_max_guests": 50, "medium_event_max_guests": 150}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE venue_ai_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_ai_settings' AND policyname = 'Users can view own venue AI settings'
  ) THEN
    CREATE POLICY "Users can view own venue AI settings"
      ON venue_ai_settings FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_ai_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_ai_settings' AND policyname = 'Users can insert own venue AI settings'
  ) THEN
    CREATE POLICY "Users can insert own venue AI settings"
      ON venue_ai_settings FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_ai_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_ai_settings' AND policyname = 'Users can update own venue AI settings'
  ) THEN
    CREATE POLICY "Users can update own venue AI settings"
      ON venue_ai_settings FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_ai_settings.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;


-- =====================================================
-- MIGRATION 24: Create venue_page_versions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  published_by UUID REFERENCES profiles(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE venue_page_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_page_versions' AND policyname = 'Users can view own venue page versions'
  ) THEN
    CREATE POLICY "Users can view own venue page versions"
      ON venue_page_versions FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_page_versions.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venue_page_versions' AND policyname = 'Users can insert own venue page versions'
  ) THEN
    CREATE POLICY "Users can insert own venue page versions"
      ON venue_page_versions FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_page_versions.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

-- Auto-cleanup: keep only last 10 versions per venue
CREATE OR REPLACE FUNCTION cleanup_old_page_versions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM venue_page_versions
  WHERE venue_id = NEW.venue_id
  AND id NOT IN (
    SELECT id FROM venue_page_versions
    WHERE venue_id = NEW.venue_id
    ORDER BY version_number DESC
    LIMIT 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_page_versions_trigger ON venue_page_versions;
CREATE TRIGGER cleanup_page_versions_trigger
  AFTER INSERT ON venue_page_versions
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_page_versions();


-- =====================================================
-- MIGRATION 25: Create page_analytics Table
-- =====================================================

CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT CHECK (event_type IN (
    'page_view', 'chat_opened', 'lead_captured', 'cta_click',
    'gallery_view', 'calendar_click', 'phone_click', 'email_click',
    'scroll_depth', 'element_click', 'social_click'
  )) NOT NULL,
  metadata JSONB,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_analytics_venue_date ON page_analytics(venue_id, created_at);
CREATE INDEX IF NOT EXISTS idx_page_analytics_event_type ON page_analytics(event_type);

ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_analytics' AND policyname = 'Users can view own page analytics'
  ) THEN
    CREATE POLICY "Users can view own page analytics"
      ON page_analytics FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = page_analytics.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_analytics' AND policyname = 'Service role can insert page analytics'
  ) THEN
    CREATE POLICY "Service role can insert page analytics"
      ON page_analytics FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 26: Create leads and lead_activities Tables
-- =====================================================
-- Must be created BEFORE conversations (FK dependency).
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
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

CREATE INDEX IF NOT EXISTS idx_leads_venue_id ON leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority_score ON leads(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_contact_email ON leads(contact_email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can view own leads'
  ) THEN
    CREATE POLICY "Users can view own leads"
      ON leads FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = leads.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can insert own leads'
  ) THEN
    CREATE POLICY "Users can insert own leads"
      ON leads FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = leads.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can update own leads'
  ) THEN
    CREATE POLICY "Users can update own leads"
      ON leads FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = leads.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can delete own leads'
  ) THEN
    CREATE POLICY "Users can delete own leads"
      ON leads FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = leads.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Service role can manage leads'
  ) THEN
    CREATE POLICY "Service role can manage leads"
      ON leads FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Lead Activities
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT CHECK (activity_type IN (
    'created', 'email_sent', 'email_opened', 'proposal_sent',
    'proposal_viewed', 'call_scheduled', 'call_completed',
    'note_added', 'status_changed', 'assigned'
  )) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lead_activities' AND policyname = 'Users can view own lead activities'
  ) THEN
    CREATE POLICY "Users can view own lead activities"
      ON lead_activities FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM leads
        JOIN venues ON venues.id = leads.venue_id
        WHERE leads.id = lead_activities.lead_id AND venues.owner_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lead_activities' AND policyname = 'Users can insert own lead activities'
  ) THEN
    CREATE POLICY "Users can insert own lead activities"
      ON lead_activities FOR INSERT TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM leads
        JOIN venues ON venues.id = leads.venue_id
        WHERE leads.id = lead_activities.lead_id AND venues.owner_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lead_activities' AND policyname = 'Service role can manage lead activities'
  ) THEN
    CREATE POLICY "Service role can manage lead activities"
      ON lead_activities FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 27: Create conversations and conversation_messages Tables
-- =====================================================
-- For AI chat on public venue pages.
-- Uses service_role for public chat API (no anon RLS needed).
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
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
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  message_count INTEGER DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_venue_id ON conversations(venue_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view own conversations'
  ) THEN
    CREATE POLICY "Users can view own conversations"
      ON conversations FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = conversations.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Service role can manage conversations'
  ) THEN
    CREATE POLICY "Service role can manage conversations"
      ON conversations FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Conversation Messages
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  extracted_data JSONB,
  suggested_actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_conversation_id ON conversation_messages(conversation_id);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Users can view own conversation messages'
  ) THEN
    CREATE POLICY "Users can view own conversation messages"
      ON conversation_messages FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM conversations
        JOIN venues ON venues.id = conversations.venue_id
        WHERE conversations.id = conversation_messages.conversation_id AND venues.owner_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Service role can manage conversation messages'
  ) THEN
    CREATE POLICY "Service role can manage conversation messages"
      ON conversation_messages FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 28: Create proposals Table
-- =====================================================

CREATE TABLE IF NOT EXISTS proposals (
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

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Users can view own proposals'
  ) THEN
    CREATE POLICY "Users can view own proposals"
      ON proposals FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = proposals.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Users can insert own proposals'
  ) THEN
    CREATE POLICY "Users can insert own proposals"
      ON proposals FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = proposals.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Users can update own proposals'
  ) THEN
    CREATE POLICY "Users can update own proposals"
      ON proposals FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = proposals.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Users can delete own proposals'
  ) THEN
    CREATE POLICY "Users can delete own proposals"
      ON proposals FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = proposals.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Service role can manage proposals'
  ) THEN
    CREATE POLICY "Service role can manage proposals"
      ON proposals FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- PUBLIC PAGES MIGRATION COMPLETE
-- =====================================================
-- Tables created/modified: 16
--   Modified: venues (15 new columns), spaces (7 new columns)
--   Created: venue_photos, venue_amenities, venue_event_types,
--     venue_packages, venue_package_addons, venue_testimonials,
--     venue_availability, venue_calendar_settings, venue_blackout_dates,
--     venue_ai_settings, venue_page_versions, page_analytics,
--     leads, lead_activities, conversations, conversation_messages,
--     proposals
-- Functions: generate_venue_slug(), cleanup_old_page_versions()
-- Triggers: generate_venue_slug_trigger, cleanup_page_versions_trigger
-- =====================================================
