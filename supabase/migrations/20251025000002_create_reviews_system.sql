-- Migration: Create reviews and ratings system
-- Allows clients to review owners/properties and vice versa

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('client_to_owner', 'owner_to_client', 'property')),

  -- Detailed rating breakdown
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Response and flags
  response_text TEXT,
  responded_at TIMESTAMPTZ,
  is_verified_stay BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,

  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: Can't review yourself
  CHECK (reviewer_id != reviewed_id)
);

-- Create index for fast review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified_stay) WHERE is_verified_stay = TRUE;

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view public reviews"
  ON public.reviews
  FOR SELECT
  USING (is_flagged = FALSE);

CREATE POLICY "Users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewed users can respond to reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = reviewed_id)
  WITH CHECK (auth.uid() = reviewed_id);

-- Create function to update profile ratings when review is added/updated
CREATE OR REPLACE FUNCTION public.update_profile_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating NUMERIC(3, 2);
  review_count INTEGER;
BEGIN
  -- Calculate new average rating for the reviewed profile
  SELECT
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE reviewed_id = COALESCE(NEW.reviewed_id, OLD.reviewed_id)
    AND is_flagged = FALSE;

  -- Update the reviewed profile
  UPDATE public.profiles
  SET
    average_rating = COALESCE(avg_rating, 0.0),
    total_reviews = review_count
  WHERE id = COALESCE(NEW.reviewed_id, OLD.reviewed_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to auto-update profile ratings
DROP TRIGGER IF EXISTS trg_update_profile_ratings ON public.reviews;
CREATE TRIGGER trg_update_profile_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_ratings();

-- Create updated_at trigger for reviews
CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reviews_updated_at();

-- Create helpful_votes table for tracking who found reviews helpful
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON public.review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON public.review_helpful_votes(user_id);

-- Enable RLS
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view helpful votes"
  ON public.review_helpful_votes
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can vote"
  ON public.review_helpful_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.review_helpful_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM public.review_helpful_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_helpful_count ON public.review_helpful_votes;
CREATE TRIGGER trg_update_helpful_count
  AFTER INSERT OR DELETE ON public.review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_helpful_count();

COMMENT ON TABLE public.reviews IS 'User reviews and ratings for clients, owners, and properties';
COMMENT ON COLUMN public.reviews.is_verified_stay IS 'TRUE if the reviewer had a confirmed booking/contract';
COMMENT ON COLUMN public.reviews.helpful_count IS 'Number of users who found this review helpful';
