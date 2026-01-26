-- =====================================================
-- CORRECTED APP IMPROVEMENTS
-- Created: 2026-01-26
-- Purpose: Performance indexes, matching algorithm, analytics, search
-- Based on ACTUAL database schema (likes.target_id, reviews.reviewed_id, etc.)
-- =====================================================

-- =====================================================
-- PART 1: PERFORMANCE INDEXES
-- =====================================================

-- Likes table indexes (target_id is correct column name)
CREATE INDEX IF NOT EXISTS idx_likes_user_target_created
  ON likes(user_id, target_id, created_at DESC);

-- Conversations indexes (client_id, not user_id)
CREATE INDEX IF NOT EXISTS idx_conversations_participants_updated
  ON conversations(client_id, owner_id, updated_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON conversation_messages(conversation_id, created_at DESC);

-- Unread messages index (is_read, not read_at)
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON conversation_messages(receiver_id, is_read)
  WHERE is_read = false;

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_active_type_city
  ON listings(listing_type, city, created_at DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_listings_owner_active
  ON listings(owner_id, is_active, created_at DESC);

-- Owner likes index
CREATE INDEX IF NOT EXISTS idx_owner_likes_owner_created
  ON owner_likes(owner_id, created_at DESC);

-- Reviews index (reviewed_id is correct column)
CREATE INDEX IF NOT EXISTS idx_reviews_rating
  ON reviews(rating DESC, created_at DESC);

-- Full-text search index on listings
CREATE INDEX IF NOT EXISTS idx_listings_search
  ON listings USING gin(to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(neighborhood, '')
  ));

-- =====================================================
-- PART 2: SMART MATCHING FUNCTION
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS calculate_match_score(uuid, uuid);

-- Function to calculate compatibility score between client and listing
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_client_id UUID,
  p_listing_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 0;
  v_client_profile RECORD;
  v_listing RECORD;
  v_client_avg_rating NUMERIC;
  v_owner_avg_rating NUMERIC;
BEGIN
  -- Get client profile
  SELECT * INTO v_client_profile FROM client_profiles WHERE user_id = p_client_id;

  -- Get listing details
  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id;

  -- Return 0 if listing not found
  IF v_listing IS NULL THEN RETURN 0; END IF;

  -- Get average ratings from reviews table (reviewed_id is correct column)
  SELECT COALESCE(AVG(rating), 0) INTO v_client_avg_rating
  FROM reviews WHERE reviewed_id = p_client_id;

  SELECT COALESCE(AVG(rating), 0) INTO v_owner_avg_rating
  FROM reviews WHERE reviewed_id = v_listing.owner_id;

  -- Base score for active listing
  IF v_listing.is_active THEN
    v_score := v_score + 10;
  END IF;

  -- Price compatibility (within budget)
  IF v_client_profile IS NOT NULL AND v_client_profile.max_budget IS NOT NULL AND v_listing.price IS NOT NULL THEN
    IF v_listing.price <= v_client_profile.max_budget THEN
      v_score := v_score + 20;
      IF v_listing.price <= v_client_profile.max_budget * 0.8 THEN
        v_score := v_score + 10;
      END IF;
    ELSE
      v_score := v_score - 30;
    END IF;
  END IF;

  -- Location match
  IF v_client_profile IS NOT NULL AND v_client_profile.preferred_location IS NOT NULL AND v_listing.city IS NOT NULL THEN
    IF v_client_profile.preferred_location = v_listing.city THEN
      v_score := v_score + 15;
    END IF;
  END IF;

  -- Client rating bonus
  IF v_client_avg_rating >= 4.5 THEN v_score := v_score + 15;
  ELSIF v_client_avg_rating >= 4.0 THEN v_score := v_score + 10;
  ELSIF v_client_avg_rating >= 3.5 THEN v_score := v_score + 5;
  END IF;

  -- Owner rating bonus
  IF v_owner_avg_rating >= 4.5 THEN v_score := v_score + 15;
  ELSIF v_owner_avg_rating >= 4.0 THEN v_score := v_score + 10;
  ELSIF v_owner_avg_rating >= 3.5 THEN v_score := v_score + 5;
  END IF;

  -- Recency bonus
  IF v_listing.created_at > NOW() - INTERVAL '7 days' THEN
    v_score := v_score + 8;
  ELSIF v_listing.created_at > NOW() - INTERVAL '30 days' THEN
    v_score := v_score + 4;
  END IF;

  RETURN GREATEST(v_score, 0);
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION calculate_match_score(UUID, UUID) TO authenticated;

-- =====================================================
-- PART 3: FULL-TEXT SEARCH FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS search_listings(TEXT, TEXT, NUMERIC, NUMERIC, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION search_listings(
  p_search_query TEXT,
  p_listing_type TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
  listing_id UUID,
  title TEXT,
  description TEXT,
  listing_type TEXT,
  price NUMERIC,
  city TEXT,
  owner_id UUID,
  search_rank REAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.description,
    l.listing_type,
    l.price,
    l.city,
    l.owner_id,
    ts_rank(
      to_tsvector('english',
        coalesce(l.title, '') || ' ' ||
        coalesce(l.description, '') || ' ' ||
        coalesce(l.city, '') || ' ' ||
        coalesce(l.neighborhood, '')
      ),
      plainto_tsquery('english', p_search_query)
    ) as search_rank,
    l.created_at
  FROM listings l
  WHERE l.is_active = true
    AND (p_listing_type IS NULL OR l.listing_type = p_listing_type)
    AND (p_min_price IS NULL OR l.price >= p_min_price)
    AND (p_max_price IS NULL OR l.price <= p_max_price)
    AND (p_city IS NULL OR l.city ILIKE p_city)
    AND to_tsvector('english',
        coalesce(l.title, '') || ' ' ||
        coalesce(l.description, '') || ' ' ||
        coalesce(l.city, '') || ' ' ||
        coalesce(l.neighborhood, '')
      ) @@ plainto_tsquery('english', p_search_query)
  ORDER BY search_rank DESC, l.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION search_listings(TEXT, TEXT, NUMERIC, NUMERIC, TEXT, INTEGER) TO authenticated;

-- =====================================================
-- PART 4: ANALYTICS MATERIALIZED VIEWS
-- =====================================================

-- Owner Dashboard Statistics
DROP MATERIALIZED VIEW IF EXISTS owner_dashboard_stats;
CREATE MATERIALIZED VIEW owner_dashboard_stats AS
SELECT
  p.id as owner_id,
  COUNT(DISTINCT l.id) as total_listings,
  COUNT(DISTINCT l.id) FILTER (WHERE l.is_active = true) as active_listings,
  COUNT(DISTINCT lk.id) as total_likes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.created_at > NOW() - INTERVAL '7 days') as likes_last_7_days,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.created_at > NOW() - INTERVAL '30 days') as likes_last_30_days,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT c.id) FILTER (WHERE c.created_at > NOW() - INTERVAL '7 days') as new_conversations_7_days,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(r.id) as total_reviews,
  MAX(l.updated_at) as last_listing_update,
  MAX(c.updated_at) as last_conversation_activity
