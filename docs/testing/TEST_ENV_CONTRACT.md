# Test Environment Contract

This document defines the minimum environment required for stable automated E2E runs.

## Required Variables

Add these to `.env.local` (local) and CI secrets (pipeline):

```env
TEST_USER_EMAIL=qa-user@example.com
TEST_USER_PASSWORD=your-password
TEST_VENUE_SLUG=your-published-venue-slug
```

## Variable Meanings

1. `TEST_USER_EMAIL`: Existing manager account used for authenticated tests.
2. `TEST_USER_PASSWORD`: Password for `TEST_USER_EMAIL`.
3. `TEST_VENUE_SLUG`: Published public venue slug used by public-page and chat tests.

## Behavior When Missing

1. Missing `TEST_USER_EMAIL` or `TEST_USER_PASSWORD`:
- Auth setup writes an empty storage state.
- Auth-required tests are skipped with an explicit reason.

2. Missing `TEST_VENUE_SLUG`:
- Public venue-specific tests are skipped with an explicit reason.

## Test Data Baseline

The test environment should keep the following fixtures available:

1. One published venue with pricing/packages and inquiry form enabled.
2. One manager user linked to at least one venue.
3. At least one lead and one event for manager portal list/detail flows.

## Seeding Guidance

If fixtures drift, reseed demo data before running full E2E:

1. Start the app and authenticate as the test manager account.
2. Trigger `POST /api/seed` from an authenticated session.
3. Confirm seed success in API response and rerun tests.

