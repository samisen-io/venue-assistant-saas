-- =====================================================
-- MIGRATION: Multi-User Teams, RBAC & Audit Logs
-- =====================================================

-- 1. Create Enums and Tables for Team Members
CREATE TYPE venue_role AS ENUM ('owner', 'admin', 'staff', 'ai_agent');

CREATE TABLE IF NOT EXISTS venue_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role venue_role DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, profile_id)
);

-- Enable RLS on the new table
ALTER TABLE venue_team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can see other team members of their venue
CREATE POLICY "Users can view team members" ON venue_team_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM venue_team_members vtm WHERE vtm.venue_id = venue_team_members.venue_id AND vtm.profile_id = auth.uid()));

-- Policy: Only Owners/Admins can manage team members
CREATE POLICY "Admins can manage team members" ON venue_team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM venue_team_members vtm WHERE vtm.venue_id = venue_team_members.venue_id AND vtm.profile_id = auth.uid() AND vtm.role IN ('owner', 'admin')));

-- 2. Migrate existing Owners to the Team Members table
INSERT INTO venue_team_members (venue_id, profile_id, role)
SELECT id, owner_id, 'owner'::venue_role FROM venues
ON CONFLICT DO NOTHING;

-- 3. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, 
  action_type TEXT NOT NULL, 
  entity_type TEXT NOT NULL, 
  entity_id UUID NOT NULL,
  changes JSONB, 
  description TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view audit logs for their venue
CREATE POLICY "Users can view audit logs" ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM venue_team_members WHERE venue_team_members.venue_id = audit_logs.venue_id AND venue_team_members.profile_id = auth.uid()));

-- Policy: Service Role can insert audit logs (will be inserted by backend API, not direct client access)
-- Note: Supabase Edge Functions / Next.js API using Service Role bypasses RLS for inserts.
CREATE POLICY "Users cannot insert/update/delete audit logs directly" ON audit_logs FOR INSERT WITH CHECK (false);

-- =====================================================
-- 4. Rewrite All Existing RLS Policies
-- =====================================================

-- Helper function to check if user has access to venue (for performance)
CREATE OR REPLACE FUNCTION user_has_venue_access(v_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM venue_team_members WHERE venue_id = v_id AND profile_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

-- VENUES
DROP POLICY IF EXISTS "Users can view own venue" ON venues;
DROP POLICY IF EXISTS "Users can insert own venue" ON venues;
DROP POLICY IF EXISTS "Users can update own venue" ON venues;
DROP POLICY IF EXISTS "Users can delete own venue" ON venues;

CREATE POLICY "Team can view venue" ON venues FOR SELECT USING (user_has_venue_access(id));
CREATE POLICY "Users can insert venue" ON venues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- We will handle owner_id via API
CREATE POLICY "Admins can update venue" ON venues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM venue_team_members WHERE venue_id = id AND profile_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Only Owners can delete venue" ON venues FOR DELETE USING (
  EXISTS (SELECT 1 FROM venue_team_members WHERE venue_id = id AND profile_id = auth.uid() AND role = 'owner')
);

-- SPACES
DROP POLICY IF EXISTS "Users can view own spaces" ON spaces;
DROP POLICY IF EXISTS "Users can insert own spaces" ON spaces;
DROP POLICY IF EXISTS "Users can update own spaces" ON spaces;
DROP POLICY IF EXISTS "Users can delete own spaces" ON spaces;

CREATE POLICY "Team can view spaces" ON spaces FOR SELECT USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can insert spaces" ON spaces FOR INSERT WITH CHECK (user_has_venue_access(venue_id));
CREATE POLICY "Team can update spaces" ON spaces FOR UPDATE USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can delete spaces" ON spaces FOR DELETE USING (user_has_venue_access(venue_id));

-- EVENT SERVICES
DROP POLICY IF EXISTS "Users can view own event_services" ON event_services;
DROP POLICY IF EXISTS "Users can insert own event_services" ON event_services;
DROP POLICY IF EXISTS "Users can update own event_services" ON event_services;
DROP POLICY IF EXISTS "Users can delete own event_services" ON event_services;

CREATE POLICY "Team can view event_services" ON event_services FOR SELECT USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can insert event_services" ON event_services FOR INSERT WITH CHECK (user_has_venue_access(venue_id));
CREATE POLICY "Team can update event_services" ON event_services FOR UPDATE USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can delete event_services" ON event_services FOR DELETE USING (user_has_venue_access(venue_id));

-- VENDORS
DROP POLICY IF EXISTS "Users can view own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can insert own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can delete own vendors" ON vendors;

CREATE POLICY "Team can view vendors" ON vendors FOR SELECT USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can insert vendors" ON vendors FOR INSERT WITH CHECK (user_has_venue_access(venue_id));
CREATE POLICY "Team can update vendors" ON vendors FOR UPDATE USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can delete vendors" ON vendors FOR DELETE USING (user_has_venue_access(venue_id));