FROM profiles p
LEFT JOIN listings l ON l.owner_id = p.id
LEFT JOIN likes lk ON lk.target_id = l.id AND lk.direction = 'right'
LEFT JOIN conversations c ON c.owner_id = p.id
LEFT JOIN reviews r ON r.reviewed_id = p.id
GROUP BY p.id;

CREATE UNIQUE INDEX ON owner_dashboard_stats(owner_id);

-- Listing Performance Analytics
DROP MATERIALIZED VIEW IF EXISTS listing_analytics;
CREATE MATERIALIZED VIEW listing_analytics AS
SELECT
  l.id as listing_id,
  l.owner_id,
  l.title,
  l.listing_type,
  l.city,
  l.price,
  l.created_at,
  COUNT(DISTINCT lk.id) as total_views,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'right') as total_likes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'left') as total_dislikes,
  CASE
    WHEN COUNT(DISTINCT lk.id) > 0
    THEN (COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'right')::float / COUNT(DISTINCT lk.id)) * 100
    ELSE 0
  END as like_rate_percentage,
  COUNT(DISTINCT c.id) as conversations_started,
  COUNT(DISTINCT lk.user_id) FILTER (WHERE lk.created_at > NOW() - INTERVAL '7 days') as unique_viewers_7_days,
  COUNT(DISTINCT lk.user_id) FILTER (WHERE lk.created_at > NOW() - INTERVAL '30 days') as unique_viewers_30_days,
  MAX(lk.created_at) as last_interaction
FROM listings l
LEFT JOIN likes lk ON lk.target_id = l.id
LEFT JOIN conversations c ON c.listing_id = l.id
GROUP BY l.id, l.owner_id, l.title, l.listing_type, l.city, l.price, l.created_at;

CREATE UNIQUE INDEX ON listing_analytics(listing_id);
CREATE INDEX ON listing_analytics(owner_id, like_rate_percentage DESC);

-- Client Engagement Metrics
DROP MATERIALIZED VIEW IF EXISTS client_engagement_metrics;
CREATE MATERIALIZED VIEW client_engagement_metrics AS
SELECT
  p.id as client_id,
  COUNT(DISTINCT lk.id) as total_swipes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'right') as total_likes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'left') as total_dislikes,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT cm.id) as total_messages_sent,
  COUNT(DISTINCT ol.id) as owner_likes_received,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(r.id) as total_reviews,
  MAX(lk.created_at) as last_swipe,
  MAX(cm.created_at) as last_message_sent,
  EXTRACT(EPOCH FROM (NOW() - MAX(lk.created_at))) / 86400 as days_since_last_active
