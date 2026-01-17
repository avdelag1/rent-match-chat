-- =====================================================
-- Swipe Undo Tracking System
-- Track daily undo usage and add premium unlimited undo
-- =====================================================

-- Create table to track daily undo usage
CREATE TABLE IF NOT EXISTS public.swipe_undo_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  undo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  undo_count INTEGER NOT NULL DEFAULT 0,
  last_undo_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one row per user per day
  UNIQUE(user_id, undo_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_swipe_undo_tracking_user_date
  ON public.swipe_undo_tracking(user_id, undo_date);

-- Enable RLS
ALTER TABLE public.swipe_undo_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view and update their own undo tracking
CREATE POLICY "Users can view own undo tracking"
  ON public.swipe_undo_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own undo tracking"
  ON public.swipe_undo_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own undo tracking"
  ON public.swipe_undo_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get or create today's undo tracking record
CREATE OR REPLACE FUNCTION public.get_or_create_undo_tracking(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  undo_date DATE,
  undo_count INTEGER,
  last_undo_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert if not exists, then return
  INSERT INTO public.swipe_undo_tracking (user_id, undo_date, undo_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, undo_date)
  DO UPDATE SET updated_at = now()
  RETURNING
    swipe_undo_tracking.id,
    swipe_undo_tracking.user_id,
    swipe_undo_tracking.undo_date,
    swipe_undo_tracking.undo_count,
    swipe_undo_tracking.last_undo_at
  INTO
    id,
    user_id,
    undo_date,
    undo_count,
    last_undo_at;

  RETURN NEXT;
END;
$$;

-- Function to increment undo count
CREATE OR REPLACE FUNCTION public.increment_undo_count(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure record exists for today
  INSERT INTO public.swipe_undo_tracking (user_id, undo_date, undo_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, undo_date) DO NOTHING;

  -- Increment count
  UPDATE public.swipe_undo_tracking
  SET
    undo_count = undo_count + 1,
    last_undo_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id
    AND undo_date = CURRENT_DATE;

  RETURN TRUE;
END;
$$;

-- Add unlimited_undo_rewind column to subscription_packages
ALTER TABLE public.subscription_packages
ADD COLUMN IF NOT EXISTS unlimited_undo_rewind BOOLEAN DEFAULT FALSE;

-- Update premium tiers to include unlimited undo
UPDATE public.subscription_packages
SET unlimited_undo_rewind = TRUE
WHERE tier IN ('gold', 'platinum', 'silver')
  OR name ILIKE '%premium%'
  OR name ILIKE '%vip%'
  OR name ILIKE '%unlimited%';

-- Create a function to check if user has unlimited undo
CREATE OR REPLACE FUNCTION public.has_unlimited_undo(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_feature BOOLEAN;
BEGIN
  SELECT COALESCE(
    (
      SELECT sp.unlimited_undo_rewind
      FROM public.user_subscriptions us
      INNER JOIN public.subscription_packages sp ON us.subscription_package_id = sp.id
      WHERE us.user_id = p_user_id
        AND us.is_active = TRUE
        AND sp.unlimited_undo_rewind = TRUE
      LIMIT 1
    ),
    FALSE
  ) INTO has_feature;

  RETURN has_feature;
END;
$$;

-- Clean up old tracking records (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_undo_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.swipe_undo_tracking
  WHERE undo_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_undo_tracking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_undo_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_unlimited_undo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_undo_tracking() TO authenticated;

COMMENT ON TABLE public.swipe_undo_tracking IS 'Tracks daily undo usage per user for swipe cards';
COMMENT ON FUNCTION public.get_or_create_undo_tracking(UUID) IS 'Gets or creates today''s undo tracking record for a user';
COMMENT ON FUNCTION public.increment_undo_count(UUID) IS 'Increments the undo count for today';
COMMENT ON FUNCTION public.has_unlimited_undo(UUID) IS 'Checks if user has unlimited undo from premium subscription';
COMMENT ON FUNCTION public.cleanup_old_undo_tracking() IS 'Removes undo tracking records older than 30 days';
