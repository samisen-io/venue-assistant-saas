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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for client CRUD tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Client CRUD', () => {
  test('create, read, edit, and delete client lifecycle', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.goto('/clients');

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const clientName = `PW Client ${suffix}`;
    const editedClientName = `PW Client Edited ${suffix}`;
    const clientEmail = `client-${suffix}@example.com`;
    const admin = buildAdminClient();

    let createdClientId: string | null = null;

    try {
      await page.getByTestId('add-client-btn').click();
      await expect(page.getByRole('heading', { name: /add client/i })).toBeVisible();

      await page.getByLabel(/contact name/i).fill(clientName);
      await page.getByLabel(/email/i).fill(clientEmail);
      await page.getByRole('button', { name: /create client/i }).click();

      await page.waitForURL(/\/clients$/, { timeout: 20_000 });
      await page.getByPlaceholder(/search clients/i).fill(clientName);
      await expect(page.getByText(clientName).first()).toBeVisible({ timeout: 15_000 });

      const clientsRes = await page.request.get(`/api/clients?search=${encodeURIComponent(clientName)}`);
      expect(clientsRes.ok()).toBeTruthy();
      const clients = (await clientsRes.json()) as Array<{ id: string; contact_name: string }>;
      const createdClient = clients.find((client) => client.contact_name === clientName);
      expect(createdClient, `Client '${clientName}' was not returned by /api/clients`).toBeTruthy();

      createdClientId = createdClient!.id;

      await page.goto(`/clients/${createdClientId}`);
      await expect(page.getByRole('heading', { name: new RegExp(clientName) })).toBeVisible();

      await page.getByRole('link', { name: /edit client/i }).click();
      await expect(page.getByRole('heading', { name: /edit client/i })).toBeVisible();

      await page.getByLabel(/contact name/i).fill(editedClientName);
      await page.getByRole('button', { name: /save changes/i }).click();

      await page.waitForURL(new RegExp(`/clients/${createdClientId}`), { timeout: 20_000 });
      await expect(page.getByRole('heading', { name: new RegExp(editedClientName) })).toBeVisible();

      await page.reload();
      await expect(page.getByRole('heading', { name: new RegExp(editedClientName) })).toBeVisible();

      const deleteRes = await page.request.delete(`/api/clients/${createdClientId}`);
      expect([200, 204]).toContain(deleteRes.status());

      await expect
        .poll(async () => {
          const latest = await page.request.get(`/api/clients?search=${encodeURIComponent(editedClientName)}`);
          if (!latest.ok()) return false;
          const rows = (await latest.json()) as Array<{ id: string }>;
          return rows.every((row) => row.id !== createdClientId);
        })
        .toBeTruthy();

      await page.goto('/clients');
      await page.getByPlaceholder(/search clients/i).fill(editedClientName);
      await expect(page.getByText(/no matches found|no clients found/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      if (createdClientId) {
        await admin.from('client_communications').delete().eq('client_id', createdClientId);
        await admin.from('events').update({ client_id: null }).eq('client_id', createdClientId);
        await admin.from('clients').delete().eq('id', createdClientId);
      }
    }
  });
});
