-- Migration: Create saved searches system with alerts
-- Allows users to save search criteria and get notified of new matches

-- Create saved searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Search criteria (stored as JSONB for flexibility)
  search_criteria JSONB NOT NULL DEFAULT '{}',

  -- Alert settings
  alerts_enabled BOOLEAN DEFAULT TRUE,
  alert_frequency TEXT DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  last_alerted_at TIMESTAMPTZ,

  -- Tracking
  match_count INTEGER DEFAULT 0,
  last_match_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create saved search matches table (to track which listings have been seen)
CREATE TABLE IF NOT EXISTS public.saved_search_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID NOT NULL REFERENCES public.saved_searches(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  match_percentage INTEGER NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(saved_search_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_search_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage their own saved searches"
  ON public.saved_searches
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for saved_search_matches
CREATE POLICY "Users can view matches for their saved searches"
  ON public.saved_search_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_searches
      WHERE saved_searches.id = saved_search_matches.saved_search_id
      AND saved_searches.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert match records"
  ON public.saved_search_matches
  FOR INSERT
  WITH CHECK (true); -- Will be inserted by backend functions

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON public.saved_searches(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_saved_search_matches_search_id ON public.saved_search_matches(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_matches_listing_id ON public.saved_search_matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_matches_notified ON public.saved_search_matches(saved_search_id, notified) WHERE notified = FALSE;

-- Update trigger for updated_at
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check saved searches against new listings
CREATE OR REPLACE FUNCTION public.check_saved_searches_for_listing(p_listing_id UUID)
RETURNS void AS $$
DECLARE
  v_search RECORD;
  v_listing RECORD;
  v_match_percentage INTEGER;
  v_criteria JSONB;
BEGIN
  -- Get the listing details
  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;

  IF v_listing IS NULL THEN
    RETURN;
  END IF;

  -- Loop through all active saved searches
  FOR v_search IN
    SELECT * FROM public.saved_searches
    WHERE is_active = TRUE
    AND alerts_enabled = TRUE
  LOOP
    v_criteria := v_search.search_criteria;
    v_match_percentage := 0;

    -- Simple matching logic (can be enhanced)
    -- Price range check
    IF v_criteria ? 'min_price' AND v_criteria ? 'max_price' THEN
      IF v_listing.price >= (v_criteria->>'min_price')::NUMERIC
         AND v_listing.price <= (v_criteria->>'max_price')::NUMERIC THEN
        v_match_percentage := v_match_percentage + 30;
      END IF;
    END IF;

    -- Property type check
    IF v_criteria ? 'property_type' THEN
      IF v_listing.property_type = (v_criteria->>'property_type') THEN
        v_match_percentage := v_match_percentage + 20;
      END IF;
    END IF;

    -- Category check
    IF v_criteria ? 'category' THEN
      IF v_listing.category = (v_criteria->>'category') THEN
        v_match_percentage := v_match_percentage + 20;
      END IF;
    END IF;

    -- Location check
    IF v_criteria ? 'city' THEN
      IF v_listing.city ILIKE '%' || (v_criteria->>'city') || '%' THEN
        v_match_percentage := v_match_percentage + 30;
      END IF;
    END IF;

    -- If match percentage is high enough, save it
    IF v_match_percentage >= 50 THEN
      -- Insert or update match record
      INSERT INTO public.saved_search_matches (
        saved_search_id,
        listing_id,
        match_percentage,
        notified,
        notified_at
      ) VALUES (
        v_search.id,
        p_listing_id,
        v_match_percentage,
        FALSE,
        NULL
      )
      ON CONFLICT (saved_search_id, listing_id)
      DO UPDATE SET match_percentage = EXCLUDED.match_percentage;

      -- Update saved search stats
      UPDATE public.saved_searches
      SET
        match_count = match_count + 1,
        last_match_at = NOW()
      WHERE id = v_search.id;

      -- Create notification for user (instant alerts)
      IF v_search.alert_frequency = 'instant' THEN
        INSERT INTO public.notifications (
          user_id,
          notification_type,
          title,
          message,
          link_url
        ) VALUES (
          v_search.user_id,
          'property_inquiry',
          'New Match for Saved Search',
          format('"%s" has a new %d%% match!', v_search.name, v_match_percentage),
          '/client/dashboard'
        );

        -- Update last alerted timestamp
        UPDATE public.saved_searches
        SET last_alerted_at = NOW()
        WHERE id = v_search.id;

        -- Mark match as notified
        UPDATE public.saved_search_matches
        SET notified = TRUE, notified_at = NOW()
        WHERE saved_search_id = v_search.id AND listing_id = p_listing_id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically check saved searches when new listing is created
CREATE OR REPLACE FUNCTION public.trigger_check_saved_searches()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for new active listings
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active'))
     AND NEW.is_active = TRUE THEN
    PERFORM public.check_saved_searches_for_listing(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_check_saved_searches_on_listing ON public.listings;
CREATE TRIGGER trigger_check_saved_searches_on_listing
  AFTER INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_saved_searches();

-- Add comments
COMMENT ON TABLE public.saved_searches IS 'Stores user saved search criteria with alert preferences';
COMMENT ON TABLE public.saved_search_matches IS 'Tracks which listings match which saved searches';
COMMENT ON COLUMN public.saved_searches.search_criteria IS 'JSONB object containing search filters (price range, location, property type, etc.)';
COMMENT ON COLUMN public.saved_searches.alert_frequency IS 'How often to send alerts: instant, daily, or weekly';

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Saved searches system created successfully:';
  RAISE NOTICE '  - saved_searches table with alert settings';
  RAISE NOTICE '  - saved_search_matches tracking table';
  RAISE NOTICE '  - Automatic match detection on new listings';
  RAISE NOTICE '  - Instant notification support';
  RAISE NOTICE '  - RLS policies for security';
END $$;
