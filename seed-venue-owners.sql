-- One-time fix: seed venue_team_members for all existing venues
-- based on the owner_id column in the venues table.
-- Run this in the Supabase SQL editor.

INSERT INTO venue_team_members (venue_id, profile_id, role)
SELECT v.id, v.owner_id, 'owner'::venue_role
FROM venues v
WHERE v.owner_id IS NOT NULL
ON CONFLICT (venue_id, profile_id) DO UPDATE SET role = 'owner';
