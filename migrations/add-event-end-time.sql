-- =====================================================
-- MIGRATION: Add event_end_time for Space Booking
-- =====================================================
-- This migration adds the event_end_time column to support
-- accurate conflict detection for space bookings.
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add event_end_time column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS event_end_time TIME;

-- Add composite index for efficient conflict detection queries
-- This index will be used to quickly find overlapping bookings
CREATE INDEX IF NOT EXISTS idx_events_space_time_range
ON events(space_id, event_date, event_time, event_end_time)
WHERE status != 'cancelled';

-- Add a helpful comment
COMMENT ON COLUMN events.event_end_time IS 'End time of the event. Used with event_time for space booking conflict detection.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Optionally update existing events with estimated end times
-- 2. Consider adding a default end time (e.g., event_time + 4 hours)
-- 3. Update application code to use event_end_time
-- =====================================================
