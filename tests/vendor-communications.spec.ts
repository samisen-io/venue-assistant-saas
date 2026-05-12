import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for vendor communication tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Vendor Communication Thread', () => {
  test('contacting a vendor on an event creates a communication record', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Seed event + vendor + assignment
    const { data: space } = await admin.from('spaces').select('id').eq('venue_id', activeVenueId!).limit(1).single();
    if (!space) throw new Error('No space found');

    const { data: svc } = await admin.from('event_services')
      .insert({ venue_id: activeVenueId!, name: `PW Comm Svc ${suffix}`, slug: `pw-comm-svc-${suffix}`, is_active: true })
      .select('id').single();

    const { data: vendor } = await admin.from('vendors')
      .insert({ venue_id: activeVenueId!, name: `PW Comm Vendor ${suffix}`, contact_name: 'Comm Contact', contact_email: `pw-comm-${suffix}@example.com`, is_active: true })
      .select('id').single();

    await admin.from('vendor_services').insert({ vendor_id: vendor!.id, event_service_id: svc!.id });

    const eventDate = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: event } = await admin.from('events')
      .insert({ venue_id: activeVenueId!, space_id: space.id, event_name: `PW Comm Event ${suffix}`, event_type: 'corporate', event_date: eventDate, event_time: '13:00', event_end_time: '15:00', guest_count: 45, budget_total: 4500, status: 'planning' })
      .select('id').single();

    await admin.from('event_service_requirements').insert({ event_id: event!.id, event_service_id: svc!.id, budget_amount: 900 });

    const { data: association, error: assocErr } = await admin.from('event_vendors')
      .insert({ event_id: event!.id, vendor_id: vendor!.id, event_service_id: svc!.id, quoted_cost: 850, confirmed: false, outreach_status: 'pending', status_updated_at: new Date().toISOString() })
      .select('id').single();
    if (assocErr || !association) throw new Error(`Failed creating association: ${assocErr?.message}`);

    try {
      // POST to the contact endpoint — triggers outreach and creates a communication record
      const contactRes = await page.request.post(
        `/api/events/${event!.id}/vendors/${association.id}/contact`,
      );
      expect(
        // 200 = success, 422/400 = missing email (vendor has one here), 500 = server error
        [200, 201].includes(contactRes.status()),
        `POST /api/events/${event!.id}/vendors/${association.id}/contact failed: ${contactRes.status()} — ${await contactRes.text()}`,
      ).toBeTruthy();

      // Verify communication record created
      const { data: comms } = await admin
        .from('vendor_communications')
        .select('id')
        .eq('event_id', event!.id)
        .eq('vendor_id', vendor!.id);
      expect(
        (comms ?? []).length,
        'At least one vendor communication should be created after contact',
      ).toBeGreaterThan(0);

      // Verify the outreach status updated
      const { data: updatedAssoc } = await admin
        .from('event_vendors')
        .select('outreach_status')
        .eq('id', association.id)
        .single();
      expect(
        updatedAssoc?.outreach_status,
        'Outreach status should change from pending after contact',
      ).not.toBe('pending');

      // GET communications thread for the association
      const threadRes = await page.request.get(
        `/api/events/${event!.id}/vendors/${association.id}/communications`,
      );
      expect(threadRes.ok(), `GET communications failed: ${threadRes.status()}`).toBeTruthy();
      const thread = (await threadRes.json()) as Array<unknown>;
      expect(Array.isArray(thread)).toBeTruthy();
    } finally {
      await admin.from('vendor_communications').delete().eq('event_id', event!.id);
      await admin.from('event_vendors').delete().eq('event_id', event!.id);
      await admin.from('event_service_requirements').delete().eq('event_id', event!.id);
      await admin.from('events').delete().eq('id', event!.id);
      await admin.from('vendor_services').delete().eq('vendor_id', vendor!.id);
      await admin.from('vendors').delete().eq('id', vendor!.id);
      await admin.from('event_services').delete().eq('id', svc!.id);
    }
  });
});
