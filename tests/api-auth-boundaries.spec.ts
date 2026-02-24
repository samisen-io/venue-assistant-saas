import { test, expect } from '@playwright/test';

test.describe('API Auth Boundaries', () => {
  test('unauthenticated requests to protected API endpoints return 401', async ({ request }) => {
    const checks: Array<{ label: string; call: () => Promise<{ status: number }> }> = [
      {
        label: 'GET /api/events',
        call: async () => ({ status: (await request.get('/api/events')).status() }),
      },
      {
        label: 'POST /api/events',
        call: async () => ({
          status: (
            await request.post('/api/events', {
              data: {
                event_name: 'PW Unauthorized Event',
                event_type: 'corporate',
                event_date: '2030-01-01',
                event_time: '10:00',
                guest_count: 50,
                budget_total: 5000,
                space_id: '00000000-0000-0000-0000-000000000000',
              },
            })
          ).status(),
        }),
      },
      {
        label: 'GET /api/leads',
        call: async () => ({ status: (await request.get('/api/leads')).status() }),
      },
      {
        label: 'PUT /api/leads/[leadId]',
        call: async () => ({
          status: (
            await request.put('/api/leads/00000000-0000-0000-0000-000000000000', {
              data: { status: 'qualified' },
            })
          ).status(),
        }),
      },
      {
        label: 'GET /api/venues/[venueId]/public-page',
        call: async () => ({
          status: (
            await request.get('/api/venues/00000000-0000-0000-0000-000000000000/public-page')
          ).status(),
        }),
      },
    ];

    for (const check of checks) {
      const result = await check.call();
      expect(result.status, `${check.label} should return 401 without auth`).toBe(401);
    }
  });
});
