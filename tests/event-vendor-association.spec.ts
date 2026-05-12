import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for event vendor association tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Event Vendor Association', () => {
  test('update and delete an event vendor association via API', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Seed event + vendor + association
    const { data: space } = await admin.from('spaces').select('id').eq('venue_id', activeVenueId!).limit(1).single();
    if (!space) throw new Error('No space found');

    const { data: svc } = await admin.from('event_services')
      .insert({ venue_id: activeVenueId!, name: `PW EVA Svc ${suffix}`, slug: `pw-eva-svc-${suffix}`, is_active: true })
      .select('id').single();

    const { data: vendor } = await admin.from('vendors')
      .insert({ venue_id: activeVenueId!, name: `PW EVA Vendor ${suffix}`, contact_name: 'EVA Contact', contact_email: `pw-eva-${suffix}@example.com`, is_active: true })
      .select('id').single();

    await admin.from('vendor_services').insert({ vendor_id: vendor!.id, event_service_id: svc!.id });

    const eventDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: event } = await admin.from('events')
      .insert({ venue_id: activeVenueId!, space_id: space.id, event_name: `PW EVA Event ${suffix}`, event_type: 'corporate', event_date: eventDate, event_time: '09:00', event_end_time: '11:00', guest_count: 60, budget_total: 6000, status: 'planning' })
      .select('id').single();

    await admin.from('event_service_requirements').insert({ event_id: event!.id, event_service_id: svc!.id, budget_amount: 1200 });

    const { data: association, error: assocErr } = await admin.from('event_vendors')
      .insert({ event_id: event!.id, vendor_id: vendor!.id, event_service_id: svc!.id, quoted_cost: 1000, confirmed: false, outreach_status: 'pending', status_updated_at: new Date().toISOString() })
      .select('id').single();
    if (assocErr || !association) throw new Error(`Failed creating association: ${assocErr?.message}`);

    try {
      // UPDATE — change quoted cost
      const updateRes = await page.request.put(
        `/api/events/${event!.id}/vendors/${association.id}`,
        { data: { quoted_cost: 1100 } },
      );
      expect(
        updateRes.ok(),
        `PUT /api/events/${event!.id}/vendors/${association.id} failed: ${updateRes.status()} — ${await updateRes.text()}`,
      ).toBeTruthy();

      const { data: updated } = await admin
        .from('event_vendors').select('quoted_cost').eq('id', association.id).single();
      expect(updated?.quoted_cost).toBe(1100);

      // DELETE
      const deleteRes = await page.request.delete(
        `/api/events/${event!.id}/vendors/${association.id}`,
      );
      expect(
        [200, 204].includes(deleteRes.status()),
        `DELETE /api/events/${event!.id}/vendors/${association.id} failed: ${deleteRes.status()}`,
      ).toBeTruthy();

      const { data: gone } = await admin
        .from('event_vendors').select('id').eq('id', association.id).maybeSingle();
      expect(gone, 'Association should be deleted').toBeNull();
    } finally {
      await admin.from('event_vendors').delete().eq('event_id', event!.id);
      await admin.from('event_service_requirements').delete().eq('event_id', event!.id);
      await admin.from('events').delete().eq('id', event!.id);
      await admin.from('vendor_services').delete().eq('vendor_id', vendor!.id);
      await admin.from('vendors').delete().eq('id', vendor!.id);
      await admin.from('event_services').delete().eq('id', svc!.id);
    }
  });
});
