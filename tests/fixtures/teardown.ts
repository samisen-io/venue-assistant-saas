/**
 * Test teardown fixture — Task 1.1
 *
 * Deletes records created by seedTestFixtures() in FK-safe order.
 * Uses the service-role client so RLS policies are bypassed.
 */

import { createClient } from '@supabase/supabase-js';
import type { TestIds } from './seed';

function buildAdminClient() {
  const url =
    process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase admin credentials for teardown. ' +
        'Set TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Delete all records seeded by seedTestFixtures() for one test run.
 * Safe to call even if some records were not created (e.g. after a partial test).
 */
export async function teardownTestFixtures(ids: TestIds): Promise<void> {
  const admin = buildAdminClient();

  const { venueId, spaceId, vendorId, eventId, clientId, leadId } = ids;

  // Delete in FK dependency order (deepest children first)

  // Event children
  await safeDelete(admin, 'vendor_quotes', 'event_id', eventId);
  await safeDelete(admin, 'vendor_communications', 'event_id', eventId);
  await safeDelete(admin, 'agent_runs', 'event_id', eventId);
  await safeDelete(admin, 'vendor_reviews', 'event_id', eventId);
  await safeDelete(admin, 'event_vendors', 'event_id', eventId);
  await safeDelete(admin, 'event_service_requirements', 'event_id', eventId);

  // Lead children
  await safeDelete(admin, 'lead_activities', 'lead_id', leadId);
  await safeDelete(admin, 'proposals', 'lead_id', leadId);

  // Client children
  await safeDelete(admin, 'client_communications', 'client_id', clientId);

  // Vendor children
  await safeDelete(admin, 'vendor_services', 'vendor_id', vendorId);

  // Top-level records
  await safeDelete(admin, 'events', 'id', eventId);
  await safeDelete(admin, 'leads', 'id', leadId);
  await safeDelete(admin, 'clients', 'id', clientId);
  await safeDelete(admin, 'vendors', 'id', vendorId);
  await safeDelete(admin, 'spaces', 'id', spaceId);

  // Venue children before venue
  await safeDelete(admin, 'venue_photos', 'venue_id', venueId);
  await safeDelete(admin, 'venue_amenities', 'venue_id', venueId);
  await safeDelete(admin, 'venue_packages', 'venue_id', venueId);
  await safeDelete(admin, 'venue_page_versions', 'venue_id', venueId);
  await safeDelete(admin, 'venue_ai_settings', 'venue_id', venueId);

  // Venue
  await safeDelete(admin, 'venues', 'id', venueId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeDelete(
  admin: any,
  table: string,
  column: string,
  id: string
): Promise<void> {
  if (!id) return;
  const { error } = await admin
    .from(table as never)
    .delete()
    .eq(column, id);

  if (error) {
    // Table might not exist yet (e.g. optional features not migrated)
    if ((error as { code?: string }).code === '42P01') return;
    // Log but don't throw — teardown failures shouldn't mask test failures
    console.warn(`teardown: failed to delete from ${table}: ${error.message}`);
  }
}
