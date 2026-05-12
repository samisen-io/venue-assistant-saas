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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for vendor RLS tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Vendor RLS Isolation', () => {
  test('vendor created by venue A is invisible to venue B user', async ({ page }) => {
    test.setTimeout(90_000);

    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const userAEmail = `pw-vendor-rls-a-${suffix}@example.com`;
    const userBEmail = `pw-vendor-rls-b-${suffix}@example.com`;
    const userAPassword = `PwA-${randomUUID().slice(0, 8)}!`;
    const userBPassword = `PwB-${randomUUID().slice(0, 8)}!`;

    const { data: userAData, error: userAErr } = await admin.auth.admin.createUser({
      email: userAEmail,
      password: userAPassword,
      email_confirm: true,
      user_metadata: { full_name: 'PW Vendor RLS User A' },
    });
    if (userAErr || !userAData.user) {
      throw new Error(`Failed creating User A: ${userAErr?.message ?? 'unknown'}`);
    }

    const { data: userBData, error: userBErr } = await admin.auth.admin.createUser({
      email: userBEmail,
      password: userBPassword,
      email_confirm: true,
      user_metadata: { full_name: 'PW Vendor RLS User B' },
    });
    if (userBErr || !userBData.user) {
      await admin.auth.admin.deleteUser(userAData.user.id);
      throw new Error(`Failed creating User B: ${userBErr?.message ?? 'unknown'}`);
    }

    let venueAId: string | null = null;
    let venueBId: string | null = null;
    let vendorAId: string | null = null;

    try {
      const { data: venueA, error: venueAErr } = await admin
        .from('venues')
        .insert({
          owner_id: userAData.user.id,
          name: `PW Vendor RLS Venue A ${suffix}`,
          venue_type: 'conference_center',
          address: '1 RLS St',
          city: 'Austin',
          state: 'TX',
          zip_code: '73301',
          page_status: 'draft',
        })
        .select('id')
        .single();
      if (venueAErr || !venueA) throw new Error(`Failed creating venue A: ${venueAErr?.message}`);
      venueAId = venueA.id as string;

      await admin.from('venue_team_members').insert({
        venue_id: venueAId,
        profile_id: userAData.user.id,
        role: 'owner',
      });

      const { data: venueB, error: venueBErr } = await admin
        .from('venues')
        .insert({
          owner_id: userBData.user.id,
          name: `PW Vendor RLS Venue B ${suffix}`,
          venue_type: 'conference_center',
          address: '2 RLS St',
          city: 'Austin',
          state: 'TX',
          zip_code: '73301',
          page_status: 'draft',
        })
        .select('id')
        .single();
      if (venueBErr || !venueB) throw new Error(`Failed creating venue B: ${venueBErr?.message}`);
      venueBId = venueB.id as string;

      await admin.from('venue_team_members').insert({
        venue_id: venueBId,
        profile_id: userBData.user.id,
        role: 'owner',
      });

      const vendorName = `PW Vendor RLS Secret ${suffix}`;
      const { data: vendorA, error: vendorAErr } = await admin
        .from('vendors')
        .insert({
          venue_id: venueAId,
          name: vendorName,
          contact_name: 'Secret Contact',
          contact_email: `pw-vendor-rls-secret-${suffix}@example.com`,
          is_active: true,
        })
        .select('id')
        .single();
      if (vendorAErr || !vendorA) throw new Error(`Failed creating vendor A: ${vendorAErr?.message}`);
      vendorAId = vendorA.id as string;

      // Log in as User B and verify vendor A is inaccessible
      await loginAs(page, userBEmail, userBPassword);

      // API: GET /api/vendors should not return vendor A
      const listRes = await page.request.get('/api/vendors', {
        headers: { 'X-Venue-Id': venueBId },
      });
      if (listRes.ok()) {
        const vendors = (await listRes.json()) as Array<{ id: string; name: string }>;
        expect(
          vendors.some((v) => v.id === vendorAId),
          `Vendor from venue A unexpectedly appeared in venue B vendor list`,
        ).toBeFalsy();
      }

      // API: GET /api/vendors/[vendorId] directly should be blocked
      const directRes = await page.request.get(`/api/vendors/${vendorAId}`);
      expect(
        directRes.status(),
        `Cross-tenant GET /api/vendors/${vendorAId} should not return 200`,
      ).not.toBe(200);

      // UI: vendor detail page should not leak the vendor name
      await page.goto(`/vendors/${vendorAId}`);
      await page.waitForLoadState('networkidle');
      const bodyText = await page.locator('body').innerText();
      expect(
        bodyText.includes(vendorName),
        `Vendor name from venue A leaked on /vendors/${vendorAId} for venue B user`,
      ).toBeFalsy();
    } finally {
      if (vendorAId) {
        await admin.from('vendor_services').delete().eq('vendor_id', vendorAId);
        await admin.from('vendors').delete().eq('id', vendorAId);
      }
      if (venueAId) {
        await admin.from('venue_team_members').delete().eq('venue_id', venueAId);
        await admin.from('venues').delete().eq('id', venueAId);
      }
      if (venueBId) {
        await admin.from('venue_team_members').delete().eq('venue_id', venueBId);
        await admin.from('venues').delete().eq('id', venueBId);
      }
      await admin.auth.admin.deleteUser(userAData.user.id);
      await admin.auth.admin.deleteUser(userBData.user.id);
    }
  });
});
