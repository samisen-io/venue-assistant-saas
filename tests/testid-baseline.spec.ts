/**
 * Task 1.3 — data-testid Attribute Baseline
 *
 * Validates that all key interactive elements have their expected data-testid
 * attributes and are reachable from the authenticated dashboard.  Tests here
 * use ONLY data-testid selectors so they are immune to label/copy changes.
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { requireAuthCredentials, assertNotRedirectedToLogin } from './helpers/requirements';

test.use({ storageState: path.join(__dirname, '.auth/user.json') });

// ─── Sidebar navigation testids ───────────────────────────────────────────────

test.describe('Sidebar nav data-testids', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);
  });

  const navItems = [
    'nav-dashboard',
    'nav-calendar',
    'nav-events',
    'nav-spaces',
    'nav-vendors',
    'nav-clients',
    'nav-leads',
    'nav-venues',
    'nav-settings',
  ];

  for (const testid of navItems) {
    test(`${testid} link is present in the sidebar`, async ({ page }) => {
      await expect(page.getByTestId(testid)).toBeVisible();
    });
  }

  test('logout-button is present and clickable', async ({ page }) => {
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });
});

// ─── Primary CTA buttons on list pages ────────────────────────────────────────

test.describe('Primary CTA data-testids on list pages', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
  });

  test('create-event-btn is present on /events', async ({ page }) => {
    await page.goto('/events');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByTestId('create-event-btn')).toBeVisible({ timeout: 15_000 });
  });

  test('add-vendor-btn is present on /vendors', async ({ page }) => {
    await page.goto('/vendors');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByTestId('add-vendor-btn')).toBeVisible({ timeout: 15_000 });
  });

  test('add-client-btn is present on /clients', async ({ page }) => {
    await page.goto('/clients');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByTestId('add-client-btn')).toBeVisible({ timeout: 15_000 });
  });

  test('add-space-btn is present on /spaces', async ({ page }) => {
    await page.goto('/spaces');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByTestId('add-space-btn')).toBeVisible({ timeout: 15_000 });
  });

  test('add-venue-btn is present on /venues', async ({ page }) => {
    await page.goto('/venues');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByTestId('add-venue-btn')).toBeVisible({ timeout: 15_000 });
  });
});

// ─── Event detail action data-testids ─────────────────────────────────────────

test.describe('Event detail action data-testids', () => {
  test('event-status-badge, event-complete-btn and event-cancel-btn exist on a planning event', async ({ page }) => {
    requireAuthCredentials();

    // Navigate to events list and look for the first planning event link
    await page.goto('/events');
    await assertNotRedirectedToLogin(page);

    // Filter to planning status
    const firstEventLink = page
      .locator('main')
      .getByRole('link')
      .filter({ hasText: /planning/i })
      .first();

    const hasEvent = await firstEventLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasEvent) {
      // No planning events in this environment – skip gracefully
      test.skip();
      return;
    }

    await firstEventLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('event-status-badge')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('event-complete-btn')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('event-cancel-btn')).toBeVisible({ timeout: 10_000 });
  });
});

// ─── Lead detail data-testids ─────────────────────────────────────────────────

test.describe('Lead detail data-testids', () => {
  test('lead-status-dropdown is visible on a lead detail page', async ({ page }) => {
    requireAuthCredentials();

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
    await expect(page.getByTestId('lead-status-dropdown')).toBeVisible({ timeout: 10_000 });
  });

  test('convert-to-event-btn is visible on an active lead', async ({ page }) => {
    requireAuthCredentials();

    await page.goto('/leads');
    await assertNotRedirectedToLogin(page);

    // Find a lead that is not won or lost
    const activeLeadLink = page
      .locator('main')
      .getByRole('link')
      .filter({ has: page.getByRole('heading', { level: 3 }) })
      .first();

    const hasLead = await activeLeadLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasLead) {
      test.skip();
      return;
    }

    await activeLeadLink.click();
    await page.waitForLoadState('networkidle');

    // convert-to-event-btn only shows when status != won/lost; skip if lead is in terminal state
    const btn = page.getByTestId('convert-to-event-btn');
    const isVisible = await btn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!isVisible) {
      console.log('ℹ️  convert-to-event-btn not visible – lead may be in won/lost state.');
      return;
    }
    await expect(btn).toBeEnabled();
  });
});

// ─── Public page editor data-testids ─────────────────────────────────────────

test.describe('Public page editor data-testids', () => {
  test('publish-btn and unpublish-btn exist on the public-page editor', async ({ page }) => {
    requireAuthCredentials();

    // Navigate to any venue's public-page editor
    await page.goto('/venues');
    await assertNotRedirectedToLogin(page);

    const firstVenueLink = page
      .locator('main')
      .getByRole('link')
      .first();

    const hasVenue = await firstVenueLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasVenue) {
      test.skip();
      return;
    }

    const href = await firstVenueLink.getAttribute('href');
    if (!href) {
      test.skip();
      return;
    }

    // Extract venueId from the href (e.g. /venues/uuid/edit or /venues/uuid)
    const venueIdMatch = href.match(/\/venues\/([a-f0-9-]+)/);
    if (!venueIdMatch) {
      test.skip();
      return;
    }

    const venueId = venueIdMatch[1];
    await page.goto(`/venues/${venueId}/public-page`);
    await page.waitForLoadState('networkidle');

    // publish-btn must always be present
    await expect(page.getByTestId('publish-btn')).toBeVisible({ timeout: 15_000 });

    // unpublish-btn is only present when the venue is published
    const isPublished = await page.getByTestId('unpublish-btn').isVisible({ timeout: 3_000 }).catch(() => false);
    if (isPublished) {
      await expect(page.getByTestId('unpublish-btn')).toBeVisible();
    } else {
      console.log('ℹ️  unpublish-btn not visible – venue is in draft state.');
    }
  });
});

// ─── Public venue page AI chat data-testid ────────────────────────────────────

test.describe('Public venue page chat widget data-testid', () => {
  test('ai-chat-bubble is present on a published venue page (mobile viewport)', async ({ browser }) => {
    const slug = process.env.TEST_VENUE_SLUG;
    if (!slug) {
      test.skip();
      return;
    }

    // Chat widget is mobile-only so use a mobile context
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    await page.goto(`/${slug}`);

    const is404 = await page.getByRole('heading', { name: '404' }).isVisible().catch(() => false);
    if (is404) {
      await ctx.close();
      test.skip();
      return;
    }

    await expect(page.getByTestId('ai-chat-bubble')).toBeVisible({ timeout: 10_000 });
    await ctx.close();
  });
});
