-- =====================================================
-- MIGRATION: Add client_id to events
-- =====================================================
-- Links events to clients (optional)
-- =====================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
