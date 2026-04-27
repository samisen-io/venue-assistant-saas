import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { loginAs } from './helpers/auth';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for auth onboarding tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function deleteUserByEmail(email: string): Promise<void> {
  const admin = buildAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return;

  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return;

  await admin.from('venues').delete().eq('owner_id', user.id);
  await admin.auth.admin.deleteUser(user.id);
}

test.describe('Auth + Onboarding', () => {
  test('signup submits and moves to OTP verification step', async ({ page }) => {
    test.skip(
      process.env.PLAYWRIGHT_SIGNUP_E2E !== '1',
      'Set PLAYWRIGHT_SIGNUP_E2E=1 to run live signup->OTP flow.',
    );

    const email = `pw-signup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

    await page.goto('/signup');
    await page.getByLabel('Full Name').fill('Playwright Signup');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm').fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByRole('heading', { name: /verify your email/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(new RegExp(email, 'i'))).toBeVisible();

    await deleteUserByEmail(email);
  });

  test('new user can complete onboarding and reach dashboard', async ({ page }) => {
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const email = `pw-onboard-${suffix}@example.com`;
    const password = `Pw-${randomUUID().slice(0, 8)}!`;

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Playwright Onboarding User' },
    });
    if (error || !data.user) {
      throw new Error(`Failed to create temp onboarding user: ${error?.message || 'unknown error'}`);
    }

    try {
      await loginAs(page, email, password);
      await page.goto('/onboarding/venue-setup');

      await expect(page.getByRole('heading', { name: /let's get started/i })).toBeVisible();
      await page.getByLabel('Venue Name').fill(`PW Onboarding Venue ${suffix}`);
      await page.getByLabel('Venue Type').click();
      await page.getByRole('option', { name: /^hotel$/i }).click();
      await page.getByLabel('Address').fill('123 Test Ave');
      await page.getByLabel('City').fill('Austin');
      await page.getByLabel('State').fill('TX');
      await page.getByLabel('Zip Code').fill('73301');
      await page.getByLabel('Contact Name').fill('Venue Ops');
      await page.getByLabel('Phone').fill('5125550101');
      await page.getByLabel('Email').fill(email);

      await page.getByRole('button', { name: /complete setup/i }).click();

      await page.waitForURL('**/dashboard', { timeout: 20_000 });
      await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
      await expect(page.getByText(new RegExp(`PW Onboarding Venue ${suffix}`)).first()).toBeVisible();
    } finally {
      await admin.from('venues').delete().eq('owner_id', data.user.id);
      await admin.auth.admin.deleteUser(data.user.id);
    }
  });
});
