-- AppSumo Redemption Codes Table

CREATE TABLE IF NOT EXISTS public.appsumo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    is_used BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.appsumo_codes ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can only see their own redeemed codes
CREATE POLICY "Users can view their own redeemed codes"
    ON public.appsumo_codes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_appsumo_codes_code ON public.appsumo_codes(code);
CREATE INDEX idx_appsumo_codes_user_id ON public.appsumo_codes(user_id);

-- Note: The redemption process will be handled by the backend API using the Supabase service_role key,
-- which automatically bypasses RLS to check for available codes and update them.
