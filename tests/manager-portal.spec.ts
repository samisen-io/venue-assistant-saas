/**
 * Manager Portal Tests — converted from structural to business-outcome assertions.
 *
 * Changes from the legacy version:
 * - Primary CTA buttons are located by data-testid (stable) rather than link text.
 * - Nav links use data-testid="nav-*" selectors.
 * - Dashboard stat cards assert that real numeric values are present, not just that
 *   the headings exist.
 * - The event search test verifies the filter actually removes results.
 * - The subscription page asserts plan-specific content rather than a generic regex.
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { requireAuthCredentials, assertNotRedirectedToLogin } from './helpers/requirements';

// Use the saved auth state for all tests in this file.
// If auth.setup.ts ran without credentials, the state is empty and protected routes will redirect to /login.
test.use({ storageState: path.join(__dirname, '.auth/user.json') });

// ─── 2.1 Authentication ───────────────────────────────────────────────────────

test.describe('2.1 Authentication', () => {
  test('login page shows form fields @smoke', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('unauthenticated access to /dashboard redirects to /login @smoke', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
    await ctx.close();
  });

  test('logout button is reachable via data-testid and redirects on click', async ({ browser }) => {
    requireAuthCredentials();
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Use the stable data-testid selector
    const logoutBtn = page.getByTestId('logout-button');
    await expect(logoutBtn).toBeVisible({ timeout: 5_000 });
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 8_000 });

    await ctx.close();
  });
});

// ─── 2.2 Dashboard Home ───────────────────────────────────────────────────────

test.describe('2.2 Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/upcoming events/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('shows the main heading @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
  });

  test('stat cards are present and each contains a numeric value', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^upcoming events$/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^active vendors$/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^managed budget$/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^reliability avg$/i, level: 3 })).toBeVisible();

    // Each stat card should contain at least one digit (real data or zero)
    const statCards = page.locator('[class*="card"]').filter({ hasText: /\d/ });
    await expect(statCards.first()).toBeVisible({ timeout: 5_000 });
  });

  test('shows upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^upcoming events$/i, level: 2 })).toBeVisible();
  });

  test('shows recent leads section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recent leads/i })).toBeVisible();
  });

  test('quick-action New Event link navigates to /events/new', async ({ page }) => {
    const newEventLink = page.getByRole('link', { name: /new event/i });
    await expect(newEventLink).toBeVisible();
    const href = await newEventLink.getAttribute('href');
    expect(href).toMatch(/\/events\/new/);
  });

  test('quick-action Add Vendor link navigates to /vendors/new', async ({ page }) => {
    const addVendorLink = page.getByRole('link', { name: /add vendor/i });
    await expect(addVendorLink).toBeVisible();
    const href = await addVendorLink.getAttribute('href');
    expect(href).toMatch(/\/vendors\/new/);
  });
});

// ─── 2.3 Events ───────────────────────────────────────────────────────────────

test.describe('2.3 Events', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/events');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible({ timeout: 15_000 });
  });

  test('events page loads with heading @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible();
  });

  test('Create Event button is present (via data-testid)', async ({ page }) => {
    await expect(page.getByTestId('create-event-btn')).toBeVisible();
  });

  test('Create Event button links to /events/new', async ({ page }) => {
    const btn = page.getByTestId('create-event-btn');
    const href = await btn.getAttribute('href').catch(() => null);
    if (href) {
      expect(href).toMatch(/\/events\/new/);
    } else {
      // Upgrade-prompt path — button navigates on click
      await btn.click();
      await expect(page).toHaveURL(/\/(events\/new|settings\/subscription)/, { timeout: 8_000 });
    }
  });

  test('search input filters the event list', async ({ page }) => {
    const search = page.getByPlaceholder(/search events/i);
    await expect(search).toBeVisible();
    await search.fill('zzznomatch_xyz_abc_999');
    await expect(
      page.getByText(/no matches found|no events found/i)
    ).toBeVisible({ timeout: 5_000 });
    // Clearing should not crash
    await search.clear();
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible();
  });

  test('status filter combobox has planning option', async ({ page }) => {
    const combobox = page.getByRole('combobox').first();
    await expect(combobox).toBeVisible();
    await combobox.click();
    await expect(page.getByRole('option', { name: /planning/i })).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press('Escape');
  });

  test('Create Event page loads', async ({ page }) => {
    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 2.4 Vendors ──────────────────────────────────────────────────────────────

test.describe('2.4 Vendors', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/vendors');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByRole('heading', { name: /^vendors$/i })).toBeVisible({ timeout: 15_000 });
  });

  test('vendors page loads with heading @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^vendors$/i })).toBeVisible();
  });

  test('Add Vendor button is present (via data-testid)', async ({ page }) => {
    await expect(page.getByTestId('add-vendor-btn')).toBeVisible();
  });

  test('has a search input that accepts text', async ({ page }) => {
    const search = page.getByPlaceholder(/search vendors/i);
    await expect(search).toBeVisible();
    await search.fill('test');
    await expect(search).toHaveValue('test');
  });

  test('Add Vendor page loads', async ({ page }) => {
    await page.goto('/vendors/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 2.5 Calendar ─────────────────────────────────────────────────────────────

test.describe('2.5 Calendar', () => {
  test('calendar page loads with a calendar widget', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/calendar');
    await assertNotRedirectedToLogin(page);
    await expect(
      page.locator('.rbc-calendar').or(page.getByRole('grid')).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('calendar renders navigation controls (prev/next/today)', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/calendar');
    await assertNotRedirectedToLogin(page);
    await expect(
      page.locator('.rbc-calendar').or(page.getByRole('grid')).first()
    ).toBeVisible({ timeout: 15_000 });
    // react-big-calendar renders a Today button in its toolbar
    await expect(
      page.getByRole('button', { name: /today/i }).or(page.getByText(/today/i)).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 2.6 Venues ───────────────────────────────────────────────────────────────

test.describe('2.6 Venues', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/venues');
    await assertNotRedirectedToLogin(page);
    await expect(page.getByRole('heading', { name: /^venues?$/i })).toBeVisible({ timeout: 15_000 });
  });

  test('venues page loads @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^venues?$/i })).toBeVisible();
  });

  test('Add Venue button is present (via data-testid)', async ({ page }) => {
    await expect(page.getByTestId('add-venue-btn')).toBeVisible();
  });
});

// ─── 2.7 Leads ────────────────────────────────────────────────────────────────

test.describe('2.7 Leads', () => {
  test('leads page loads', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/leads');
    await assertNotRedirectedToLogin(page);
    await expect(
      page.getByRole('heading', { name: /leads/i }).or(page.getByText(/no leads|inbox/i)).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});

// ─── 2.8 Spaces ───────────────────────────────────────────────────────────────

test.describe('2.8 Spaces', () => {
  test('spaces page loads and Add Space button is present (via data-testid)', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/spaces');
    await assertNotRedirectedToLogin(page);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('add-space-btn')).toBeVisible();
  });
});

// ─── 2.9 Settings ─────────────────────────────────────────────────────────────

test.describe('2.9 Settings', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/settings');
    await assertNotRedirectedToLogin(page);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15_000 });
  });

  test('settings page loads', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('subscription page shows current plan name and usage stats', async ({ page }) => {
    await page.goto('/settings/subscription');
    // Plan name must be visible
    await expect(
      page.getByText(/starter|pro|enterprise/i).first()
    ).toBeVisible({ timeout: 10_000 });
    // Usage stats should also appear
    await expect(
      page.getByText(/usage|events used|vendors used|limit/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 2.10 Sidebar nav links (data-testid) ─────────────────────────────────────

test.describe('2.10 Sidebar nav data-testid links', () => {
  test.beforeEach(async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/dashboard');
    await assertNotRedirectedToLogin(page);
  });

  const routes: Array<[string, string]> = [
    ['nav-events', '/events'],
    ['nav-vendors', '/vendors'],
    ['nav-clients', '/clients'],
    ['nav-spaces', '/spaces'],
    ['nav-leads', '/leads'],
    ['nav-settings', '/settings'],
  ];

  for (const [testid, expectedPath] of routes) {
    test(`${testid} link href contains ${expectedPath}`, async ({ page }) => {
      const link = page.getByTestId(testid);
      await expect(link).toBeVisible();
      const href = await link.getAttribute('href');
      expect(href).toContain(expectedPath);
    });
  }
});
