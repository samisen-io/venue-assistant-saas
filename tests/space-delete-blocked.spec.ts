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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for space delete blocked tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Space Delete Blocked', () => {
  test('deleting a space with active events is blocked (409 SPACE_HAS_EVENTS)', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.goto('/dashboard');

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;
    const admin = buildAdminClient();

    const spacesRes = await page.request.get('/api/spaces', { headers });
    expect(spacesRes.ok()).toBeTruthy();
    const spaces = (await spacesRes.json()) as Array<{ id: string; venue_id: string }>;
    expect(spaces.length).toBeGreaterThan(0);

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const createSpaceRes = await page.request.post('/api/spaces', {
      headers,
      data: {
        name: `PW Blocked Delete Space ${suffix}`,
        capacity: 75,
        space_type: 'ballroom',
        notes: 'PW space-delete-blocked fixture',
      },
    });

    expect(createSpaceRes.ok()).toBeTruthy();
    const createdSpace = (await createSpaceRes.json()) as { id: string; venue_id: string };

    const eventDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: createdEvent, error: eventError } = await admin
      .from('events')
      .insert({
        venue_id: createdSpace.venue_id,
        space_id: createdSpace.id,
        event_name: `PW Space Block Event ${suffix}`,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: '11:00',
        event_end_time: '13:00',
        guest_count: 40,
        budget_total: 6000,
        status: 'planning',
      })
      .select('id')
      .single();

    if (eventError || !createdEvent) {
      throw new Error(`Failed to create active event fixture: ${eventError?.message || 'unknown error'}`);
    }

    try {
      const deleteApiRes = await page.request.delete(`/api/spaces/${createdSpace.id}`);
      expect(deleteApiRes.status()).toBe(409);
      const deleteBody = (await deleteApiRes.json()) as {
        code?: string;
        error?: string;
        activeEventCount?: number;
      };
      expect(deleteBody.code).toBe('SPACE_HAS_EVENTS');
      expect(deleteBody.activeEventCount).toBeGreaterThan(0);
      expect(deleteBody.error || '').toMatch(/cannot delete.*active event/i);

      const alertMessages: string[] = [];
      page.on('dialog', async (dialog) => {
        if (dialog.type() === 'confirm') {
          await dialog.accept();
          return;
        }
        alertMessages.push(dialog.message());
        await dialog.accept();
      });

      await page.goto(`/spaces/${createdSpace.id}`);
      await expect(page.getByRole('heading', { name: /PW Blocked Delete Space/i })).toBeVisible();
      await page.getByRole('button', { name: /delete space/i }).click();

      await expect
        .poll(() => alertMessages.length, { timeout: 10_000 })
        .toBeGreaterThan(0);

      expect(alertMessages.join(' ')).toMatch(/cannot delete.*active event/i);
      await expect(page).toHaveURL(new RegExp(`/spaces/${createdSpace.id}`));
    } finally {
      await admin.from('events').delete().eq('id', createdEvent.id);
      await admin.from('spaces').delete().eq('id', createdSpace.id);
    }
  });
});
