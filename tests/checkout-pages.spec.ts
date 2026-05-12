import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Checkout Pages @smoke', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });
  });

  test('checkout cancel page renders with back-to-dashboard link', async ({ page }) => {
    await page.goto('/checkout/cancel');
    await expect(
      page.getByText(/cancelled|no charges/i).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('link', { name: /back to dashboard/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('checkout success page renders without crashing', async ({ page }) => {
    // Navigate without a real Stripe session — success page should handle the missing
    // session_id gracefully (show error state or redirect, not blank/crash)
    await page.goto('/checkout/success');
    // Page should either show success content or an error/redirect state — not a JS crash
    const body = await page.locator('body').innerText();
    expect(body.length, 'Checkout success page rendered empty body').toBeGreaterThan(0);
    // Should not stay on a loading spinner forever
    await expect(
      page
        .getByText(/success|upgraded|plan activated|syncing|error|invalid|back to/i)
        .first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
