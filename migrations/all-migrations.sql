-- =====================================================
-- ALL INCREMENTAL MIGRATIONS
-- =====================================================
-- Run this file AFTER setup-database.sql on an existing database.
-- All statements are idempotent (safe to re-run).
-- =====================================================


-- =====================================================
-- MIGRATION 1: Agent Runs - additional columns
-- =====================================================
-- Adds progress tracking, error tracking, and logs
-- to the agent_runs table for AI agent functionality.
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'trigger_type'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN trigger_type TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'vendors_targeted'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN vendors_targeted INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'vendors_contacted'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN vendors_contacted INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'vendors_responded'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN vendors_responded INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'quotes_received'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN quotes_received INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'error_count'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN error_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'last_error_message'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN last_error_message TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'last_error_at'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN last_error_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_runs' AND column_name = 'logs'
  ) THEN
    ALTER TABLE agent_runs ADD COLUMN logs JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'agent_runs' AND constraint_name LIKE '%status%'
  ) THEN
    ALTER TABLE agent_runs DROP CONSTRAINT IF EXISTS agent_runs_status_check;
  END IF;
  ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_status_check
    CHECK (status IN ('running', 'completed', 'failed', 'paused'));
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_runs_event_id ON agent_runs(event_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs(started_at DESC);


-- =====================================================
-- MIGRATION 2: Vendor Communications - additional columns
-- =====================================================
-- Adds sent_at/received_at timestamps and email tracking
-- columns to vendor_communications.
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'received_at'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN received_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'from_email'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN from_email TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'to_email'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN to_email TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'processed'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN processed BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'requires_followup'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN requires_followup BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  ALTER TABLE vendor_communications ALTER COLUMN event_id DROP NOT NULL;
  ALTER TABLE vendor_communications ALTER COLUMN vendor_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Migrate existing data timestamps
UPDATE vendor_communications
SET sent_at = received_at
WHERE direction = 'outbound' AND sent_at IS NULL AND received_at IS NOT NULL;

UPDATE vendor_communications
SET received_at = sent_at
WHERE direction = 'inbound' AND received_at IS NULL AND sent_at IS NOT NULL;

UPDATE vendor_communications
SET sent_at = created_at
WHERE direction = 'outbound' AND sent_at IS NULL;

UPDATE vendor_communications
SET received_at = created_at
WHERE direction = 'inbound' AND received_at IS NULL;


-- =====================================================
-- MIGRATION 3: Event End Time
-- =====================================================
-- Adds event_end_time column for space booking
-- conflict detection.
-- =====================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_time TIME;

CREATE INDEX IF NOT EXISTS idx_events_space_time_range
ON events(space_id, event_date, event_time, event_end_time)
WHERE status != 'cancelled';

COMMENT ON COLUMN events.event_end_time IS 'End time of the event. Used with event_time for space booking conflict detection.';


-- =====================================================
-- MIGRATION 4: Double-Booking Prevention
-- =====================================================
-- Database function and trigger to prevent overlapping
-- space bookings. Depends on Migration 3.
-- =====================================================

CREATE OR REPLACE FUNCTION check_space_availability(
    p_space_id UUID,
    p_event_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_event_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    IF p_end_time IS NULL THEN
        p_end_time := p_start_time + INTERVAL '1 hour';
    END IF;

    SELECT COUNT(*)
    INTO conflict_count
    FROM events
    WHERE space_id = p_space_id
        AND event_date = p_event_date
        AND status != 'cancelled'
        AND (p_event_id IS NULL OR id != p_event_id)
        AND (
            (p_start_time >= event_time AND p_start_time < COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
            OR
            (p_end_time > event_time AND p_end_time <= COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
            OR
            (p_start_time <= event_time AND p_end_time >= COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
        );

    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    is_available BOOLEAN;
    conflicting_event RECORD;
BEGIN
    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    is_available := check_space_availability(
        NEW.space_id,
        NEW.event_date,
        NEW.event_time,
        NEW.event_end_time,
        NEW.id
    );

    IF NOT is_available THEN
        SELECT event_name, event_time, COALESCE(event_end_time, event_time + INTERVAL '1 hour') as end_time
        INTO conflicting_event
        FROM events
        WHERE space_id = NEW.space_id
            AND event_date = NEW.event_date
            AND status != 'cancelled'
            AND (TG_OP = 'INSERT' OR id != NEW.id)
            AND (
                (NEW.event_time >= event_time AND NEW.event_time < COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
                OR
                (COALESCE(NEW.event_end_time, NEW.event_time + INTERVAL '1 hour') > event_time
                    AND COALESCE(NEW.event_end_time, NEW.event_time + INTERVAL '1 hour') <= COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
                OR
                (NEW.event_time <= event_time AND COALESCE(NEW.event_end_time, NEW.event_time + INTERVAL '1 hour') >= COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
            )
        LIMIT 1;

        RAISE EXCEPTION 'Space is already booked for this time. Conflicting event: "%" (% - %)',
            conflicting_event.event_name,
            conflicting_event.event_time,
            conflicting_event.end_time
        USING ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_booking_conflict ON events;
CREATE TRIGGER check_booking_conflict
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_double_booking();


-- =====================================================
-- MIGRATION 5: Clients Table
-- =====================================================
-- Creates clients table with RLS policies.
-- Note: setup-database.sql already creates this table,
-- so IF NOT EXISTS guards are used here.
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  notify_on_booking_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_venue_id ON clients(venue_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);


-- =====================================================
-- MIGRATION 6: Client Communications
-- =====================================================
-- Creates client_communications table with RLS policies.
-- Note: setup-database.sql already creates this table,
-- so IF NOT EXISTS guards are used here.
-- =====================================================

CREATE TABLE IF NOT EXISTS client_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('booking_confirmed', 'booking_updated', 'booking_cancelled', 'general', 'reminder')),
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_comms_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_comms_event_id ON client_communications(event_id);


-- =====================================================
-- MIGRATION 7: Add client_id to Events
-- =====================================================
-- Links events to clients (optional FK).
-- Note: setup-database.sql already includes this column,
-- so IF NOT EXISTS guard is used here.
-- =====================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);


-- =====================================================
-- MIGRATION 8: Webhook Events Table
-- =====================================================
-- Stores incoming webhook events from Resend for
-- async processing via cron job.
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'resend',
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processing_error TEXT,
    vendor_communication_id UUID REFERENCES vendor_communications(id),
    CONSTRAINT webhook_events_event_type_check CHECK (event_type IN (
        'email.sent',
        'email.delivered',
        'email.bounced',
        'email.opened',
        'email.clicked',
        'email.complained',
        'email.delivery_delayed',
        'email.received'
    ))
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_vendor_communication_id ON webhook_events(vendor_communication_id);

-- RLS for webhook_events (system-level table)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Service role can insert webhook events'
  ) THEN
    CREATE POLICY "Service role can insert webhook events"
      ON webhook_events FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Service role can read all webhook events'
  ) THEN
    CREATE POLICY "Service role can read all webhook events"
      ON webhook_events FOR SELECT TO service_role USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Users can read their own webhook events'
  ) THEN
    CREATE POLICY "Users can read their own webhook events"
      ON webhook_events FOR SELECT TO authenticated
      USING (
        vendor_communication_id IN (
          SELECT vc.id FROM vendor_communications vc
          JOIN events e ON vc.event_id = e.id
          JOIN venues v ON e.venue_id = v.id
          WHERE v.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Service role can update webhook events'
  ) THEN
    CREATE POLICY "Service role can update webhook events"
      ON webhook_events FOR UPDATE TO service_role USING (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 9: Subscriptions & Usage Tracking
-- =====================================================
-- Creates subscriptions and usage_tracking tables for
-- Stripe billing integration (Phase 23).
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'professional', 'enterprise', 'trial')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscription'
  ) THEN
    CREATE POLICY "Users can view own subscription"
      ON subscriptions FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscription'
  ) THEN
    CREATE POLICY "Users can update own subscription"
      ON subscriptions FOR UPDATE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Service role can manage subscriptions'
  ) THEN
    CREATE POLICY "Service role can manage subscriptions"
      ON subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    venues_created INTEGER DEFAULT 0,
    events_created INTEGER DEFAULT 0,
    vendors_created INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'usage_tracking' AND policyname = 'Users can view own usage'
  ) THEN
    CREATE POLICY "Users can view own usage"
      ON usage_tracking FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'usage_tracking' AND policyname = 'Service role can manage usage tracking'
  ) THEN
    CREATE POLICY "Service role can manage usage tracking"
      ON usage_tracking FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;


