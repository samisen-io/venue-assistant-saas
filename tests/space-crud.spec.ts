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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for space CRUD tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Space CRUD', () => {
  test('create, read, edit, and delete space lifecycle @smoke', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.goto('/spaces');

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const spaceName = `PW Space ${suffix}`;
    const editedSpaceName = `PW Space Edited ${suffix}`;
    const initialCapacity = '90';
    const updatedCapacity = '140';
    const admin = buildAdminClient();

    let createdSpaceId: string | null = null;

    try {
      await page.getByTestId('add-space-btn').click();
      await expect(page.getByRole('heading', { name: /create new space/i })).toBeVisible();

      await page.getByLabel(/space name/i).fill(spaceName);
      await page.getByLabel(/space type/i).click();
      await page.getByRole('option', { name: /ballroom/i }).click();
      await page.getByLabel(/^capacity/i).fill(initialCapacity);
      await page.getByLabel(/floor level/i).fill('2nd Floor');
      await page.getByLabel(/hourly rate/i).fill('450');
      await page.getByRole('button', { name: /create space/i }).click();

      await page.waitForURL('**/spaces', { timeout: 20_000 });
      await page.getByPlaceholder(/search spaces/i).fill(spaceName);
      await expect(page.getByText(spaceName).first()).toBeVisible({ timeout: 15_000 });

      const spacesRes = await page.request.get('/api/spaces');
      expect(spacesRes.ok()).toBeTruthy();
      const spaces = (await spacesRes.json()) as Array<{ id: string; name: string }>;
      const createdSpace = spaces.find((space) => space.name === spaceName);
      expect(createdSpace, `Space '${spaceName}' was not returned by /api/spaces`).toBeTruthy();

      createdSpaceId = createdSpace!.id;

      await page.goto(`/spaces/${createdSpaceId}`);
      await expect(page.getByRole('heading', { name: new RegExp(spaceName) })).toBeVisible();

      await page.getByRole('link', { name: /edit space/i }).click();
      await expect(page.getByRole('heading', { name: /edit space/i })).toBeVisible();

      await page.getByLabel(/space name/i).fill(editedSpaceName);
      await page.getByLabel(/^capacity/i).fill(updatedCapacity);
      await page.getByRole('button', { name: /save changes/i }).click();

      await page.waitForURL(new RegExp(`/spaces/${createdSpaceId}`), { timeout: 20_000 });
      await expect(page.getByRole('heading', { name: new RegExp(editedSpaceName) })).toBeVisible();
      await expect(page.getByText(updatedCapacity).first()).toBeVisible();

      await page.reload();
      await expect(page.getByRole('heading', { name: new RegExp(editedSpaceName) })).toBeVisible();

      page.once('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: /delete space/i }).click();
      await page.waitForURL('**/spaces', { timeout: 20_000 });

      await expect
        .poll(async () => {
          const latest = await page.request.get('/api/spaces');
          if (!latest.ok()) return false;
          const rows = (await latest.json()) as Array<{ id: string }>;
          return rows.every((row) => row.id !== createdSpaceId);
        })
        .toBeTruthy();

      await page.getByPlaceholder(/search spaces/i).fill(editedSpaceName);
      await expect(page.getByText(/no matching spaces|no spaces found/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      if (createdSpaceId) {
        await admin.from('events').delete().eq('space_id', createdSpaceId);
        await admin.from('spaces').delete().eq('id', createdSpaceId);
      }
    }
  });
});
