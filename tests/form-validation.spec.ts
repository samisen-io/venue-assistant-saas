import { test, expect } from '@playwright/test';
import path from 'node:path';

test.use({ storageState: path.join(__dirname, '.auth/user.json') });

function requireAuth() {
  if (!process.env.TEST_USER_EMAIL) {
    test.skip();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * VendorForm uses mode:"onSubmit" (default), so we need to click the submit
 * button to trigger validation. Fill the minimum required fields correctly,
 * then override the one field under test with an invalid value.
 */
async function fillVendorFormBase(page: import('@playwright/test').Page) {
  await page.goto('/vendors/new');
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

  await page.getByLabel(/vendor name/i).fill('Test Vendor');

  // Wait for services to load and check the first one (required field)
  const firstService = page.locator('[id^="service-"]').first();
  await expect(firstService).toBeVisible({ timeout: 10_000 });
  await firstService.check();
}

/**
 * ClientForm also uses mode:"onSubmit". Fill the one required field correctly
 * so validation errors on other fields are clearly isolated.
 */
async function fillClientFormBase(page: import('@playwright/test').Page) {
  await page.goto('/clients/new');
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

  await page.getByLabel(/contact name/i).fill('Test Client');
}

// ─── 5.1 Email Format Validation ─────────────────────────────────────────────

test.describe('5.1 Email Format Validation', () => {
  test('vendor form: invalid email shows error', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('notanemail');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Please enter a valid email address')).toBeVisible({ timeout: 5_000 });
  });

  test('vendor form: empty email shows required error', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    // Leave email blank and submit
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Please enter a valid email address')).toBeVisible({ timeout: 5_000 });
  });

  test('client form: invalid email format shows error', async ({ page }) => {
    requireAuth();

    await fillClientFormBase(page);
    await page.getByLabel(/email/i).fill('bademail@');
    await page.getByRole('button', { name: /create client/i }).click();

    await expect(page.getByText('Invalid email address')).toBeVisible({ timeout: 5_000 });
  });

  test('client form: valid email passes validation', async ({ page }) => {
    requireAuth();

    await fillClientFormBase(page);
    await page.getByLabel(/email/i).fill('valid@example.com');
    await page.getByRole('button', { name: /create client/i }).click();

    // No email error — it may redirect or show other field errors but not email
    await expect(page.getByText('Invalid email address')).not.toBeVisible({ timeout: 3_000 });
  });
});

// ─── 5.2 Phone Format Validation ─────────────────────────────────────────────

test.describe('5.2 Phone Format Validation', () => {
  test('vendor form: alphabetical phone shows format error', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByLabel(/phone/i).fill('abcdef');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Invalid phone number format')).toBeVisible({ timeout: 5_000 });
  });

  test('vendor form: valid phone with formatting passes', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByLabel(/phone/i).fill('(555) 123-4567');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Invalid phone number format')).not.toBeVisible({ timeout: 3_000 });
  });
});

// ─── 5.3 Field Length — Minimum ──────────────────────────────────────────────

