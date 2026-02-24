import { expect } from '@playwright/test';
import { seedTestFixtures, getTestUserId } from '../fixtures/seed';
import type { TestIds } from '../fixtures/seed';

export function requireAuthCredentials() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing TEST_USER_EMAIL/TEST_USER_PASSWORD for authenticated flow.');
  }
}

export function requireVenueSlug() {
  if (!process.env.TEST_VENUE_SLUG) {
    throw new Error('Missing TEST_VENUE_SLUG for public venue flow.');
  }
}

/**
 * Assert the current page URL is not a login redirect.
 * Used to verify auth state is intact after navigation.
 */
export async function assertNotRedirectedToLogin(page: { url: () => string }) {
  await expect(page.url(), 'Auth state missing or expired; redirected to /login.').not.toContain('/login');
}

/**
 * Task 1.1 — Validate env vars required for seed/teardown.
 * Call this at the start of tests that rely on seeded fixture data.
 */
export function requireSeedData() {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.TEST_USER_EMAIL;

  const missing: string[] = [];
  if (!url) missing.push('TEST_SUPABASE_URL');
  if (!key) missing.push('TEST_SUPABASE_SERVICE_ROLE_KEY');
  if (!email) missing.push('TEST_USER_EMAIL');

  if (missing.length > 0) {
    throw new Error(
      `Missing env vars for seed data: ${missing.join(', ')}. ` +
        'See docs/testing/TEST_ENV_CONTRACT.md.'
    );
  }
}

/**
 * Task 1.1 — Seed minimal test fixtures and return their DB-backed IDs.
 *
 * Usage in a Playwright test file:
 *
 *   let ids: TestIds;
 *   test.beforeEach(async () => { ids = await getTestIds(); });
 *   test.afterEach(async () => { await teardownTestFixtures(ids); });
 */
export async function getTestIds(): Promise<TestIds> {
  requireSeedData();
  const userId = await getTestUserId();
  return seedTestFixtures(userId);
}
