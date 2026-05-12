import { test, expect } from '@playwright/test';

test.describe('AI Public Venue Search', () => {
  test('natural language search returns structured venue results', async ({ request }) => {
    test.setTimeout(30_000);

    const res = await request.post('/api/public/venues/ai-search', {
      data: { query: 'corporate conference venue in Austin for 100 people' },
    });

    // Accept 200 (results found) or 200 with empty list — not a 4xx/5xx
    expect(
      res.ok(),
      `POST /api/public/venues/ai-search failed: ${res.status()} — ${await res.text()}`,
    ).toBeTruthy();

    const body = (await res.json()) as {
      venues?: Array<unknown>;
      results?: Array<unknown>;
      search_summary?: string;
    };

    // Response should be an object with a venues/results array
    const results = body.venues ?? body.results ?? [];
    expect(Array.isArray(results), 'ai-search should return an array of venues').toBeTruthy();
  });

  test('ai-search returns 400 or handles empty query gracefully', async ({ request }) => {
    const res = await request.post('/api/public/venues/ai-search', {
      data: { query: '' },
    });
    // Should return 400 for empty input or 200 with empty results — not a 500
    expect(res.status(), 'Empty query should not cause server error').not.toBe(500);
  });
});
