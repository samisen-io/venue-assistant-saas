import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';
import { randomUUID } from 'node:crypto';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for proposal tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Proposal Lifecycle', () => {
  test('seeded proposal is retrievable and public token page renders', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const publicToken = randomUUID();

    // Seed a lead and proposal directly (bypasses AI generation)
    const { data: lead, error: leadErr } = await admin
      .from('leads')
      .insert({
        venue_id: activeVenueId!,
        source: 'manual',
        contact_name: `PW Proposal Contact ${suffix}`,
        contact_email: `pw-proposal-${suffix}@example.com`,
        status: 'qualified',
      })
      .select('id')
      .single();
    if (leadErr || !lead) throw new Error(`Failed creating lead: ${leadErr?.message}`);

    const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: proposal, error: propErr } = await admin
      .from('proposals')
      .insert({
        venue_id: activeVenueId!,
        lead_id: lead.id,
        status: 'sent',
        public_token: publicToken,
        reference_number: `PW-${suffix}`,
        total_estimated: 8500,
        valid_until: validUntil,
        viewed_at: null,
      })
      .select('id')
      .single();
    if (propErr || !proposal) throw new Error(`Failed creating proposal: ${propErr?.message}`);

    try {
      // Verify proposal detail page loads (authenticated view)
      await page.goto(`/leads/${lead.id}`);
      await expect(page.getByRole('heading', { name: /lead/i })).toBeVisible({ timeout: 15_000 });

      // Verify the public token endpoint returns proposal data
      const publicRes = await page.request.get(`/api/proposals/public/${publicToken}`);
      expect(
        publicRes.ok(),
        `GET /api/proposals/public/${publicToken} failed: ${publicRes.status()} — ${await publicRes.text()}`,
      ).toBeTruthy();
      const publicData = (await publicRes.json()) as {
        reference_number?: string;
        total_estimated?: number;
        status?: string;
      };
      expect(publicData.reference_number).toBe(`PW-${suffix}`);
      expect(publicData.total_estimated).toBe(8500);
      expect(publicData.status).toBe('sent');

      // Verify proposal is marked as viewed after GET
      const { data: viewed } = await admin
        .from('proposals')
        .select('viewed_at')
        .eq('id', proposal.id)
        .single();
      expect(viewed?.viewed_at, 'Proposal should be marked viewed_at after first GET').toBeTruthy();

      // Verify the proposal GET via authenticated API
      const authRes = await page.request.get(`/api/proposals/${proposal.id}`);
      expect(authRes.ok(), `GET /api/proposals/${proposal.id} failed: ${authRes.status()}`).toBeTruthy();
    } finally {
      await admin.from('proposals').delete().eq('id', proposal.id);
      await admin.from('lead_activities').delete().eq('lead_id', lead.id);
      await admin.from('leads').delete().eq('id', lead.id);
    }
  });
});
