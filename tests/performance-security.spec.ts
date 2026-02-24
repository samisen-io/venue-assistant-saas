import { test, expect } from '@playwright/test';

// ─── 5.1 Page Load Performance ────────────────────────────────────────────────

test.describe('5.1 Performance — Load Times', () => {
  test('homepage loads in under 5 seconds', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const loadTime = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return entry.loadEventEnd - entry.startTime;
    });
    expect(loadTime).toBeLessThan(5_000);
  });

  test('login page loads in under 4 seconds', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    const loadTime = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return entry.loadEventEnd - entry.startTime;
    });
    expect(loadTime).toBeLessThan(4_000);
  });

  test('homepage has no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Filter out known third-party noise
    const appErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR')
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ─── 5.2 Security — Authentication Guards ────────────────────────────────────

test.describe('5.2 Security — Auth Guards', () => {
  const protectedRoutes = [
    '/dashboard',
    '/events',
    '/vendors',
    '/calendar',
    '/leads',
    '/venues',
    '/spaces',
    '/settings',
    '/clients',
  ];

  for (const route of protectedRoutes) {
    test(`unauthenticated access to ${route} redirects to /login`, async ({ browser }) => {
      // Use a fresh context with NO auth state (no cookies)
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await page.goto(route);
      await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
      await ctx.close();
    });
  }
});

// ─── 5.3 Security — Public Content Boundaries ────────────────────────────────

test.describe('5.3 Security — Public Content Boundaries', () => {
  test('unknown venue slug returns 404 or not-found UI', async ({ page }) => {
    const response = await page.goto('/this-venue-slug-xyz-does-not-exist-at-all');
    const is404 = response?.status() === 404;
    const hasNotFoundUI = await page
      .getByText(/not found|not available|404/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    expect(is404 || hasNotFoundUI).toBeTruthy();
  });

  test('/api routes are not publicly browsable @smoke', async ({ page }) => {
    // API routes should return JSON errors (not HTML dashboards) to unauthenticated requests
    const response = await page.goto('/api/events');
    const status = response?.status() ?? 0;
    // Expect 401 Unauthorized or a redirect to login — not 200
    expect(status).not.toBe(200);
  });
});

// ─── 5.4 Core Routing ─────────────────────────────────────────────────────────

test.describe('5.4 Core Routing', () => {
  test('non-existent page shows a 404 or not-found component', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-abc123');
    const is404 = response?.status() === 404;
    const hasNotFoundUI = await page
      .getByText(/not found|404|page.*not exist/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    expect(is404 || hasNotFoundUI).toBeTruthy();
  });

  test('/pricing page is publicly accessible', async ({ page }) => {
    const response = await page.goto('/pricing');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('main')).toBeVisible();
  });

  test('/terms page is publicly accessible', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('main')).toBeVisible();
  });

  test('/privacy page is publicly accessible', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('main')).toBeVisible();
  });
});
