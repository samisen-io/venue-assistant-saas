-- =====================================================
-- Venue Manager SAAS - COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains the complete database schema setup
-- Run this in Supabase SQL Editor for first-time setup
-- =====================================================

-- =====================================================
-- SECTION 1: PROFILE TRIGGER
-- =====================================================
-- Automatically creates a profile when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 2: DROP EXISTING TABLES (if any)
-- =====================================================
-- Safe to run on fresh database

DROP TABLE IF EXISTS vendor_reviews CASCADE;
DROP TABLE IF EXISTS event_vendors CASCADE;
DROP TABLE IF EXISTS event_service_requirements CASCADE;
DROP TABLE IF EXISTS vendor_services CASCADE;
DROP TABLE IF EXISTS event_services CASCADE;
DROP TABLE IF EXISTS vendor_quotes CASCADE;
DROP TABLE IF EXISTS vendor_communications CASCADE;
DROP TABLE IF EXISTS agent_runs CASCADE;
DROP TABLE IF EXISTS client_communications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- =====================================================
-- SECTION 3: CORE TABLES
-- =====================================================

-- Table: PROFILES (extends Supabase auth.users)
-- Note: This table structure should already exist or be created
-- Uncomment if needed:
-- CREATE TABLE profiles (
--   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
--   email TEXT UNIQUE NOT NULL,
--   full_name TEXT,
--   company_name TEXT,
--   phone TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Table: VENUES (one per user)
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE, -- UNIQUE: one venue per user
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  venue_type TEXT, -- hotel, banquet_hall, conference_center, resort
  description TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: SPACES (multiple per venue)
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER,
  space_type TEXT, -- ballroom, conference_room, meeting_room, outdoor_garden, rooftop, banquet_hall, other
  floor_level TEXT,
  square_footage INTEGER,
  hourly_rate DECIMAL(10,2),
  setup_time_minutes INTEGER DEFAULT 60,
  cleanup_time_minutes INTEGER DEFAULT 60,
  amenities TEXT[], -- ["Stage", "Dance Floor", "AV Equipment", "Projector", "WiFi", "Catering Kitchen"]
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: EVENT_SERVICES (catalog per venue)
CREATE TABLE event_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, slug)
);

-- Table: VENDORS (attached to venue)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  cost_structure TEXT, -- per_person, flat_rate, hourly, per_event
  cost_per_unit DECIMAL(10,2),
  website TEXT,
  notes TEXT,

  -- Performance metrics
  reliability_score INTEGER DEFAULT 0, -- 0-100
  total_events INTEGER DEFAULT 0,
  on_time_count INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 0,
  avg_quality_rating DECIMAL(3,2) DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: CLIENTS (booking contacts)
CREATE TABLE clients (
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

-- Table: VENDOR_SERVICES (many-to-many junction)
CREATE TABLE vendor_services (
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  event_service_id UUID REFERENCES event_services(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (vendor_id, event_service_id)
);

-- Table: EVENTS (attached to space)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL, -- Added for convenience
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- wedding, corporate, birthday, conference, gala, other
  event_date DATE NOT NULL,
  event_time TIME,
  guest_count INTEGER,
  budget_total DECIMAL(10,2),
  budget_spent DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  special_requirements TEXT,
  status TEXT DEFAULT 'planning', -- planning, confirmed, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: CLIENT_COMMUNICATIONS
CREATE TABLE client_communications (
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

-- Table: EVENT_SERVICE_REQUIREMENTS (many-to-many junction)
CREATE TABLE event_service_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  event_service_id UUID REFERENCES event_services(id) ON DELETE CASCADE NOT NULL,
  budget_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, event_service_id)
);

-- Table: EVENT_VENDORS (many-to-many junction)
CREATE TABLE event_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  event_service_id UUID REFERENCES event_services(id) ON DELETE CASCADE NOT NULL,
  assignment_type TEXT DEFAULT 'primary', -- primary, backup
  quoted_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, vendor_id, event_service_id)
);

-- Table: VENDOR_REVIEWS (post-event performance ratings)
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  on_time BOOLEAN NOT NULL,
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  cost_accurate BOOLEAN NOT NULL,
  would_use_again BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, vendor_id)
);

