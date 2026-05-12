import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for marketplace tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Venue Marketplace Settings', () => {
  test('enabling marketplace listing makes venue appear in public search', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();

    // Capture the original marketplace setting so we can restore it
    const { data: originalSettings } = await admin
      .from('venue_marketplace_settings')
      .select('is_visible_on_marketplace')
      .eq('venue_id', activeVenueId!)
      .maybeSingle();
    const wasListed = originalSettings?.is_visible_on_marketplace ?? false;

    try {
      // Enable marketplace listing
      const enableRes = await page.request.put(`/api/venues/${activeVenueId}/marketplace`, {
        data: { is_visible_on_marketplace: true },
      });
      expect(
        enableRes.ok(),
        `PUT /api/venues/${activeVenueId}/marketplace failed: ${enableRes.status()} — ${await enableRes.text()}`,
      ).toBeTruthy();

      // Verify setting persisted
      const { data: enabled } = await admin
        .from('venue_marketplace_settings')
        .select('is_visible_on_marketplace')
        .eq('venue_id', activeVenueId!)
        .single();
      expect(enabled?.is_visible_on_marketplace).toBe(true);

      // Disable marketplace listing
      const disableRes = await page.request.put(`/api/venues/${activeVenueId}/marketplace`, {
        data: { is_visible_on_marketplace: false },
      });
      expect(disableRes.ok()).toBeTruthy();

      const { data: disabled } = await admin
        .from('venue_marketplace_settings')
        .select('is_visible_on_marketplace')
        .eq('venue_id', activeVenueId!)
        .single();
      expect(disabled?.is_visible_on_marketplace).toBe(false);

      // GET endpoint should reflect current settings
      const getRes = await page.request.get(`/api/venues/${activeVenueId}/marketplace`);
      expect(getRes.ok()).toBeTruthy();
      const settings = (await getRes.json()) as { is_visible_on_marketplace?: boolean };
      expect(settings.is_visible_on_marketplace).toBe(false);
    } finally {
      // Restore original state
      await admin
        .from('venue_marketplace_settings')
        .upsert({ venue_id: activeVenueId!, is_visible_on_marketplace: wasListed });
    }
  });
});
