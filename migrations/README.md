# Database Migrations

## How to Apply Migrations

Run the SQL files in this directory in your Supabase SQL Editor in the order they were created.

## Available Migrations

### 1. `add_sent_at_received_at_columns.sql`

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

---

### 2. `add_agent_runs_columns.sql`

**Purpose**: Adds missing columns to the agent_runs table to support AI agent functionality.

**What it does**:
1. Adds `trigger_type` - tracks how the agent was started (manual, webhook, scheduled)
2. Adds progress tracking columns:
   - `vendors_targeted` - number of vendors to contact
   - `vendors_contacted` - number of initial emails sent
   - `vendors_responded` - number of vendors who replied
   - `quotes_received` - number of complete quotes extracted
3. Adds timing column:
   - `last_activity_at` - last activity timestamp
4. Adds error tracking columns:
   - `error_count` - number of errors
   - `last_error_message` - most recent error
   - `last_error_at` - when the last error occurred
5. Adds `logs` - JSONB array to store agent activity logs
6. Updates status constraint to include all valid states
7. Creates performance indexes

**Why this was needed**:
- The original `agent_runs` table was a simplified version
- The AI agent code requires detailed tracking of:
  - Progress (how many vendors contacted/responded)
  - Errors (for debugging and monitoring)
  - Logs (activity history for each run)
- These columns enable the agent dashboard and monitoring features

**How to apply**:
1. Open your Supabase SQL Editor
2. Copy and paste the entire contents of `add_agent_runs_columns.sql`
3. Run the migration
4. Verify with: `\d agent_runs`

**Safe to run multiple times**: Yes, this migration checks if columns exist before adding them.

## After Running Migrations

### Expected Table Structures

**agent_runs** table:
```sql
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  trigger_type TEXT,                     -- 'manual', 'webhook', 'scheduled'
  status TEXT DEFAULT 'running',         -- 'running', 'completed', 'failed', 'paused'

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Progress tracking
  vendors_targeted INTEGER DEFAULT 0,
  vendors_contacted INTEGER DEFAULT 0,
  vendors_responded INTEGER DEFAULT 0,
  quotes_received INTEGER DEFAULT 0,

  -- Error tracking
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  last_error_at TIMESTAMP WITH TIME ZONE,

  -- Activity logs (JSONB array)
  logs JSONB DEFAULT '[]',

  -- Legacy fields
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);
```

**vendor_communications** table will have the following structure:

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
