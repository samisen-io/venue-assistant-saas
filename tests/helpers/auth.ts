/**
 * Auth helpers — Task 1.2
 *
 * Centralised login/logout logic so no test file duplicates sign-in steps.
 * All tests that need an authenticated session should call one of these helpers
 * rather than re-implementing the login flow.
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Log in as an arbitrary user via the login form.
 * Waits for a successful redirect to /dashboard before returning.
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 10_000 });
}

/**
 * Log in as the configured test user (TEST_USER_EMAIL / TEST_USER_PASSWORD).
 * Throws immediately if env vars are not set so the failure is clear.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD. ' +
        'Set them in .env.local (see docs/testing/TEST_ENV_CONTRACT.md).'
    );
  }

  await loginAs(page, email, password);
}

/**
 * Log out via the sidebar logout button.
 * Expects the `data-testid="logout-button"` attribute to be present.
 * Waits for redirect to /login or / before returning.
 */
export async function logout(page: Page): Promise<void> {
  await page.getByTestId('logout-button').click();
  await page.waitForURL(/\/(login)?$/, { timeout: 10_000 });
}
