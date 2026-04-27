import { test, expect } from '@playwright/test';
import { loginAs, loginAsTestUser, logout } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Login + Logout', () => {
  test('valid credentials log user into dashboard @smoke', async ({ page }) => {
    requireAuthCredentials();
    await loginAsTestUser(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
  });

  test('invalid credentials show an error and do not navigate', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('pw-invalid-user@example.com');
    await page.getByLabel('Password').fill('NotTheRightPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid|error|credentials/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('logout signs user out and redirects to login or home @smoke', async ({ browser }) => {
    requireAuthCredentials();
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();

    try {
      await loginAs(page, email, password);
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();

      await logout(page);
      await expect(page).toHaveURL(/\/(login)?$/);
    } finally {
      await ctx.close();
    }
  });
});