-- CLIENTS
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Team can view clients" ON clients FOR SELECT USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can insert clients" ON clients FOR INSERT WITH CHECK (user_has_venue_access(venue_id));
CREATE POLICY "Team can update clients" ON clients FOR UPDATE USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can delete clients" ON clients FOR DELETE USING (user_has_venue_access(venue_id));

-- EVENTS
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can insert own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

CREATE POLICY "Team can view events" ON events FOR SELECT USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can insert events" ON events FOR INSERT WITH CHECK (user_has_venue_access(venue_id));
CREATE POLICY "Team can update events" ON events FOR UPDATE USING (user_has_venue_access(venue_id));
CREATE POLICY "Team can delete events" ON events FOR DELETE USING (user_has_venue_access(venue_id));

-- VENDOR_SERVICES
DROP POLICY IF EXISTS "Users can view own vendor_services" ON vendor_services;
DROP POLICY IF EXISTS "Users can insert own vendor_services" ON vendor_services;
DROP POLICY IF EXISTS "Users can update own vendor_services" ON vendor_services;
DROP POLICY IF EXISTS "Users can delete own vendor_services" ON vendor_services;

CREATE POLICY "Team can view vendor_services" ON vendor_services FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = vendor_services.vendor_id AND user_has_venue_access(vendors.venue_id))
);
CREATE POLICY "Team can manage vendor_services" ON vendor_services FOR ALL USING (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = vendor_services.vendor_id AND user_has_venue_access(vendors.venue_id))
);

-- CLIENT_COMMUNICATIONS
DROP POLICY IF EXISTS "Users can view own client communications" ON client_communications;
DROP POLICY IF EXISTS "Users can insert own client communications" ON client_communications;
DROP POLICY IF EXISTS "Users can update own client communications" ON client_communications;
DROP POLICY IF EXISTS "Users can delete own client communications" ON client_communications;

CREATE POLICY "Team can manage client_communications" ON client_communications FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_communications.client_id AND user_has_venue_access(clients.venue_id))
);

-- EVENT_SERVICE_REQUIREMENTS
DROP POLICY IF EXISTS "Users can view own event_service_requirements" ON event_service_requirements;
DROP POLICY IF EXISTS "Users can insert own event_service_requirements" ON event_service_requirements;
DROP POLICY IF EXISTS "Users can update own event_service_requirements" ON event_service_requirements;
DROP POLICY IF EXISTS "Users can delete own event_service_requirements" ON event_service_requirements;

CREATE POLICY "Team can manage event_service_requirements" ON event_service_requirements FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_service_requirements.event_id AND user_has_venue_access(events.venue_id))
);

-- EVENT_VENDORS
DROP POLICY IF EXISTS "Users can view own event_vendors" ON event_vendors;
DROP POLICY IF EXISTS "Users can insert own event_vendors" ON event_vendors;
DROP POLICY IF EXISTS "Users can update own event_vendors" ON event_vendors;
DROP POLICY IF EXISTS "Users can delete own event_vendors" ON event_vendors;

CREATE POLICY "Team can manage event_vendors" ON event_vendors FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = event_vendors.event_id AND user_has_venue_access(events.venue_id))
);

-- VENDOR_REVIEWS
DROP POLICY IF EXISTS "Users can view own vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Users can insert own vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Users can update own vendor_reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Users can delete own vendor_reviews" ON vendor_reviews;

CREATE POLICY "Team can manage vendor_reviews" ON vendor_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = vendor_reviews.event_id AND user_has_venue_access(events.venue_id))
);

-- AI TABLES (AGENT_RUNS, VENDOR_COMMUNICATIONS, VENDOR_QUOTES)
DROP POLICY IF EXISTS "Users can view own agent_runs" ON agent_runs;
DROP POLICY IF EXISTS "Users can insert own agent_runs" ON agent_runs;
DROP POLICY IF EXISTS "Users can update own agent_runs" ON agent_runs;
CREATE POLICY "Team can manage agent_runs" ON agent_runs FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = agent_runs.event_id AND user_has_venue_access(events.venue_id))
);

DROP POLICY IF EXISTS "Users can view own vendor_communications" ON vendor_communications;
DROP POLICY IF EXISTS "Users can insert own vendor_communications" ON vendor_communications;
DROP POLICY IF EXISTS "Users can update own vendor_communications" ON vendor_communications;
CREATE POLICY "Team can manage vendor_communications" ON vendor_communications FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = vendor_communications.event_id AND user_has_venue_access(events.venue_id))
);

DROP POLICY IF EXISTS "Users can view own vendor_quotes" ON vendor_quotes;
DROP POLICY IF EXISTS "Users can insert own vendor_quotes" ON vendor_quotes;
DROP POLICY IF EXISTS "Users can update own vendor_quotes" ON vendor_quotes;
CREATE POLICY "Team can manage vendor_quotes" ON vendor_quotes FOR ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = vendor_quotes.event_id AND user_has_venue_access(events.venue_id))
);
