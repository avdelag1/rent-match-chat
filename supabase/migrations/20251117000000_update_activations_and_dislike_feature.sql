-- Migration: Update activations to 3 and add dislike feature with 1-week cooldown
-- Date: 2025-11-17

-- ============================================================================
-- PART 1: Grant 3 free message activations to all existing users
-- ============================================================================

-- Give existing users who don't have any activations 3 free message activations
INSERT INTO public.message_activations (
  user_id,
  activation_type,
  total_activations,
  used_activations,
  expires_at
)
SELECT
  au.id as user_id,
  'pay_per_use'::text as activation_type,
  3 as total_activations,
  0 as used_activations,
  NOW() + INTERVAL '90 days' as expires_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1
  FROM public.message_activations ma
  WHERE ma.user_id = au.id
)
AND au.created_at < NOW(); -- Only existing users, not future ones

-- ============================================================================
-- PART 2: Create dislikes table with 1-week cooldown
-- ============================================================================

-- Create table to track dislikes with timestamps
CREATE TABLE IF NOT EXISTS public.dislikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- Can be listing_id or profile_id
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'profile')),
  disliked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cooldown_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one dislike record per user-target combination
  UNIQUE(user_id, target_id, target_type)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_dislikes_user_id ON public.dislikes(user_id);
CREATE INDEX IF NOT EXISTS idx_dislikes_target_id ON public.dislikes(target_id);
CREATE INDEX IF NOT EXISTS idx_dislikes_cooldown_until ON public.dislikes(cooldown_until);
CREATE INDEX IF NOT EXISTS idx_dislikes_user_target ON public.dislikes(user_id, target_id);

-- Enable RLS on dislikes table
ALTER TABLE public.dislikes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own dislikes
CREATE POLICY "Users can view their own dislikes"
  ON public.dislikes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own dislikes
CREATE POLICY "Users can insert their own dislikes"
  ON public.dislikes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own dislikes
CREATE POLICY "Users can update their own dislikes"
  ON public.dislikes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dislikes
CREATE POLICY "Users can delete their own dislikes"
  ON public.dislikes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: Create function to clean up expired dislikes
-- ============================================================================

-- Function to automatically delete expired dislikes (after cooldown period)
CREATE OR REPLACE FUNCTION public.cleanup_expired_dislikes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.dislikes
  WHERE cooldown_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Create function to upsert dislike with cooldown
-- ============================================================================

-- Function to record a dislike or update existing one
CREATE OR REPLACE FUNCTION public.record_dislike(
  p_user_id UUID,
  p_target_id UUID,
  p_target_type TEXT
)
RETURNS void AS $$
BEGIN
  -- Upsert: If dislike exists, update the cooldown; if not, insert new
  INSERT INTO public.dislikes (
    user_id,
    target_id,
    target_type,
    disliked_at,
    cooldown_until
  ) VALUES (
    p_user_id,
    p_target_id,
    p_target_type,
    NOW(),
    NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (user_id, target_id, target_type)
  DO UPDATE SET
    disliked_at = NOW(),
    cooldown_until = NOW() + INTERVAL '7 days',
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: Create function to check if item is currently disliked
-- ============================================================================

-- Function to check if a target is currently disliked (within cooldown)
CREATE OR REPLACE FUNCTION public.is_currently_disliked(
  p_user_id UUID,
  p_target_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_cooldown_until TIMESTAMPTZ;
BEGIN
  SELECT cooldown_until INTO v_cooldown_until
  FROM public.dislikes
  WHERE user_id = p_user_id
    AND target_id = p_target_id
    AND cooldown_until > NOW()
  LIMIT 1;

  RETURN v_cooldown_until IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: Modify the likes table to track dislike timestamp
-- ============================================================================

-- Add a disliked_at column to likes table to track when left swipes happened
-- This allows us to implement the 1-week cooldown for left swipes
ALTER TABLE public.likes
ADD COLUMN IF NOT EXISTS disliked_at TIMESTAMPTZ;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_likes_disliked_at ON public.likes(disliked_at)
WHERE disliked_at IS NOT NULL;

-- ============================================================================
-- PART 7: Create trigger to automatically record dislikes when left swiping
-- ============================================================================

-- Function to record dislike when user swipes left
CREATE OR REPLACE FUNCTION public.record_left_swipe_as_dislike()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record as dislike if it's a left swipe
  IF NEW.direction = 'left' THEN
    -- Determine target type based on target_id
    -- If target_id exists in listings table, it's a listing; otherwise profile
    PERFORM public.record_dislike(
      NEW.user_id,
      NEW.target_id,
      CASE
        WHEN EXISTS (SELECT 1 FROM public.listings WHERE id = NEW.target_id)
        THEN 'listing'
        ELSE 'profile'
      END
    );

    -- Also update the disliked_at timestamp in likes table
    NEW.disliked_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on likes table
DROP TRIGGER IF EXISTS record_dislike_on_left_swipe ON public.likes;
CREATE TRIGGER record_dislike_on_left_swipe
  BEFORE INSERT OR UPDATE ON public.likes
  FOR EACH ROW
  WHEN (NEW.direction = 'left')
  EXECUTE FUNCTION public.record_left_swipe_as_dislike();

-- ============================================================================
-- PART 8: Grant necessary permissions
-- ============================================================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_dislikes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_dislike(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_currently_disliked(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_left_swipe_as_dislike() TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dislikes TO authenticated;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.dislikes IS 'Tracks user dislikes with 1-week cooldown period';
COMMENT ON COLUMN public.dislikes.cooldown_until IS 'Timestamp until which the disliked item will be hidden';
COMMENT ON FUNCTION public.record_dislike IS 'Records a dislike with automatic 7-day cooldown';
COMMENT ON FUNCTION public.is_currently_disliked IS 'Checks if a target is currently within dislike cooldown period';
COMMENT ON FUNCTION public.cleanup_expired_dislikes IS 'Removes dislikes that have passed their cooldown period';
