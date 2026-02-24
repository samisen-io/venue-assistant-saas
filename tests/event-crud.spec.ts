import { test, expect, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for event CRUD tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureSpaceExists(page: Page) {
  await page.goto('/spaces');

  const hasNoSpaces = await page.getByText(/no spaces found/i).isVisible().catch(() => false);
  if (!hasNoSpaces) return;

  await page.getByTestId('add-space-btn').click();
  await expect(page.getByRole('heading', { name: /create new space/i })).toBeVisible();

  const suffix = `${Date.now()}`;
  await page.getByLabel(/space name/i).fill(`PW Auto Space ${suffix}`);
  await page.getByLabel(/space type/i).click();
  await page.getByRole('option', { name: /ballroom/i }).click();
  await page.getByLabel(/^capacity/i).fill('120');
  await page.getByRole('button', { name: /create space/i }).click();

  await page.waitForURL('**/spaces', { timeout: 15_000 });
}

test.describe('Event CRUD', () => {
  test('create (admin), edit, and cancel event via UI @smoke', async ({ page }) => {
    test.setTimeout(90_000);

    requireAuthCredentials();
    await loginAsTestUser(page);
    await ensureSpaceExists(page);

    const spacesRes = await page.request.get('/api/spaces');
    expect(spacesRes.ok()).toBeTruthy();
    const spaces = (await spacesRes.json()) as Array<{ id: string; venue_id: string }>;
    expect(spaces.length).toBeGreaterThan(0);

    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const eventName = `PW Event ${suffix}`;
    const editedName = `PW Event Edited ${suffix}`;
    const future = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: created, error: createErr } = await admin
      .from('events')
      .insert({
        venue_id: spaces[0].venue_id,
        space_id: spaces[0].id,
        event_name: eventName,
        event_type: 'corporate',
        event_date: future,
        event_time: '10:00',
        event_end_time: '14:00',
        guest_count: 80,
        budget_total: 12000,
        status: 'planning',
      })
      .select('id')
      .single();

    if (createErr || !created) {
      throw new Error(`Failed to create event fixture: ${createErr?.message || 'unknown error'}`);
    }

    try {
      await page.goto('/events');
      await page.getByPlaceholder(/search events/i).fill(eventName);
      await page.goto(`/events/${created.id}`);

      await expect(page.getByRole('heading', { name: new RegExp(eventName) })).toBeVisible({
        timeout: 15_000,
      });

      await page.getByRole('link', { name: /^edit$/i }).click();
      await expect(page.getByRole('heading', { name: /edit event/i })).toBeVisible();

      await page.getByLabel(/event name/i).fill(editedName);
      await page.getByRole('button', { name: /save changes/i }).click();

      await expect(page.getByRole('heading', { name: new RegExp(editedName) })).toBeVisible({
        timeout: 15_000,
      });

      page.once('dialog', (dialog) => dialog.accept());
      await page.getByTestId('event-cancel-btn').click();

      await expect(page.getByTestId('event-status-badge')).toContainText(/cancelled/i, {
        timeout: 15_000,
      });

      await page.reload();
      await expect(page.getByTestId('event-status-badge')).toContainText(/cancelled/i, {
        timeout: 15_000,
      });

      await page.goto('/events');
      await page.getByPlaceholder(/search events/i).fill(editedName);
      await expect(page.getByText(new RegExp(editedName))).toBeVisible();
    } finally {
      await admin.from('events').delete().eq('id', created.id);
    }
  });
});
