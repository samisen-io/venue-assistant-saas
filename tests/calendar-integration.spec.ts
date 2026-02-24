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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for calendar integration tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Calendar Integration', () => {
  test('shows event in month/week and navigates to event detail from calendar click', async ({
    page,
  }) => {
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
    const eventName = `PW Calendar Event ${suffix}`;
    const eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: createdEvent, error: eventError } = await admin
      .from('events')
      .insert({
        venue_id: spaces[0].venue_id,
        space_id: spaces[0].id,
        event_name: eventName,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: '11:00',
        event_end_time: '12:00',
        guest_count: 60,
        budget_total: 9000,
        status: 'planning',
      })
      .select('id')
      .single();

    if (eventError || !createdEvent) {
      throw new Error(`Failed to create event fixture: ${eventError?.message || 'unknown error'}`);
    }

    try {
      await page.goto('/calendar');
      await expect(page.getByTestId('calendar-page-title')).toBeVisible();

      const searchInput = page.getByPlaceholder(/search events/i);
      await searchInput.fill(eventName);
      await expect(page.getByText(eventName).first()).toBeVisible({ timeout: 15_000 });

      await page.getByTestId('calendar-view-week').click();
      await expect(page.getByTestId('calendar-view-week')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByText(eventName).first()).toBeVisible({ timeout: 15_000 });

      await page.getByText(eventName).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').getByRole('heading', { name: new RegExp(eventName) })).toBeVisible();

      await page.getByRole('button', { name: /view full details/i }).click();
      await expect(page).toHaveURL(new RegExp(`/events/${createdEvent.id}`));
      await expect(page.getByRole('heading', { name: new RegExp(eventName) })).toBeVisible();
    } finally {
      await admin.from('events').delete().eq('id', createdEvent.id);
    }
  });
});
