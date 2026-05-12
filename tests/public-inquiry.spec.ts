import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireVenueSlug } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for inquiry tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Public Venue Inquiry', () => {
  test('submitting the inquiry form creates a lead for the venue', async ({ page, request }) => {
    test.setTimeout(30_000);
    requireVenueSlug();

    const slug = process.env.TEST_VENUE_SLUG!;
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const contactEmail = `pw-inquiry-${suffix}@example.com`;

    // Submit via API directly (public endpoint, no auth required)
    const res = await request.post(`/api/venues/public/${slug}/inquiries`, {
      data: {
        name: `PW Inquiry ${suffix}`,
        email: contactEmail,
        phone: '5551234567',
        event_type: 'corporate',
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        guest_count: 80,
        message: `Playwright test inquiry ${suffix}`,
      },
    });
    expect(
      res.ok(),
      `POST /api/venues/public/${slug}/inquiries failed: ${res.status()} — ${await res.text()}`,
    ).toBeTruthy();

    // Verify lead was created in DB
    await expect
      .poll(async () => {
        const { data } = await admin
          .from('leads')
          .select('id')
          .eq('contact_email', contactEmail)
          .limit(1);
        return (data ?? []).length;
      })
      .toBeGreaterThan(0);

    // Cleanup
    const { data: leads } = await admin
      .from('leads')
      .select('id')
      .eq('contact_email', contactEmail);
    if (leads?.length) {
      for (const lead of leads) {
        await admin.from('lead_activities').delete().eq('lead_id', lead.id);
        await admin.from('leads').delete().eq('id', lead.id);
      }
    }
  });
});
