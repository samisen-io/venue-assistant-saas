# Test Environment Contract

This document defines the minimum environment required for stable automated E2E runs.

## Required Variables

Add these to `.env.local` (local) and CI secrets (pipeline):

```env
TEST_USER_EMAIL=qa-user@example.com
TEST_USER_PASSWORD=your-password
TEST_VENUE_SLUG=your-published-venue-slug

# Required for seed/teardown fixtures (Task 1.1)
TEST_SUPABASE_URL=https://your-project.supabase.co
TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Variable Meanings

1. `TEST_USER_EMAIL`: Existing manager account used for authenticated tests.
2. `TEST_USER_PASSWORD`: Password for `TEST_USER_EMAIL`.
3. `TEST_VENUE_SLUG`: Published public venue slug used by public-page and chat tests.
4. `TEST_SUPABASE_URL`: Supabase project URL. Falls back to `NEXT_PUBLIC_SUPABASE_URL` if unset.
5. `TEST_SUPABASE_SERVICE_ROLE_KEY`: Service-role key used by the seed/teardown fixtures to create and delete test records directly (bypasses RLS). Falls back to `SUPABASE_SERVICE_ROLE_KEY` if unset. **Never expose this key to the browser or commit it.**

## Behavior When Missing

1. Missing `TEST_USER_EMAIL` or `TEST_USER_PASSWORD`:
- Auth setup writes an empty storage state.
- Auth-required tests are skipped with an explicit reason.

2. Missing `TEST_VENUE_SLUG`:
- Public venue-specific tests are skipped with an explicit reason.

3. Missing `TEST_SUPABASE_SERVICE_ROLE_KEY`:
- `getTestIds()` / `seedTestFixtures()` throw immediately with a descriptive error.
- Tests that call `requireSeedData()` fail fast before attempting DB operations.

## Test Data Baseline

The test environment should keep the following fixtures available:

1. One published venue with pricing/packages and inquiry form enabled.
2. One manager user linked to at least one venue.
3. At least one lead and one event for manager portal list/detail flows.

## Seeding Guidance

### Programmatic seed (recommended for CRUD/business-logic tests)

Use `getTestIds()` from `tests/helpers/requirements.ts` in a `beforeEach`:

```typescript
import { test } from '@playwright/test';
import { getTestIds } from '../helpers/requirements';
import { teardownTestFixtures } from '../fixtures/teardown';
import type { TestIds } from '../fixtures/seed';

let ids: TestIds;

test.beforeEach(async () => {
  ids = await getTestIds();
});

test.afterEach(async () => {
  await teardownTestFixtures(ids);
});
```

### Manual seed (fallback for exploratory runs)

If fixtures drift, reseed demo data before running full E2E:

1. Start the app and authenticate as the test manager account.
2. Trigger `POST /api/seed` from an authenticated session.
3. Confirm seed success in API response and rerun tests.

## CI Secrets

Add the following secrets to GitHub Actions (Settings → Secrets → Actions):

| Secret name                      | Description                        |
|----------------------------------|------------------------------------|
| `TEST_USER_EMAIL`                | QA account email                   |
| `TEST_USER_PASSWORD`             | QA account password                |
| `TEST_VENUE_SLUG`                | Published venue slug               |
| `TEST_SUPABASE_URL`              | Supabase project URL               |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | Service-role key (never in client) |