test.describe('5.3 Field Length — Minimum', () => {
  // SpaceForm and EventForm use mode:"onBlur" — validation fires when the
  // field loses focus, so we fill → blur without needing to submit.

  test('space name: 1 character triggers min-length error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/spaces/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/space name/i);
    await nameInput.fill('x');
    await nameInput.blur();

    await expect(page.getByText('Space name must be at least 2 characters')).toBeVisible({ timeout: 5_000 });
  });

  test('event name: 1 character triggers min-length error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/event name/i);
    await nameInput.fill('x');
    await nameInput.blur();

    await expect(page.getByText('Event name must be at least 2 characters')).toBeVisible({ timeout: 5_000 });
  });

  test('vendor name: 1 character triggers min-length error on submit', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    // Override the valid name with a single character
    await page.getByLabel(/vendor name/i).fill('x');
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Vendor name must be at least 2 characters')).toBeVisible({ timeout: 5_000 });
  });

  test('client contact name: 1 character triggers min-length error on submit', async ({ page }) => {
    requireAuth();

    await page.goto('/clients/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/contact name/i).fill('x');
    await page.getByRole('button', { name: /create client/i }).click();

    await expect(page.getByText('Contact name is required')).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 5.4 Field Length — Maximum ──────────────────────────────────────────────

test.describe('5.4 Field Length — Maximum', () => {
  const str = (n: number) => 'a'.repeat(n);

  test('space name: 101 characters triggers max-length error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/spaces/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/space name/i);
    await nameInput.fill(str(101));
    await nameInput.blur();

    await expect(page.getByText('Space name must be less than 100 characters')).toBeVisible({ timeout: 5_000 });
  });

  test('event name: 101 characters triggers max-length error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/event name/i);
    await nameInput.fill(str(101));
    await nameInput.blur();

    await expect(page.getByText('Event name must be less than 100 characters')).toBeVisible({ timeout: 5_000 });
  });

  test('event name: exactly 100 characters passes validation', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/event name/i);
    await nameInput.fill(str(100));
    await nameInput.blur();

    await expect(page.getByText('Event name must be less than 100 characters')).not.toBeVisible({ timeout: 3_000 });
  });

  test('vendor name: 101 characters triggers max-length error on submit', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/vendor name/i).fill(str(101));
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Vendor name must be less than 100 characters')).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 5.5 Numeric Boundaries ──────────────────────────────────────────────────

test.describe('5.5 Numeric Boundaries', () => {
  // EventForm uses mode:"onBlur" so we can blur individual fields.

  test('event: guest_count of 0 triggers min error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const guestInput = page.getByLabel(/guest count/i);
    await guestInput.clear();
    await guestInput.fill('0');
    await guestInput.blur();

    await expect(page.getByText('Guest count must be at least 1')).toBeVisible({ timeout: 5_000 });
  });

  test('event: budget_total of 0 triggers min error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const budgetInput = page.getByLabel(/total budget/i);
    await budgetInput.clear();
    await budgetInput.fill('0');
    await budgetInput.blur();

    await expect(page.getByText('Budget must be greater than $0')).toBeVisible({ timeout: 5_000 });
  });

  test('event: guest_count of 1 passes min validation', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const guestInput = page.getByLabel(/guest count/i);
    await guestInput.clear();
    await guestInput.fill('1');
    await guestInput.blur();

    await expect(page.getByText('Guest count must be at least 1')).not.toBeVisible({ timeout: 3_000 });
  });

  test('space: capacity of 0 triggers min error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/spaces/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const capacityInput = page.getByLabel(/capacity/i);
    await capacityInput.clear();
    await capacityInput.fill('0');
    await capacityInput.blur();

    await expect(page.getByText('Capacity must be at least 1')).toBeVisible({ timeout: 5_000 });
  });

  test('space: capacity of 10001 triggers max error on blur', async ({ page }) => {
    requireAuth();

    await page.goto('/spaces/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const capacityInput = page.getByLabel(/capacity/i);
    await capacityInput.clear();
    await capacityInput.fill('10001');
    await capacityInput.blur();

    await expect(page.getByText('Capacity seems too large')).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 5.6 URL Format Validation ───────────────────────────────────────────────

test.describe('5.6 URL Format Validation', () => {
  test('vendor form: invalid website URL shows error', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByLabel(/website/i).fill('not-a-url');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Please enter a valid URL (e.g., https://example.com)')).toBeVisible({ timeout: 5_000 });
  });

  test('vendor form: URL missing scheme shows error', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByLabel(/website/i).fill('example.com');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Please enter a valid URL (e.g., https://example.com)')).toBeVisible({ timeout: 5_000 });
  });

  test('vendor form: valid https URL passes validation', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    await page.getByLabel(/website/i).fill('https://example.com');
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Please enter a valid URL (e.g., https://example.com)')).not.toBeVisible({ timeout: 3_000 });
  });

  test('vendor form: empty website field passes (field is optional)', async ({ page }) => {
    requireAuth();

    await fillVendorFormBase(page);
    await page.getByLabel(/^email$/i).fill('valid@example.com');
    // Leave website blank
    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText('Please enter a valid URL (e.g., https://example.com)')).not.toBeVisible({ timeout: 3_000 });
  });
});
