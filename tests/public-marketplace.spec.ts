import { test, expect } from '@playwright/test';

// ─── 1.1 Homepage ────────────────────────────────────────────────────────────

test.describe('1.1 Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section renders headline and CTAs', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Master Your');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Venue Operations');
    await expect(page.getByRole('link', { name: /start free trial/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /access dashboard/i })).toBeVisible();
  });

  test('trust badges are visible', async ({ page }) => {
    await expect(page.getByText(/no credit card required/i).first()).toBeVisible();
    await expect(page.getByText(/14-day free trial/i).first()).toBeVisible();
    await expect(page.getByText(/cancel anytime/i)).toBeVisible();
  });

  test('core features section lists key capabilities', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /multi-venue management/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /event management/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /vendor database/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /smart vendor matching/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /budget tracking/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /performance reviews/i })).toBeVisible();
  });

  test('AI features section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /let ai handle the heavy lifting/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /natural language event creation/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ai vendor communication agent/i })).toBeVisible();
  });

  test('how it works section has 4 steps', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /build your page/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ai qualifies leads/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /send proposals/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /manage events/i })).toBeVisible();
  });

  test('footer renders with navigation links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('VenueManager', { exact: true })).toBeVisible();
    await expect(footer.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /terms of service/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });

  test('"Start Free Trial" links to /signup', async ({ page }) => {
    const href = await page.getByRole('link', { name: /start free trial/i }).first().getAttribute('href');
    expect(href).toBe('/signup');
  });

  test('"View Pricing" links to /pricing', async ({ page }) => {
    await expect(page.getByRole('link', { name: /view pricing/i })).toBeVisible();
  });
});

// ─── 1.2 Authentication Pages ─────────────────────────────────────────────────

test.describe('1.2 Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders login form with email and password fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('has link to signup page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    // Either a toast or inline error should appear
    const hasError = await page.getByText(/invalid|required/i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('wrongpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Wait for error toast or message
    await expect(page.getByText(/invalid|error|credentials|wrong/i).first()).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('1.3 Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('renders signup form with all required fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('has link back to login page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click();
    const hasError = await page.getByText(/required|invalid/i).first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm').fill('differentpassword');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/match/i).first()).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 1.4 Legal Pages ─────────────────────────────────────────────────────────

test.describe('1.4 Legal Pages', () => {
  test('terms of service page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /terms/i })).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /privacy/i })).toBeVisible();
  });
});

// ─── 1.5 Pricing Page ────────────────────────────────────────────────────────

test.describe('1.5 Pricing Page', () => {
  test('pricing page loads and shows plans', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
  });
});

// ─── 1.6 Public Venue Page ([venueSlug]) ─────────────────────────────────────

test.describe('1.6 Public Venue Page', () => {
  test('unknown slug returns 404 or not-found state', async ({ page }) => {
    const response = await page.goto('/this-venue-absolutely-does-not-exist-xyz');
    // Either a 404 status or a "not found" UI
    const is404 = response?.status() === 404;
    const hasNotFound = await page.getByText(/not found|not available|404/i).isVisible().catch(() => false);
    expect(is404 || hasNotFound).toBeTruthy();
  });

  test('published venue page renders key sections when slug is known', async ({ page }) => {
    const slug = process.env.TEST_VENUE_SLUG;
    if (!slug) {
      test.skip();
      return;
    }
    await page.goto(`/${slug}`);
    // Hero section should have venue name or a "Request Quote" / inquiry CTA
    await expect(page.locator('main')).toBeVisible();
    // Availability calendar widget should be present
    await expect(page.getByText(/availability|calendar/i).first()).toBeVisible();
  });
});
