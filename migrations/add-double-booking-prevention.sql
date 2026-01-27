-- =====================================================
-- MIGRATION: Double-Booking Prevention
-- =====================================================
-- This migration creates a database function and trigger
-- to prevent overlapping space bookings at the database level.
-- Run this in Supabase SQL Editor AFTER add-event-end-time.sql
-- =====================================================

-- Function to check if a space is available for booking
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
    -- Handle NULL end time (assume same as start time + 1 hour)
    IF p_end_time IS NULL THEN
        p_end_time := p_start_time + INTERVAL '1 hour';
    END IF;

    -- Check for overlapping bookings
    SELECT COUNT(*)
    INTO conflict_count
    FROM events
    WHERE space_id = p_space_id
        AND event_date = p_event_date
        AND status != 'cancelled'  -- Exclude cancelled events
        AND (p_event_id IS NULL OR id != p_event_id)  -- Exclude current event when updating
        AND (
            -- Time ranges overlap if:
            -- New event starts during existing event
            (p_start_time >= event_time AND p_start_time < COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
            OR
            -- New event ends during existing event
            (p_end_time > event_time AND p_end_time <= COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
            OR
            -- New event completely contains existing event
            (p_start_time <= event_time AND p_end_time >= COALESCE(event_end_time, event_time + INTERVAL '1 hour'))
        );

    -- Return TRUE if available (no conflicts), FALSE otherwise
    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to prevent double-booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    is_available BOOLEAN;
    conflicting_event RECORD;
BEGIN
    -- Skip check if event is cancelled
    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    -- Check if space is available
    is_available := check_space_availability(
        NEW.space_id,
        NEW.event_date,
        NEW.event_time,
        NEW.event_end_time,
        NEW.id  -- Pass current event ID for updates
    );

    -- If not available, find conflicting event and raise error
    IF NOT is_available THEN
        -- Get details of conflicting event for error message
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

        -- Raise exception with helpful error message
        RAISE EXCEPTION 'Space is already booked for this time. Conflicting event: "%" (% - %)',
            conflicting_event.event_name,
            conflicting_event.event_time,
            conflicting_event.end_time
        USING ERRCODE = '23P01';  -- exclusion_violation error code
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on events table
DROP TRIGGER IF EXISTS check_booking_conflict ON events;
CREATE TRIGGER check_booking_conflict
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_double_booking();

-- =====================================================
-- TEST THE TRIGGER
-- =====================================================
-- Uncomment below to test the trigger with sample data
-- (Make sure you have a valid space_id first)

/*
-- This should succeed
INSERT INTO events (space_id, venue_id, event_name, event_type, event_date, event_time, event_end_time)
VALUES (
    'your-space-id-here',
    'your-venue-id-here',
    'Test Event 1',
    'conference',
    '2026-02-01',
    '10:00:00',
    '12:00:00'
);

-- This should fail with conflict error
INSERT INTO events (space_id, venue_id, event_name, event_type, event_date, event_time, event_end_time)
VALUES (
    'same-space-id',
    'your-venue-id-here',
    'Test Event 2',
    'conference',
    '2026-02-01',
    '11:00:00',  -- Overlaps with previous event
    '13:00:00'
);
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
