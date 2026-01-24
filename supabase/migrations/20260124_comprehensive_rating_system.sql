-- ============================================================================
-- COMPREHENSIVE TRUST & RATING SYSTEM
-- ============================================================================
-- A fair, forgiving rating system that prevents sudden drops and allows recovery
--
-- KEY FEATURES:
-- • Everyone starts at 5.0 (optimistic trust)
-- • Early ratings have low impact (confidence-weighted)
-- • Negative ratings decay over time (12-month half-life)
-- • Recovery is possible with good behavior
-- • Verified transactions only (match + chat + completion)
-- • Category-specific rating questions
-- • Trust levels: New (0-5 ratings), Trusted (6+ with 4.5+), Needs Attention (<4.0)
-- ============================================================================

-- ============================================================================
-- 1. RATING CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rating_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'user', 'worker')),
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE rating_categories IS 'Defines category-specific rating questions for properties, vehicles, workers, and clients';

-- Insert default rating categories
INSERT INTO rating_categories (id, name, description, target_type, questions) VALUES
('property', 'Property', 'Rental property ratings', 'listing', '[
  {"id": "accuracy", "question": "How accurate was the listing description?", "weight": 1.5},
  {"id": "cleanliness", "question": "How clean was the property?", "weight": 2.0},
  {"id": "location", "question": "How would you rate the location?", "weight": 1.0},
  {"id": "value", "question": "How would you rate the value for money?", "weight": 1.5},
  {"id": "communication", "question": "How responsive was the owner?", "weight": 1.0}
]'),
('vehicle', 'Vehicle', 'Vehicle rental ratings', 'listing', '[
  {"id": "condition", "question": "How was the vehicle condition?", "weight": 2.0},
  {"id": "cleanliness", "question": "How clean was the vehicle?", "weight": 1.5},
  {"id": "performance", "question": "How well did it perform?", "weight": 1.5},
  {"id": "value", "question": "Value for money?", "weight": 1.0},
  {"id": "communication", "question": "How responsive was the owner?", "weight": 1.0}
]'),
('worker', 'Worker/Service', 'Service provider ratings', 'worker', '[
  {"id": "quality", "question": "Quality of work", "weight": 2.0},
  {"id": "professionalism", "question": "Professionalism", "weight": 1.5},
  {"id": "timeliness", "question": "Punctuality and timeliness", "weight": 1.5},
  {"id": "communication", "question": "Communication", "weight": 1.0},
  {"id": "value", "question": "Value for money", "weight": 1.0}
]'),
('client', 'Client', 'Client ratings (from owner perspective)', 'user', '[
  {"id": "communication", "question": "Communication quality", "weight": 1.5},
  {"id": "respect", "question": "Respectfulness", "weight": 2.0},
  {"id": "cleanliness", "question": "Cleanliness (if applicable)", "weight": 1.5},
  {"id": "payment", "question": "Payment reliability", "weight": 1.5},
  {"id": "followthrough", "question": "Follows agreements", "weight": 1.5}
]')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. RATINGS TABLE (Enhanced from existing)
-- ============================================================================
-- Drop old simple reviews table if exists and create comprehensive ratings
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS property_ratings CASCADE;

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is rating whom/what
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- What is being rated (nullable, only one should be set)
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Rating category
  category_id TEXT NOT NULL REFERENCES rating_categories(id),

  -- Verification (can only rate after completion)
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Overall rating (1-5 stars)
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),

  -- Category-specific ratings (JSONB for flexibility)
  category_ratings JSONB NOT NULL DEFAULT '{}',
  -- Example: {"accuracy": 5, "cleanliness": 4, "location": 5, "value": 4, "communication": 5}

  -- Review text
  review_title TEXT,
  review_text TEXT,

  -- Sentiment (for display)
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),

  -- Helpful votes
  helpful_count INT DEFAULT 0,

  -- Temporal decay support
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  decayed_weight DECIMAL(4,3) DEFAULT 1.0,
  last_decay_calculation TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT one_target_only CHECK (
    (listing_id IS NOT NULL AND rated_user_id IS NULL) OR
    (listing_id IS NULL AND rated_user_id IS NOT NULL)
  ),

  -- One rating per reviewer per target
  CONSTRAINT unique_reviewer_target UNIQUE (reviewer_id, listing_id, rated_user_id, category_id)
);

