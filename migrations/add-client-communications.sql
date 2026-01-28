-- =====================================================
-- MIGRATION: Client communications log
-- =====================================================
-- Adds a lightweight communications audit trail
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_comms_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_comms_event_id ON client_communications(event_id);

-- Enable Row Level Security
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own client communications" ON client_communications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN venues ON venues.id = clients.venue_id
      WHERE clients.id = client_communications.client_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own client communications" ON client_communications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      JOIN venues ON venues.id = clients.venue_id
      WHERE clients.id = client_communications.client_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own client communications" ON client_communications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN venues ON venues.id = clients.venue_id
      WHERE clients.id = client_communications.client_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own client communications" ON client_communications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      JOIN venues ON venues.id = clients.venue_id
      WHERE clients.id = client_communications.client_id
      AND venues.owner_id = auth.uid()
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
