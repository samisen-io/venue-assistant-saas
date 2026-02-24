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

  let authRequestFailure: string | null = null;
  page.on('requestfailed', (request) => {
    if (request.url().includes('/auth/v1/token?grant_type=password')) {
      const errorText = request.failure()?.errorText ?? 'unknown network error';
      authRequestFailure = `${request.url()} (${errorText})`;
    }
  });

  await page.getByRole('button', { name: /sign in/i }).click();

  const authResponseTimeoutMs = 10_000;
  let authResponse;
  try {
    authResponse = await page.waitForResponse(
      (response) =>
        response.url().includes('/auth/v1/token?grant_type=password') &&
        response.request().method() === 'POST',
      { timeout: authResponseTimeoutMs }
    );
  } catch {
    const base = `Timed out waiting ${authResponseTimeoutMs}ms for Supabase auth response.`;
    const details = authRequestFailure
      ? ` Request failed: ${authRequestFailure}.`
      : ' No auth response was received (check NEXT_PUBLIC_SUPABASE_URL, DNS, or network access to *.supabase.co).';
    throw new Error(`${base}${details}`);
  }

  if (!authResponse.ok()) {
    let bodyPreview = '';
    try {
      const body = await authResponse.text();
      bodyPreview = body ? ` Response: ${body.slice(0, 300)}` : '';
    } catch {
      // Ignore body parse failures and keep the status-focused error.
    }

    throw new Error(
      `Supabase auth request failed with status ${authResponse.status()} ${authResponse.statusText()}.${bodyPreview}`
    );
  }

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
