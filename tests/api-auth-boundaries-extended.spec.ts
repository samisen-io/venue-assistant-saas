import { test, expect } from '@playwright/test';

test.describe('API Auth Boundaries — Extended', () => {
  test('vendor, space, and client endpoints return 401 without auth', async ({ request }) => {
    const NULL_ID = '00000000-0000-0000-0000-000000000000';

    const checks: Array<{ label: string; call: () => Promise<number> }> = [
      // Vendor endpoints
      {
        label: 'GET /api/vendors',
        call: async () => (await request.get('/api/vendors')).status(),
      },
      {
        label: 'POST /api/vendors',
        call: async () =>
          (
            await request.post('/api/vendors', {
              data: { name: 'PW Unauth Vendor', contact_name: 'Test', contact_email: 'test@example.com' },
            })
          ).status(),
      },
      {
        label: 'GET /api/vendors/[vendorId]',
        call: async () => (await request.get(`/api/vendors/${NULL_ID}`)).status(),
      },
      {
        label: 'PUT /api/vendors/[vendorId]',
        call: async () =>
          (await request.put(`/api/vendors/${NULL_ID}`, { data: { name: 'Updated' } })).status(),
      },
      {
        label: 'DELETE /api/vendors/[vendorId]',
        call: async () => (await request.delete(`/api/vendors/${NULL_ID}`)).status(),
      },
      {
        label: 'GET /api/vendors/[vendorId]/reviews',
        call: async () => (await request.get(`/api/vendors/${NULL_ID}/reviews`)).status(),
      },

      // Space endpoints
      {
        label: 'GET /api/spaces',
        call: async () => (await request.get('/api/spaces')).status(),
      },
      {
        label: 'POST /api/spaces',
        call: async () =>
          (
            await request.post('/api/spaces', {
              data: { name: 'PW Unauth Space', capacity: 50, space_type: 'ballroom', venue_id: NULL_ID },
            })
          ).status(),
      },
      {
        label: 'GET /api/spaces/[spaceId]',
        call: async () => (await request.get(`/api/spaces/${NULL_ID}`)).status(),
      },
      {
        label: 'PATCH /api/spaces/[spaceId]',
        call: async () =>
          (await request.patch(`/api/spaces/${NULL_ID}`, { data: { name: 'Updated' } })).status(),
      },
      {
        label: 'DELETE /api/spaces/[spaceId]',
        call: async () => (await request.delete(`/api/spaces/${NULL_ID}`)).status(),
      },

      // Client endpoints
      {
        label: 'GET /api/clients',
        call: async () => (await request.get('/api/clients')).status(),
      },
      {
        label: 'POST /api/clients',
        call: async () =>
          (
            await request.post('/api/clients', {
              data: { contact_name: 'PW Unauth Client', email: 'unauth@example.com' },
            })
          ).status(),
      },
      {
        label: 'GET /api/clients/[clientId]',
        call: async () => (await request.get(`/api/clients/${NULL_ID}`)).status(),
      },
      {
        label: 'PUT /api/clients/[clientId]',
        call: async () =>
          (await request.put(`/api/clients/${NULL_ID}`, { data: { contact_name: 'Updated' } })).status(),
      },
      {
        label: 'DELETE /api/clients/[clientId]',
        call: async () => (await request.delete(`/api/clients/${NULL_ID}`)).status(),
      },
    ];

    for (const check of checks) {
      const status = await check.call();
      expect(status, `${check.label} should return 401 without auth`).toBe(401);
    }
  });
});
