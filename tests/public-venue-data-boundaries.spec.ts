import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireSeedData } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for public venue boundary tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Public Venue Data Boundaries', () => {
  test('published slug is available, unpublished slug is blocked, and private fields are not leaked', async ({ request }) => {
    requireSeedData();
    const admin = buildAdminClient();
    const { data: ownerRow, error: ownerError } = await admin
      .from('venues')
      .select('owner_id')
      .not('owner_id', 'is', null)
      .limit(1)
      .single();
    if (ownerError || !ownerRow?.owner_id) {
      throw new Error(`Failed to resolve an owner_id for venue fixtures: ${ownerError?.message || 'unknown error'}`);
    }
    const userId = ownerRow.owner_id as string;
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const publishedSlug = `pw-public-${suffix}`;
    const draftSlug = `pw-draft-${suffix}`;

    const { data: publishedVenue, error: publishedVenueError } = await admin
      .from('venues')
      .insert({
        owner_id: userId,
        name: `PW Public Venue ${suffix}`,
        slug: publishedSlug,
        page_status: 'published',
        venue_type: 'conference_center',
        address: '1 Public Street',
        city: 'Austin',
        state: 'TX',
        zip_code: '73301',
      })
      .select('id')
      .single();
    if (publishedVenueError || !publishedVenue) {
      throw new Error(
        `Failed to create published venue fixture: ${publishedVenueError?.message || 'unknown error'}`,
      );
    }

    const { data: draftVenue, error: draftVenueError } = await admin
      .from('venues')
      .insert({
        owner_id: userId,
        name: `PW Draft Venue ${suffix}`,
        slug: draftSlug,
        page_status: 'draft',
        venue_type: 'conference_center',
        address: '1 Draft Street',
        city: 'Austin',
        state: 'TX',
        zip_code: '73301',
      })
      .select('id')
      .single();
    if (draftVenueError || !draftVenue) {
      await admin.from('venues').delete().eq('id', publishedVenue.id);
      throw new Error(`Failed to create draft venue fixture: ${draftVenueError?.message || 'unknown error'}`);
    }

    try {
      const publishedRes = await request.get(`/api/venues/public/${publishedSlug}`);
      expect(publishedRes.ok()).toBeTruthy();

      const publishedData = (await publishedRes.json()) as {
        venue?: Record<string, unknown>;
        spaces?: unknown[];
        packages?: unknown[];
        leads?: unknown[];
      };

      expect(publishedData.venue).toBeTruthy();
      expect(Array.isArray(publishedData.spaces)).toBeTruthy();
      expect(Array.isArray(publishedData.packages)).toBeTruthy();

      const venue = publishedData.venue!;
      expect(venue.owner_id).toBeUndefined();
      expect(venue.privacy_settings).toBeUndefined();
      expect(venue.google_analytics_id).toBeUndefined();
      expect(venue.facebook_pixel_id).toBeUndefined();
      expect(publishedData.leads).toBeUndefined();

      const draftRes = await request.get(`/api/venues/public/${draftSlug}`);
      expect(draftRes.status()).toBe(404);
      const draftBody = (await draftRes.json()) as { error?: string };
      expect(draftBody.error).toMatch(/not found/i);
    } finally {
      await admin.from('venues').delete().eq('id', publishedVenue.id);
      await admin.from('venues').delete().eq('id', draftVenue.id);
    }
  });
});
