import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { loginAs } from './helpers/auth';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for RLS tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Security RLS', () => {
  test('user cannot access another tenant venue data', async ({ page }) => {
    test.setTimeout(90_000);

    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const userAEmail = `pw-rls-a-${suffix}@example.com`;
    const userBEmail = `pw-rls-b-${suffix}@example.com`;
    const userAPassword = `PwA-${randomUUID().slice(0, 8)}!`;
    const userBPassword = `PwB-${randomUUID().slice(0, 8)}!`;

    const { data: userAData, error: userAErr } = await admin.auth.admin.createUser({
      email: userAEmail,
      password: userAPassword,
      email_confirm: true,
      user_metadata: { full_name: 'PW RLS User A' },
    });
    if (userAErr || !userAData.user) {
      throw new Error(`Failed creating User A: ${userAErr?.message || 'unknown error'}`);
    }

    const { data: userBData, error: userBErr } = await admin.auth.admin.createUser({
      email: userBEmail,
      password: userBPassword,
      email_confirm: true,
      user_metadata: { full_name: 'PW RLS User B' },
    });
    if (userBErr || !userBData.user) {
      await admin.auth.admin.deleteUser(userAData.user.id);
      throw new Error(`Failed creating User B: ${userBErr?.message || 'unknown error'}`);
    }

    let venueAId: string | null = null;

    try {
      const { data: venueA, error: venueAErr } = await admin
        .from('venues')
        .insert({
          owner_id: userAData.user.id,
          name: `PW RLS Venue A ${suffix}`,
          venue_type: 'conference_center',
          address: '1 Tenant St',
          city: 'Austin',
          state: 'TX',
          zip_code: '73301',
          page_status: 'draft',
        })
        .select('id')
        .single();

      if (venueAErr || !venueA) {
        throw new Error(`Failed creating venue A: ${venueAErr?.message || 'unknown error'}`);
      }
      venueAId = venueA.id as string;

      await loginAs(page, userBEmail, userBPassword);

      const apiRes = await page.request.get(`/api/venues/${venueAId}`);
      expect(apiRes.ok()).toBeFalsy();
      expect([401, 403, 404, 500]).toContain(apiRes.status());

      await page.goto(`/venues/${venueAId}/edit`);
      await expect(page.getByText(/could not load venue details/i)).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByRole('heading', { name: /edit venue/i })).not.toBeVisible();
    } finally {
      if (venueAId) {
        await admin.from('venues').delete().eq('id', venueAId);
      }
      await admin.from('venues').delete().eq('owner_id', userBData.user.id);
      await admin.auth.admin.deleteUser(userAData.user.id);
      await admin.auth.admin.deleteUser(userBData.user.id);
    }
  });
});
