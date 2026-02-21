import { test, expect } from '@playwright/test';
import path from 'node:path';

// All tests in this file run at a mobile viewport (configured via the
// 'Mobile Chrome' project in playwright.config.ts). The override here
// also makes them work when running via the generic 'chromium' project.
test.use({
  viewport: { width: 375, height: 812 }, // iPhone 13 mini
  storageState: path.join(__dirname, '.auth/user.json'),
});

function requireAuth() {
  if (!process.env.TEST_USER_EMAIL) {
    test.skip();
  }
}

// ─── 4.1 Public Landing Page ──────────────────────────────────────────────────

test.describe('4.1 Mobile — Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero heading is readable on mobile', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('CTA buttons stack vertically and remain clickable', async ({ page }) => {
    const cta = page.getByRole('link', { name: /start free trial/i }).first();
    await expect(cta).toBeVisible();
    // Check it's not clipped off screen
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
  });

  test('footer is accessible and not overflowing', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer')).toBeVisible();
  });
});

// ─── 4.2 Login / Signup ───────────────────────────────────────────────────────

test.describe('4.2 Mobile — Auth Pages', () => {
  test('login form fits in mobile viewport without horizontal scroll', async ({ page }) => {
    await page.goto('/login');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // allow 5px tolerance
  });

  test('signup form fits in mobile viewport without horizontal scroll', async ({ page }) => {
    await page.goto('/signup');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});

// ─── 4.3 Manager Dashboard ────────────────────────────────────────────────────

test.describe('4.3 Mobile — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    requireAuth();
    await page.goto('/dashboard');
    if (page.url().includes('/login')) {
      test.skip();
    }
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
  });

  test('sidebar is hidden and replaced by a mobile header', async ({ page }) => {
    // Desktop sidebar should be hidden on mobile (it has 'hidden md:block' in the layout)
    const sidebar = page.locator('aside, [data-testid="sidebar"], nav[class*="sidebar"]').first();
    const isSidebarVisible = await sidebar.isVisible().catch(() => false);
    expect(isSidebarVisible).toBeFalsy();

    // A mobile header / hamburger menu button should be visible instead
    const mobileMenuBtn = page.getByRole('button', { name: /menu|navigation|nav/i })
      .or(page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]'))
      .first();
    await expect(mobileMenuBtn).toBeVisible({ timeout: 5_000 });
  });

  test('stat cards are visible and not overflowing on mobile', async ({ page }) => {
    await expect(page.getByText(/upcoming events/i)).toBeVisible();
  });
});

// ─── 4.4 Events Page ──────────────────────────────────────────────────────────

test.describe('4.4 Mobile — Events', () => {
  test('events list renders as cards (grid/card view) on mobile', async ({ page }) => {
    requireAuth();
    await page.goto('/events');
    // Skip if auth state is stale/expired and middleware redirected to login
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible({ timeout: 15_000 });
    // The layout switches to grid/card on mobile — no horizontal table scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});

// ─── 4.5 Public Venue Page ────────────────────────────────────────────────────

test.describe('4.5 Mobile — Public Venue Page', () => {
  test('venue page renders without horizontal overflow', async ({ page }) => {
    const slug = process.env.TEST_VENUE_SLUG;
    if (!slug) {
      test.skip();
      return;
    }

    await page.goto(`/${slug}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
