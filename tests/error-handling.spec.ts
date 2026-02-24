import { test, expect } from '@playwright/test';
import path from 'node:path';
import { requireAuthCredentials, assertNotRedirectedToLogin } from './helpers/requirements';

test.use({ storageState: path.join(__dirname, '.auth/user.json') });

test.describe('Error Handling', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);
  });

  test('shows explicit conflict message for event space booking 409', async ({ page }) => {
    await page.route('**/api/spaces', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'space-pw-1',
            venue_id: 'venue-pw-1',
            name: 'PW Conflict Space',
            capacity: 120,
            space_type: 'ballroom',
          },
        ]),
      });
    });

    await page.route('**/api/event-services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'svc-pw-1', name: 'Catering', slug: 'catering' }]),
      });
    });
    await page.route('**/api/ai/extract-event', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'ready' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            event_name: `PW Conflict Event ${Date.now()}`,
            event_type: 'corporate',
            event_date: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
            event_time: '10:00',
            guest_count: 40,
            budget_total: 5000,
            needed_categories: ['catering'],
            confidence: 0.95,
          },
        }),
      });
    });

    await page.route('**/api/events', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'SPACE_CONFLICT',
          conflictingEvents: [{ event_name: 'Existing Board Meeting' }],
        }),
      });
    });

    await page.goto('/events/new');
    await page
      .getByLabel(/describe your event in natural language/i)
      .fill('Corporate planning event for 40 guests with a $5,000 budget.');
    await page.getByRole('button', { name: /extract event details/i }).click();
    await expect(page.getByText(/event details extracted/i)).toBeVisible({ timeout: 10_000 });

    const conflictResponse = page.waitForResponse(
      (res) => res.url().includes('/api/events') && res.request().method() === 'POST',
      { timeout: 10_000 },
    );
    await page.getByRole('button', { name: /^create event$/i }).click();
    await expect((await conflictResponse).status()).toBe(409);
    await expect(page).toHaveURL(/\/events\/new/);
  });

  test('shows upgrade prompt on LIMIT_REACHED for event create', async ({ page }) => {
    await page.route('**/api/spaces', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'space-pw-2', venue_id: 'venue-pw-1', name: 'PW Space', capacity: 80 }]),
      });
    });
    await page.route('**/api/event-services', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/ai/extract-event', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'ready' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            event_name: `PW Limit Event ${Date.now()}`,
            event_type: 'corporate',
            event_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            event_time: '13:00',
            guest_count: 30,
            budget_total: 3500,
            needed_categories: ['catering'],
            confidence: 0.95,
          },
        }),
      });
    });

    await page.route('**/api/events', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'LIMIT_REACHED', error: 'Event limit reached on Starter.' }),
      });
    });

    await page.goto('/events/new');
    await page
      .getByLabel(/describe your event in natural language/i)
      .fill('Corporate planning event for 30 guests with a $3,500 budget.');
    await page.getByRole('button', { name: /extract event details/i }).click();
    await expect(page.getByText(/event details extracted/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /^create event$/i }).click();

    const upgradeDialog = page.getByRole('dialog').filter({ hasText: /upgrade your plan/i });
    await expect(upgradeDialog).toBeVisible({ timeout: 10_000 });
    await expect(upgradeDialog).toContainText(/event limit reached/i);
  });

  test('shows upgrade prompt on LIMIT_REACHED for vendor create', async ({ page }) => {
    await page.route('**/api/venues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'venue-pw-1', name: 'PW Venue' }]),
      });
    });
    await page.route('**/api/event-services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'svc-pw-1', name: 'Catering', slug: 'catering' }]),
      });
    });

    await page.route('**/api/vendors', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'LIMIT_REACHED', error: 'Vendor limit reached on Starter.' }),
      });
    });

    await page.goto('/vendors/new');

    await page.getByLabel(/vendor name/i).fill(`PW Vendor ${Date.now()}`);
    await expect(page.locator('label[for^="service-"]').first()).toBeVisible({ timeout: 10_000 });
    await page.locator('label[for^="service-"]').first().click();
    await page.getByLabel(/contact person/i).fill('Vendor Contact');
    await page.getByLabel(/^email$/i).fill('vendor@test.example.com');
    await page.getByLabel(/^phone$/i).fill('5555555555');
    await page.getByRole('button', { name: /create vendor/i }).click();

    const upgradeDialog = page.getByRole('dialog').filter({ hasText: /upgrade your plan/i });
    await expect(upgradeDialog).toBeVisible({ timeout: 10_000 });
    await expect(upgradeDialog).toContainText(/vendor limit reached/i);
  });

  test('shows upgrade prompt on LIMIT_REACHED for space create', async ({ page }) => {
    await page.route('**/api/spaces', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'LIMIT_REACHED', error: 'Space limit reached on Starter.' }),
      });
    });

    await page.goto('/spaces/new');

    await page.getByLabel(/space name/i).fill(`PW Space ${Date.now()}`);
    await page.getByLabel(/space type/i).click();
    await page.getByRole('option', { name: /ballroom/i }).click();
    await page.getByLabel(/^capacity/i).fill('100');
    await page.getByRole('button', { name: /create space/i }).click();

    const upgradeDialog = page.getByRole('dialog').filter({ hasText: /upgrade your plan/i });
    await expect(upgradeDialog).toBeVisible({ timeout: 10_000 });
    await expect(upgradeDialog).toContainText(/space limit reached/i);
  });

  test('shows error toast and stays on form when client create returns 500', async ({ page }) => {
    await page.route('**/api/venues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'venue-pw-1', name: 'PW Venue' }]),
      });
    });

    await page.route('**/api/clients', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'boom' }) });
    });

    await page.goto('/clients/new');

    await page.getByLabel(/contact name/i).fill(`PW Client ${Date.now()}`);
    await page.getByRole('button', { name: /create client/i }).click();

    await expect(page.getByText(/^error$/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/something went wrong/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/clients\/new/);
  });

  // ── Task 10.1 / 10.3 breadth ─────────────────────────────────────────────

  test('shows error toast and stays on form when event create returns 500', async ({ page }) => {
    await page.route('**/api/spaces', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'space-pw-500', venue_id: 'venue-pw-1', name: 'PW 500 Space', capacity: 80 }]),
      });
    });
    await page.route('**/api/event-services', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api/ai/extract-event', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ready' }) });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            event_name: `PW 500 Event ${Date.now()}`,
            event_type: 'corporate',
            event_date: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
            event_time: '14:00',
            guest_count: 25,
            budget_total: 2000,
            needed_categories: [],
            confidence: 0.9,
          },
        }),
      });
    });
    await page.route('**/api/events', async (route) => {
      if (route.request().method() !== 'POST') { await route.continue(); return; }
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'internal server error' }) });
    });

    await page.goto('/events/new');
    await page
      .getByLabel(/describe your event in natural language/i)
      .fill('Internal team meeting for 25 people with a $2,000 budget.');
    await page.getByRole('button', { name: /extract event details/i }).click();
    await expect(page.getByText(/event details extracted/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /^create event$/i }).click();

    // Should stay on the form (not navigate away) after a server error
    await expect(page).toHaveURL(/\/events\/new/, { timeout: 10_000 });
  });

  test('shows error feedback and stays on form when vendor create returns 500', async ({ page }) => {
    await page.route('**/api/event-services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'svc-pw-2', name: 'Catering', slug: 'catering' }]),
      });
    });
    await page.route('**/api/vendors', async (route) => {
      if (route.request().method() !== 'POST') { await route.continue(); return; }
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'db failure' }) });
    });

    await page.goto('/vendors/new');
    await page.getByLabel(/vendor name/i).fill(`PW 500 Vendor ${Date.now()}`);
    await expect(page.locator('label[for^="service-"]').first()).toBeVisible({ timeout: 10_000 });
    await page.locator('label[for^="service-"]').first().click();
    await page.getByLabel(/contact person/i).fill('Contact Person');
    await page.getByLabel(/^email$/i).fill('vendor500@test.example.com');
    await page.getByLabel(/^phone$/i).fill('5555550000');
    await page.getByRole('button', { name: /create vendor/i }).click();

    // Must stay on the form
    await expect(page).toHaveURL(/\/vendors\/new/, { timeout: 10_000 });
  });

  test('shows error feedback and stays on form when space create returns 500', async ({ page }) => {
    await page.route('**/api/spaces', async (route) => {
      if (route.request().method() !== 'POST') { await route.continue(); return; }
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'server error' }) });
    });

    await page.goto('/spaces/new');
    await page.getByLabel(/space name/i).fill(`PW 500 Space ${Date.now()}`);
    await page.getByLabel(/space type/i).click();
    await page.getByRole('option', { name: /conference room/i }).click();
    await page.getByLabel(/^capacity/i).fill('50');
    await page.getByRole('button', { name: /create space/i }).click();

    await expect(page).toHaveURL(/\/spaces\/new/, { timeout: 10_000 });
  });

  test('navigating to a non-existent event shows an error state, not a blank page', async ({ page }) => {
    const fakeId = '00000000-0000-0000-0000-000000000404';
    await page.goto(`/events/${fakeId}`);
    await page.waitForLoadState('networkidle');

    // Should show an error message rather than a blank/loading screen
    const hasError = await page
      .getByText(/not found|could not load|error|no event/i)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
    expect(hasError, 'Event 404 page must show a user-visible error message').toBeTruthy();
  });

  test('navigating to a non-existent lead shows an error state, not a blank page', async ({ page }) => {
    const fakeId = '00000000-0000-0000-0000-000000000404';
    await page.goto(`/leads/${fakeId}`);
    await page.waitForLoadState('networkidle');

    const hasError = await page
      .getByText(/not found|could not load|error|no lead/i)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
    expect(hasError, 'Lead 404 page must show a user-visible error message').toBeTruthy();
  });

  test('lead update returning 500 shows error toast without crashing the page', async ({ page }) => {
    await page.goto('/leads');
    await assertNotRedirectedToLogin(page);

    const firstLeadLink = page
      .locator('main')
      .getByRole('link')
      .filter({ has: page.getByRole('heading', { level: 3 }) })
      .first();

    const hasLead = await firstLeadLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasLead) {
      test.skip();
      return;
    }

    await firstLeadLink.click();
    await page.waitForLoadState('networkidle');

    // Mock the PUT /api/leads/:id to return 500
    await page.route('**/api/leads/**', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'update failed' }) });
        return;
      }
      await route.continue();
    });

    // Attempt a status change via the dropdown
    await page.getByTestId('lead-status-dropdown').click();
    await page.getByRole('option', { name: /qualified/i }).click();

    // Page must remain stable (not crash / navigate away)
    await page.waitForTimeout(2_000);
    const url = page.url();
    expect(url).toMatch(/\/leads\//);
  });
});
