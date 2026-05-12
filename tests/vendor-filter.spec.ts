import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for vendor filter tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Vendor Service Category Filter', () => {
  test('filtering by service category shows only matching vendors', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Seed a unique service and two vendors: one with the service, one without
    const { data: service, error: svcErr } = await admin
      .from('event_services')
      .insert({
        venue_id: activeVenueId!,
        name: `PW Filter Service ${suffix}`,
        slug: `pw-filter-svc-${suffix}`,
        is_active: true,
      })
      .select('id, name')
      .single();
    if (svcErr || !service) throw new Error(`Failed creating service: ${svcErr?.message}`);

    const { data: vendorWith, error: vwErr } = await admin
      .from('vendors')
      .insert({
        venue_id: activeVenueId!,
        name: `PW Filter WITH ${suffix}`,
        contact_name: 'Filter With',
        contact_email: `pw-filter-with-${suffix}@example.com`,
        is_active: true,
      })
      .select('id')
      .single();
    if (vwErr || !vendorWith) throw new Error(`Failed creating vendor with service: ${vwErr?.message}`);

    const { data: vendorWithout, error: vwoErr } = await admin
      .from('vendors')
      .insert({
        venue_id: activeVenueId!,
        name: `PW Filter WITHOUT ${suffix}`,
        contact_name: 'Filter Without',
        contact_email: `pw-filter-without-${suffix}@example.com`,
        is_active: true,
      })
      .select('id')
      .single();
    if (vwoErr || !vendorWithout) throw new Error(`Failed creating vendor without service: ${vwoErr?.message}`);

    await admin.from('vendor_services').insert({
      vendor_id: vendorWith.id,
      event_service_id: service.id,
    });

    try {
      await page.goto('/vendors');
      await expect(page.getByRole('heading', { name: /^vendors$/i })).toBeVisible();

      // Both vendors should appear unfiltered
      await page.getByPlaceholder(/search vendors/i).fill(`PW Filter ${suffix.slice(0, 8)}`);
      await expect(page.getByText(`PW Filter WITH ${suffix}`).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(`PW Filter WITHOUT ${suffix}`).first()).toBeVisible({ timeout: 10_000 });
      await page.getByPlaceholder(/search vendors/i).clear();

      // Select the seeded service in the filter dropdown
      await page.getByRole('combobox').first().click();
      await page.getByRole('option', { name: service.name }).click();

      // Only the vendor with the service should remain visible
      await expect(page.getByText(`PW Filter WITH ${suffix}`).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(`PW Filter WITHOUT ${suffix}`)).not.toBeVisible();
    } finally {
      await admin.from('vendor_services').delete().eq('vendor_id', vendorWith.id);
      await admin.from('vendors').delete().eq('id', vendorWith.id);
      await admin.from('vendors').delete().eq('id', vendorWithout.id);
      await admin.from('event_services').delete().eq('id', service.id);
    }
  });
});