-- =====================================================
-- MIGRATION 10: Add contact_name to venues
-- =====================================================

ALTER TABLE venues ADD COLUMN IF NOT EXISTS contact_name TEXT;


-- =====================================================
-- MIGRATION 11: Vendor Outreach Lifecycle
-- =====================================================
-- Adds outreach_status and related columns to event_vendors
-- for tracking the complete vendor communication lifecycle.
-- =====================================================

-- Create the outreach status enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_outreach_status') THEN
    CREATE TYPE vendor_outreach_status AS ENUM (
      'pending',         -- Not yet contacted (default for legacy)
      'contacted',       -- Initial outreach sent
      'available',       -- Vendor responded positively, within budget
      'not_available',   -- Vendor declined or unavailable
      'needs_attention', -- Vendor available but over budget
      'confirmed',       -- Venue manager confirmed
      'rejected'         -- Venue manager rejected
    );
  END IF;
END $$;

-- Add outreach_status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_vendors' AND column_name = 'outreach_status'
  ) THEN
    ALTER TABLE event_vendors ADD COLUMN outreach_status vendor_outreach_status DEFAULT 'pending';
  END IF;
END $$;

-- Add status_updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_vendors' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE event_vendors ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add status_notes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_vendors' AND column_name = 'status_notes'
  ) THEN
    ALTER TABLE event_vendors ADD COLUMN status_notes TEXT;
  END IF;
