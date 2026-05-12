import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials for testimonials tests.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

test.describe('Venue Testimonials CRUD', () => {
  test('create and delete a testimonial via API', async ({ page }) => {
    test.setTimeout(60_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let testimonialId: string | null = null;

    try {
      // CREATE
      const createRes = await page.request.post(`/api/venues/${activeVenueId}/testimonials`, {
        data: {
          author_name: `PW Reviewer ${suffix}`,
          author_title: 'Event Planner',
          content: `PW testimonial content ${suffix}`,
          rating: 5,
          event_type: 'corporate',
          is_featured: false,
        },
      });
      expect(
        createRes.ok(),
        `POST /api/venues/${activeVenueId}/testimonials failed: ${createRes.status()} — ${await createRes.text()}`,
      ).toBeTruthy();
      const created = (await createRes.json()) as { id?: string };
      testimonialId = created.id ?? null;
      expect(testimonialId, 'No testimonial ID returned').toBeTruthy();

      // READ — verify it appears in the list
      const getRes = await page.request.get(`/api/venues/${activeVenueId}/testimonials`);
      expect(getRes.ok()).toBeTruthy();
      const testimonials = (await getRes.json()) as Array<{ id: string; author_name: string }>;
      expect(
        testimonials.some((t) => t.id === testimonialId),
        'Created testimonial not found in list',
      ).toBeTruthy();

      // DELETE
      const deleteRes = await page.request.delete(`/api/venues/${activeVenueId}/testimonials`, {
        data: { id: testimonialId },
      });
      expect(
        [200, 204].includes(deleteRes.status()),
        `DELETE /api/venues/${activeVenueId}/testimonials failed: ${deleteRes.status()}`,
      ).toBeTruthy();

      // Verify deleted from DB
      const { data: gone } = await admin
        .from('venue_testimonials')
        .select('id')
        .eq('id', testimonialId!)
        .maybeSingle();
      expect(gone, 'Testimonial should be deleted from DB').toBeNull();
      testimonialId = null;
    } finally {
      if (testimonialId) {
        await admin.from('venue_testimonials').delete().eq('id', testimonialId);
      }
    }
  });
});
