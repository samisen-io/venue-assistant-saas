import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD. Set them in .env.local (docs/testing/TEST_ENV_CONTRACT.md).'
    );
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for successful redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15_000 });

  // The sidebar navigation is rendered immediately on load (before any async data).
  // Waiting for it confirms we are authenticated and the app shell is ready.
  await expect(page.getByRole('navigation')).toBeVisible({ timeout: 10_000 });

  // Save auth cookies/storage state
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });

  const stateRaw = fs.readFileSync(authFile, 'utf-8');
  const state = JSON.parse(stateRaw) as { cookies?: Array<{ name: string }> };
  if (!state.cookies?.length) {
    throw new Error('Auth setup wrote an empty storage state.');
  }

  const hasSupabaseCookie = state.cookies.some((cookie) => cookie.name.startsWith('sb-'));
  if (!hasSupabaseCookie) {
    throw new Error('Auth setup completed without Supabase auth cookies in storage state.');
  }
});
