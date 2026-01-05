# Database Migrations

## How to Apply Migrations

Run the SQL files in this directory in your Supabase SQL Editor in the order they were created.

## Available Migrations

### `add_sent_at_received_at_columns.sql`

**Purpose**: Fixes the vendor_communications table schema to properly track email timestamps.

**What it does**:
1. Adds `sent_at` column - tracks when venue manager sends emails to vendors (outbound)
2. Adds `received_at` column - tracks when vendors reply back (inbound)
3. Adds missing columns that the code uses: `from_email`, `to_email`, `read_at`, `processed`, `requires_followup`
4. Makes `event_id` and `vendor_id` nullable to support unmatched communications
5. Migrates existing data to the correct timestamp columns based on direction

**Why this was needed**:
- The original schema only had one timestamp column (`sent_at` in the schema, but `received_at` in the actual database)
- The application needs TWO timestamps because:
  - **Outbound** communications (you → vendor) need `sent_at`
  - **Inbound** communications (vendor → you) need `received_at`
- The code was already using additional columns (`from_email`, `to_email`, etc.) that weren't in the schema

**How to apply**:
1. Open your Supabase SQL Editor
2. Copy and paste the entire contents of `add_sent_at_received_at_columns.sql`
3. Run the migration
4. Verify the table structure with: `\d vendor_communications`

**Safe to run multiple times**: Yes, this migration checks if columns exist before adding them.

## After Running Migrations

The `vendor_communications` table will have the following structure:

```sql
CREATE TABLE vendor_communications (
  id UUID PRIMARY KEY,
  agent_run_id UUID,
  event_id UUID (nullable),
  vendor_id UUID (nullable),
  direction TEXT NOT NULL, -- 'outbound' or 'inbound'
  subject TEXT,
  body TEXT,
  from_email TEXT,
  to_email TEXT,
  email_id TEXT,
  thread_id TEXT,
  status TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,      -- Used for outbound
  received_at TIMESTAMP WITH TIME ZONE,  -- Used for inbound
  read_at TIMESTAMP WITH TIME ZONE,
  processed BOOLEAN,
  requires_followup BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
);
```

## Code Changes

The following files were updated to properly use both timestamp columns:

### Updated Files:
- **[setup-database.sql](../setup-database.sql)** - Schema now includes both `sent_at` and `received_at`
- **[app/api/quotes/route.ts](../app/api/quotes/route.ts)** - Now selects both timestamps and direction

### Already Correct:
- **[lib/agent/vendorCommunicator.ts](../lib/agent/vendorCommunicator.ts)** - Sets `sent_at` for outbound emails
- **[app/api/webhooks/email/inbound/route.ts](../app/api/webhooks/email/inbound/route.ts)** - Sets `received_at` for inbound emails

## Verification

After running the migration, verify it worked correctly:

```sql
-- Check the table structure
\d vendor_communications

-- Verify outbound communications have sent_at
SELECT id, direction, sent_at, received_at
FROM vendor_communications
WHERE direction = 'outbound'
LIMIT 5;

-- Verify inbound communications have received_at
SELECT id, direction, sent_at, received_at
FROM vendor_communications
WHERE direction = 'inbound'
LIMIT 5;
```
