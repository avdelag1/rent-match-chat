-- ============================================================================
-- ENHANCE REVIEWS SYSTEM: Add full rating features
-- ============================================================================

-- 1. Add missing columns to reviews table
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS reviewed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS review_type TEXT DEFAULT 'property' CHECK (review_type IN ('client_to_owner', 'owner_to_client', 'property')),
  ADD COLUMN IF NOT EXISTS review_title TEXT,
  ADD COLUMN IF NOT EXISTS cleanliness_rating INTEGER CHECK (cleanliness_rating IS NULL OR (cleanliness_rating >= 1 AND cleanliness_rating <= 5)),
  ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)),
  ADD COLUMN IF NOT EXISTS accuracy_rating INTEGER CHECK (accuracy_rating IS NULL OR (accuracy_rating >= 1 AND accuracy_rating <= 5)),
  ADD COLUMN IF NOT EXISTS location_rating INTEGER CHECK (location_rating IS NULL OR (location_rating >= 1 AND location_rating <= 5)),
  ADD COLUMN IF NOT EXISTS value_rating INTEGER CHECK (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5)),
  ADD COLUMN IF NOT EXISTS response_text TEXT,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_verified_stay BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add constraint to prevent self-reviewing (on listing)
-- Can't add CHECK on existing data, so use trigger instead
CREATE OR REPLACE FUNCTION public.prevent_self_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If reviewing a listing, check owner
  IF NEW.listing_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = NEW.listing_id AND owner_id = NEW.reviewer_id
    ) THEN
      RAISE EXCEPTION 'Cannot review your own listing';
    END IF;
  END IF;
  
  -- If reviewing a user directly
  IF NEW.reviewed_id IS NOT NULL AND NEW.reviewed_id = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Cannot review yourself';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_review ON public.reviews;
CREATE TRIGGER trg_prevent_self_review
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_review();

-- 3. Create unique constraint for one review per user per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_listing ON public.reviews (reviewer_id, listing_id) WHERE listing_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_user ON public.reviews (reviewer_id, reviewed_id) WHERE reviewed_id IS NOT NULL;

-- 4. Create review_helpful_votes table
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view helpful votes"
  ON public.review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote helpful"
  ON public.review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Add average_rating and total_reviews to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- 6. Create or update trigger to calculate profile ratings
CREATE OR REPLACE FUNCTION public.update_profile_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avg_rating NUMERIC(3, 2);
  review_count INTEGER;
  target_profile_id UUID;
BEGIN
  -- Determine which profile to update
  IF TG_OP = 'DELETE' THEN
    target_profile_id := COALESCE(OLD.reviewed_id, (SELECT owner_id FROM public.listings WHERE id = OLD.listing_id));
  ELSE
    target_profile_id := COALESCE(NEW.reviewed_id, (SELECT owner_id FROM public.listings WHERE id = NEW.listing_id));
  END IF;
  
  IF target_profile_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate new average rating for the target profile
  SELECT
    ROUND(AVG(r.rating)::numeric, 2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews r
  LEFT JOIN public.listings l ON r.listing_id = l.id
  WHERE (r.reviewed_id = target_profile_id OR l.owner_id = target_profile_id)
    AND COALESCE(r.is_flagged, false) = false;

  -- Update the profile
  UPDATE public.profiles
  SET
    average_rating = COALESCE(avg_rating, 0.0),
    total_reviews = COALESCE(review_count, 0)
  WHERE id = target_profile_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_profile_ratings ON public.reviews;
CREATE TRIGGER trg_update_profile_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_ratings();

-- 7. Fix RLS on reviews table  
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public reviews" ON public.reviews;
CREATE POLICY "Anyone can view unflagged reviews"
  ON public.reviews FOR SELECT
  USING (COALESCE(is_flagged, false) = false);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Reviewers can update their own reviews" ON public.reviews;
CREATE POLICY "Reviewers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Allow reviewed users to respond to reviews
DROP POLICY IF EXISTS "Reviewed users can respond to reviews" ON public.reviews;
CREATE POLICY "Reviewed users can respond"
  ON public.reviews FOR UPDATE
  USING (
    auth.uid() = reviewed_id 
    OR auth.uid() = (SELECT owner_id FROM public.listings WHERE id = listing_id)
  );

-- 8. Create increment helpful count function
CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert vote record (ignore if already voted)
  INSERT INTO public.review_helpful_votes (review_id, user_id)
  VALUES (p_review_id, auth.uid())
  ON CONFLICT (review_id, user_id) DO NOTHING;
  
  -- Update count on review
  UPDATE public.reviews
  SET helpful_count = (
    SELECT COUNT(*) FROM public.review_helpful_votes WHERE review_id = p_review_id
  )
  WHERE id = p_review_id;
END;
$$;

-- 9. Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.reviews (listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews (reviewed_id) WHERE reviewed_id IS NOT NULL;