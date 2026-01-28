-- =====================================================
-- MIGRATION: Clients table
-- =====================================================
-- Adds a lightweight CRM clients table with RLS policies
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_venue_id ON clients(venue_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own clients" ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = clients.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own clients" ON clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = clients.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own clients" ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = clients.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own clients" ON clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = clients.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
