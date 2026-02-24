import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { loginAs } from './helpers/auth';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for RLS tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Security RLS', () => {
  test('user cannot access another tenant venue/event/lead/client data', async ({ page }) => {
    test.setTimeout(90_000);

    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const userAEmail = `pw-rls-a-${suffix}@example.com`;
    const userBEmail = `pw-rls-b-${suffix}@example.com`;
    const userAPassword = `PwA-${randomUUID().slice(0, 8)}!`;
    const userBPassword = `PwB-${randomUUID().slice(0, 8)}!`;

    const { data: userAData, error: userAErr } = await admin.auth.admin.createUser({
      email: userAEmail,
      password: userAPassword,
      email_confirm: true,
      user_metadata: { full_name: 'PW RLS User A' },
    });
    if (userAErr || !userAData.user) {
      throw new Error(`Failed creating User A: ${userAErr?.message || 'unknown error'}`);
    }

    const { data: userBData, error: userBErr } = await admin.auth.admin.createUser({
      email: userBEmail,
      password: userBPassword,
      email_confirm: true,
      user_metadata: { full_name: 'PW RLS User B' },
    });
    if (userBErr || !userBData.user) {
      await admin.auth.admin.deleteUser(userAData.user.id);
      throw new Error(`Failed creating User B: ${userBErr?.message || 'unknown error'}`);
    }

    let venueAId: string | null = null;
    let venueBId: string | null = null;
    let spaceAId: string | null = null;
    let clientAId: string | null = null;
    let eventAId: string | null = null;
    let leadAId: string | null = null;

    try {
      const { data: venueA, error: venueAErr } = await admin
        .from('venues')
        .insert({
          owner_id: userAData.user.id,
          name: `PW RLS Venue A ${suffix}`,
          venue_type: 'conference_center',
          address: '1 Tenant St',
          city: 'Austin',
          state: 'TX',
          zip_code: '73301',
          page_status: 'draft',
        })
        .select('id')
        .single();

      if (venueAErr || !venueA) {
        throw new Error(`Failed creating venue A: ${venueAErr?.message || 'unknown error'}`);
      }
      venueAId = venueA.id as string;

      const { data: venueB, error: venueBErr } = await admin
        .from('venues')
        .insert({
          owner_id: userBData.user.id,
          name: `PW RLS Venue B ${suffix}`,
          venue_type: 'conference_center',
          address: '2 Tenant St',
          city: 'Austin',
          state: 'TX',
          zip_code: '73301',
          page_status: 'draft',
        })
        .select('id')
        .single();

      if (venueBErr || !venueB) {
        throw new Error(`Failed creating venue B: ${venueBErr?.message || 'unknown error'}`);
      }
      venueBId = venueB.id as string;

      const { data: spaceA, error: spaceAErr } = await admin
        .from('spaces')
        .insert({
          venue_id: venueAId,
          name: `PW RLS Space A ${suffix}`,
          capacity: 80,
          space_type: 'ballroom',
        })
        .select('id')
        .single();
      if (spaceAErr || !spaceA) {
        throw new Error(`Failed creating space A: ${spaceAErr?.message || 'unknown error'}`);
      }
      spaceAId = spaceA.id as string;

      const clientName = `PW RLS Client A ${suffix}`;
      const { data: clientA, error: clientAErr } = await admin
        .from('clients')
        .insert({
          venue_id: venueAId,
          contact_name: clientName,
          email: `pw-rls-client-a-${suffix}@example.com`,
        })
        .select('id')
        .single();
      if (clientAErr || !clientA) {
        throw new Error(`Failed creating client A: ${clientAErr?.message || 'unknown error'}`);
      }
      clientAId = clientA.id as string;

      const eventName = `PW RLS Event A ${suffix}`;
      const eventDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const { data: eventA, error: eventAErr } = await admin
        .from('events')
        .insert({
          venue_id: venueAId,
          space_id: spaceAId,
          client_id: clientAId,
          event_name: eventName,
          event_type: 'corporate',
          event_date: eventDate,
          event_time: '10:00',
          event_end_time: '12:00',
          guest_count: 60,
          budget_total: 8000,
          status: 'planning',
        })
        .select('id')
        .single();
      if (eventAErr || !eventA) {
        throw new Error(`Failed creating event A: ${eventAErr?.message || 'unknown error'}`);
      }
      eventAId = eventA.id as string;

      const leadName = `PW RLS Lead A ${suffix}`;
      const { data: leadA, error: leadAErr } = await admin
        .from('leads')
        .insert({
          venue_id: venueAId,
          source: 'manual',
          contact_name: leadName,
          contact_email: `pw-rls-lead-a-${suffix}@example.com`,
          status: 'new',
        })
        .select('id')
        .single();
      if (leadAErr || !leadA) {
        throw new Error(`Failed creating lead A: ${leadAErr?.message || 'unknown error'}`);
      }
      leadAId = leadA.id as string;

      await loginAs(page, userBEmail, userBPassword);

      const apiChecks = [
        `/api/venues/${venueAId}`,
        `/api/events/${eventAId}`,
        `/api/leads/${leadAId}`,
        `/api/clients/${clientAId}`,
      ];

      for (const route of apiChecks) {
        const apiRes = await page.request.get(route);
        expect(apiRes.status(), `Cross-tenant API access unexpectedly allowed for ${route}`).not.toBe(200);
      }

      await page.goto(`/venues/${venueAId}/edit`);
      await expect(page.getByText(/could not load venue details/i)).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByRole('heading', { name: /edit venue/i })).not.toBeVisible();

      const uiChecks: Array<{ path: string; secretText: string }> = [
        { path: `/events/${eventAId}`, secretText: eventName },
        { path: `/leads/${leadAId}`, secretText: leadName },
        { path: `/clients/${clientAId}`, secretText: clientName },
      ];

      for (const uiCheck of uiChecks) {
        await page.goto(uiCheck.path);
        await page.waitForLoadState('networkidle');
        const bodyText = await page.locator('body').innerText();
        expect(
          bodyText.includes(uiCheck.secretText),
          `Cross-tenant page access leaked data for ${uiCheck.path}`,
        ).toBeFalsy();
      }
    } finally {
      if (leadAId) {
        await admin.from('lead_activities').delete().eq('lead_id', leadAId);
        await admin.from('leads').delete().eq('id', leadAId);
      }
      if (eventAId) {
        await admin.from('vendor_communications').delete().eq('event_id', eventAId);
        await admin.from('event_vendors').delete().eq('event_id', eventAId);
        await admin.from('event_service_requirements').delete().eq('event_id', eventAId);
        await admin.from('events').delete().eq('id', eventAId);
      }
      if (clientAId) {
        await admin.from('client_communications').delete().eq('client_id', clientAId);
        await admin.from('clients').delete().eq('id', clientAId);
      }
      if (spaceAId) {
        await admin.from('spaces').delete().eq('id', spaceAId);
      }
      if (venueAId) {
        await admin.from('venues').delete().eq('id', venueAId);
      }
      if (venueBId) {
        await admin.from('venues').delete().eq('id', venueBId);
      }
      await admin.auth.admin.deleteUser(userAData.user.id);
      await admin.auth.admin.deleteUser(userBData.user.id);
    }
  });
});
