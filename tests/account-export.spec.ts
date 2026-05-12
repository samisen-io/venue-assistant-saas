import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

test.describe('Account Data Export', () => {
  test('GET /api/account/export returns a data bundle containing profile and venues', async ({
    page,
  }) => {
    test.setTimeout(30_000);
    requireAuthCredentials();

    await loginAsTestUser(page);
    await page.waitForFunction(() => localStorage.getItem('activeVenueId') !== null, {
      timeout: 10_000,
    }).catch(() => { throw new Error('activeVenueId not set — ensure test user has a venue'); });

    const res = await page.request.get('/api/account/export');
    expect(
      res.ok(),
      `GET /api/account/export failed: ${res.status()} — ${await res.text()}`,
    ).toBeTruthy();

    const data = (await res.json()) as {
      exportDate?: string;
      profile?: unknown;
      venues?: unknown[];
      events?: unknown[];
      leads?: unknown[];
    };

    expect(data.exportDate, 'Export should include exportDate').toBeTruthy();
    expect(data.profile, 'Export should include profile').toBeTruthy();
    expect(Array.isArray(data.venues), 'Export should include venues array').toBeTruthy();
    expect(Array.isArray(data.events), 'Export should include events array').toBeTruthy();
    expect(Array.isArray(data.leads), 'Export should include leads array').toBeTruthy();
  });
});
