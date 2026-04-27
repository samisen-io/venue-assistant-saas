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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for vendor matching tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Vendor Matching', () => {
  test('shows scored recommendations and persists assigned vendor', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();
    await loginAsTestUser(page);
    await page.goto('/dashboard');

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const eventName = `PW Match Event ${suffix}`;

    const spacesRes = await page.request.get('/api/spaces', { headers });
    expect(spacesRes.ok()).toBeTruthy();
    const spaces = (await spacesRes.json()) as Array<{ id: string; venue_id: string }>;
    expect(spaces.length).toBeGreaterThan(0);

    const vendorsRes = await page.request.get(`/api/vendors?venueId=${spaces[0].venue_id}`);
    expect(vendorsRes.ok()).toBeTruthy();
    const vendors = (await vendorsRes.json()) as Array<{
      vendor_services?: Array<{ event_service_id: string }>;
      contact_email?: string | null;
    }>;
    const vendorWithServiceAndEmail = vendors.find(
      (v) => v.contact_email && (v.vendor_services?.length ?? 0) > 0,
    );
    if (!vendorWithServiceAndEmail?.vendor_services?.[0]?.event_service_id) {
      throw new Error('No vendor with both service mapping and email found for vendor matching test.');
    }
    const eventServiceId = vendorWithServiceAndEmail.vendor_services[0].event_service_id;

    const eventDate = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: createdEvent, error: eventError } = await admin
      .from('events')
      .insert({
        venue_id: spaces[0].venue_id,
        space_id: spaces[0].id,
        event_name: eventName,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: '11:00',
        event_end_time: '13:00',
        guest_count: 80,
        budget_total: 15000,
        status: 'planning',
      })
      .select('id')
      .single();

    if (eventError || !createdEvent) {
      throw new Error(`Failed to create event fixture: ${eventError?.message || 'unknown error'}`);
    }

    const { error: reqError } = await admin.from('event_service_requirements').insert({
      event_id: createdEvent.id,
      event_service_id: eventServiceId,
      budget_amount: 3000,
    });

    if (reqError) {
      throw new Error(`Failed to create service requirement fixture: ${reqError.message}`);
    }

    try {
      await page.goto(`/events/${createdEvent.id}`);
      await expect(page.getByRole('heading', { name: new RegExp(eventName) })).toBeVisible();
      await page.getByRole('tab', { name: /^vendors$/i }).click();

      await expect(page.getByTestId('recommended-vendors-title')).toBeVisible();
      const contactBtn = page.getByTestId('vendor-recommendation-contact-btn').first();
      await expect(contactBtn).toBeVisible({ timeout: 15_000 });
      const vendorCard = contactBtn.locator('xpath=ancestor::*[@data-testid="vendor-recommendation-card"]');
      const matchedVendorName = (
        await vendorCard.getByTestId('vendor-recommendation-name').first().textContent()
      )?.trim();
      expect(matchedVendorName).toBeTruthy();

      const scoreText = (await vendorCard.getByTestId('vendor-recommendation-score').innerText()).replace(/\n/g, ' ');
      const scoreMatch = scoreText.match(/\b([1-9]\d?|100)\b/);
      expect(scoreMatch).toBeTruthy();
      expect(Number(scoreMatch![1])).toBeGreaterThan(0);

      await contactBtn.click();

      await expect
        .poll(async () => {
          const assignedRes = await page.request.get(`/api/events/${createdEvent.id}/vendors`);
          if (!assignedRes.ok()) return 0;
          const assigned = (await assignedRes.json()) as Array<{ id: string }>;
          return assigned.length;
        })
        .toBeGreaterThan(0);

      const assignedRes = await page.request.get(`/api/events/${createdEvent.id}/vendors`);
      expect(assignedRes.ok()).toBeTruthy();
      const assigned = (await assignedRes.json()) as Array<{ vendors?: { name?: string } | null }>;
      expect(assigned.some((row) => row.vendors?.name === matchedVendorName)).toBeTruthy();
      const assignedVendorName = assigned.find((row) => row.vendors?.name)?.vendors?.name;
      expect(assignedVendorName).toBeTruthy();

      await page.reload();
      await page.getByRole('tab', { name: /^vendors$/i }).click();
      await expect(page.getByTestId('event-vendors-title')).toBeVisible();
      await expect(page.getByTestId('event-vendor-card').filter({ hasText: assignedVendorName! })).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await admin.from('vendor_communications').delete().eq('event_id', createdEvent.id);
      await admin.from('event_vendors').delete().eq('event_id', createdEvent.id);
      await admin.from('event_service_requirements').delete().eq('event_id', createdEvent.id);
      await admin.from('events').delete().eq('id', createdEvent.id);
    }
  });
});
