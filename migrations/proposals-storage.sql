-- =====================================================
-- PROPOSALS STORAGE SETUP
-- =====================================================
-- Creates public storage bucket and RLS policies for proposal PDF uploads.
-- The bucket is public (PDFs are linked in emails to clients).
-- Service role uploads via the admin client, so no authenticated INSERT policy needed.
-- Run in Supabase SQL editor after core schema.
-- =====================================================

-- Create bucket if it does not exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'proposals',
  'proposals',
  true,
  20971520, -- 20MB
  ARRAY['application/pdf']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'proposals'
);

-- Public read access so clients can open PDF links from emails.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view proposal PDFs'
  ) THEN
    CREATE POLICY "Public can view proposal PDFs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'proposals');
  END IF;
END $$;

-- Service role handles all writes via admin client (bypasses RLS),
-- so no INSERT/DELETE policies are required for authenticated users.
