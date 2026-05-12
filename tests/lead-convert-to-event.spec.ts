import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for lead convert tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Lead Convert to Event', () => {
  test('converting a qualified lead creates an event and marks lead as won', async ({ page }) => {
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
        contact_name: `PW Convert Lead ${suffix}`,
        contact_email: `pw-convert-${suffix}@example.com`,
        event_type: 'corporate',
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        guest_count: 75,
        budget: 10000,
        status: 'qualified',
      })
      .select('id')
      .single();
    if (leadErr || !lead) throw new Error(`Failed creating lead: ${leadErr?.message}`);

    let createdEventId: string | null = null;

    try {
      // Convert via API
      const convertRes = await page.request.post(
        `/api/leads/${lead.id}/convert-to-event`,
      );
      expect(
        convertRes.ok(),
        `POST /api/leads/${lead.id}/convert-to-event failed: ${convertRes.status()} — ${await convertRes.text()}`,
      ).toBeTruthy();

      const result = (await convertRes.json()) as { event?: { id: string }; eventId?: string };
      createdEventId = result.event?.id ?? result.eventId ?? null;
      expect(createdEventId, 'No event ID returned from convert-to-event').toBeTruthy();

      // Verify event exists in DB
      const { data: event } = await admin
        .from('events')
        .select('id, status')
        .eq('id', createdEventId!)
        .single();
      expect(event, 'Created event not found in database').toBeTruthy();

      // Verify lead is now marked as won
      const { data: updatedLead } = await admin
        .from('leads')
        .select('status')
        .eq('id', lead.id)
        .single();
      expect(updatedLead?.status, 'Lead status should be "won" after conversion').toBe('won');

      // UI: navigate to the lead and verify convert button is gone / event link present
      await page.goto(`/leads/${lead.id}`);
      await expect(
        page.getByText(/converted|won|event created/i).first(),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      if (createdEventId) {
        await admin.from('event_vendors').delete().eq('event_id', createdEventId);
        await admin.from('event_service_requirements').delete().eq('event_id', createdEventId);
        await admin.from('events').delete().eq('id', createdEventId);
      }
      await admin.from('lead_activities').delete().eq('lead_id', lead.id);
      await admin.from('leads').delete().eq('id', lead.id);
    }
  });
});