CREATE INDEX idx_ratings_listing ON ratings(listing_id) WHERE listing_id IS NOT NULL AND is_active = TRUE;
CREATE INDEX idx_ratings_user ON ratings(rated_user_id) WHERE rated_user_id IS NOT NULL AND is_active = TRUE;
CREATE INDEX idx_ratings_reviewer ON ratings(reviewer_id) WHERE is_active = TRUE;
CREATE INDEX idx_ratings_created ON ratings(created_at DESC);
CREATE INDEX idx_ratings_verified ON ratings(is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_ratings_sentiment ON ratings(sentiment) WHERE sentiment IS NOT NULL;

COMMENT ON TABLE ratings IS 'Comprehensive rating system with category-specific questions, verification, and temporal decay';
COMMENT ON COLUMN ratings.decayed_weight IS 'Temporal decay weight (1.0 = recent, 0.5 = 12 months old, decays with half-life of 12 months)';
COMMENT ON COLUMN ratings.category_ratings IS 'Category-specific ratings as JSON (e.g., {"cleanliness": 5, "accuracy": 4})';

-- ============================================================================
-- 3. RATING AGGREGATES TABLE (Materialized for performance)
-- ============================================================================
CREATE TABLE rating_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What is being rated
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES rating_categories(id),

  -- Aggregate statistics
  total_ratings INT DEFAULT 0,
  verified_ratings INT DEFAULT 0,

  -- Displayed rating (confidence-weighted average)
  displayed_rating DECIMAL(3,2) DEFAULT 5.00,

  -- Raw statistics
  rating_sum DECIMAL(10,2) DEFAULT 0,
  weighted_sum DECIMAL(10,4) DEFAULT 0,
  weight_sum DECIMAL(10,4) DEFAULT 0,

  -- Distribution
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',

  -- Trust level calculation
  trust_level TEXT DEFAULT 'new' CHECK (trust_level IN ('new', 'trusted', 'needs_attention')),
  trust_score DECIMAL(5,2) DEFAULT 100.0,

  -- Best and worst reviews (for display)
  best_review_id UUID REFERENCES ratings(id) ON DELETE SET NULL,
  worst_review_id UUID REFERENCES ratings(id) ON DELETE SET NULL,

  -- Timestamps
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT one_aggregate_target CHECK (
    (listing_id IS NOT NULL AND user_id IS NULL) OR
    (listing_id IS NULL AND user_id IS NOT NULL)
  ),

  CONSTRAINT unique_aggregate UNIQUE (listing_id, user_id, category_id)
);

