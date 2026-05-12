import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Subscription Management', () => {
  test('subscription page shows current plan, usage, and billing action', async ({ page }) => {
    test.setTimeout(30_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    await page.goto('/settings/subscription');

    await expect(page.getByRole('heading', { name: /^subscription$/i })).toBeVisible({
      timeout: 15_000,
    });

    // Plan tier badge (starter / professional / enterprise / trial)
    await expect(
      page.getByText(/starter|professional|enterprise|trial/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // At least one usage meter or plan limit indicator should render
    await expect(
      page
        .getByText(/usage|events used|venues used|limit/i)
        .first()
        .or(page.getByRole('progressbar').first()),
    ).toBeVisible({ timeout: 10_000 });

    // Billing action: either an upgrade button or a manage billing / portal button
    await expect(
      page
        .getByRole('link', { name: /upgrade|manage billing|billing portal/i })
        .or(page.getByRole('button', { name: /upgrade|manage billing|billing portal/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    // GET /api/subscription should return a valid plan tier
    const subRes = await page.request.get('/api/subscription');
    expect(subRes.ok(), `GET /api/subscription failed: ${subRes.status()}`).toBeTruthy();
    const sub = (await subRes.json()) as { plan_tier?: string; status?: string };
    expect(sub.plan_tier, 'plan_tier missing from subscription response').toBeTruthy();
  });
});
