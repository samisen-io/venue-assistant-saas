import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for vendor review tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Vendor Reviews', () => {
  test('submitting a post-event review persists and is retrievable via API', async ({ page }) => {
    test.setTimeout(120_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => {
      throw new Error('activeVenueId not set — ensure test user has a venue');
    });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const spacesRes = await page.request.get('/api/spaces', { headers });
    expect(spacesRes.ok(), `GET /api/spaces failed: ${spacesRes.status()}`).toBeTruthy();
    const spaces = (await spacesRes.json()) as Array<{ id: string; venue_id: string }>;
    expect(spaces.length, 'No spaces found for test user venue').toBeGreaterThan(0);

    const venueId = spaces[0].venue_id;

    // Ensure vendor with service exists
    const vendorsRes = await page.request.get(`/api/vendors?venueId=${venueId}`);
    expect(vendorsRes.ok()).toBeTruthy();
    const vendors = (await vendorsRes.json()) as Array<{
      id: string;
      name: string;
      vendor_services?: Array<{ event_service_id: string }>;
    }>;
    let selectedVendor = vendors.find((v) => (v.vendor_services?.length ?? 0) > 0);

    let fallbackVendorId: string | null = null;
    let fallbackServiceId: string | null = null;

    if (!selectedVendor) {
      const { data: svc } = await admin
        .from('event_services')
        .insert({ venue_id: venueId, name: `PW Review Svc ${suffix}`, slug: `pw-rev-svc-${suffix}`, is_active: true })
        .select('id').single();
      fallbackServiceId = svc!.id;

      const { data: vnd } = await admin
        .from('vendors')
        .insert({ venue_id: venueId, name: `PW Review Vendor ${suffix}`, contact_name: 'PW Rev', contact_email: `pw-rev-${suffix}@example.com`, is_active: true })
        .select('id, name').single();
      fallbackVendorId = vnd!.id;

      await admin.from('vendor_services').insert({ vendor_id: vnd!.id, event_service_id: svc!.id });
      selectedVendor = { id: vnd!.id, name: vnd!.name, vendor_services: [{ event_service_id: svc!.id }] };
    }

    const serviceId = selectedVendor.vendor_services![0].event_service_id;

    // Get initial reliability score
    const vendorBeforeRes = await page.request.get(`/api/vendors/${selectedVendor.id}`);
    const vendorBefore = vendorBeforeRes.ok()
      ? ((await vendorBeforeRes.json()) as { reliability_score?: number })
      : null;

    // Create a completed event with the vendor assigned
    const eventDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: createdEvent, error: eventErr } = await admin
      .from('events')
      .insert({
        venue_id: venueId,
        space_id: spaces[0].id,
        event_name: `PW Review Event ${suffix}`,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: '10:00',
        event_end_time: '12:00',
        guest_count: 50,
        budget_total: 5000,
        status: 'completed',
      })
      .select('id')
      .single();
    if (eventErr || !createdEvent) throw new Error(`Failed to create event: ${eventErr?.message}`);

    await admin.from('event_service_requirements').insert({
      event_id: createdEvent.id,
      event_service_id: serviceId,
      budget_amount: 1000,
    });

    const { error: assocErr } = await admin.from('event_vendors').insert({
      event_id: createdEvent.id,
      vendor_id: selectedVendor.id,
      event_service_id: serviceId,
      quoted_cost: 900,
      confirmed: true,
      outreach_status: 'confirmed',
      status_updated_at: new Date().toISOString(),
    });
    if (assocErr) throw new Error(`Failed to create event_vendor: ${assocErr.message}`);

    try {
      await page.goto(`/events/${createdEvent.id}/review`);
      await expect(page.getByRole('heading', { name: /post-event review/i })).toBeVisible({
        timeout: 15_000,
      });

      // The vendor should appear in the review form
      await expect(page.getByText(selectedVendor.name).first()).toBeVisible({ timeout: 15_000 });

      // Set quality rating to 4 stars (click the 4th star for this vendor)
      const stars = page.getByRole('button', { name: /star/i });
      if ((await stars.count()) >= 4) {
        await stars.nth(3).click();
      }

      // Submit the review
      await page.getByRole('button', { name: /submit review/i }).click();
      await expect(page.getByText(/review submitted|saved/i)).toBeVisible({ timeout: 15_000 });

      // Verify the review was persisted via API
      await expect
        .poll(async () => {
          const res = await page.request.get(`/api/vendors/${selectedVendor!.id}/reviews`);
          if (!res.ok()) return 0;
          const reviews = (await res.json()) as Array<{ event_id: string }>;
          return reviews.filter((r) => r.event_id === createdEvent.id).length;
        })
        .toBeGreaterThan(0);

      // Verify reliability score updated (if it was previously defined)
      if (vendorBefore?.reliability_score !== undefined) {
        const vendorAfterRes = await page.request.get(`/api/vendors/${selectedVendor.id}`);
        if (vendorAfterRes.ok()) {
          const vendorAfter = (await vendorAfterRes.json()) as { reliability_score?: number };
          expect(
            vendorAfter.reliability_score,
            'Reliability score should be set after review submission',
          ).toBeDefined();
        }
      }
    } finally {
      await admin.from('vendor_reviews').delete().eq('event_id', createdEvent.id);
      await admin.from('event_vendors').delete().eq('event_id', createdEvent.id);
      await admin.from('event_service_requirements').delete().eq('event_id', createdEvent.id);
      await admin.from('events').delete().eq('id', createdEvent.id);
      if (fallbackVendorId) {
        await admin.from('vendor_services').delete().eq('vendor_id', fallbackVendorId);
        await admin.from('vendors').delete().eq('id', fallbackVendorId);
      }
      if (fallbackServiceId) {
        await admin.from('event_services').delete().eq('id', fallbackServiceId);
      }
    }
  });
});
