-- =====================================================
-- Create preview_tokens Table and Add Anonymous Access
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create the preview_tokens table
CREATE TABLE IF NOT EXISTS preview_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_preview_tokens_venue_id ON preview_tokens(venue_id);
CREATE INDEX IF NOT EXISTS idx_preview_tokens_token ON preview_tokens(token);

-- Enable RLS
ALTER TABLE preview_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view their own venue's preview tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preview_tokens' AND policyname = 'Users can view own venue preview tokens'
  ) THEN
    CREATE POLICY "Users can view own venue preview tokens"
      ON preview_tokens FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = preview_tokens.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

-- Policy: Authenticated users can create preview tokens for their own venues
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preview_tokens' AND policyname = 'Users can create own venue preview tokens'
  ) THEN
    CREATE POLICY "Users can create own venue preview tokens"
      ON preview_tokens FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = preview_tokens.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

-- Policy: Authenticated users can delete their own venue's preview tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preview_tokens' AND policyname = 'Users can delete own venue preview tokens'
  ) THEN
    CREATE POLICY "Users can delete own venue preview tokens"
      ON preview_tokens FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = preview_tokens.venue_id AND venues.owner_id = auth.uid()));
  END IF;
END $$;

-- Policy: Anonymous users can verify preview tokens (IMPORTANT FOR PREVIEW LINKS TO WORK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preview_tokens' AND policyname = 'Anonymous users can verify preview tokens'
  ) THEN
    CREATE POLICY "Anonymous users can verify preview tokens"
      ON preview_tokens FOR SELECT TO anon
      USING (true);
  END IF;
END $$;

-- Function: Clean up expired preview tokens
DROP FUNCTION IF EXISTS cleanup_expired_preview_tokens();
CREATE FUNCTION cleanup_expired_preview_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM preview_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done!
SELECT 'Preview tokens table created successfully!' as status;
