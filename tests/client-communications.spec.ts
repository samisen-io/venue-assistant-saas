import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for client communications tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Client Communications', () => {
  test('posting a communication to a client persists and is retrievable', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: client, error: clientErr } = await admin.from('clients')
      .insert({ venue_id: activeVenueId!, contact_name: `PW Comms Client ${suffix}`, email: `pw-comms-${suffix}@example.com` })
      .select('id').single();
    if (clientErr || !client) throw new Error(`Failed creating client: ${clientErr?.message}`);

    try {
      const noteContent = `PW client note ${suffix}`;

      const postRes = await page.request.post(`/api/clients/${client.id}/communications`, {
        data: { type: 'note', subject: 'Test Note', content: noteContent, direction: 'outbound' },
      });
      expect(
        postRes.ok(),
        `POST /api/clients/${client.id}/communications failed: ${postRes.status()} — ${await postRes.text()}`,
      ).toBeTruthy();

      const getRes = await page.request.get(`/api/clients/${client.id}/communications`);
      expect(getRes.ok(), `GET /api/clients/${client.id}/communications failed: ${getRes.status()}`).toBeTruthy();
      const comms = (await getRes.json()) as Array<{ content?: string; subject?: string }>;
      expect(
        comms.some((c) => c.content === noteContent || c.subject === 'Test Note'),
        `Posted communication not found in client communications list`,
      ).toBeTruthy();
    } finally {
      await admin.from('client_communications').delete().eq('client_id', client.id);
      await admin.from('clients').delete().eq('id', client.id);
    }
  });
});
