import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Venue Analytics @smoke', () => {
  test('analytics page loads with dashboard heading and at least one metric', async ({ page }) => {
    test.setTimeout(30_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));

    await page.goto(`/venues/${activeVenueId}/analytics`);

    await expect(
      page.getByRole('heading', { name: /analytics/i }),
    ).toBeVisible({ timeout: 15_000 });

    // At least one stat card / metric value should be rendered
    await expect(
      page
        .getByText(/total events|revenue|leads|inquiries|page views|bookings/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    // Verify the analytics API responds successfully
    const res = await page.request.get(`/api/venues/${activeVenueId}/analytics`);
    expect(res.ok(), `GET /api/venues/${activeVenueId}/analytics failed: ${res.status()}`).toBeTruthy();
  });
});