FROM profiles p
LEFT JOIN likes lk ON lk.user_id = p.id
LEFT JOIN conversations c ON c.client_id = p.id
LEFT JOIN conversation_messages cm ON cm.sender_id = p.id
LEFT JOIN owner_likes ol ON ol.client_id = p.id AND ol.direction = 'right'
LEFT JOIN reviews r ON r.reviewed_id = p.id
GROUP BY p.id;

CREATE UNIQUE INDEX ON client_engagement_metrics(client_id);
CREATE INDEX ON client_engagement_metrics(days_since_last_active);

-- =====================================================
-- PART 5: REFRESH ANALYTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS TEXT AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY owner_dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY listing_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY client_engagement_metrics;
  RETURN 'Analytics views refreshed at ' || NOW()::TEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION refresh_analytics_views() TO service_role;

-- =====================================================
-- PART 6: CLEANUP & MAINTENANCE FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION archive_inactive_conversations(
  p_days_inactive INTEGER DEFAULT 180
) RETURNS INTEGER AS $$
DECLARE
  v_archived_count INTEGER;
BEGIN
  WITH archived AS (
    UPDATE conversations
    SET deleted_at = NOW()
    WHERE deleted_at IS NULL
      AND updated_at < NOW() - (p_days_inactive || ' days')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM conversation_messages cm
        WHERE cm.conversation_id = conversations.id
        AND cm.created_at > NOW() - (p_days_inactive || ' days')::INTERVAL
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_archived_count FROM archived;
  RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION flag_stale_listings(
  p_days_stale INTEGER DEFAULT 90
) RETURNS TABLE (
  listing_id UUID,
  owner_id UUID,
  title TEXT,
  days_since_update INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.owner_id,
    l.title,
    EXTRACT(EPOCH FROM (NOW() - l.updated_at))::INTEGER / 86400 as days_since_update
  FROM listings l
  WHERE l.is_active = true
    AND l.updated_at < NOW() - (p_days_stale || ' days')::INTERVAL
    AND NOT EXISTS (
      SELECT 1 FROM likes lk
      WHERE lk.target_id = l.id
      AND lk.created_at > NOW() - INTERVAL '30 days'
    )
  ORDER BY days_since_update DESC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_platform_statistics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_clients', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'client'),
    'total_owners', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'owner'),
    'active_listings', (SELECT COUNT(*) FROM listings WHERE is_active = true),
    'total_conversations', (
      SELECT COUNT(*) FROM conversations
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'total_messages', (
      SELECT COUNT(*) FROM conversation_messages
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'avg_listing_price', (
      SELECT ROUND(AVG(price)::numeric, 2) FROM listings
      WHERE is_active = true AND price IS NOT NULL
    ),
    'avg_user_rating', (
      SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews
    ),
    'new_users_period', (
      SELECT COUNT(*) FROM profiles
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'period_start', p_start_date,
    'period_end', p_end_date
  ) INTO v_stats;
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_platform_statistics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_inactive_conversations(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION flag_stale_listings(INTEGER) TO service_role;

-- =====================================================
-- PART 7: VIEW PERMISSIONS
-- =====================================================

GRANT SELECT ON owner_dashboard_stats TO authenticated;
GRANT SELECT ON listing_analytics TO authenticated;
GRANT SELECT ON client_engagement_metrics TO authenticated;

-- =====================================================
-- PART 8: RECOMMENDATION VIEW
-- =====================================================

DROP VIEW IF EXISTS recommended_listings;
CREATE OR REPLACE VIEW recommended_listings AS
SELECT
  cp.user_id as client_id,
  l.id as listing_id,
  l.title,
  l.listing_type,
  l.price,
  l.city,
  l.owner_id,
  calculate_match_score(cp.user_id, l.id) as match_score,
  COALESCE(AVG(r.rating), 0) as owner_avg_rating,
  COUNT(r.id) as owner_review_count
FROM client_profiles cp
CROSS JOIN listings l
LEFT JOIN reviews r ON r.reviewed_id = l.owner_id
WHERE l.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM likes lk
    WHERE lk.user_id = cp.user_id AND lk.target_id = l.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM user_blocks ub
    WHERE (ub.blocker_id = cp.user_id AND ub.blocked_id = l.owner_id)
       OR (ub.blocker_id = l.owner_id AND ub.blocked_id = cp.user_id)
  )
GROUP BY cp.user_id, l.id, l.title, l.listing_type, l.price, l.city, l.owner_id;

GRANT SELECT ON recommended_listings TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260126100000_corrected_app_improvements completed';
  RAISE NOTICE 'Created: 10 indexes, 3 materialized views, 1 view, 5 functions';
  RAISE NOTICE 'Uses correct column names: likes.target_id, reviews.reviewed_id, conversations.client_id';
END
$$;
