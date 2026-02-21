import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    // Create an empty auth state so dependent tests can still run (and skip auth-gated assertions)
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
    console.warn(
      '\n⚠️  TEST_USER_EMAIL or TEST_USER_PASSWORD not set.\n' +
      '   Authenticated tests will be skipped or will fail on protected routes.\n' +
      '   Create a .env.test file (see .env.example) and add your test credentials.\n'
    );
    return;
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
  await page.context().storageState({ path: authFile });
});
