-- Migration: Update dislike system to 5-day cooldown with permanent hide on second dislike
-- Date: 2025-11-22
--
-- Requirements:
-- 1. First dislike: Hide for 5 days (was 7 days)
-- 2. Second dislike: Hide permanently
-- 3. Never show cards that have been disliked twice

-- ============================================================================
-- PART 1: Update dislikes table schema
-- ============================================================================

-- Add dislike_count to track first vs second dislike
ALTER TABLE public.dislikes
ADD COLUMN IF NOT EXISTS dislike_count INTEGER NOT NULL DEFAULT 1;

-- Add permanent_hide flag for second dislikes
ALTER TABLE public.dislikes
ADD COLUMN IF NOT EXISTS permanent_hide BOOLEAN NOT NULL DEFAULT false;

-- Create index for permanent hide filtering
CREATE INDEX IF NOT EXISTS idx_dislikes_permanent_hide ON public.dislikes(permanent_hide)
WHERE permanent_hide = true;

-- ============================================================================
-- PART 2: Update record_dislike function with new logic
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_dislike(
  p_user_id UUID,
  p_target_id UUID,
  p_target_type TEXT
)
RETURNS void AS $$
DECLARE
  v_existing_count INTEGER;
BEGIN
  -- Check if dislike already exists
  SELECT dislike_count INTO v_existing_count
  FROM public.dislikes
  WHERE user_id = p_user_id
    AND target_id = p_target_id
    AND target_type = p_target_type;

  IF v_existing_count IS NOT NULL THEN
    -- Dislike exists - this is the second (or more) dislike
    UPDATE public.dislikes
    SET
      dislike_count = dislike_count + 1,
      disliked_at = NOW(),
      -- Second dislike = permanent hide (no more cooldown)
      permanent_hide = CASE WHEN dislike_count >= 1 THEN true ELSE false END,
      -- If permanent, don't update cooldown; otherwise extend to 5 days
      cooldown_until = CASE
        WHEN dislike_count >= 1 THEN cooldown_until -- Keep existing (doesn't matter)
        ELSE NOW() + INTERVAL '5 days'
      END,
      updated_at = NOW()
    WHERE user_id = p_user_id
      AND target_id = p_target_id
      AND target_type = p_target_type;
  ELSE
    -- First dislike - insert with 5-day cooldown
    INSERT INTO public.dislikes (
      user_id,
      target_id,
      target_type,
      disliked_at,
      cooldown_until,
      dislike_count,
      permanent_hide
    ) VALUES (
      p_user_id,
      p_target_id,
      p_target_type,
      NOW(),
      NOW() + INTERVAL '5 days',
      1,
      false
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 3: Update cleanup function to only remove non-permanent dislikes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_dislikes()
RETURNS void AS $$
BEGIN
  -- Only delete dislikes that have passed cooldown AND are not permanent
  DELETE FROM public.dislikes
  WHERE cooldown_until < NOW()
    AND permanent_hide = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Create helper function to get active disliked IDs
-- ============================================================================

-- Function to get all currently disliked target IDs for a user
-- This includes both cooldown-active and permanently hidden items
CREATE OR REPLACE FUNCTION public.get_active_dislikes(
  p_user_id UUID,
  p_target_type TEXT DEFAULT NULL
)
RETURNS TABLE (target_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT d.target_id
  FROM public.dislikes d
  WHERE d.user_id = p_user_id
    AND (
      -- Permanent hide
      d.permanent_hide = true
      OR
      -- Still in cooldown period
      d.cooldown_until > NOW()
    )
    AND (p_target_type IS NULL OR d.target_type = p_target_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_active_dislikes(UUID, TEXT) TO authenticated;

-- ============================================================================
-- PART 6: Update existing 7-day dislikes to 5-day cooldown
-- ============================================================================

-- Update all existing non-permanent dislikes to use 5-day cooldown
UPDATE public.dislikes
SET cooldown_until = disliked_at + INTERVAL '5 days'
WHERE permanent_hide = false
  AND dislike_count = 1
  AND cooldown_until > NOW();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON COLUMN public.dislikes.dislike_count IS 'Number of times user has disliked this target (1 = first dislike, 2+ = permanent hide)';
COMMENT ON COLUMN public.dislikes.permanent_hide IS 'True if user has disliked twice - hide permanently';
COMMENT ON FUNCTION public.get_active_dislikes IS 'Returns all target IDs that should be hidden for a user (both cooldown and permanent)';
