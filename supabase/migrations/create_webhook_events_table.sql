-- Table to store incoming webhook events from Resend
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Event metadata
    event_type TEXT NOT NULL, -- e.g., 'email.delivered', 'email.bounced', 'email.opened'
    provider TEXT NOT NULL DEFAULT 'resend',

    -- Raw webhook data
    payload JSONB NOT NULL,

    -- Processing status
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processing_error TEXT,

    -- Link to vendor communication if applicable
    vendor_communication_id UUID REFERENCES vendor_communications(id),

    -- Indexing for quick lookups
    CONSTRAINT webhook_events_event_type_check CHECK (event_type IN (
        'email.sent',
        'email.delivered',
        'email.bounced',
        'email.opened',
        'email.clicked',
        'email.complained',
        'email.delivery_delayed',
        'email.received'  -- Inbound emails from Resend
    ))
);

-- Indexes for performance
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_vendor_communication_id ON webhook_events(vendor_communication_id);

-- RLS Policies (webhooks are system-level, not user-specific)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert webhook events
CREATE POLICY "Service role can insert webhook events"
    ON webhook_events
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow service role and authenticated users to read their related webhooks
CREATE POLICY "Service role can read all webhook events"
    ON webhook_events
    FOR SELECT
    TO service_role
    USING (true);

-- Users can only see webhook events related to their communications
CREATE POLICY "Users can read their own webhook events"
    ON webhook_events
    FOR SELECT
    TO authenticated
    USING (
        vendor_communication_id IN (
            SELECT vc.id
            FROM vendor_communications vc
            JOIN events e ON vc.event_id = e.id
            JOIN venues v ON e.venue_id = v.id
            WHERE v.owner_id = auth.uid()
        )
    );

-- Service role can update processing status
CREATE POLICY "Service role can update webhook events"
    ON webhook_events
    FOR UPDATE
    TO service_role
    USING (true);

COMMENT ON TABLE webhook_events IS 'Stores incoming webhook events from email providers (Resend) for async processing';
COMMENT ON COLUMN webhook_events.event_type IS 'Type of webhook event received';
COMMENT ON COLUMN webhook_events.payload IS 'Full webhook payload as JSON';
COMMENT ON COLUMN webhook_events.processed IS 'Whether this event has been processed by the agent';
