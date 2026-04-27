import { test, expect } from '@playwright/test';

test.describe('Password Reset', () => {
  test('forgot-password form submits and shows success state', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL || `pw-reset-${Date.now()}@example.com`;

    await page.goto('/login');
    await page.getByRole('link', { name: /forgot password\?/i }).click();

    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(email);
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page.getByText(/if an account exists for this email/i)).toBeVisible({ timeout: 15_000 });
  });
});
