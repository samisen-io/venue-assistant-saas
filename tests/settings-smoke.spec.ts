import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Settings Pages @smoke', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });
  });

  test('general settings page loads with profile form', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible({ timeout: 15_000 });
    // Profile section should be visible
    await expect(page.getByLabel(/full name/i).or(page.getByText(/profile/i).first())).toBeVisible({
      timeout: 10_000,
    });
  });

  test('subscription page loads with current plan', async ({ page }) => {
    await page.goto('/settings/subscription');
    await expect(page.getByRole('heading', { name: /^subscription$/i })).toBeVisible({
      timeout: 15_000,
    });
    // Plan tier badge or plan info should be visible
    await expect(
      page.getByText(/starter|professional|enterprise|trial/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('team management page loads with team members list', async ({ page }) => {
    await page.goto('/settings/team');
    await expect(page.getByRole('heading', { name: /team management/i })).toBeVisible({
      timeout: 15_000,
    });
    // Current user (owner) should appear in the list
    await expect(page.getByText(/owner/i).first()).toBeVisible({ timeout: 10_000 });
    // Invite form should be present
    await expect(page.getByRole('button', { name: /send invite/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('audit trail page loads', async ({ page }) => {
    await page.goto('/settings/audit');
    await expect(page.getByRole('heading', { name: /audit trail/i })).toBeVisible({
      timeout: 15_000,
    });
    // Either shows logs or empty state
    await expect(
      page.getByRole('table').or(page.getByText(/no audit logs/i)),
    ).toBeVisible({ timeout: 10_000 });
  });
});
