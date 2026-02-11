# Database Migrations

## How to Apply

1. **First-time setup**: Run `setup-database.sql` (in project root) in Supabase SQL Editor. This creates all tables, indexes, and RLS policies from scratch.

2. **Incremental migrations**: Run `all-migrations.sql` (this directory) to apply all incremental changes on top of the base schema. This file is idempotent -- safe to re-run at any time.

## Files

| File | Purpose |
|------|---------|
| `setup-database.sql` (root) | Complete schema setup for fresh databases. Drops and recreates all tables. |
| `all-migrations.sql` | All incremental migrations consolidated into one file. Safe to re-run. |
| `public-pages-migration.sql` | Public venue pages feature: venues, spaces, photos, packages, testimonials, calendar settings, preview tokens, leads, conversations, etc. |
| `setup-preview-tokens.sql` | Creates `preview_tokens` table with anonymous access for preview links (run this if table doesn't exist). |
| `venue-photos-storage.sql` | Supabase Storage setup for venue photos and media. |

## What `all-migrations.sql` Contains

1. **Agent Runs columns** -- Adds progress tracking, error tracking, and logs to `agent_runs`
2. **Vendor Communications columns** -- Adds `sent_at`/`received_at` timestamps and email tracking fields
3. **Event End Time** -- Adds `event_end_time` column for space booking conflict detection
4. **Double-Booking Prevention** -- Database function and trigger to prevent overlapping space bookings
5. **Clients table** -- Creates `clients` table with RLS (guard: `IF NOT EXISTS`)
6. **Client Communications** -- Creates `client_communications` table with RLS (guard: `IF NOT EXISTS`)
7. **Client ID on Events** -- Adds `client_id` FK to `events` (guard: `IF NOT EXISTS`)
8. **Webhook Events table** -- Creates `webhook_events` table for Resend webhook processing