END $$;

-- Add contacted_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_vendors' AND column_name = 'contacted_at'
  ) THEN
    ALTER TABLE event_vendors ADD COLUMN contacted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add vendor_response_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_vendors' AND column_name = 'vendor_response_at'
  ) THEN
    ALTER TABLE event_vendors ADD COLUMN vendor_response_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add rejection_reason column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_vendors' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE event_vendors ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- Add event_vendor_id column to vendor_communications for linking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendor_communications' AND column_name = 'event_vendor_id'
  ) THEN
    ALTER TABLE vendor_communications ADD COLUMN event_vendor_id UUID REFERENCES event_vendors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index on outreach_status
CREATE INDEX IF NOT EXISTS idx_event_vendors_outreach_status ON event_vendors(outreach_status);

-- Create index on event_vendor_id in vendor_communications
CREATE INDEX IF NOT EXISTS idx_vendor_communications_event_vendor_id ON vendor_communications(event_vendor_id);

-- Migrate existing records: Set outreach_status based on confirmed flag
UPDATE event_vendors
SET outreach_status = CASE
  WHEN confirmed = true THEN 'confirmed'::vendor_outreach_status
  ELSE 'pending'::vendor_outreach_status
END,
status_updated_at = COALESCE(confirmed_at, created_at)
WHERE outreach_status IS NULL OR outreach_status = 'pending'::vendor_outreach_status;


-- =====================================================
-- MIGRATION 12: Multi-Venue Support
-- =====================================================
-- Removes the one-venue-per-user constraint and adds
-- is_default flag so each user has a designated default venue.
-- =====================================================

-- Drop UNIQUE constraint on owner_id (was enforcing one venue per user)
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_owner_id_key;

-- Add is_default column
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Mark existing single venues as default
UPDATE venues v
SET is_default = true
WHERE is_default = false
  AND NOT EXISTS (
    SELECT 1 FROM venues v2
    WHERE v2.owner_id = v.owner_id AND v2.is_default = true
  );

CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_owner_default ON venues(owner_id, is_default);


-- =====================================================
-- MIGRATION 13: Rename spaces_created to venues_created
-- =====================================================
-- Aligns usage_tracking column name with the multi-venue model.
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usage_tracking' AND column_name = 'spaces_created'
  ) THEN
    ALTER TABLE usage_tracking RENAME COLUMN spaces_created TO venues_created;
  END IF;
END $$;


-- =====================================================
-- MIGRATION: Proposals E-Signature Fields (M5)
-- =====================================================
-- Adds public_token and e-signature capture columns to proposals.
-- Extends lead_activities activity_type CHECK to include accepted/declined.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'public_token'
  ) THEN
    ALTER TABLE proposals ADD COLUMN public_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'accepted_by_name'
  ) THEN
    ALTER TABLE proposals ADD COLUMN accepted_by_name TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE proposals ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'accepted_ip'
  ) THEN
    ALTER TABLE proposals ADD COLUMN accepted_ip TEXT;
  END IF;
END $$;

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


-- =====================================================
-- ALL MIGRATIONS COMPLETE
-- =====================================================
