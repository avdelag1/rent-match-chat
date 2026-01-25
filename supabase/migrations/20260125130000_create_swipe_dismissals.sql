-- Create swipe_dismissals table for tracking temporary and permanent dismissals
-- This allows users to dismiss listings/clients temporarily (20 days) or permanently (after 3rd dismiss)

CREATE TABLE IF NOT EXISTS public.swipe_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who dismissed
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was dismissed (listing or client profile)
  target_id UUID NOT NULL,

  -- Type of target ('listing' or 'client')
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'client')),

  -- Dismissal tracking
  dismiss_count INTEGER NOT NULL DEFAULT 1 CHECK (dismiss_count >= 1 AND dismiss_count <= 3),
  last_dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Permanent dismissal flag (set to true on 3rd dismiss)
  is_permanent BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint: one dismissal record per user+target combination
  UNIQUE(user_id, target_id, target_type)
);

-- Create indexes for efficient querying
CREATE INDEX idx_swipe_dismissals_user_id ON public.swipe_dismissals(user_id);
CREATE INDEX idx_swipe_dismissals_target ON public.swipe_dismissals(target_id, target_type);
CREATE INDEX idx_swipe_dismissals_user_target ON public.swipe_dismissals(user_id, target_type, is_permanent);
CREATE INDEX idx_swipe_dismissals_expiry ON public.swipe_dismissals(user_id, last_dismissed_at, is_permanent)
  WHERE is_permanent = false;

-- Enable RLS
ALTER TABLE public.swipe_dismissals ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own dismissals
CREATE POLICY "Users can view own dismissals"
  ON public.swipe_dismissals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own dismissals
CREATE POLICY "Users can insert own dismissals"
  ON public.swipe_dismissals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own dismissals (for incrementing dismiss_count)
CREATE POLICY "Users can update own dismissals"
  ON public.swipe_dismissals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own dismissals (to un-dismiss)
CREATE POLICY "Users can delete own dismissals"
  ON public.swipe_dismissals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to upsert dismissal and handle dismiss count logic
CREATE OR REPLACE FUNCTION public.dismiss_swipe_target(
  p_target_id UUID,
  p_target_type TEXT
)
RETURNS TABLE (
  is_permanent BOOLEAN,
  dismiss_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_count INTEGER;
  v_is_permanent BOOLEAN;
  v_new_count INTEGER;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if dismissal already exists
  SELECT d.dismiss_count, d.is_permanent
  INTO v_existing_count, v_is_permanent
  FROM public.swipe_dismissals d
  WHERE d.user_id = v_user_id
    AND d.target_id = p_target_id
    AND d.target_type = p_target_type;

  -- If already permanently dismissed, return existing record
  IF v_is_permanent THEN
    RETURN QUERY SELECT v_is_permanent, v_existing_count;
    RETURN;
  END IF;

  -- If exists and not permanent, check if 20 days have passed
  IF v_existing_count IS NOT NULL THEN
    -- Check if dismissal has expired (20 days)
    DECLARE
      v_last_dismissed TIMESTAMPTZ;
      v_expired BOOLEAN;
    BEGIN
      SELECT d.last_dismissed_at
      INTO v_last_dismissed
      FROM public.swipe_dismissals d
      WHERE d.user_id = v_user_id
        AND d.target_id = p_target_id
        AND d.target_type = p_target_type;

      v_expired := (now() - v_last_dismissed) > INTERVAL '20 days';

      -- If expired, reset count to 1
      IF v_expired THEN
        v_new_count := 1;
        v_is_permanent := false;
      ELSE
        -- If not expired, increment count
        v_new_count := v_existing_count + 1;
        -- Set permanent if count reaches 3
        v_is_permanent := (v_new_count >= 3);
      END IF;
    END;

    -- Update existing record
    UPDATE public.swipe_dismissals
    SET
      dismiss_count = v_new_count,
      last_dismissed_at = now(),
      is_permanent = v_is_permanent,
      updated_at = now()
    WHERE user_id = v_user_id
      AND target_id = p_target_id
      AND target_type = p_target_type;

    RETURN QUERY SELECT v_is_permanent, v_new_count;
  ELSE
    -- Insert new dismissal record
    INSERT INTO public.swipe_dismissals (
      user_id,
      target_id,
      target_type,
      dismiss_count,
      is_permanent
    ) VALUES (
      v_user_id,
      p_target_id,
      p_target_type,
      1,
      false
    );

    RETURN QUERY SELECT false::BOOLEAN, 1::INTEGER;
  END IF;
END;
$$;

-- Function to get active dismissals for a user (excluding expired temporary ones)
CREATE OR REPLACE FUNCTION public.get_active_dismissals(
  p_target_type TEXT
)
RETURNS TABLE (
  target_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT d.target_id
  FROM public.swipe_dismissals d
  WHERE d.user_id = v_user_id
    AND d.target_type = p_target_type
    AND (
      d.is_permanent = true
      OR (d.is_permanent = false AND (now() - d.last_dismissed_at) <= INTERVAL '20 days')
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.dismiss_swipe_target(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_dismissals(TEXT) TO authenticated;

-- Add comment
COMMENT ON TABLE public.swipe_dismissals IS 'Tracks temporary (20 day) and permanent (3rd dismiss) dismissals of listings and client profiles';
