-- =====================================================
-- VENUEASSISTANT AI FEATURES DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- ============ TABLE 1: vendor_communications ============

CREATE TABLE vendor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,

  -- Email metadata
  thread_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  subject TEXT,
  body TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,

  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'replied', 'failed')),

  -- Metadata for agent processing
  processed BOOLEAN DEFAULT false,
  requires_followup BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendor_communications
CREATE INDEX idx_communications_event ON vendor_communications(event_id);
CREATE INDEX idx_communications_vendor ON vendor_communications(vendor_id);
CREATE INDEX idx_communications_thread ON vendor_communications(thread_id);
CREATE INDEX idx_communications_direction ON vendor_communications(direction);
CREATE INDEX idx_communications_processed ON vendor_communications(processed) WHERE NOT processed;

-- ============ TABLE 2: vendor_quotes ============

CREATE TABLE vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  communication_id UUID REFERENCES vendor_communications(id) ON DELETE SET NULL,

  -- Quote details (extracted by Claude from vendor email)
  total_cost DECIMAL(10,2) NOT NULL,
  breakdown JSONB,

  -- Availability
  availability_confirmed BOOLEAN DEFAULT false,
  available_date DATE,
  setup_time TIME,

  -- Terms extracted from email
  deposit_required DECIMAL(10,2),
  deposit_percentage DECIMAL(5,2),
  payment_terms TEXT,
  cancellation_policy TEXT,
  additional_notes TEXT,

  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'withdrawn')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,

  -- Raw data for audit trail
  raw_email_text TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendor_quotes
CREATE INDEX idx_quotes_event ON vendor_quotes(event_id);
CREATE INDEX idx_quotes_vendor ON vendor_quotes(vendor_id);
CREATE INDEX idx_quotes_status ON vendor_quotes(status);
CREATE INDEX idx_quotes_pending ON vendor_quotes(event_id, status) WHERE status = 'pending';

-- ============ TABLE 3: agent_runs ============

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,

  -- Run metadata
  trigger_type TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Progress tracking
  vendors_targeted INTEGER DEFAULT 0,
  vendors_contacted INTEGER DEFAULT 0,
  vendors_responded INTEGER DEFAULT 0,
  quotes_received INTEGER DEFAULT 0,

  -- Error tracking
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  last_error_at TIMESTAMP WITH TIME ZONE,

  -- Agent logs (for debugging and transparency)
  logs JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agent_runs
CREATE INDEX idx_agent_runs_event ON agent_runs(event_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);

-- ============ ROW LEVEL SECURITY POLICIES ============

-- RLS for vendor_communications
ALTER TABLE vendor_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view communications for own venue events" ON vendor_communications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = vendor_communications.event_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert communications" ON vendor_communications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update communications" ON vendor_communications
  FOR UPDATE USING (true);

-- RLS for vendor_quotes
ALTER TABLE vendor_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotes for own venue events" ON vendor_quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = vendor_quotes.event_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes for own events" ON vendor_quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = vendor_quotes.event_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert quotes" ON vendor_quotes
  FOR INSERT WITH CHECK (true);

-- RLS for agent_runs
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent runs for own venue events" ON agent_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = agent_runs.event_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert agent runs" ON agent_runs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update agent runs" ON agent_runs
  FOR UPDATE USING (true);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
