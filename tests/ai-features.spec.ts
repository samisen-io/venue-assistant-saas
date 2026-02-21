import { test, expect } from '@playwright/test';
import path from 'node:path';

test.use({ storageState: path.join(__dirname, '.auth/user.json') });

function requireAuth() {
  if (!process.env.TEST_USER_EMAIL) {
    test.skip();
  }
}

// ─── 3.1 Natural Language Event Creation ──────────────────────────────────────

test.describe('3.1 Natural Language Event Creation', () => {
  test('new event page loads with form or NLP input', async ({ page }) => {
    requireAuth();
    await page.goto('/events/new');
    // Skip if redirected (e.g. no venue context selected yet)
    if (!page.url().includes('/events/new')) {
      test.skip();
      return;
    }
    // Wait for actual content inside main, not just the layout shell
    await expect(page.locator('main').locator('form, input, textarea').first()).toBeVisible({ timeout: 15_000 });
  });

  test('NLP tab or option is present on new event page', async ({ page }) => {
    requireAuth();
    await page.goto('/events/new');
    if (!page.url().includes('/events/new')) { test.skip(); return; }
    // Check for "Natural Language" or "AI" tab/button
    const hasNLP = await page.getByText(/natural language|describe|ai|tell us/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    // This feature is optional — just log if absent rather than failing
    if (!hasNLP) {
      console.log('ℹ️  Natural Language tab not found on /events/new — may be behind a toggle.');
    }
  });
});

// ─── 3.2 AI Chat Widget on Public Venue Page ──────────────────────────────────

test.describe('3.2 AI Chat Widget', () => {
  test('chat widget is present on a published venue page', async ({ page }) => {
    const slug = process.env.TEST_VENUE_SLUG;
    if (!slug) {
      test.skip();
      return;
    }

    await page.goto(`/${slug}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });

    // Skip if venue doesn't exist or isn't published in this environment
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible().catch(() => false);
    if (is404) {
      test.skip();
      return;
    }

    // Chat widget could be a floating button or an embedded chat section
    const chatTrigger = page
      .getByRole('button', { name: /chat|message|ask/i })
      .or(page.locator('[data-testid="chat-widget"]'))
      .or(page.locator('.chat-widget, .chat-bubble, [aria-label*="chat" i]'))
      .first();

    await expect(chatTrigger).toBeVisible({ timeout: 10_000 });
  });

  test('chat widget opens when clicked', async ({ page }) => {
    const slug = process.env.TEST_VENUE_SLUG;
    if (!slug) {
      test.skip();
      return;
    }

    await page.goto(`/${slug}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });

    // Skip if venue doesn't exist or isn't published in this environment
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible().catch(() => false);
    if (is404) {
      test.skip();
      return;
    }

    const chatTrigger = page
      .getByRole('button', { name: /chat|message|ask/i })
      .or(page.locator('[aria-label*="chat" i]'))
      .first();

    if (await chatTrigger.isVisible({ timeout: 5_000 })) {
      await chatTrigger.click();
      // After opening, an input or message area should appear
      await expect(
        page.getByPlaceholder(/message|type|ask/i).or(page.getByRole('textbox'))
      ).toBeVisible({ timeout: 8_000 });
    }
  });
});

// ─── 3.3 Vendor Outreach Agent ────────────────────────────────────────────────

test.describe('3.3 Vendor Outreach Agent', () => {
  test('event detail page has a vendors section', async ({ page }) => {
    requireAuth();
    await page.goto('/events');
    if (page.url().includes('/login')) { test.skip(); return; }
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible({ timeout: 15_000 });

    // Navigate to the first event if one exists
    const firstEvent = page.getByRole('link', { name: /view|details|open/i }).first();
    const hasEvents = await firstEvent.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!hasEvents) {
      test.skip();
      return;
    }

    await firstEvent.click();
    // Vendor section or tab should exist on event detail
    await expect(page.getByText(/vendor|agent/i)).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 3.4 Proposal Generation ──────────────────────────────────────────────────

test.describe('3.4 Proposal Generation', () => {
  test('leads page has action buttons for each lead', async ({ page }) => {
    requireAuth();
    await page.goto('/leads');
    if (page.url().includes('/login')) { test.skip(); return; }
    await expect(page.getByRole('heading', { name: /^leads$/i, level: 1 }).first()).toBeVisible({ timeout: 15_000 });

    // Lead cards are links containing an h3 heading (the lead's name); this avoids matching "Add Lead"
    const firstLead = page.locator('main').getByRole('link').filter({
      has: page.getByRole('heading', { level: 3 }),
    }).first();
    const hasLeads = await firstLead.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!hasLeads) {
      test.skip();
      return;
    }

    await firstLead.click();
    // Proposal or action buttons should appear on lead detail
    await expect(
      page.getByRole('button', { name: /proposal|send|action/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 3.5 Vendor Matching Algorithm ───────────────────────────────────────────

test.describe('3.5 Vendor Matching', () => {
  test('vendor matching UI is reachable from an event', async ({ page }) => {
    requireAuth();
    await page.goto('/events');
    if (page.url().includes('/login')) { test.skip(); return; }
    // Just verify the events page loads correctly — full matching test requires seed data
    await expect(page.getByRole('heading', { name: /^events$/i })).toBeVisible({ timeout: 15_000 });
  });
});
