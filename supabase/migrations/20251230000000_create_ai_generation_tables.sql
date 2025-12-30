-- Migration: Create AI Generation Usage Tracking
-- File: supabase/migrations/20251230000000_create_ai_generation_tables.sql

-- Table to track AI generation usage per user
CREATE TABLE IF NOT EXISTS ai_generation_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL CHECK (category IN ('property', 'vehicle', 'worker')),
  listing_type TEXT, -- 'apartment', 'car', 'cleaner', etc.
  is_premium_usage BOOLEAN DEFAULT FALSE,
  generation_method TEXT CHECK (generation_method IN ('template', 'ai')),
  success BOOLEAN DEFAULT TRUE
);

-- Index for fast user lookups
CREATE INDEX idx_ai_generation_usage_user_id ON ai_generation_usage(user_id);
CREATE INDEX idx_ai_generation_usage_created_at ON ai_generation_usage(created_at);

-- Add subscription tier to user profiles if it doesn't exist
-- Assuming you have a profiles table, adjust the table name if different
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'basic', 'premium', 'pro'));
  END IF;
END $$;

-- Function to check if user has AI generations remaining
CREATE OR REPLACE FUNCTION check_ai_generations_remaining(p_user_id UUID)
RETURNS TABLE (
  has_remaining BOOLEAN,
  used_count INTEGER,
  limit_count INTEGER,
  is_premium BOOLEAN
) AS $$
DECLARE
  v_tier TEXT;
  v_used INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;

  -- Premium users have unlimited
  IF v_tier IN ('premium', 'pro') THEN
    RETURN QUERY SELECT TRUE, 0, -1, TRUE;
    RETURN;
  END IF;

  -- Count AI generations this month for free/basic users
  SELECT COUNT(*) INTO v_used
  FROM ai_generation_usage
  WHERE user_id = p_user_id
    AND generation_method = 'ai'
    AND created_at >= DATE_TRUNC('month', NOW());

  -- Free tier gets 3 per month
  RETURN QUERY SELECT
    (v_used < 3) as has_remaining,
    v_used,
    3 as limit_count,
    FALSE as is_premium;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE ai_generation_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own AI usage"
  ON ai_generation_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own usage records
CREATE POLICY "Users can insert own AI usage"
  ON ai_generation_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON ai_generation_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_ai_generations_remaining TO authenticated;
