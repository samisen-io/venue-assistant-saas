import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for venue packages tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Venue Packages CRUD', () => {
  test('create, read, update, and delete a venue package via API', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let packageId: string | null = null;

    try {
      // CREATE
      const createRes = await page.request.post(`/api/venues/${activeVenueId}/packages`, {
        data: {
          entity: 'package',
          name: `PW Package ${suffix}`,
          description: 'Playwright test package',
          base_price: 2500,
          min_guests: 50,
          max_guests: 200,
          duration_hours: 4,
          is_active: true,
        },
      });
      expect(
        createRes.ok(),
        `POST /api/venues/${activeVenueId}/packages failed: ${createRes.status()} — ${await createRes.text()}`,
      ).toBeTruthy();
      const created = (await createRes.json()) as { id?: string; package?: { id: string } };
      packageId = created.id ?? created.package?.id ?? null;
      expect(packageId, 'No package ID returned from create').toBeTruthy();

      // READ
      const getRes = await page.request.get(`/api/venues/${activeVenueId}/packages`);
      expect(getRes.ok(), `GET /api/venues/${activeVenueId}/packages failed: ${getRes.status()}`).toBeTruthy();
      const { packages } = (await getRes.json()) as { packages: Array<{ id: string; name: string }> };
      expect(
        packages.some((p) => p.id === packageId),
        'Created package not found in packages list',
      ).toBeTruthy();

      // UPDATE
      const updateRes = await page.request.put(`/api/venues/${activeVenueId}/packages`, {
        data: { entity: 'package', id: packageId, name: `PW Package Updated ${suffix}`, base_price: 3000 },
      });
      expect(
        updateRes.ok(),
        `PUT /api/venues/${activeVenueId}/packages failed: ${updateRes.status()}`,
      ).toBeTruthy();

      // Verify update persisted
      const { data: updated } = await admin
        .from('venue_packages')
        .select('name, base_price')
        .eq('id', packageId!)
        .single();
      expect(updated?.name).toContain('Updated');

      // DELETE
      const deleteRes = await page.request.delete(`/api/venues/${activeVenueId}/packages`, {
        data: { entity: 'package', id: packageId },
      });
      expect(
        [200, 204].includes(deleteRes.status()),
        `DELETE /api/venues/${activeVenueId}/packages failed: ${deleteRes.status()}`,
      ).toBeTruthy();

      // Verify deleted
      const { data: gone } = await admin
        .from('venue_packages')
        .select('id')
        .eq('id', packageId!)
        .maybeSingle();
      expect(gone, 'Package should be deleted from DB').toBeNull();
      packageId = null;
    } finally {
      if (packageId) {
        await admin.from('venue_packages').delete().eq('id', packageId);
      }
    }
  });
});
