-- Users table is managed by Supabase Auth

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues (multi-tenant: one user can manage multiple venues)
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  capacity INTEGER,
  venue_type TEXT, -- hotel, banquet_hall, conference_center, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors (belongs to a venue)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- catering, av, florals, parking, security, entertainment
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  cost_structure TEXT, -- per_person, flat_rate, hourly
  cost_per_unit DECIMAL(10,2), -- cost per person/hour/event
  website TEXT,
  notes TEXT,
  
  -- Performance metrics (calculated fields)
  reliability_score INTEGER DEFAULT 0, -- 0-100
  total_events INTEGER DEFAULT 0,
  on_time_count INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 0,
  avg_quality_rating DECIMAL(3,2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- gala, wedding, conference, corporate, party
  event_date DATE NOT NULL,
  event_time TIME,
  guest_count INTEGER NOT NULL,
  
  -- Budget
  budget_total DECIMAL(10,2) NOT NULL,
  budget_breakdown JSONB DEFAULT '{}', -- { "catering": 5000, "av": 2000, ... }
  actual_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'planning', -- planning, confirmed, in_progress, completed, cancelled
  
  -- Additional info
  description TEXT,
  special_requirements TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event-Vendor Assignments (many-to-many)
CREATE TABLE event_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  
  category TEXT NOT NULL, -- catering, av, etc.
  assignment_type TEXT DEFAULT 'primary', -- primary, backup
  
  -- Costs for this specific assignment
  quoted_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Confirmation status
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, vendor_id)
);

-- Vendor Performance Reviews (post-event)
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  
  -- Performance ratings
  on_time BOOLEAN,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  cost_accurate BOOLEAN,
  would_use_again BOOLEAN,
  
  -- Notes
  notes TEXT,
  
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, vendor_id)
);

-- Indexes for performance
CREATE INDEX idx_venues_owner ON venues(owner_id);
CREATE INDEX idx_vendors_venue ON vendors(venue_id);
CREATE INDEX idx_vendors_category ON vendors(venue_id, category);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_vendors_event ON event_vendors(event_id);
CREATE INDEX idx_event_vendors_vendor ON event_vendors(vendor_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Venues: Users can only access their own venues
CREATE POLICY "Users can view own venues" ON venues
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own venues" ON venues
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own venues" ON venues
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own venues" ON venues
  FOR DELETE USING (auth.uid() = owner_id);

-- Vendors: Users can only access vendors for their venues
CREATE POLICY "Users can view vendors for own venues" ON vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert vendors for own venues" ON vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update vendors for own venues" ON vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete vendors for own venues" ON vendors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = vendors.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );

-- Events: Users can only access events for their venues
CREATE POLICY "Users can view events for own venues" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = events.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert events for own venues" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = events.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update events for own venues" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = events.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete events for own venues" ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = events.venue_id 
      AND venues.owner_id = auth.uid()
    )
  );

-- Event Vendors: Access inherited from events
CREATE POLICY "Users can view event_vendors for own venues" ON event_vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_vendors.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert event_vendors for own venues" ON event_vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_vendors.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update event_vendors for own venues" ON event_vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_vendors.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete event_vendors for own venues" ON event_vendors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = event_vendors.event_id
      AND venues.owner_id = auth.uid()
    )
  );

-- Vendor Reviews: Access inherited from events
CREATE POLICY "Users can view vendor_reviews for own venues" ON vendor_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = vendor_reviews.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert vendor_reviews for own venues" ON vendor_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = vendor_reviews.event_id
      AND venues.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update vendor_reviews for own venues" ON vendor_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN venues ON venues.id = events.venue_id
      WHERE events.id = vendor_reviews.event_id
      AND venues.owner_id = auth.uid()
    )
  );
