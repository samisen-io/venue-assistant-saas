# Venue Manager — multi-tenant SaaS for venue and event operations

A production-shaped micro-SaaS for event venue managers (hotels, banquet halls, conference centres):
manage spaces, run events end to end, keep a vendor database with performance history, match vendors
to an event, and track budget variance in real time — plus an AI layer that turns a manager's request
into structured work.

Built as a single Next.js App Router application with Supabase (Postgres + Row Level Security),
Supabase Auth, Tailwind + shadcn/ui, and Claude for the AI features.

## Why it is worth a look

Most portfolio projects stop at a UI over a table. This one carries the parts that make software
survivable in production:

- **Multi-tenant isolation in the database, not in application code.** Every table has RLS policies;
  `tests/security-rls.spec.ts` and `tests/public-venue-data-boundaries.spec.ts` assert that one
  tenant's data cannot leak into another's queries.
- **31 Playwright specs** covering authentication and onboarding, event and space CRUD, budget
  tracking, vendor matching, the public marketplace, mobile responsiveness, error handling and
  performance/security boundaries (`npm run test:e2e`, plus a `@smoke` subset for quick runs).
- **Migrations as files** (`migrations/*.sql`, 8 of them) rather than edits made in a dashboard.
- **An AI layer behind one interface** (`lib/ai/claude.ts`) with typed error handling, so the product
  features that use Claude do not know or care which model answers.
- **83 API route files** — the app is API-first, so the same operations serve the dashboard and the
  public pages.

## Tech stack

- **Framework:** Next.js (App Router), TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Data:** Supabase (PostgreSQL) with Row Level Security; schema in `setup-database.sql` + `migrations/`
- **Auth:** Supabase Auth
- **AI:** Anthropic Claude via `lib/ai/claude.ts`
- **Tests:** Playwright (31 specs) · **Deploy:** Vercel

## Features

- **Authentication & onboarding** — signup, profile setup, first-venue wizard
- **Multi-venue management** — several venues per account, with spaces inside each
- **Event management** — full CRUD, status tracking (planning → confirmed → in progress → completed), dashboard of upcoming events
- **Vendor database** — categories (catering, AV, florals, parking, security, entertainment), cost structures, performance metrics
- **Vendor matching engine** — score 0-100 from reliability (40%), cost fit (30%), experience (20%), on-time history (10%), with primary/backup assignment
- **Budget tracking** — per-category breakdown, quoted vs actual, variance alerts, export
- **Performance reviews** — post-event ratings that feed the reliability score
- **AI features** — conversational assistance and vendor communications built on Claude

## Quick start

```bash
npm install
# .env.local
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE_KEY=...      # server-side only, never exposed to the client
#   ANTHROPIC_API_KEY=...              # for the AI features
npm run dev            # http://localhost:3000
```

Database: create a Supabase project, run `setup-database.sql` in the SQL editor, then the files in
`migrations/` in order (they are written to be idempotent).

## Scripts

```bash
npm run dev              # dev server
npm run build            # production build
npm run lint             # ESLint
npm run test:e2e         # full Playwright suite
npm run test:e2e:smoke   # @smoke-tagged specs, chromium, single worker
```

## Project structure

```
app/
  (auth)/        authentication pages
  (dashboard)/   protected application
  api/           API routes (83 files)
components/      ui/, events/, vendors/, budget/, layout/, shared/
lib/             supabase/ (clients), algorithms/ (matching, budget maths), ai/ (Claude), types/
hooks/           data-fetching hooks
migrations/      SQL migrations, in order
tests/           31 Playwright specs + fixtures and helpers
docs/            PRDs, task lists, guides, testing checklists
```

## Documentation in-repo

- `docs/prds/MVP_PRD.md` — core MVP requirements
- `docs/prds/MARKETPLACE_PRD.md` — public marketplace and conversational booking
- `docs/tasks/*.md` — implementation task lists (multi-venue, public pages, Stripe, marketplace)
- `docs/guides/DESIGN_SYSTEM.md` — UI system and component patterns
- `docs/guides/SETUP_GUIDE.md` — AI agent, webhook and email infrastructure
- `docs/testing/MANUAL_TEST_CHECKLIST.md` — manual QA regression checklist
- `CLAUDE.md` — project rules and conventions for AI coding assistants

## Database schema (core)

`profiles` · `venues` · `spaces` · `event_services` · `vendors` · `events` · `event_vendors` ·
`vendor_reviews`, plus AI tables (`agent_runs`, `vendor_communications`, `vendor_quotes`). All tables
are protected by RLS policies that enforce per-tenant isolation.

## Engineering notes

- Business logic lives in `lib/` (matching and budget algorithms are pure functions and testable);
  API routes stay thin.
- RLS policy changes ship with the migration that changes the table — the two are never separated.
- The public marketplace reads through narrower policies than the dashboard, which is what the
  boundary specs verify.
- AI calls go through a single client with typed error mapping; a missing or invalid key fails
  loudly rather than silently degrading a feature.

## Limitations and next steps

- **No unit-test layer** — coverage is end-to-end through Playwright; the matching and budget
  algorithms in `lib/algorithms/` would benefit from fast unit tests.
- **No evaluation harness for the AI features.** `tests/ai-features.spec.ts` asserts the plumbing;
  answer quality is not scored. Golden prompts with expected properties is the next step.
- Payments (Stripe) and email (Resend) are specified in the task docs but not shipped.
- Single-region Supabase deployment; no queue for long-running work such as bulk vendor outreach.

## Deployment

Push to GitHub, import in Vercel, add the environment variables, deploy. Supabase stays the data
layer; the service-role key is used only in server-side routes.

## License

MIT — see [LICENSE](LICENSE).
