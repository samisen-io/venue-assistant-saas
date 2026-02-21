import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'node:fs';

// Load .env.local into the test-runner process so TEST_USER_* vars are available.
// (The Next.js dev server reads .env.local itself; this covers the Playwright side.)
try {
  const raw = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local absent in CI — credentials supplied via environment instead
}

export const STORAGE_STATE = path.join(__dirname, 'tests/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Run in headed mode locally so you can watch the tests run in the browser */
    headless: !!process.env.CI,

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshots on failure */
    screenshot: 'only-on-failure',

    /* Slow down actions slightly so they're easier to follow visually */
    launchOptions: {
      slowMo: process.env.CI ? 0 : 50,
    },
  },

  /* Configure projects */
  projects: [
    /**
     * Setup project: logs in once and saves the auth state.
     * All other projects depend on this so auth state is ready before tests run.
     */
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.ts/,
      use: { headless: true }, // Always headless for setup
    },

    /**
     * Main browser projects. All depend on setup so auth state is available
     * to spec files that use `test.use({ storageState: STORAGE_STATE })`.
     */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    /* Mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
      testMatch: '**/mobile-responsiveness.spec.ts',
    },
  ],

  /* Start the dev server before running tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
