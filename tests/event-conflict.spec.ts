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
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for event conflict tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getOrCreateSpace(
  page: Page,
  activeVenueId: string | null,
): Promise<{ id: string; name: string; venue_id: string; createdByTest: boolean }> {
  const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;
  const spacesRes = await page.request.get('/api/spaces', { headers });
  expect(spacesRes.ok()).toBeTruthy();
  const spaces = (await spacesRes.json()) as Array<{ id: string; name: string; venue_id: string }>;

  if (spaces.length > 0) {
    return { ...spaces[0], createdByTest: false };
  }

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const createRes = await page.request.post('/api/spaces', {
    headers,
    data: {
      name: `PW Conflict Space ${suffix}`,
      capacity: 120,
      space_type: 'ballroom',
      notes: 'PW event conflict test fixture',
    },
  });

  expect(createRes.ok()).toBeTruthy();
  const created = (await createRes.json()) as { id: string; name: string; venue_id: string };
  return { ...created, createdByTest: true };
}

test.describe('Event Conflict Detection', () => {
  test('blocks creating an overlapping booking for the same space/time', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();
    await loginAsTestUser(page);

    await page.goto('/dashboard');
    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const targetSpace = await getOrCreateSpace(page, activeVenueId);
    const admin = buildAdminClient();

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const existingEventName = `PW Existing Conflict ${suffix}`;
    const attemptedEventName = `PW Conflict Attempt ${suffix}`;
    const eventDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const eventTime = '10:00';
    const eventEndTime = '12:00';
    let createdSpaceIdForCleanup: string | null = null;

    const { data: existingEvent, error: existingEventError } = await admin
      .from('events')
      .insert({
        venue_id: targetSpace.venue_id,
        space_id: targetSpace.id,
        event_name: existingEventName,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: eventTime,
        event_end_time: eventEndTime,
        guest_count: 80,
        budget_total: 12000,
        status: 'planning',
      })
      .select('id')
      .single();

    if (existingEventError || !existingEvent) {
      throw new Error(
        `Failed to create existing event fixture: ${existingEventError?.message || 'unknown error'}`,
      );
    }

    if (targetSpace.createdByTest) {
      createdSpaceIdForCleanup = targetSpace.id;
    }

    try {
      const createAttemptRes = await page.request.post('/api/events', {
        headers: activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined,
        data: {
          event_name: attemptedEventName,
          event_type: 'corporate',
          event_date: eventDate,
          event_time: eventTime,
          event_end_time: eventEndTime,
          guest_count: 40,
          budget_total: 5000,
          description: 'PW conflict attempt',
          special_requirements: '',
          space_id: targetSpace.id,
        },
      });

      expect(createAttemptRes.status()).toBe(409);
      const conflictPayload = (await createAttemptRes.json()) as {
        code?: string;
        conflictingEvents?: Array<{ event_name?: string }>;
      };
      expect(conflictPayload.code).toBe('SPACE_CONFLICT');
      expect(
        conflictPayload.conflictingEvents?.some((e) => e.event_name === existingEventName),
      ).toBeTruthy();

      const { data: attemptedRows, error: attemptedRowsError } = await admin
        .from('events')
        .select('id')
        .eq('event_name', attemptedEventName);

      if (attemptedRowsError) {
        throw new Error(`Failed to verify conflict result: ${attemptedRowsError.message}`);
      }

      expect(attemptedRows ?? []).toHaveLength(0);
    } finally {
      await admin.from('events').delete().eq('id', existingEvent.id);
      if (createdSpaceIdForCleanup) {
        await admin.from('spaces').delete().eq('id', createdSpaceIdForCleanup);
      }
    }
  });
});
