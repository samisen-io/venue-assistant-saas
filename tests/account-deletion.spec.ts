import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { loginAs } from './helpers/auth';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for account deletion tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Account Deletion', () => {
  test('deleting account via API ends the session and removes the user', async ({ page }) => {
    test.setTimeout(60_000);

    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const email = `pw-delete-acct-${suffix}@example.com`;
    const password = `PwDel-${randomUUID().slice(0, 8)}!`;

    // Create a disposable user — never delete the primary test user
    const { data: userData, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `PW Delete User ${suffix}` },
    });
    if (userErr || !userData.user) throw new Error(`Failed creating disposable user: ${userErr?.message}`);

    const userId = userData.user.id;

    try {
      await loginAs(page, email, password);
      await page.waitForURL('**/dashboard', { timeout: 15_000 });

      // DELETE /api/account — deletes the authenticated user
      const deleteRes = await page.request.delete('/api/account');
      expect(
        deleteRes.ok(),
        `DELETE /api/account failed: ${deleteRes.status()} — ${await deleteRes.text()}`,
      ).toBeTruthy();

      // After deletion, subsequent authenticated API calls should return 401
      await expect
        .poll(async () => {
          const res = await page.request.get('/api/venues');
          return res.status();
        })
        .toBe(401);

      // Verify user no longer exists in Supabase auth
      const { data: deletedUser } = await admin.auth.admin.getUserById(userId);
      expect(
        deletedUser?.user,
        'User should not exist in Supabase auth after account deletion',
      ).toBeFalsy();
    } catch (err) {
      // If test fails before deletion, clean up manually
      await admin.auth.admin.deleteUser(userId).catch(() => null);
      throw err;
    }
  });
});