-- =====================================================
-- SECTION 4: AI FEATURE TABLES
-- =====================================================

-- Table: AGENT_RUNS
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'running', -- running, paused, completed, failed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Table: VENDOR_COMMUNICATIONS
CREATE TABLE vendor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- outbound, inbound
  subject TEXT,
  body TEXT,
  from_email TEXT,
  to_email TEXT,
  email_id TEXT,
  thread_id TEXT,
  status TEXT DEFAULT 'sent', -- sent, delivered, bounced, received, replied
  sent_at TIMESTAMP WITH TIME ZONE, -- Set when venue manager sends email to vendor (outbound)
  received_at TIMESTAMP WITH TIME ZONE, -- Set when vendor replies back (inbound)
  read_at TIMESTAMP WITH TIME ZONE, -- Set when email is opened by recipient
  processed BOOLEAN DEFAULT false, -- Whether the communication has been processed by the agent
  requires_followup BOOLEAN DEFAULT false, -- Whether this communication needs follow-up action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: VENDOR_QUOTES
CREATE TABLE vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID REFERENCES vendor_communications(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  quoted_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  valid_until DATE,
  breakdown JSONB,
  terms TEXT,
  payment_schedule TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, expired
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 5: INDEXES
-- =====================================================

CREATE INDEX idx_spaces_venue_id ON spaces(venue_id);
CREATE INDEX idx_event_services_venue_id ON event_services(venue_id);
CREATE INDEX idx_vendors_venue_id ON vendors(venue_id);
CREATE INDEX idx_clients_venue_id ON clients(venue_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_vendor_services_vendor_id ON vendor_services(vendor_id);
CREATE INDEX idx_vendor_services_service_id ON vendor_services(event_service_id);
CREATE INDEX idx_events_space_id ON events(space_id);
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_service_requirements_event_id ON event_service_requirements(event_id);
CREATE INDEX idx_event_service_requirements_service_id ON event_service_requirements(event_service_id);
CREATE INDEX idx_event_vendors_event_id ON event_vendors(event_id);
CREATE INDEX idx_event_vendors_vendor_id ON event_vendors(vendor_id);
CREATE INDEX idx_event_vendors_service_id ON event_vendors(event_service_id);
CREATE INDEX idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);
CREATE INDEX idx_client_comms_client_id ON client_communications(client_id);
CREATE INDEX idx_client_comms_event_id ON client_communications(event_id);
CREATE INDEX idx_agent_runs_event_id ON agent_runs(event_id);
CREATE INDEX idx_vendor_communications_event_id ON vendor_communications(event_id);
CREATE INDEX idx_vendor_communications_vendor_id ON vendor_communications(vendor_id);
CREATE INDEX idx_vendor_quotes_event_id ON vendor_quotes(event_id);
CREATE INDEX idx_vendor_quotes_vendor_id ON vendor_quotes(vendor_id);

-- =====================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 7: RLS POLICIES
-- =====================================================

-- VENUES: Users can view/update their own venue
CREATE POLICY "Users can view own venue" ON venues FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own venue" ON venues FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own venue" ON venues FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own venue" ON venues FOR DELETE USING (auth.uid() = owner_id);

-- SPACES: Users can manage spaces for their venue
CREATE POLICY "Users can view own spaces" ON spaces FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = spaces.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own spaces" ON spaces FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = spaces.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own spaces" ON spaces FOR UPDATE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = spaces.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own spaces" ON spaces FOR DELETE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = spaces.venue_id AND venues.owner_id = auth.uid()));

-- EVENT_SERVICES: Users can manage services for their venue
CREATE POLICY "Users can view own event_services" ON event_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = event_services.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own event_services" ON event_services FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = event_services.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own event_services" ON event_services FOR UPDATE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = event_services.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own event_services" ON event_services FOR DELETE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = event_services.venue_id AND venues.owner_id = auth.uid()));

-- VENDORS: Users can manage vendors for their venue
CREATE POLICY "Users can view own vendors" ON vendors FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = vendors.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own vendors" ON vendors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = vendors.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own vendors" ON vendors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = vendors.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own vendors" ON vendors FOR DELETE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = vendors.venue_id AND venues.owner_id = auth.uid()));

-- CLIENTS: Users can manage clients for their venue
CREATE POLICY "Users can view own clients" ON clients FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = clients.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = clients.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = clients.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = clients.venue_id AND venues.owner_id = auth.uid()));