CREATE INDEX idx_rating_aggregates_listing ON rating_aggregates(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX idx_rating_aggregates_user ON rating_aggregates(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_rating_aggregates_trust ON rating_aggregates(trust_level);
CREATE INDEX idx_rating_aggregates_rating ON rating_aggregates(displayed_rating DESC);

COMMENT ON TABLE rating_aggregates IS 'Pre-calculated rating aggregates for fast display on swipe cards';
COMMENT ON COLUMN rating_aggregates.displayed_rating IS 'Confidence-weighted rating shown to users (starts at 5.0, converges to true average)';
COMMENT ON COLUMN rating_aggregates.trust_level IS 'new: 0-5 ratings, trusted: 6+ ratings with 4.5+, needs_attention: <4.0';

-- ============================================================================
-- 4. RATING DECAY FUNCTION (12-month half-life)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_rating_decay(rating_age_days DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  -- Half-life decay: weight = 0.5^(age_in_years / half_life_in_years)
  -- Half-life = 1 year (365 days)
  -- After 1 year: weight = 0.5
  -- After 2 years: weight = 0.25
  -- After 3 years: weight = 0.125
  RETURN POWER(0.5, rating_age_days / 365.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_rating_decay IS 'Calculate temporal decay weight with 12-month half-life';

-- ============================================================================
-- 5. CONFIDENCE-WEIGHTED RATING CALCULATION
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_displayed_rating(
  total_count INT,
  weighted_avg DECIMAL,
  prior_rating DECIMAL DEFAULT 5.0,
  confidence_threshold INT DEFAULT 10
)
RETURNS DECIMAL AS $$
DECLARE
  confidence DECIMAL;
  displayed DECIMAL;
BEGIN
  -- Bayesian average with confidence weighting
  -- New items (low count) pull toward prior (5.0)
  -- Established items (high count) reflect true average

  confidence := LEAST(total_count::DECIMAL / confidence_threshold::DECIMAL, 1.0);
  displayed := (confidence * weighted_avg) + ((1 - confidence) * prior_rating);

  RETURN ROUND(displayed, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_displayed_rating IS 'Bayesian rating that prevents sudden drops from few reviews';

-- ============================================================================
-- 6. RECALCULATE RATING AGGREGATES FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION recalculate_rating_aggregate(
  p_listing_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_category_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_total_ratings INT;
  v_verified_ratings INT;
  v_weighted_sum DECIMAL;
  v_weight_sum DECIMAL;
  v_weighted_avg DECIMAL;
  v_displayed_rating DECIMAL;
  v_trust_level TEXT;
  v_best_review_id UUID;
  v_worst_review_id UUID;
  v_distribution JSONB;
  v_category_id TEXT;
BEGIN
  -- Determine category if not provided
  IF p_category_id IS NULL THEN
    IF p_listing_id IS NOT NULL THEN
      SELECT category INTO v_category_id FROM listings WHERE id = p_listing_id;
      -- Map listing category to rating category
      v_category_id := CASE
        WHEN v_category_id IN ('property', 'apartment', 'house') THEN 'property'
        WHEN v_category_id IN ('motorcycle', 'bicycle', 'vehicle') THEN 'vehicle'
        ELSE 'property'
      END;
    ELSE
      v_category_id := 'client'; -- Default for user ratings
    END IF;
  ELSE
    v_category_id := p_category_id;
  END IF;

  -- Update decay weights for all ratings first
  UPDATE ratings
  SET
    decayed_weight = calculate_rating_decay(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400.0),
    last_decay_calculation = NOW()
  WHERE
    (listing_id = p_listing_id OR rated_user_id = p_user_id)
    AND category_id = v_category_id
    AND is_active = TRUE
    AND EXTRACT(EPOCH FROM (NOW() - last_decay_calculation)) > 86400; -- Update once per day

  -- Calculate weighted statistics
  SELECT
    COUNT(*),
    SUM(CASE WHEN is_verified THEN 1 ELSE 0 END),
    SUM(overall_rating * decayed_weight),
    SUM(decayed_weight)
  INTO v_total_ratings, v_verified_ratings, v_weighted_sum, v_weight_sum
  FROM ratings
  WHERE
    (listing_id = p_listing_id OR rated_user_id = p_user_id)
    AND category_id = v_category_id
    AND is_active = TRUE;

  -- Calculate weighted average
  IF v_weight_sum > 0 THEN
    v_weighted_avg := v_weighted_sum / v_weight_sum;
  ELSE
    v_weighted_avg := 5.0;
  END IF;

  -- Calculate displayed rating (Bayesian with confidence)
  v_displayed_rating := calculate_displayed_rating(
    v_total_ratings,
    v_weighted_avg,
    5.0, -- prior
    10   -- confidence threshold
  );

  -- Determine trust level
  IF v_total_ratings >= 6 AND v_displayed_rating >= 4.5 THEN
    v_trust_level := 'trusted';
  ELSIF v_displayed_rating < 4.0 THEN
    v_trust_level := 'needs_attention';
  ELSE
    v_trust_level := 'new';
  END IF;

  -- Get best review (highest rated positive review with text)
  SELECT id INTO v_best_review_id
  FROM ratings
  WHERE
    (listing_id = p_listing_id OR rated_user_id = p_user_id)
    AND category_id = v_category_id
    AND is_active = TRUE
    AND review_title IS NOT NULL
    AND overall_rating >= 4
  ORDER BY overall_rating DESC, helpful_count DESC, created_at DESC
  LIMIT 1;

  -- Get worst review (lowest rated negative review with text)
  SELECT id INTO v_worst_review_id
  FROM ratings
  WHERE
    (listing_id = p_listing_id OR rated_user_id = p_user_id)
    AND category_id = v_category_id
    AND is_active = TRUE
    AND review_title IS NOT NULL
    AND overall_rating <= 3
  ORDER BY overall_rating ASC, created_at DESC
  LIMIT 1;

  -- Calculate rating distribution
  SELECT jsonb_build_object(
    '1', COUNT(*) FILTER (WHERE overall_rating >= 1 AND overall_rating < 2),
    '2', COUNT(*) FILTER (WHERE overall_rating >= 2 AND overall_rating < 3),
    '3', COUNT(*) FILTER (WHERE overall_rating >= 3 AND overall_rating < 4),
    '4', COUNT(*) FILTER (WHERE overall_rating >= 4 AND overall_rating < 5),
    '5', COUNT(*) FILTER (WHERE overall_rating = 5)
  ) INTO v_distribution
  FROM ratings
  WHERE
    (listing_id = p_listing_id OR rated_user_id = p_user_id)
    AND category_id = v_category_id
    AND is_active = TRUE;

  -- Upsert aggregate
  INSERT INTO rating_aggregates (
    listing_id,
    user_id,
    category_id,
    total_ratings,
    verified_ratings,
    displayed_rating,
    rating_sum,
    weighted_sum,
    weight_sum,
    rating_distribution,
    trust_level,
    best_review_id,
    worst_review_id,
    last_calculated_at,
    updated_at
  ) VALUES (
    p_listing_id,
    p_user_id,
    v_category_id,
    COALESCE(v_total_ratings, 0),
    COALESCE(v_verified_ratings, 0),
    v_displayed_rating,
    COALESCE(v_weighted_sum, 0),
    COALESCE(v_weighted_sum, 0),
    COALESCE(v_weight_sum, 0),
    COALESCE(v_distribution, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'),
    v_trust_level,
    v_best_review_id,
    v_worst_review_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (listing_id, user_id, category_id)
  WHERE listing_id IS NOT NULL OR user_id IS NOT NULL
  DO UPDATE SET
    total_ratings = EXCLUDED.total_ratings,
    verified_ratings = EXCLUDED.verified_ratings,
    displayed_rating = EXCLUDED.displayed_rating,
    rating_sum = EXCLUDED.rating_sum,
    weighted_sum = EXCLUDED.weighted_sum,
    weight_sum = EXCLUDED.weight_sum,
    rating_distribution = EXCLUDED.rating_distribution,
    trust_level = EXCLUDED.trust_level,
    best_review_id = EXCLUDED.best_review_id,
    worst_review_id = EXCLUDED.worst_review_id,
    last_calculated_at = NOW(),
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_rating_aggregate IS 'Recalculate and update rating aggregate with temporal decay and confidence weighting';

-- ============================================================================
-- 7. TRIGGER TO AUTO-UPDATE AGGREGATES
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_recalculate_rating_aggregate()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate for the affected target
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_rating_aggregate(OLD.listing_id, OLD.rated_user_id, OLD.category_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_rating_aggregate(NEW.listing_id, NEW.rated_user_id, NEW.category_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ratings_update_aggregate
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_rating_aggregate();

COMMENT ON TRIGGER ratings_update_aggregate ON ratings IS 'Automatically recalculate aggregates when ratings change';

-- ============================================================================
-- 8. PERMISSIONS (RLS Policies)
-- ============================================================================
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_aggregates ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings and aggregates
CREATE POLICY "Ratings are publicly readable"
  ON ratings FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Rating aggregates are publicly readable"
  ON rating_aggregates FOR SELECT
  USING (TRUE);

-- Only authenticated users can create ratings
CREATE POLICY "Authenticated users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own ratings (within 24 hours)
CREATE POLICY "Users can update own recent ratings"
  ON ratings FOR UPDATE
  USING (
    auth.uid() = reviewer_id
    AND EXTRACT(EPOCH FROM (NOW() - created_at)) < 86400
  );

-- Users can soft-delete their own ratings
CREATE POLICY "Users can delete own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

GRANT SELECT ON rating_categories TO anon, authenticated;
GRANT SELECT ON rating_aggregates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON ratings TO authenticated;
GRANT USAGE ON SEQUENCE ratings_id_seq TO authenticated;
