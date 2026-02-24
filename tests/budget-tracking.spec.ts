import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loginAsTestUser } from './helpers/auth';
import { requireAuthCredentials } from './helpers/requirements';

function buildAdminClient(): SupabaseClient {
  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing TEST_SUPABASE_URL/TEST_SUPABASE_SERVICE_ROLE_KEY for budget tracking tests.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Budget Tracking', () => {
  test('budget summary and vendor variance update after quoted cost change', async ({ page }) => {
    test.setTimeout(90_000);
    requireAuthCredentials();
    await loginAsTestUser(page);
    await page.goto('/dashboard');

    const activeVenueId = await page.evaluate(() => localStorage.getItem('activeVenueId'));
    const headers = activeVenueId ? { 'X-Venue-Id': activeVenueId } : undefined;
    const admin = buildAdminClient();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const eventName = `PW Budget Event ${suffix}`;
    const totalBudget = 10000;
    const initialQuoted = 2000;
    const updatedQuoted = 3000;
    const actualCost = 2600;

    const spacesRes = await page.request.get('/api/spaces', { headers });
    expect(spacesRes.ok()).toBeTruthy();
    const spaces = (await spacesRes.json()) as Array<{ id: string; venue_id: string }>;
    expect(spaces.length).toBeGreaterThan(0);

    const vendorsRes = await page.request.get(`/api/vendors?venueId=${spaces[0].venue_id}`);
    expect(vendorsRes.ok()).toBeTruthy();
    const vendors = (await vendorsRes.json()) as Array<{
      id: string;
      vendor_services?: Array<{ event_service_id: string }>;
    }>;
    const vendorWithService = vendors.find((v) => (v.vendor_services?.length ?? 0) > 0);
    if (!vendorWithService?.vendor_services?.[0]?.event_service_id) {
      throw new Error('No vendor with service mapping found for budget tracking test.');
    }
    const eventServiceId = vendorWithService.vendor_services[0].event_service_id;

    const eventDate = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: createdEvent, error: eventError } = await admin
      .from('events')
      .insert({
        venue_id: spaces[0].venue_id,
        space_id: spaces[0].id,
        event_name: eventName,
        event_type: 'corporate',
        event_date: eventDate,
        event_time: '12:00',
        event_end_time: '14:00',
        guest_count: 75,
        budget_total: totalBudget,
        status: 'planning',
      })
      .select('id')
      .single();

    if (eventError || !createdEvent) {
      throw new Error(`Failed to create event fixture: ${eventError?.message || 'unknown error'}`);
    }

    const { error: reqError } = await admin.from('event_service_requirements').insert({
      event_id: createdEvent.id,
      event_service_id: eventServiceId,
      budget_amount: 4000,
    });
    if (reqError) {
      throw new Error(`Failed to create event service requirement: ${reqError.message}`);
    }

    const { data: createdAssociation, error: assocError } = await admin
      .from('event_vendors')
      .insert({
        event_id: createdEvent.id,
        vendor_id: vendorWithService.id,
        event_service_id: eventServiceId,
        quoted_cost: initialQuoted,
        actual_cost: actualCost,
        confirmed: true,
        outreach_status: 'confirmed',
        status_updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (assocError || !createdAssociation) {
      throw new Error(`Failed to create event vendor association: ${assocError?.message || 'unknown error'}`);
    }

    try {
      await page.goto(`/events/${createdEvent.id}`);
      await expect(page.getByRole('heading', { name: new RegExp(eventName) })).toBeVisible();
      await page.getByRole('tab', { name: /^budget$/i }).click();

      await expect(page.getByTestId('budget-total-allocated-value')).toHaveText('$10,000.00');
      await expect(page.getByTestId('budget-committed-spent-value')).toHaveText('$2,600.00');
      await expect(page.getByTestId('budget-remaining-value')).toHaveText('$7,400.00');

      const budgetRow = page.locator(`[data-association-id="${createdAssociation.id}"]`);
      await expect(budgetRow.getByTestId('budget-row-quoted')).toHaveText('$2,000.00');
      await expect(budgetRow.getByTestId('budget-row-actual')).toHaveText('$2,600.00');
      await expect(budgetRow.getByTestId('budget-row-variance')).toHaveText('$600.00');

      const updateRes = await page.request.put(
        `/api/events/${createdEvent.id}/vendors/${createdAssociation.id}`,
        {
          data: { quoted_cost: updatedQuoted },
        },
      );
      expect(updateRes.ok()).toBeTruthy();

      await page.reload();
      await page.getByRole('tab', { name: /^budget$/i }).click();

      await expect(page.getByTestId('budget-committed-spent-value')).toHaveText('$2,600.00');
      await expect(page.getByTestId('budget-remaining-value')).toHaveText('$7,400.00');
      await expect(budgetRow.getByTestId('budget-row-quoted')).toHaveText('$3,000.00');
      await expect(budgetRow.getByTestId('budget-row-actual')).toHaveText('$2,600.00');
      await expect(budgetRow.getByTestId('budget-row-variance')).toHaveText('-$400.00');
    } finally {
      await admin.from('vendor_communications').delete().eq('event_id', createdEvent.id);
      await admin.from('event_vendors').delete().eq('id', createdAssociation.id);
      await admin.from('event_service_requirements').delete().eq('event_id', createdEvent.id);
      await admin.from('events').delete().eq('id', createdEvent.id);
    }
  });
});