-- VENDOR_SERVICES: Users can manage vendor services for their venue
CREATE POLICY "Users can view own vendor_services" ON vendor_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      JOIN venues ON venues.id = vendors.venue_id
      WHERE vendors.id = vendor_services.vendor_id
      AND venues.owner_id = auth.uid()
    )
  );
  
-- CLIENT_COMMUNICATIONS: Users can manage communications for their clients
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
CREATE POLICY "Users can insert own vendor_services" ON vendor_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      JOIN venues ON venues.id = vendors.venue_id
      WHERE vendors.id = vendor_services.vendor_id
      AND venues.owner_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM event_services
      JOIN venues ON venues.id = event_services.venue_id
      WHERE event_services.id = vendor_services.event_service_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own vendor_services" ON vendor_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      JOIN venues ON venues.id = vendors.venue_id
      WHERE vendors.id = vendor_services.vendor_id
      AND venues.owner_id = auth.uid()
    )
  );

-- EVENTS: Users can manage events for their venue
CREATE POLICY "Users can view own events" ON events FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own events" ON events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own events" ON events FOR UPDATE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own events" ON events FOR DELETE
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()));

-- EVENT_SERVICE_REQUIREMENTS: Users can manage services needed for their events
CREATE POLICY "Users can view own event_service_requirements" ON event_service_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_service_requirements.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own event_service_requirements" ON event_service_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_service_requirements.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own event_service_requirements" ON event_service_requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_service_requirements.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own event_service_requirements" ON event_service_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_service_requirements.event_id
      AND venues.owner_id = auth.uid()
    )
  );

-- EVENT_VENDORS: Users can manage event-vendor assignments
CREATE POLICY "Users can view own event_vendors" ON event_vendors FOR SELECT
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = event_vendors.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own event_vendors" ON event_vendors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = event_vendors.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own event_vendors" ON event_vendors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = event_vendors.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own event_vendors" ON event_vendors FOR DELETE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = event_vendors.event_id AND venues.owner_id = auth.uid()));

-- VENDOR_REVIEWS: Users can manage reviews for their events
CREATE POLICY "Users can view own vendor_reviews" ON vendor_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_reviews.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own vendor_reviews" ON vendor_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_reviews.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own vendor_reviews" ON vendor_reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_reviews.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can delete own vendor_reviews" ON vendor_reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_reviews.event_id AND venues.owner_id = auth.uid()));

-- AI TABLES: RLS Policies
CREATE POLICY "Users can view own agent_runs" ON agent_runs FOR SELECT
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = agent_runs.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own agent_runs" ON agent_runs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = agent_runs.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own agent_runs" ON agent_runs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = agent_runs.event_id AND venues.owner_id = auth.uid()));

CREATE POLICY "Users can view own vendor_communications" ON vendor_communications FOR SELECT
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_communications.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own vendor_communications" ON vendor_communications FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_communications.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own vendor_communications" ON vendor_communications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_communications.event_id AND venues.owner_id = auth.uid()));

CREATE POLICY "Users can view own vendor_quotes" ON vendor_quotes FOR SELECT
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_quotes.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can insert own vendor_quotes" ON vendor_quotes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_quotes.event_id AND venues.owner_id = auth.uid()));
CREATE POLICY "Users can update own vendor_quotes" ON vendor_quotes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events JOIN venues ON events.venue_id = venues.id WHERE events.id = vendor_quotes.event_id AND venues.owner_id = auth.uid()));

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
--
-- Next steps:
-- 1. Run this file in Supabase SQL Editor
-- 2. Verify all tables were created successfully
-- 3. Test user signup to confirm profile trigger works
-- 4. Optionally run seed data if available
--
-- =====================================================
