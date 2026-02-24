import { test, expect } from '@playwright/test';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireAuthCredentials, assertNotRedirectedToLogin } from './helpers/requirements';

test.use({ storageState: path.join(__dirname, '.auth/user.json') });

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for lead lifecycle tests.');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Lead Lifecycle', () => {
  test('lead status transitions persist: new -> qualified -> won', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);
    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));

    const uniqueName = `PW Lead Lifecycle ${Date.now()}`;
    const admin = buildAdminClient();

    const createRes = await page.request.post('/api/leads', {
      headers: activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined,
      data: {
        source: 'manual',
        contact_name: uniqueName,
        contact_email: `lead-${Date.now()}@example.com`,
        contact_phone: '5551234567',
        event_type: 'corporate',
        priority_score: 55,
        notes: 'PW lead lifecycle test seed',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createdLead = (await createRes.json()) as { id: string };

    if (!createdLead?.id) {
      throw new Error('Failed to create test lead via /api/leads.');
    }

    try {
      await page.goto('/leads');
      await expect(page.getByRole('heading', { name: /^leads$/i })).toBeVisible();
      await page.getByPlaceholder(/search by name, email, company/i).fill(uniqueName);

      await page.getByRole('link', { name: new RegExp(uniqueName, 'i') }).first().click();
      await expect(page).toHaveURL(new RegExp(`/leads/${createdLead.id}`));
      await expect(page.getByTestId('lead-status-dropdown')).toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(uniqueName, 'i') })).toBeVisible();
      await expect(page.getByText(/no conversation transcript available/i)).toBeVisible();

      const statusDropdown = page.getByTestId('lead-status-dropdown');

      await statusDropdown.click();
      await page.getByRole('option', { name: /^qualified$/i }).click();
      await expect(statusDropdown).toContainText(/qualified/i);

      await page.reload();
      await expect(statusDropdown).toContainText(/qualified/i);

      await statusDropdown.click();
      await page.getByRole('option', { name: /^won$/i }).click();
      await expect(statusDropdown).toContainText(/won/i);

      await page.reload();
      await expect(statusDropdown).toContainText(/won/i);
    } finally {
      await admin.from('lead_activities').delete().eq('lead_id', createdLead.id);
      await admin.from('leads').delete().eq('id', createdLead.id);
    }
  });
});
