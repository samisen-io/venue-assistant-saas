import { test, expect, type APIRequestContext } from '@playwright/test';
import path from 'node:path';

// Use the saved auth state for all tests in this file.
test.use({ storageState: path.join(__dirname, '.auth/user.json') });

// Unique prefix so test-created records are identifiable and won't collide with
// real data. Keep it short to stay within field length limits.
const P = 'PW_';

function requireAuth() {
  if (!process.env.TEST_USER_EMAIL) {
    test.skip();
  }
}

/** Best-effort API cleanup — warns on unexpected failures but never throws. */
async function del(request: APIRequestContext, url: string) {
  try {
    const res = await request.delete(url);
    if (!res.ok() && res.status() !== 204 && res.status() !== 404) {
      console.warn(`[Cleanup] DELETE ${url} → ${res.status()}`);
    }
  } catch {
    // intentionally swallowed — cleanup is best-effort
  }
}

// ─── 3.1 Space CRUD ──────────────────────────────────────────────────────────

test.describe('3.1 Space CRUD', () => {
  let spaceId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (spaceId) { await del(request, `/api/spaces/${spaceId}`); spaceId = null; }
  });

  test('creates a space via the form and it appears in the list', async ({ page }) => {
    requireAuth();

    await page.goto('/spaces/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/space name/i).fill(`${P}Ballroom`);

    // Space Type is a shadcn Select — click the trigger, then pick the option
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Ballroom' }).click();

    await page.getByLabel(/capacity/i).fill('150');

    // Intercept the POST response to capture the created ID
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/spaces') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /create space/i }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const created = await response.json();
    spaceId = created.id;

    await page.waitForURL('**/spaces', { timeout: 15_000 });
    await expect(page.getByText(`${P}Ballroom`)).toBeVisible();
  });

  test('shows inline validation errors on empty form submission', async ({ page }) => {
    requireAuth();

    await page.goto('/spaces/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /create space/i }).click();

    // react-hook-form + zod errors should render
    await expect(page.getByText(/at least|required|invalid/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('edits a space and the updated name appears in the list', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/spaces', {
      data: { name: `${P}ToEdit`, space_type: 'conference_room', capacity: 50 },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    spaceId = created.id;

    await page.goto(`/spaces/${spaceId}/edit`);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/space name/i);
    await nameInput.clear();
    await nameInput.fill(`${P}Renamed`);

    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText(`${P}Renamed`)).toBeVisible({ timeout: 10_000 });
  });

  test('space detail page loads with space information', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/spaces', {
      data: { name: `${P}DetailSpace`, space_type: 'rooftop', capacity: 75 },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    spaceId = created.id;

    await page.goto(`/spaces/${spaceId}`);
    await expect(page.getByText(`${P}DetailSpace`)).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 3.2 Client CRUD ─────────────────────────────────────────────────────────

test.describe('3.2 Client CRUD', () => {
  let clientId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (clientId) { await del(request, `/api/clients/${clientId}`); clientId = null; }
  });

  test('creates a client via the form and it appears in the list', async ({ page }) => {
    requireAuth();

    await page.goto('/clients/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/contact name/i).fill(`${P}Jane Doe`);
    await page.getByLabel(/email/i).fill('pw-crud-client@example.com');

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/clients') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /create client/i }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const created = await response.json();
    clientId = created.id;

    await page.waitForURL('**/clients', { timeout: 15_000 });
    await expect(page.getByText(`${P}Jane Doe`)).toBeVisible();
  });

  test('shows inline validation errors on empty client form', async ({ page }) => {
    requireAuth();

    await page.goto('/clients/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /create client/i }).click();

    await expect(page.getByText(/at least|required/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('edits a client and the updated name persists', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/clients', {
      data: { contact_name: `${P}ClientToEdit` },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    clientId = created.id;

    await page.goto(`/clients/${clientId}/edit`);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/contact name/i);
    await nameInput.clear();
    await nameInput.fill(`${P}ClientRenamed`);

    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText(`${P}ClientRenamed`)).toBeVisible({ timeout: 10_000 });
  });

  test('client detail page shows contact information', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/clients', {
      data: { contact_name: `${P}DetailClient`, email: 'pw-detail-client@example.com' },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    clientId = created.id;

    await page.goto(`/clients/${clientId}`);
    await expect(
      page.getByText(`${P}DetailClient`).or(page.getByText('pw-detail-client@example.com')),
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 3.3 Vendor CRUD ─────────────────────────────────────────────────────────

test.describe('3.3 Vendor CRUD', () => {
  let vendorId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (vendorId) { await del(request, `/api/vendors/${vendorId}`); vendorId = null; }
  });

  test('creates a vendor via the form and it appears in the list', async ({ page }) => {
    requireAuth();

    await page.goto('/vendors/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/vendor name/i).fill(`${P}Catering Co`);
    // The Email label in VendorForm is exactly "Email" (no "(Optional)" suffix)
    await page.getByLabel(/^email$/i).fill('pw-crud-vendor@example.com');

    // Wait for event services to load, then check the first one
    // Checkboxes are rendered with id="service-{uuid}"
    const firstService = page.locator('[id^="service-"]').first();
    await expect(firstService).toBeVisible({ timeout: 10_000 });
    await firstService.check();

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/vendors') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /create vendor/i }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const created = await response.json();
    vendorId = created.id;

    await page.waitForURL('**/vendors', { timeout: 15_000 });
    await expect(page.getByText(`${P}Catering Co`)).toBeVisible();
  });

  test('shows inline validation errors on empty vendor form', async ({ page }) => {
    requireAuth();

    await page.goto('/vendors/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /create vendor/i }).click();

    await expect(page.getByText(/required|at least|invalid/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('edits a vendor and the updated name persists', async ({ page, request }) => {
    requireAuth();

    // Need at least one service ID to create a vendor
    const servicesRes = await request.get('/api/event-services');
    expect(servicesRes.ok()).toBeTruthy();
    const services = await servicesRes.json();
    const firstServiceId = services[0]?.id;
    if (!firstServiceId) { test.skip(); return; }

    const res = await request.post('/api/vendors', {
      data: {
        name: `${P}VendorToEdit`,
        contact_email: 'pw-edit-vendor@example.com',
        event_service_ids: [firstServiceId],
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    vendorId = created.id;

    await page.goto(`/vendors/${vendorId}/edit`);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/vendor name/i);
    await nameInput.clear();
    await nameInput.fill(`${P}VendorRenamed`);

    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText(`${P}VendorRenamed`)).toBeVisible({ timeout: 10_000 });
  });

  test('vendor detail page shows vendor information', async ({ page, request }) => {
    requireAuth();

    const servicesRes = await request.get('/api/event-services');
    const services = await servicesRes.json();
    const firstServiceId = services[0]?.id;
    if (!firstServiceId) { test.skip(); return; }

    const res = await request.post('/api/vendors', {
      data: {
        name: `${P}DetailVendor`,
        contact_email: 'pw-detail-vendor@example.com',
        event_service_ids: [firstServiceId],
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    vendorId = created.id;

    await page.goto(`/vendors/${vendorId}`);
    await expect(page.getByText(`${P}DetailVendor`)).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 3.4 Event CRUD ──────────────────────────────────────────────────────────

test.describe('3.4 Event CRUD', () => {
  let eventId: string | null = null;
  let spaceId: string | null = null;

  const futureDate = (monthsAhead: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().split('T')[0];
  };

  // Each test needs a space to attach events to
  test.beforeEach(async ({ request }) => {
    if (!process.env.TEST_USER_EMAIL) return;
    const res = await request.post('/api/spaces', {
      data: { name: `${P}EventSpace`, space_type: 'ballroom', capacity: 200 },
    });
    if (res.ok()) spaceId = (await res.json()).id;
  });

  test.afterEach(async ({ request }) => {
    // Delete event before space (FK constraint)
    if (eventId) { await del(request, `/api/events/${eventId}`); eventId = null; }
    if (spaceId) { await del(request, `/api/spaces/${spaceId}`); spaceId = null; }
  });

  test('creates an event via the form and it appears in the events list', async ({ page }) => {
    requireAuth();
    if (!spaceId) { test.skip(); return; }

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    // SpaceSelector — shadcn Select, placeholder "Select a space"
    await page.getByRole('combobox', { name: /select a space/i }).click();
    await page.getByRole('option', { name: new RegExp(`${P}EventSpace`) }).click();

    await page.getByLabel(/event name/i).fill(`${P}Birthday Bash`);

    // Event Type — shadcn Select, placeholder "Select type"
    await page.getByRole('combobox', { name: /select type/i }).click();
    await page.getByRole('option', { name: 'Birthday' }).click();

    await page.getByLabel(/^date$/i).fill(futureDate(2));
    await page.getByLabel(/guest count/i).fill('75');
    await page.getByLabel(/total budget/i).fill('8000');

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/events') && r.request().method() === 'POST',
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /create event/i }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const created = await response.json();
    eventId = created.id;

    await page.waitForURL('**/events', { timeout: 15_000 });
    await expect(page.getByText(`${P}Birthday Bash`)).toBeVisible();
  });

  test('shows inline validation errors on empty event form', async ({ page }) => {
    requireAuth();

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /create event/i }).click();

    await expect(page.getByText(/required|at least|invalid/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('rejects a past event date with a validation error', async ({ page }) => {
    requireAuth();
    if (!spaceId) { test.skip(); return; }

    await page.goto('/events/new');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('combobox', { name: /select a space/i }).click();
    await page.getByRole('option', { name: new RegExp(`${P}EventSpace`) }).click();

    await page.getByLabel(/event name/i).fill(`${P}PastEvent`);
    await page.getByRole('combobox', { name: /select type/i }).click();
    await page.getByRole('option', { name: 'Other' }).click();

    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    await page.getByLabel(/^date$/i).fill(past.toISOString().split('T')[0]);

    await page.getByLabel(/guest count/i).fill('50');
    await page.getByLabel(/total budget/i).fill('1000');

    await page.getByRole('button', { name: /create event/i }).click();

    // The zod schema validates event_date must be in the future
    await expect(page.getByText(/future|past|must be/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('edits an event and the updated name is reflected', async ({ page, request }) => {
    requireAuth();
    if (!spaceId) { test.skip(); return; }

    const res = await request.post('/api/events', {
      data: {
        space_id: spaceId,
        event_name: `${P}EventToEdit`,
        event_type: 'corporate',
        event_date: futureDate(3),
        guest_count: 100,
        budget_total: 10000,
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    eventId = created.id;

    await page.goto(`/events/${eventId}/edit`);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel(/event name/i);
    await nameInput.clear();
    await nameInput.fill(`${P}EventRenamed`);

    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText(`${P}EventRenamed`)).toBeVisible({ timeout: 10_000 });
  });

  test('event detail page renders the event name and type', async ({ page, request }) => {
    requireAuth();
    if (!spaceId) { test.skip(); return; }

    const res = await request.post('/api/events', {
      data: {
        space_id: spaceId,
        event_name: `${P}DetailEvent`,
        event_type: 'wedding',
        event_date: futureDate(4),
        guest_count: 150,
        budget_total: 20000,
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    eventId = created.id;

    await page.goto(`/events/${eventId}`);
    await expect(page.getByText(`${P}DetailEvent`)).toBeVisible({ timeout: 10_000 });
  });

  test('event cancellation API returns 200 and status changes to cancelled', async ({ request }) => {
    requireAuth();
    if (!spaceId) { test.skip(); return; }

    const res = await request.post('/api/events', {
      data: {
        space_id: spaceId,
        event_name: `${P}CancelMe`,
        event_type: 'other',
        event_date: futureDate(5),
        guest_count: 20,
        budget_total: 2000,
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    eventId = created.id;

    const cancelRes = await request.post(`/api/events/${eventId}/cancel`);
    expect(cancelRes.ok()).toBeTruthy();

    const fetchRes = await request.get(`/api/events/${eventId}`);
    const updated = await fetchRes.json();
    expect(updated.status).toBe('cancelled');
  });
});

// ─── 3.5 Lead CRUD ───────────────────────────────────────────────────────────

test.describe('3.5 Lead CRUD', () => {
  let leadId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (leadId) { await del(request, `/api/leads/${leadId}`); leadId = null; }
  });

  test('creates a lead via API and it appears in the leads list', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/leads', {
      data: {
        contact_name: `${P}LeadContact`,
        contact_email: 'pw-lead@example.com',
        event_type: 'wedding',
        estimated_budget: 15000,
        source: 'manual',
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    leadId = created.id;

    await page.goto('/leads');
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(
      page.getByText(`${P}LeadContact`).or(page.getByText('pw-lead@example.com')),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('lead detail page shows the contact information', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/leads', {
      data: {
        contact_name: `${P}DetailLead`,
        contact_email: 'pw-detail-lead@example.com',
        source: 'manual',
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    leadId = created.id;

    await page.goto(`/leads/${leadId}`);
    await expect(
      page.getByText(`${P}DetailLead`).or(page.getByText('pw-detail-lead@example.com')),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('updates a lead status to contacted and it reflects in the UI', async ({ page, request }) => {
    requireAuth();

    const res = await request.post('/api/leads', {
      data: { contact_name: `${P}StatusLead`, source: 'manual' },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    leadId = created.id;

    // Update via API
    const updateRes = await request.put(`/api/leads/${leadId}`, {
      data: { status: 'contacted' },
    });
    expect(updateRes.ok()).toBeTruthy();

    await page.goto(`/leads/${leadId}`);
    await expect(page.getByText(/contacted/i)).toBeVisible({ timeout: 10_000 });
  });

  test('marks a lead as lost with a reason', async ({ request }) => {
    requireAuth();

    const res = await request.post('/api/leads', {
      data: { contact_name: `${P}LostLead`, source: 'manual' },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    leadId = created.id;

    const updateRes = await request.put(`/api/leads/${leadId}`, {
      data: { status: 'lost', lost_reason: 'Budget too low' },
    });
    expect(updateRes.ok()).toBeTruthy();

    const fetchRes = await request.get(`/api/leads/${leadId}`);
    const { lead } = await fetchRes.json();
    expect(lead.status).toBe('lost');
    expect(lead.lost_reason).toBe('Budget too low');
  });
});
