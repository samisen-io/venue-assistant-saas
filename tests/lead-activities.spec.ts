import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for lead activities tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Lead Activities', () => {
  test('posting an activity appears in the activities list for that lead', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: lead, error: leadErr } = await admin
      .from('leads')
      .insert({
        venue_id: activeVenueId!,
        source: 'manual',
        contact_name: `PW Activity Lead ${suffix}`,
        contact_email: `pw-activity-${suffix}@example.com`,
        status: 'new',
      })
      .select('id')
      .single();
    if (leadErr || !lead) throw new Error(`Failed creating lead: ${leadErr?.message}`);

    try {
      const noteText = `PW activity note ${suffix}`;

      // POST a new activity via the API
      const postRes = await page.request.post(`/api/leads/${lead.id}/activities`, {
        data: { type: 'note', notes: noteText },
      });
      expect(
        postRes.ok(),
        `POST /api/leads/${lead.id}/activities failed: ${postRes.status()} — ${await postRes.text()}`,
      ).toBeTruthy();

      const created = (await postRes.json()) as { id?: string };
      expect(created.id, 'No activity ID returned').toBeTruthy();

      // GET activities and verify the note is present
      const getRes = await page.request.get(`/api/leads/${lead.id}/activities`);
      expect(getRes.ok(), `GET /api/leads/${lead.id}/activities failed: ${getRes.status()}`).toBeTruthy();
      const activities = (await getRes.json()) as Array<{ id: string; notes?: string; type?: string }>;
      expect(
        activities.some((a) => a.notes === noteText),
        `Posted activity note "${noteText}" not found in activities list`,
      ).toBeTruthy();

      // UI: navigate to lead detail and verify activity appears
      await page.goto(`/leads/${lead.id}`);
      await expect(page.getByText(noteText)).toBeVisible({ timeout: 15_000 });
    } finally {
      await admin.from('lead_activities').delete().eq('lead_id', lead.id);
      await admin.from('leads').delete().eq('id', lead.id);
    }
  });
});
