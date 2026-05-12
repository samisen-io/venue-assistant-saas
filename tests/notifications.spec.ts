import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Notifications', () => {
  test('GET notifications returns a list and PUT marks them as read', async ({ page }) => {
    test.setTimeout(30_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    // GET notifications — should return an array (possibly empty)
    const getRes = await page.request.get('/api/notifications');
    expect(
      getRes.ok(),
      `GET /api/notifications failed: ${getRes.status()} — ${await getRes.text()}`,
    ).toBeTruthy();
    const notifications = (await getRes.json()) as Array<{ id: string; read: boolean }>;
    expect(Array.isArray(notifications), 'Notifications response should be an array').toBeTruthy();

    // If there are unread notifications, mark them as read and verify
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > 0) {
      const ids = unread.map((n) => n.id);
      const putRes = await page.request.put('/api/notifications', {
        data: { ids },
      });
      expect(
        putRes.ok(),
        `PUT /api/notifications failed: ${putRes.status()} — ${await putRes.text()}`,
      ).toBeTruthy();

      // Verify they are now read
      const afterRes = await page.request.get('/api/notifications');
      expect(afterRes.ok()).toBeTruthy();
      const afterNotifications = (await afterRes.json()) as Array<{ id: string; read: boolean }>;
      for (const id of ids) {
        const n = afterNotifications.find((x) => x.id === id);
        if (n) {
          expect(n.read, `Notification ${id} should be marked read`).toBe(true);
        }
      }
    }

    // UI: notification button should be visible in the header
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: /notifications/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
