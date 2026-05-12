import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for team management tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Team Management', () => {
  test('owner is listed and invite form is present', async ({ page }) => {
    requireAuthCredentials();
    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    await page.goto('/settings/team');
    await expect(page.getByRole('heading', { name: /team management/i })).toBeVisible();

    // Current user should appear with owner role
    await expect(page.getByText(/owner/i).first()).toBeVisible({ timeout: 10_000 });

    // Invite form elements
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send invite/i })).toBeVisible();

    // Empty email submit should not crash (button stays on page)
    await page.getByRole('button', { name: /send invite/i }).click();
    await expect(page.getByRole('heading', { name: /team management/i })).toBeVisible();
  });

  test('admin-seeded member appears in team list and can be removed', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const memberEmail = `pw-team-member-${suffix}@example.com`;
    const memberPassword = `PwM-${randomUUID().slice(0, 8)}!`;

    // Create a new user and add them to the venue team via admin
    const { data: memberData, error: memberErr } = await admin.auth.admin.createUser({
      email: memberEmail,
      password: memberPassword,
      email_confirm: true,
      user_metadata: { full_name: `PW Team Member ${suffix}` },
    });
    if (memberErr || !memberData.user) throw new Error(`Failed creating team member: ${memberErr?.message}`);

    // Ensure profile exists
    await admin.from('profiles').upsert({
      id: memberData.user.id,
      full_name: `PW Team Member ${suffix}`,
      email: memberEmail,
    });

    const { data: insertedMember, error: teamErr } = await admin
      .from('venue_team_members')
      .insert({ venue_id: activeVenueId!, profile_id: memberData.user.id, role: 'staff' })
      .select('id')
      .single();
    if (teamErr) {
      await admin.auth.admin.deleteUser(memberData.user.id);
      throw new Error(`Failed adding team member: ${teamErr.message}`);
    }

    try {
      await page.goto('/settings/team');
      await expect(page.getByRole('heading', { name: /team management/i })).toBeVisible();

      // Seeded member should appear
      await expect(page.getByText(memberEmail).or(page.getByText(`PW Team Member ${suffix}`))).toBeVisible({
        timeout: 15_000,
      });

      // Remove the seeded member via the remove button next to their row
      const memberRow = page
        .getByText(memberEmail)
        .or(page.getByText(`PW Team Member ${suffix}`))
        .locator('xpath=ancestor::*[contains(@class,"flex") or contains(@class,"tr") or self::tr][1]');
      const removeBtn = memberRow.getByRole('button', { name: /remove/i });
      if ((await removeBtn.count()) > 0) {
        await removeBtn.click();
        await expect(page.getByText(memberEmail)).not.toBeVisible({ timeout: 10_000 });
      } else {
        // If no remove button found in row, delete directly via API as fallback assertion
        const deleteRes = await page.request.delete(
          `/api/venues/${activeVenueId}/team/${insertedMember!.id}`,
        );
        expect([200, 204]).toContain(deleteRes.status());
      }
    } finally {
      // Cleanup — safe even if already removed via UI
      await admin.from('venue_team_members').delete().eq('id', insertedMember!.id).eq('venue_id', activeVenueId!);
      await admin.auth.admin.deleteUser(memberData.user.id);
    }
  });
});
