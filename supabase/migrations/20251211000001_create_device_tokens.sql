-- Create device_tokens table for storing FCM/APNs tokens
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, token)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON public.device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON public.device_tokens(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own device tokens
CREATE POLICY "Users can view their own device tokens"
    ON public.device_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens"
    ON public.device_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens"
    ON public.device_tokens FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens"
    ON public.device_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can access all tokens (for sending notifications)
CREATE POLICY "Service role can access all device tokens"
    ON public.device_tokens FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update last_used_at
CREATE OR REPLACE FUNCTION update_device_token_last_used()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER device_token_updated
    BEFORE UPDATE ON public.device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_device_token_last_used();

-- Function to clean up old inactive tokens (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_inactive_device_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.device_tokens
    WHERE is_active = false
    AND updated_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
