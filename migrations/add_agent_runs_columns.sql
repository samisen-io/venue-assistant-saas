-- Migration: Add missing columns to agent_runs table
-- Purpose: Align agent_runs table with the code requirements

-- Add trigger_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'trigger_type'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN trigger_type TEXT;
    COMMENT ON COLUMN agent_runs.trigger_type IS 'Type of trigger: manual, webhook, scheduled';
  END IF;
END $$;

-- Add vendors_targeted column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'vendors_targeted'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN vendors_targeted INTEGER DEFAULT 0;
    COMMENT ON COLUMN agent_runs.vendors_targeted IS 'Number of vendors that should be contacted';
  END IF;
END $$;

-- Add vendors_contacted column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'vendors_contacted'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN vendors_contacted INTEGER DEFAULT 0;
    COMMENT ON COLUMN agent_runs.vendors_contacted IS 'Number of initial emails sent';
  END IF;
END $$;

-- Add vendors_responded column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'vendors_responded'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN vendors_responded INTEGER DEFAULT 0;
    COMMENT ON COLUMN agent_runs.vendors_responded IS 'Number of vendors who replied';
  END IF;
END $$;

-- Add quotes_received column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'quotes_received'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN quotes_received INTEGER DEFAULT 0;
    COMMENT ON COLUMN agent_runs.quotes_received IS 'Number of complete quotes extracted';
  END IF;
END $$;

-- Add last_activity_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    COMMENT ON COLUMN agent_runs.last_activity_at IS 'Last time any activity occurred for this run';
  END IF;
END $$;

-- Add error_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'error_count'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN error_count INTEGER DEFAULT 0;
    COMMENT ON COLUMN agent_runs.error_count IS 'Number of errors encountered';
  END IF;
END $$;

-- Add last_error_message column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'last_error_message'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN last_error_message TEXT;
    COMMENT ON COLUMN agent_runs.last_error_message IS 'Most recent error message';
  END IF;
END $$;

-- Add last_error_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'last_error_at'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN last_error_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN agent_runs.last_error_at IS 'Timestamp of the last error';
  END IF;
END $$;

-- Add logs column (JSONB array) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'logs'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN logs JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN agent_runs.logs IS 'Array of log entries for this agent run';
  END IF;
END $$;

-- Update status column to have proper constraints if needed
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'agent_runs' AND constraint_name LIKE '%status%'
  ) THEN
    ALTER TABLE agent_runs DROP CONSTRAINT IF EXISTS agent_runs_status_check;
  END IF;

  -- Add new constraint
  ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_status_check
    CHECK (status IN ('running', 'completed', 'failed', 'paused'));
END $$;

-- Create index on event_id for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_runs_event_id ON agent_runs(event_id);

-- Create index on status for dashboard queries
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

-- Create index on started_at for sorting recent runs
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at DESC);

COMMENT ON TABLE agent_runs IS 'Tracks AI agent execution runs for vendor outreach automation';
