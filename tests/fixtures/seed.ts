/**
 * Test seed fixture — Task 1.1
 *
 * Creates minimal deterministic test records in the DB using the Supabase
 * service-role client (bypasses RLS). Returns typed IDs for use in tests.
 *
 * Environment variables required:
 *   TEST_SUPABASE_URL          (falls back to NEXT_PUBLIC_SUPABASE_URL)
 *   TEST_SUPABASE_SERVICE_ROLE_KEY  (falls back to SUPABASE_SERVICE_ROLE_KEY)
 *   TEST_USER_EMAIL            — used to resolve the test user's UUID
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TestIds {
  venueId: string;
  venueSlug: string;
  spaceId: string;
  vendorId: string;
  eventId: string;
  clientId: string;
  leadId: string;
}

/** Unique tag embedded in every test-seed record so teardown can find them. */
const TEST_MARKER = 'playwright-test-fixture';

function buildAdminClient(): SupabaseClient {
  const url =
    process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase admin credentials for test seed. ' +
        'Set TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY ' +
        '(see docs/testing/TEST_ENV_CONTRACT.md).'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Resolve the test user's UUID from their email address. */
export async function getTestUserId(): Promise<string> {
  const email = process.env.TEST_USER_EMAIL;
  if (!email) {
    throw new Error(
      'Missing TEST_USER_EMAIL — cannot resolve test user UUID for seeding.'
    );
  }

  const admin = buildAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`Failed to list users: ${error.message}`);

  const user = data.users.find((u) => u.email === email);
  if (!user) {
    throw new Error(
      `Test user "${email}" not found in Supabase. ` +
        'Create the account first or check TEST_USER_EMAIL.'
    );
  }

  return user.id;
}

/**
 * Seed a minimal set of test records for one test run.
 * Each call creates brand-new records (timestamped names) so parallel
 * test workers don't collide. Call teardownTestFixtures() in afterEach.
 */
export async function seedTestFixtures(userId: string): Promise<TestIds> {
  const admin = buildAdminClient();
  const ts = Date.now();
  const slug = `pw-test-venue-${ts}`;

  // 1 — Venue
  const { data: venue, error: venueErr } = await admin
    .from('venues')
    .insert({
      owner_id: userId,
      name: `PW Test Venue ${ts}`,
      slug,
      venue_type: 'conference_center',
      description: TEST_MARKER,
      address: '1 Test Street',
      city: 'Testville',
      state: 'CA',
      zip_code: '00000',
      email: `pw-test-${ts}@example.com`,
      page_status: 'draft',
      is_default: false,
    })
    .select('id, slug')
    .single();
  if (venueErr) throw new Error(`seed venue: ${venueErr.message}`);

  const venueId = venue.id as string;
  const venueSlug = venue.slug as string;

  // 2 — Space
  const { data: space, error: spaceErr } = await admin
    .from('spaces')
    .insert({
      venue_id: venueId,
      name: `PW Test Space ${ts}`,
      capacity: 50,
      space_type: 'ballroom',
      description: TEST_MARKER,
    })
    .select('id')
    .single();
  if (spaceErr) throw new Error(`seed space: ${spaceErr.message}`);

  const spaceId = space.id as string;

  // 3 — Vendor
  const { data: vendor, error: vendorErr } = await admin
    .from('vendors')
    .insert({
      venue_id: venueId,
      name: `PW Test Vendor ${ts}`,
      category: 'catering',
      email: `vendor-${ts}@example.com`,
      description: TEST_MARKER,
    })
    .select('id')
    .single();
  if (vendorErr) throw new Error(`seed vendor: ${vendorErr.message}`);

  const vendorId = vendor.id as string;

  // 4 — Client
  const { data: client, error: clientErr } = await admin
    .from('clients')
    .insert({
      venue_id: venueId,
      name: `PW Test Client ${ts}`,
      email: `client-${ts}@example.com`,
      phone: '555-0100',
      notes: TEST_MARKER,
    })
    .select('id')
    .single();
  if (clientErr) throw new Error(`seed client: ${clientErr.message}`);

  const clientId = client.id as string;

  // 5 — Event (30 days from now, uses the seeded space)
  const eventDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data: event, error: eventErr } = await admin
    .from('events')
    .insert({
      venue_id: venueId,
      client_id: clientId,
      space_id: spaceId,
      event_name: `PW Test Event ${ts}`,
      event_type: 'corporate',
      event_date: eventDate,
      start_time: '10:00',
      end_time: '14:00',
      guest_count: 40,
      total_budget: 5000,
      status: 'planning',
      notes: TEST_MARKER,
    })
    .select('id')
    .single();
  if (eventErr) throw new Error(`seed event: ${eventErr.message}`);

  const eventId = event.id as string;

  // 6 — Lead
  const { data: lead, error: leadErr } = await admin
    .from('leads')
    .insert({
      venue_id: venueId,
      name: `PW Test Lead ${ts}`,
      email: `lead-${ts}@example.com`,
      phone: '555-0200',
      event_type: 'corporate',
      status: 'new',
      source: 'manual',
      notes: TEST_MARKER,
    })
    .select('id')
    .single();
  if (leadErr) throw new Error(`seed lead: ${leadErr.message}`);

  const leadId = lead.id as string;

  return { venueId, venueSlug, spaceId, vendorId, eventId, clientId, leadId };
}
