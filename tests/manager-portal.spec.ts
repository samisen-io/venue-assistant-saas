import { test, expect } from '@playwright/test';
import path from 'node:path';
import { requireAuthCredentials, assertNotRedirectedToLogin } from './helpers/requirements';

// Use the saved auth state for all tests in this file.
// If auth.setup.ts ran without credentials, the state is empty and protected routes will redirect to /login.
test.use({ storageState: path.join(__dirname, '.auth/user.json') });

// ─── 2.1 Authentication ───────────────────────────────────────────────────────

test.describe('2.1 Authentication', () => {
  test('login page shows form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('unauthenticated access to /dashboard redirects to /login', async ({ browser }) => {
    // Open a fresh context without any auth state
    const ctx = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await ctx.newPage();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
    await ctx.close();
  });

  test('logout redirects to login or home', async ({ browser }) => {
    requireAuthCredentials();
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    // Use a dedicated authenticated context for logout so the shared
    // storageState token used by other tests is not invalidated.
    const ctx = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await ctx.newPage();

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/dashboard');
    // Find and click the logout button (in the header/sidebar user menu)
    const logoutBtn = page.getByRole('button', { name: /log out|sign out|logout/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/(login|$)/, { timeout: 8_000 });
    } else {
      // Logout may be behind a dropdown — open it first
      const userMenu = page.getByRole('button', { name: /account|profile|user/i }).first();
      await userMenu.click();
      await page.getByRole('menuitem', { name: /log out|sign out/i }).click();
      await expect(page).toHaveURL(/\/(login|$)/, { timeout: 8_000 });
    }

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

  test('shows the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
  });

  test('displays stat cards for key metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^upcoming events$/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^active vendors$/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^managed budget$/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^reliability avg$/i, level: 3 })).toBeVisible();
  });

  test('shows upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^upcoming events$/i, level: 2 })).toBeVisible();
  });

  test('shows recent leads section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recent leads/i })).toBeVisible();
  });

  test('has quick action buttons for New Event and Add Vendor', async ({ page }) => {
    await expect(page.getByRole('link', { name: /new event/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /add vendor/i })).toBeVisible();
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

  test('events page loads with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible();
  });

  test('has a Create Event button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /create event/i }).or(
      page.getByRole('button', { name: /create event/i })
    )).toBeVisible();
  });

  test('has a search input for filtering events', async ({ page }) => {
    await expect(page.getByPlaceholder(/search events/i)).toBeVisible();
  });

  test('has a status filter', async ({ page }) => {
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('search filters the event list', async ({ page }) => {
    const search = page.getByPlaceholder(/search events/i);
    await search.fill('zzznomatch_xyz_abc');
    // Should show empty state or no results
    await expect(
      page.getByText(/no matches found|no events found/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Create Event page loads', async ({ page }) => {
    await page.goto('/events/new');
    // The new event page should have a form or heading
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

  test('vendors page loads with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^vendors$/i })).toBeVisible();
  });

  test('has an Add Vendor button', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /add vendor/i }).or(
        page.getByRole('button', { name: /add vendor/i })
      )
    ).toBeVisible();
  });

  test('has a search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search vendors/i)).toBeVisible();
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
    // react-big-calendar uses .rbc-calendar class
    await expect(
      page.locator('.rbc-calendar').or(page.getByRole('grid')).first()
    ).toBeVisible({ timeout: 15_000 });
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

  test('venues page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^venues?$/i })).toBeVisible();
  });

  test('has a button to add or create a new venue', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /add venue|new venue|create venue/i }).or(
        page.getByRole('button', { name: /add venue|new venue|create venue/i })
      )
    ).toBeVisible();
  });
});

// ─── 2.7 Leads ────────────────────────────────────────────────────────────────

test.describe('2.7 Leads', () => {
  test('leads page loads', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/leads');
    await assertNotRedirectedToLogin(page);
    // Leads list or empty state should be visible
    await expect(
      page.getByRole('heading', { name: /leads/i }).or(
        page.getByText(/no leads|inbox/i)
      ).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});

// ─── 2.8 Spaces ───────────────────────────────────────────────────────────────

test.describe('2.8 Spaces', () => {
  test('spaces page loads', async ({ page }) => {
    requireAuthCredentials();
    await page.goto('/spaces');
    await assertNotRedirectedToLogin(page);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15_000 });
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

  test('subscription page loads', async ({ page }) => {
    await page.goto('/settings/subscription');
    await expect(page.getByText(/starter|pro|plan|subscription/i)).toBeVisible({ timeout: 10_000 });
  });
});

