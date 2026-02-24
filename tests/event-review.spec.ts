import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials, assertNotRedirectedToLogin } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for event review tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Event Review Flow', () => {
  test('review page renders summary, vendor entries, and client contact details', async ({ page }) => {
    test.setTimeout(120_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;
    const admin = buildAdminClient();

    const spacesRes = await page.request.get('/api/spaces', { headers });
    expect(spacesRes.ok()).toBeTruthy();
    const spaces = (await spacesRes.json()) as Array<{ id: string; venue_id: string }>;
    expect(spaces.length).toBeGreaterThan(0);

    const venueId = spaces[0].venue_id;

    const vendorsRes = await page.request.get(`/api/vendors?venueId=${venueId}`);
    expect(vendorsRes.ok()).toBeTruthy();
    const vendors = (await vendorsRes.json()) as Array<{
      id: string;
      name: string;
      vendor_services?: Array<{ event_service_id: string }>;
    }>;

    let selectedVendor = vendors.find((v) => (v.vendor_services?.length ?? 0) > 0);
    let fallbackServiceId: string | null = null;
    let fallbackVendorId: string | null = null;

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    if (!selectedVendor) {
      const { data: createdService, error: createdServiceError } = await admin
        .from('event_services')
        .insert({
          venue_id: venueId,
          name: `PW Review Service ${suffix}`,
          slug: `pw-review-service-${suffix}`,
          is_active: true,
        })
        .select('id')
        .single();

      if (createdServiceError || !createdService) {
        throw new Error(`Failed to create fallback event service: ${createdServiceError?.message || 'unknown error'}`);
      }

      fallbackServiceId = createdService.id;

      const { data: createdVendor, error: createdVendorError } = await admin
        .from('vendors')
        .insert({
          venue_id: venueId,
          name: `PW Review Vendor ${suffix}`,
          contact_name: 'PW Review Contact',
          contact_email: `pw-review-vendor-${suffix}@example.com`,
          is_active: true,
        })
        .select('id, name')
        .single();

      if (createdVendorError || !createdVendor) {
        throw new Error(`Failed to create fallback vendor: ${createdVendorError?.message || 'unknown error'}`);
      }

      fallbackVendorId = createdVendor.id;

      const { error: vendorServiceError } = await admin.from('vendor_services').insert({
        vendor_id: createdVendor.id,
        event_service_id: createdService.id,
      });

      if (vendorServiceError) {
        throw new Error(`Failed to map fallback vendor to service: ${vendorServiceError.message}`);
      }

      selectedVendor = {
        id: createdVendor.id,
        name: createdVendor.name,
        vendor_services: [{ event_service_id: createdService.id }],
      };
    }

    const selectedServiceId = selectedVendor.vendor_services?.[0]?.event_service_id;
    if (!selectedServiceId) throw new Error('No event service available for event review fixture.');

    const clientName = `PW Review Client ${suffix}`;
    const clientEmail = `pw-review-client-${suffix}@example.com`;

    const { data: createdClient, error: clientError } = await admin
      .from('clients')
      .insert({
        venue_id: venueId,
        contact_name: clientName,
        email: clientEmail,
        phone: '5557771212',
      })
      .select('id')
      .single();

    if (clientError || !createdClient) {
      throw new Error(`Failed to create event-review client fixture: ${clientError?.message || 'unknown error'}`);
    }

    const eventName = `PW Review Event ${suffix}`;
    const eventDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: createdEvent, error: eventError } = await admin
      .from('events')
      .insert({
        venue_id: venueId,
        space_id: spaces[0].id,
        client_id: createdClient.id,
        event_name: eventName,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: '15:00',
        event_end_time: '18:00',
        guest_count: 120,
        budget_total: 12000,
        status: 'completed',
      })
      .select('id')
      .single();

    if (eventError || !createdEvent) {
      throw new Error(`Failed to create event-review event fixture: ${eventError?.message || 'unknown error'}`);
    }

    const { data: association, error: associationError } = await admin
      .from('event_vendors')
      .insert({
        event_id: createdEvent.id,
        vendor_id: selectedVendor.id,
        event_service_id: selectedServiceId,
        quoted_cost: 2500,
        confirmed: true,
        outreach_status: 'confirmed',
        status_updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (associationError || !association) {
      throw new Error(
        `Failed to create event-review vendor association fixture: ${associationError?.message || 'unknown error'}`,
      );
    }

    try {
      await page.goto(`/events/${createdEvent.id}/review`);

      await expect(page.getByRole('heading', { name: /post-event review/i })).toBeVisible();
      await expect(page.getByTestId('event-review-name')).toContainText(eventName);
      await expect(page.getByTestId('event-review-date')).toContainText(eventDate);
      await expect(page.getByTestId('event-review-guest-count')).toContainText('120');
      await expect(page.getByTestId('event-review-budget')).toContainText('$12,000.00');

      await expect(page.getByText(selectedVendor.name).first()).toBeVisible({ timeout: 15_000 });

      await expect(page.getByTestId('event-review-client-name')).toContainText(clientName);
      await expect(page.getByTestId('event-review-client-email')).toContainText(clientEmail);
      await expect(page.getByTestId('event-review-client-phone')).toContainText('5557771212');
    } finally {
      await admin.from('vendor_reviews').delete().eq('event_id', createdEvent.id);
      await admin.from('event_vendors').delete().eq('event_id', createdEvent.id);
      await admin.from('events').delete().eq('id', createdEvent.id);
      await admin.from('clients').delete().eq('id', createdClient.id);

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
