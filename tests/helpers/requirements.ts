import { expect } from '@playwright/test';

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

export async function assertNotRedirectedToLogin(page: { url: () => string }) {
  await expect(page.url(), 'Auth state missing or expired; redirected to /login.').not.toContain('/login');
}
