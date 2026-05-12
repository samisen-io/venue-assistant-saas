import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for quote tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Quote Approval & Rejection', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });
  });

  test('approving a quote assigns the vendor and marks quote approved', async ({ page }) => {
    test.setTimeout(60_000);
    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Seed: space → vendor → event → event_service_requirement → quote
    const { data: space } = await admin
      .from('spaces')
      .select('id')
      .eq('venue_id', activeVenueId!)
      .limit(1)
      .single();
    if (!space) throw new Error('No space found for test venue');

    const { data: svc } = await admin
      .from('event_services')
      .insert({ venue_id: activeVenueId!, name: `PW Quote Svc ${suffix}`, slug: `pw-q-svc-${suffix}`, is_active: true })
      .select('id').single();

    const { data: vendor } = await admin
      .from('vendors')
      .insert({ venue_id: activeVenueId!, name: `PW Quote Vendor ${suffix}`, contact_name: 'Q Contact', contact_email: `pw-q-${suffix}@example.com`, is_active: true })
      .select('id').single();

    await admin.from('vendor_services').insert({ vendor_id: vendor!.id, event_service_id: svc!.id });

    const eventDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: event } = await admin
      .from('events')
      .insert({ venue_id: activeVenueId!, space_id: space.id, event_name: `PW Quote Event ${suffix}`, event_type: 'corporate', event_date: eventDate, event_time: '10:00', event_end_time: '12:00', guest_count: 50, budget_total: 5000, status: 'planning' })
      .select('id').single();

    await admin.from('event_service_requirements').insert({ event_id: event!.id, event_service_id: svc!.id, budget_amount: 1500 });

    const { data: quote, error: quoteErr } = await admin
      .from('vendor_quotes')
      .insert({ event_id: event!.id, vendor_id: vendor!.id, event_service_id: svc!.id, quoted_amount: 1200, status: 'pending', valid_until: eventDate })
      .select('id').single();
    if (quoteErr || !quote) throw new Error(`Failed creating quote: ${quoteErr?.message}`);

    try {
      const approveRes = await page.request.post(`/api/quotes/${quote.id}/approve`);
      expect(
        approveRes.ok(),
        `POST /api/quotes/${quote.id}/approve failed: ${approveRes.status()} — ${await approveRes.text()}`,
      ).toBeTruthy();

      const { data: updatedQuote } = await admin
        .from('vendor_quotes')
        .select('status')
        .eq('id', quote.id)
        .single();
      expect(updatedQuote?.status, 'Quote status should be approved').toBe('approved');

      // Vendor should now be assigned to the event
      const { data: assignment } = await admin
        .from('event_vendors')
        .select('id')
        .eq('event_id', event!.id)
        .eq('vendor_id', vendor!.id)
        .maybeSingle();
      expect(assignment, 'Vendor should be assigned to event after quote approval').toBeTruthy();
    } finally {
      await admin.from('event_vendors').delete().eq('event_id', event!.id);
      await admin.from('vendor_quotes').delete().eq('id', quote.id);
      await admin.from('event_service_requirements').delete().eq('event_id', event!.id);
      await admin.from('events').delete().eq('id', event!.id);
      await admin.from('vendor_services').delete().eq('vendor_id', vendor!.id);
      await admin.from('vendors').delete().eq('id', vendor!.id);
      await admin.from('event_services').delete().eq('id', svc!.id);
    }
  });

  test('rejecting a quote marks it rejected with a reason', async ({ page }) => {
    test.setTimeout(60_000);
    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: space } = await admin
      .from('spaces').select('id').eq('venue_id', activeVenueId!).limit(1).single();
    if (!space) throw new Error('No space found for test venue');

    const { data: svc } = await admin
      .from('event_services')
      .insert({ venue_id: activeVenueId!, name: `PW Reject Svc ${suffix}`, slug: `pw-rej-svc-${suffix}`, is_active: true })
      .select('id').single();

    const { data: vendor } = await admin
      .from('vendors')
      .insert({ venue_id: activeVenueId!, name: `PW Reject Vendor ${suffix}`, contact_name: 'R Contact', contact_email: `pw-rej-${suffix}@example.com`, is_active: true })
      .select('id').single();

    await admin.from('vendor_services').insert({ vendor_id: vendor!.id, event_service_id: svc!.id });

    const eventDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: event } = await admin
      .from('events')
      .insert({ venue_id: activeVenueId!, space_id: space.id, event_name: `PW Reject Event ${suffix}`, event_type: 'corporate', event_date: eventDate, event_time: '14:00', event_end_time: '16:00', guest_count: 40, budget_total: 4000, status: 'planning' })
      .select('id').single();

    await admin.from('event_service_requirements').insert({ event_id: event!.id, event_service_id: svc!.id, budget_amount: 1000 });

    const { data: quote, error: quoteErr } = await admin
      .from('vendor_quotes')
      .insert({ event_id: event!.id, vendor_id: vendor!.id, event_service_id: svc!.id, quoted_amount: 1800, status: 'pending', valid_until: eventDate })
      .select('id').single();
    if (quoteErr || !quote) throw new Error(`Failed creating quote: ${quoteErr?.message}`);

    try {
      const rejectRes = await page.request.post(`/api/quotes/${quote.id}/reject`, {
        data: { reason: 'Over budget for this event' },
      });
      expect(
        rejectRes.ok(),
        `POST /api/quotes/${quote.id}/reject failed: ${rejectRes.status()} — ${await rejectRes.text()}`,
      ).toBeTruthy();

      const { data: updatedQuote } = await admin
        .from('vendor_quotes')
        .select('status, rejection_reason')
        .eq('id', quote.id)
        .single();
      expect(updatedQuote?.status, 'Quote status should be rejected').toBe('rejected');
    } finally {
      await admin.from('vendor_quotes').delete().eq('id', quote.id);
      await admin.from('event_service_requirements').delete().eq('event_id', event!.id);
      await admin.from('events').delete().eq('id', event!.id);
      await admin.from('vendor_services').delete().eq('vendor_id', vendor!.id);
      await admin.from('vendors').delete().eq('id', vendor!.id);
      await admin.from('event_services').delete().eq('id', svc!.id);
    }
  });
});
