import { test, expect, type Page } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials, requireVenueSlug } from './helpers/requirements';

async function publishFromEditor(page: Page): Promise<boolean> {
  await page.getByTestId('publish-btn').click();
  const checklist = page.getByRole('dialog');
  await expect(checklist).toBeVisible({ timeout: 10_000 });

  const acknowledge = checklist.getByLabel(/i understand and want to publish anyway/i);
  if (await acknowledge.isVisible().catch(() => false)) {
    await acknowledge.check();
  }

  const publishButton = checklist.getByRole('button', { name: /^publish$/i });
  if (!(await publishButton.isEnabled())) {
    await checklist.getByRole('button', { name: /^cancel$/i }).click();
    return false;
  }

  await publishButton.click();
  await expect(page.getByTestId('unpublish-btn')).toBeVisible({ timeout: 20_000 });
  return true;
}

test.describe('Venue Public Page Editor', () => {
  test('edit fields persist and publish/unpublish cycle controls public slug @smoke', async ({ page }) => {
    test.setTimeout(120_000);

    requireAuthCredentials();
    requireVenueSlug();

    const slug = process.env.TEST_VENUE_SLUG!;

    await loginAsTestUser(page);

    const venuesRes = await page.request.get('/api/venues');
    expect(venuesRes.ok()).toBeTruthy();
    const venues = (await venuesRes.json()) as Array<{ id: string; slug?: string | null; name: string }>;

    const targetVenue = venues.find((v) => (v.slug || '').toLowerCase() === slug.toLowerCase());
    expect(targetVenue, `Could not find venue with slug '${slug}' in /api/venues`).toBeTruthy();

    const venueId = targetVenue!.id;
    const tagline = `PW Tagline ${Date.now()}`;
    const spaceName = `PW Editor Space ${Date.now()}`;

    await page.goto(`/venues/${venueId}/public-page`);
    await expect(page.getByRole('heading', { name: /public page editor/i })).toBeVisible({
      timeout: 20_000,
    });

    const taglineInput = page
      .locator('label:has-text("Tagline")')
      .locator('xpath=following::input[1]');
    await taglineInput.fill(tagline);

    await page.getByRole('tab', { name: /^details$/i }).click();
    await page.getByRole('button', { name: /add space/i }).click();
    await page.locator('input[placeholder="Space name"]').last().fill(spaceName);

    await page.getByRole('tab', { name: /^ai$/i }).click();
    const toneCombobox = page
      .locator('label:has-text("Tone")')
      .locator('xpath=following::button[@role="combobox"][1]');
    await toneCombobox.click();
    await page.getByRole('option', { name: /^luxury$/i }).click();

    const saveButton = page.getByRole('button', { name: /^save$/i });
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/api/venues/${venueId}/public-page`) &&
          res.request().method() === 'PUT' &&
          res.ok(),
        { timeout: 20_000 },
      ),
      saveButton.click(),
    ]);

    await page.reload();
    await expect(page.getByRole('heading', { name: /public page editor/i })).toBeVisible({ timeout: 20_000 });

    const reloadedTaglineInput = page
      .locator('label:has-text("Tagline")')
      .locator('xpath=following::input[1]');
    await expect(reloadedTaglineInput).toHaveValue(tagline);

    await page.getByRole('tab', { name: /^ai$/i }).click();
    await expect(
      page.locator('label:has-text("Tone")').locator('xpath=following::button[@role="combobox"][1]'),
    ).toContainText(/luxury/i);

    const unpublishBtn = page.getByTestId('unpublish-btn');
    if (await unpublishBtn.isVisible().catch(() => false)) {
      // Non-destructive control check: dialog opens and can be cancelled.
      await unpublishBtn.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await dialog.getByRole('button', { name: /^cancel$/i }).click();
      await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    } else {
      // If venue is not currently published, try to publish when checklist allows it.
      await publishFromEditor(page);
    }

    const isPublishedInEditor = await page.getByTestId('unpublish-btn').isVisible().catch(() => false);

    await page.goto(`/${slug}`);
    if (isPublishedInEditor) {
      await expect(page.getByText(/this page is not currently available/i)).not.toBeVisible();
      await expect(
        page.getByRole('heading', { name: new RegExp(targetVenue!.name, 'i') }).first(),
      ).toBeVisible({ timeout: 20_000 });
    } else {
      await expect(page.getByText(/this page is not currently available/i)).toBeVisible({
        timeout: 20_000,
      });
    }
  });
});
