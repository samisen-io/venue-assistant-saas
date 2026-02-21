# Automation Plan for VenueAssistant

To automate the manual tests outlined in `MANUAL_TEST_CHECKLIST.md`, we recommend using **Playwright**. It is a powerful E2E testing framework that works exceptionally well with Next.js applications.

## 1. Setup Playwright

Run the following command in your terminal:

```bash
npm init playwright@latest
```

- Choose `TypeScript`.
- Put end-to-end tests in `e2e`.
- Add a GitHub Actions workflow (optional but recommended).

## 2. Configuration

Update `playwright.config.ts` to set the `baseURL` to your local development server (usually `http://localhost:3000`).

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 3. Automating the Checklist

Here is how you can map the manual checklist to Playwright test files.

### Structure
Create the following files in your `e2e` folder:
- `e2e/public-marketplace.spec.ts` (Covers Part 1)
- `e2e/manager-portal.spec.ts` (Covers Part 2)
- `e2e/ai-features.spec.ts` (Covers Part 3)

### Example Test: Homepage (Part 1.1)

Create `e2e/public-marketplace.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Part 1: Public Marketplace', () => {
  
  test('1.1 Homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Hero Section
    await expect(page.locator('h1')).toBeVisible();
    // Adjust selector based on your actual Hero component
    await expect(page.getByText('Find Your Perfect Event Venue')).toBeVisible(); 
    
    // Search Bar
    const searchInput = page.getByPlaceholder('Search location...'); // Adjust placeholder
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Dallas');
    // Verify autocomplete appears if applicable
    
    // Featured Venues
    // Assuming venue cards have a specific class or test-id
    const venueCards = page.locator('.venue-card'); 
    // Wait for data to load if needed
    await expect(venueCards.first()).toBeVisible();
    
    // Footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('1.2 Search Results', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Search location...').fill('Dallas');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/.*\/venues/);
    await expect(page.getByText('Dallas')).toBeVisible();
  });

});
```

## 4. Running Tests

- **Run all tests:** `npx playwright test`
- **Run with UI:** `npx playwright test --ui`
- **Debug:** `npx playwright test --debug`

## 5. Seeding Test Data

To make tests reliable, ensure you have a consistent dataset.
You can use the existing seed script before running tests.

In `package.json`:
```json
"scripts": {
  "test:e2e": "npm run db:reset && playwright test"
}
```
(Assuming you have a `db:reset` script that runs your seed logic).