-- =====================================================
-- VENUE PHOTOS STORAGE SETUP
-- =====================================================
-- Creates public storage bucket and RLS policies for venue photo uploads.
-- Run in Supabase SQL editor (or migration pipeline) after core schema.
-- =====================================================

-- Create bucket if it does not exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'venue-photos',
  'venue-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'venue-photos'
);

-- Public read access to uploaded venue photos.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view venue photos'
  ) THEN
    CREATE POLICY "Public can view venue photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'venue-photos');
  END IF;
END $$;

-- Authenticated users can upload only inside their own venue folder:
-- object name format expected: {venue_id}/...
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Venue owners can upload venue photos'
  ) THEN
    CREATE POLICY "Venue owners can upload venue photos"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'venue-photos'
        AND EXISTS (
          SELECT 1
          FROM venues
          WHERE venues.owner_id = auth.uid()
            AND split_part(storage.objects.name, '/', 1) = venues.id::text
        )
      );
  END IF;
END $$;

-- Authenticated users can delete only from their own venue folder.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Venue owners can delete venue photos'
  ) THEN
    CREATE POLICY "Venue owners can delete venue photos"
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = 'venue-photos'
        AND EXISTS (
          SELECT 1
          FROM venues
          WHERE venues.owner_id = auth.uid()
            AND split_part(storage.objects.name, '/', 1) = venues.id::text
        )
      );
  END IF;
END $$;
