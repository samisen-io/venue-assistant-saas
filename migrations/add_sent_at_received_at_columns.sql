-- =====================================================
-- Migration: Add sent_at and received_at columns to vendor_communications
-- =====================================================
-- This migration adds both timestamp columns to properly track:
-- - sent_at: when venue manager sends email to vendor (outbound)
-- - received_at: when vendor replies back (inbound)
-- Plus additional columns needed for email tracking
-- =====================================================

-- Step 1: Add sent_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Step 2: Add received_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'received_at'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN received_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Step 3: Add from_email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'from_email'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN from_email TEXT;
  END IF;
END $$;

-- Step 4: Add to_email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'to_email'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN to_email TEXT;
  END IF;
END $$;

-- Step 5: Add read_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'read_at'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Step 6: Add processed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'processed'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN processed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 7: Add requires_followup column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications'
    AND column_name = 'requires_followup'
  ) THEN
    ALTER TABLE vendor_communications
    ADD COLUMN requires_followup BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 8: Make event_id and vendor_id nullable (for unmatched communications)
DO $$
BEGIN
  ALTER TABLE vendor_communications
  ALTER COLUMN event_id DROP NOT NULL;

  ALTER TABLE vendor_communications
  ALTER COLUMN vendor_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore if already nullable
END $$;

-- Step 9: Migrate existing data
-- If you only have 'received_at' column with data, copy it to the appropriate column based on direction
UPDATE vendor_communications
SET sent_at = received_at
WHERE direction = 'outbound' AND sent_at IS NULL AND received_at IS NOT NULL;

-- If you only have 'sent_at' column with data, copy it to the appropriate column based on direction
UPDATE vendor_communications
SET received_at = sent_at
WHERE direction = 'inbound' AND received_at IS NULL AND sent_at IS NOT NULL;

-- Step 10: For any existing records without proper timestamps, use created_at as fallback
UPDATE vendor_communications
SET sent_at = created_at
WHERE direction = 'outbound' AND sent_at IS NULL;

UPDATE vendor_communications
SET received_at = created_at
WHERE direction = 'inbound' AND received_at IS NULL;

-- =====================================================
-- Migration Complete
-- =====================================================
