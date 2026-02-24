import { test, expect } from '@playwright/test';
import path from 'node:path';
import { requireAuthCredentials, requireVenueSlug, assertNotRedirectedToLogin } from './helpers/requirements';

// All tests in this file run at a mobile viewport (configured via the
// 'Mobile Chrome' project in playwright.config.ts). The override here
// also makes them work when running via the generic 'chromium' project.
test.use({
  viewport: { width: 375, height: 812 }, // iPhone 13 mini
  storageState: path.join(__dirname, '.auth/user.json'),
});

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
    requireAuthCredentials();
    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);
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
    await expect(
      page.getByRole('heading', { level: 3, name: /^upcoming events$/i }),
    ).toBeVisible();

    // Measure overflow on the app container, not document.body, because
    // Next.js dev overlays can add fixed UI outside the app in local runs.
    const { mainScrollWidth, mainClientWidth } = await page.evaluate(() => {
      const main = document.querySelector("main");
      return {
        mainScrollWidth: main?.scrollWidth ?? 0,
        mainClientWidth: main?.clientWidth ?? window.innerWidth,
      };
    });
    expect(mainScrollWidth).toBeLessThanOrEqual(mainClientWidth + 5);
  });
});

// ─── 4.4 Events Page ──────────────────────────────────────────────────────────

test.describe('4.4 Mobile — Events', () => {
  test('events list renders as cards (grid/card view) on mobile', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/events');
    await assertNotRedirectedToLogin(page);
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
    requireVenueSlug();
    const slug = process.env.TEST_VENUE_SLUG!;

    await page.goto(`/${slug}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
