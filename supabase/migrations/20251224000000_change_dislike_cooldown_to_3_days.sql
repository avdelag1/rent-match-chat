-- Migration: Change dislike cooldown from 7 days to 3 days
-- After 3 days of disliking a listing/profile, it disappears permanently

-- PART 1: Update the record_dislike function to use 3-day cooldown
CREATE OR REPLACE FUNCTION public.record_dislike(
  p_user_id UUID,
  p_target_id UUID,
  p_target_type TEXT DEFAULT 'listing'
)
RETURNS VOID AS $$
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
    NOW() + INTERVAL '3 days'  -- Changed from 7 days to 3 days
  )
  ON CONFLICT (user_id, target_id, target_type)
  DO UPDATE SET
    disliked_at = NOW(),
    cooldown_until = NOW() + INTERVAL '3 days',  -- Changed from 7 days to 3 days
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 2: Update the record_left_swipe_as_dislike trigger function
CREATE OR REPLACE FUNCTION public.record_left_swipe_as_dislike()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record as dislike if it's a left swipe
  IF NEW.direction = 'left' THEN
    -- Call the record_dislike function with 3-day cooldown
    PERFORM public.record_dislike(
      NEW.user_id,
      NEW.target_id,
      COALESCE(
        (SELECT CASE WHEN EXISTS (SELECT 1 FROM public.listings WHERE id = NEW.target_id) THEN 'listing' ELSE 'profile' END),
        'profile'
      )
    );

    -- Also update the disliked_at timestamp in likes table
    NEW.disliked_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 3: Add function to check if item is permanently hidden (cooldown expired = permanent)
-- Items that have passed the 3-day cooldown should never be shown again
CREATE OR REPLACE FUNCTION public.is_permanently_hidden(
  p_user_id UUID,
  p_target_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_cooldown_until TIMESTAMPTZ;
  v_disliked_at TIMESTAMPTZ;
BEGIN
  SELECT cooldown_until, disliked_at INTO v_cooldown_until, v_disliked_at
  FROM public.dislikes
  WHERE user_id = p_user_id
    AND target_id = p_target_id
  LIMIT 1;

  -- If no record, not hidden
  IF v_disliked_at IS NULL THEN
    RETURN FALSE;
  END IF;

  -- If cooldown has passed, permanently hidden
  RETURN v_cooldown_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 4: Add function to get disliked items still within cooldown (for refresh)
-- These are the items that can still be shown on manual refresh
CREATE OR REPLACE FUNCTION public.get_refreshable_dislikes(
  p_user_id UUID,
  p_target_type TEXT DEFAULT NULL
)
RETURNS TABLE (target_id UUID, disliked_at TIMESTAMPTZ, cooldown_until TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT d.target_id, d.disliked_at, d.cooldown_until
  FROM public.dislikes d
  WHERE d.user_id = p_user_id
    AND d.cooldown_until > NOW()  -- Still within cooldown (can be refreshed)
    AND (p_target_type IS NULL OR d.target_type = p_target_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 5: Add function to get permanently hidden items
-- These should NEVER be shown again
CREATE OR REPLACE FUNCTION public.get_permanently_hidden(
  p_user_id UUID,
  p_target_type TEXT DEFAULT NULL
)
RETURNS TABLE (target_id UUID, disliked_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT d.target_id, d.disliked_at
  FROM public.dislikes d
  WHERE d.user_id = p_user_id
    AND d.cooldown_until < NOW()  -- Cooldown passed = permanent
    AND (p_target_type IS NULL OR d.target_type = p_target_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_permanently_hidden(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_refreshable_dislikes(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_permanently_hidden(UUID, TEXT) TO authenticated;

-- Update comments
COMMENT ON FUNCTION public.record_dislike IS 'Records a dislike with automatic 3-day cooldown. After 3 days, item is permanently hidden.';
COMMENT ON FUNCTION public.is_permanently_hidden IS 'Checks if a target is permanently hidden (3-day cooldown has passed)';
COMMENT ON FUNCTION public.get_refreshable_dislikes IS 'Gets dislikes still within 3-day cooldown that can be shown on manual refresh';
COMMENT ON FUNCTION public.get_permanently_hidden IS 'Gets dislikes that have passed 3-day cooldown and should never be shown again';
