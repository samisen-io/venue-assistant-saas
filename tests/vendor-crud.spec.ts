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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for vendor CRUD tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Vendor CRUD', () => {
  test('create, read, edit, and delete vendor lifecycle', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.goto('/vendors');

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const vendorName = `PW Vendor ${suffix}`;
    const editedVendorName = `PW Vendor Edited ${suffix}`;
    const contactEmail = `vendor-${suffix}@example.com`;
    const admin = buildAdminClient();
    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;

    let createdVendorId: string | null = null;
    let createdEventServiceId: string | null = null;

    const venuesRes = await page.request.get('/api/venues');
    expect(venuesRes.ok()).toBeTruthy();
    const venues = (await venuesRes.json()) as Array<{ id: string }>;
    const fallbackVenueId = venues[0]?.id;
    const venueIdForService = activeVenueId || fallbackVenueId;
    expect(venueIdForService).toBeTruthy();

    const eventServicesRes = await page.request.get('/api/event-services');
    expect(eventServicesRes.ok()).toBeTruthy();
    const eventServices = (await eventServicesRes.json()) as Array<{ id: string; name: string }>;
    let selectedService = eventServices[0];

    if (!selectedService) {
      const slug = `pw-service-${suffix}`.toLowerCase();
      const { data: insertedService, error: serviceError } = await admin
        .from('event_services')
        .insert({
          venue_id: venueIdForService!,
          name: `PW Service ${suffix}`,
          slug,
          is_active: true,
        })
        .select('id, name')
        .single();
      if (serviceError || !insertedService) {
        throw new Error(`Failed to create fallback event service: ${serviceError?.message || 'unknown error'}`);
      }
      selectedService = insertedService;
      createdEventServiceId = insertedService.id;
    }

    await page.route('**/api/event-services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([selectedService]),
      });
    });

    try {
      await page.getByTestId('add-vendor-btn').click();
      await expect(page.getByRole('heading', { name: /register new vendor/i })).toBeVisible();

      await page.getByLabel(/vendor name/i).fill(vendorName);
      await expect(page.locator(`label[for="service-${selectedService.id}"]`)).toBeVisible({
        timeout: 10_000,
      });
      await page.locator(`label[for="service-${selectedService.id}"]`).click();
      await page.getByLabel(/contact person/i).fill('PW Vendor Contact');
      await page.getByLabel(/^email$/i).fill(contactEmail);
      await page.getByLabel(/^phone$/i).fill('5555555555');
      await page.getByRole('button', { name: /create vendor/i }).click();

      await page.waitForURL('**/vendors', { timeout: 20_000 });
      await page.getByPlaceholder(/search vendors/i).fill(vendorName);
      await expect(page.getByText(vendorName).first()).toBeVisible({ timeout: 15_000 });

      const vendorsRes = await page.request.get('/api/vendors', { headers });
      expect(vendorsRes.ok()).toBeTruthy();
      const vendors = (await vendorsRes.json()) as Array<{ id: string; name: string }>;
      const createdVendor = vendors.find((vendor) => vendor.name === vendorName);
      expect(createdVendor, `Vendor '${vendorName}' was not returned by /api/vendors`).toBeTruthy();

      createdVendorId = createdVendor!.id;

      await page.goto(`/vendors/${createdVendorId}`);
      await expect(page.getByRole('heading', { name: new RegExp(vendorName) })).toBeVisible();

      await page.getByRole('link', { name: /edit vendor/i }).click();
      await expect(page.getByRole('heading', { name: /edit vendor/i })).toBeVisible();

      await page.getByLabel(/vendor name/i).fill(editedVendorName);
      await page.getByRole('button', { name: /save changes/i }).click();

      await page.waitForURL('**/vendors', { timeout: 20_000 });
      await page.getByPlaceholder(/search vendors/i).fill(editedVendorName);
      await expect(page.getByText(editedVendorName).first()).toBeVisible({ timeout: 15_000 });

      const deleteRes = await page.request.delete(`/api/vendors/${createdVendorId}`);
      expect([200, 204]).toContain(deleteRes.status());

      await expect
        .poll(async () => {
          const latest = await page.request.get('/api/vendors', { headers });
          if (!latest.ok()) return true;
          const rows = (await latest.json()) as Array<{ id: string }>;
          return rows.every((row) => row.id !== createdVendorId);
        })
        .toBeTruthy();

      await page.goto('/vendors');
      await page.getByPlaceholder(/search vendors/i).fill(editedVendorName);
      await expect(page.getByText(/no matches found|no vendors found/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await page.unroute('**/api/event-services');
      if (createdVendorId) {
        await admin.from('vendor_services').delete().eq('vendor_id', createdVendorId);
        await admin.from('vendors').delete().eq('id', createdVendorId);
      }
      if (createdEventServiceId) {
        await admin.from('event_services').delete().eq('id', createdEventServiceId);
      }
    }
  });
});
