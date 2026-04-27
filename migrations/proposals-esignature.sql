-- =====================================================
-- MIGRATION: Proposals E-Signature Fields
-- =====================================================
-- Adds public_token (for the client-facing acceptance URL),
-- and e-signature capture fields to the proposals table.
-- Also extends lead_activities to include acceptance/decline types.
-- =====================================================

-- Add public_token for the client-facing proposal URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'public_token'
  ) THEN
    ALTER TABLE proposals ADD COLUMN public_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Add e-signature capture: typed name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'accepted_by_name'
  ) THEN
    ALTER TABLE proposals ADD COLUMN accepted_by_name TEXT;
  END IF;
END $$;

-- Add e-signature capture: acceptance timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE proposals ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add e-signature capture: client IP address
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'accepted_ip'
  ) THEN
    ALTER TABLE proposals ADD COLUMN accepted_ip TEXT;
  END IF;
END $$;

-- Extend lead_activities activity_type CHECK constraint to include proposal acceptance/decline
ALTER TABLE lead_activities
  DROP CONSTRAINT IF EXISTS lead_activities_activity_type_check;

ALTER TABLE lead_activities
  ADD CONSTRAINT lead_activities_activity_type_check
  CHECK (activity_type IN (
    'created', 'email_sent', 'email_opened', 'proposal_sent',
    'proposal_viewed', 'call_scheduled', 'call_completed',
    'note_added', 'status_changed', 'assigned',
    'proposal_accepted', 'proposal_declined'
  ));
