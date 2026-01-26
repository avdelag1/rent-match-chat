-- =====================================================
-- COMPREHENSIVE APP IMPROVEMENTS
-- Created: 2026-01-26
-- Purpose: Performance, matching algorithm, analytics, and search enhancements
-- =====================================================

-- =====================================================
-- 1. PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_likes_user_listing_created
  ON likes(user_id, listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participants_updated
  ON conversations(user_id, owner_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON conversation_messages(conversation_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_listings_active_type_city
  ON listings(listing_type, city, created_at DESC)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_listings_owner_active
  ON listings(owner_id, is_active, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_owner_likes_owner_created
  ON owner_likes(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rating_aggregates_trust_rating
  ON rating_aggregates(trust_level, displayed_rating DESC)
  WHERE total_ratings > 0;

-- Partial index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON conversation_messages(receiver_id, read_at)
  WHERE read_at IS NULL AND deleted_at IS NULL;

-- GiST index for full-text search on listings
CREATE INDEX IF NOT EXISTS idx_listings_search
  ON listings USING gin(to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(neighborhood, '')
  ));

-- GiST index for client profile search
CREATE INDEX IF NOT EXISTS idx_client_profiles_search
  ON client_profiles USING gin(to_tsvector('english',
    coalesce(bio, '') || ' ' ||
    coalesce(occupation, '') || ' ' ||
    coalesce(employer, '') || ' ' ||
    array_to_string(coalesce(languages, ARRAY[]::text[]), ' ')
  ));

-- =====================================================
-- 2. MATERIALIZED VIEWS FOR ANALYTICS
-- =====================================================

-- Owner Dashboard Statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS owner_dashboard_stats AS
SELECT
  l.owner_id,
  COUNT(DISTINCT l.id) as total_listings,
  COUNT(DISTINCT l.id) FILTER (WHERE l.is_active = true) as active_listings,
  COUNT(DISTINCT lk.id) as total_likes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.created_at > NOW() - INTERVAL '7 days') as likes_last_7_days,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.created_at > NOW() - INTERVAL '30 days') as likes_last_30_days,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT c.id) FILTER (WHERE c.created_at > NOW() - INTERVAL '7 days') as new_conversations_7_days,
  COALESCE(AVG(ra.displayed_rating), 0) as avg_rating,
  MAX(l.updated_at) as last_listing_update,
  MAX(c.updated_at) as last_conversation_activity
FROM profiles p
LEFT JOIN listings l ON l.owner_id = p.id
LEFT JOIN likes lk ON lk.listing_id = l.id AND lk.direction = 'right'
LEFT JOIN conversations c ON c.owner_id = p.id
LEFT JOIN rating_aggregates ra ON ra.user_id = p.id
WHERE EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'owner')
GROUP BY l.owner_id;

CREATE UNIQUE INDEX ON owner_dashboard_stats(owner_id);

-- Listing Performance Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS listing_analytics AS
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
LEFT JOIN likes lk ON lk.listing_id = l.id
LEFT JOIN conversations c ON c.listing_id = l.id
WHERE l.deleted_at IS NULL
GROUP BY l.id, l.owner_id, l.title, l.listing_type, l.city, l.price, l.created_at;

CREATE UNIQUE INDEX ON listing_analytics(listing_id);
CREATE INDEX ON listing_analytics(owner_id, like_rate_percentage DESC);

-- Client Engagement Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS client_engagement_metrics AS
SELECT
  p.id as client_id,
  COUNT(DISTINCT lk.id) as total_swipes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'right') as total_likes,
  COUNT(DISTINCT lk.id) FILTER (WHERE lk.direction = 'left') as total_dislikes,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT cm.id) as total_messages_sent,
  COUNT(DISTINCT ol.id) as owner_likes_received,
  COALESCE(AVG(ra.displayed_rating), 0) as avg_rating,
  ra.trust_level,
  MAX(lk.created_at) as last_swipe,
  MAX(cm.created_at) as last_message_sent,
  EXTRACT(EPOCH FROM (NOW() - MAX(lk.created_at))) / 86400 as days_since_last_active
FROM profiles p
LEFT JOIN likes lk ON lk.user_id = p.id
LEFT JOIN conversations c ON c.user_id = p.id
LEFT JOIN conversation_messages cm ON cm.sender_id = p.id
LEFT JOIN owner_likes ol ON ol.client_id = p.id AND ol.direction = 'right'
LEFT JOIN rating_aggregates ra ON ra.user_id = p.id
WHERE EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'client')
GROUP BY p.id, ra.trust_level;

CREATE UNIQUE INDEX ON client_engagement_metrics(client_id);
CREATE INDEX ON client_engagement_metrics(days_since_last_active);

-- =====================================================
-- 3. SMART MATCHING SCORE FUNCTION
-- =====================================================

-- Function to calculate compatibility score between client and listing
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_client_id UUID,
  p_listing_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 0;
  v_client_profile RECORD;
  v_listing RECORD;
  v_owner_prefs RECORD;
  v_client_rating NUMERIC;
  v_owner_rating NUMERIC;
BEGIN
  -- Get client profile
  SELECT * INTO v_client_profile
  FROM client_profiles
  WHERE user_id = p_client_id;

  -- Get listing details
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id;

  -- Get owner preferences
  SELECT * INTO v_owner_prefs
  FROM client_profiles
  WHERE user_id = v_listing.owner_id;

  -- Get ratings
  SELECT COALESCE(displayed_rating, 0) INTO v_client_rating
  FROM rating_aggregates
  WHERE user_id = p_client_id;

  SELECT COALESCE(displayed_rating, 0) INTO v_owner_rating
  FROM rating_aggregates
  WHERE user_id = v_listing.owner_id;

  -- Base score for active listing
  IF v_listing.is_active THEN
    v_score := v_score + 10;
  END IF;

  -- Price compatibility (within budget)
  IF v_client_profile.max_budget IS NOT NULL AND v_listing.price IS NOT NULL THEN
    IF v_listing.price <= v_client_profile.max_budget THEN
      v_score := v_score + 20;
      -- Bonus for being significantly under budget
      IF v_listing.price <= v_client_profile.max_budget * 0.8 THEN
        v_score := v_score + 10;
      END IF;
    ELSE
      -- Penalty for being over budget
      v_score := v_score - 30;
    END IF;
  END IF;

  -- Location match (same city)
  IF v_client_profile.preferred_location IS NOT NULL AND v_listing.city IS NOT NULL THEN
    IF v_client_profile.preferred_location = v_listing.city THEN
      v_score := v_score + 15;
    END IF;
  END IF;

  -- Bedrooms match (for property listings)
  IF v_listing.listing_type = 'property' AND v_listing.bedrooms IS NOT NULL THEN
    IF v_client_profile.preferred_bedrooms IS NOT NULL THEN
      IF v_listing.bedrooms = v_client_profile.preferred_bedrooms THEN
        v_score := v_score + 10;
      ELSIF ABS(v_listing.bedrooms - v_client_profile.preferred_bedrooms) = 1 THEN
        v_score := v_score + 5; -- Close match
      END IF;
    END IF;
  END IF;

  -- Lifestyle compatibility
  IF v_owner_prefs.smoking_preference IS NOT NULL AND v_client_profile.smoking_habits IS NOT NULL THEN
    IF v_owner_prefs.smoking_preference = v_client_profile.smoking_habits
       OR v_owner_prefs.smoking_preference = 'no_preference' THEN
      v_score := v_score + 8;
    ELSE
      v_score := v_score - 15; -- Major incompatibility
    END IF;
  END IF;

  IF v_owner_prefs.pet_preference IS NOT NULL AND v_client_profile.has_pets IS NOT NULL THEN
    IF (v_owner_prefs.pet_preference = 'allowed' AND v_client_profile.has_pets = true)
       OR (v_owner_prefs.pet_preference = 'not_allowed' AND v_client_profile.has_pets = false)
       OR v_owner_prefs.pet_preference = 'negotiable' THEN
      v_score := v_score + 8;
    ELSE
      v_score := v_score - 20; -- Major incompatibility
    END IF;
  END IF;

  -- Trust level bonus
  IF v_client_rating >= 4.5 THEN
    v_score := v_score + 15;
  ELSIF v_client_rating >= 4.0 THEN
    v_score := v_score + 10;
  ELSIF v_client_rating >= 3.5 THEN
    v_score := v_score + 5;
  END IF;

  IF v_owner_rating >= 4.5 THEN
    v_score := v_score + 15;
  ELSIF v_owner_rating >= 4.0 THEN
    v_score := v_score + 10;
  ELSIF v_owner_rating >= 3.5 THEN
    v_score := v_score + 5;
  END IF;

  -- Recency bonus (newer listings)
  IF v_listing.created_at > NOW() - INTERVAL '7 days' THEN
    v_score := v_score + 8;
  ELSIF v_listing.created_at > NOW() - INTERVAL '30 days' THEN
    v_score := v_score + 4;
  END IF;

  -- Availability bonus
  IF v_listing.available_from IS NOT NULL AND v_listing.available_from <= NOW() THEN
    v_score := v_score + 5;
  END IF;

  RETURN GREATEST(v_score, 0); -- Ensure non-negative score
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 4. FULL-TEXT SEARCH FUNCTION
-- =====================================================

-- Enhanced search function for listings
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
    AND l.deleted_at IS NULL
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

-- =====================================================
-- 5. DATA CLEANUP FUNCTIONS
-- =====================================================

-- Function to archive old inactive conversations
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

-- Function to cleanup old swipe data
CREATE OR REPLACE FUNCTION cleanup_old_swipes(
  p_days_old INTEGER DEFAULT 365
) RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM swipes
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to identify and flag stale listings
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
    AND l.deleted_at IS NULL
    AND l.updated_at < NOW() - (p_days_stale || ' days')::INTERVAL
    AND NOT EXISTS (
      SELECT 1 FROM likes lk
      WHERE lk.listing_id = l.id
      AND lk.created_at > NOW() - INTERVAL '30 days'
    )
  ORDER BY days_since_update DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. RECOMMENDATION VIEWS
-- =====================================================

-- View for recommended listings based on client preferences
CREATE OR REPLACE VIEW recommended_listings AS
SELECT
  cp.user_id as client_id,
  l.id as listing_id,
  l.title,
  l.listing_type,
  l.price,
  l.city,
  l.bedrooms,
  l.owner_id,
  calculate_match_score(cp.user_id, l.id) as match_score,
  ra.displayed_rating as owner_rating,
  ra.trust_level as owner_trust_level
FROM client_profiles cp
CROSS JOIN listings l
LEFT JOIN rating_aggregates ra ON ra.user_id = l.owner_id
WHERE l.is_active = true
  AND l.deleted_at IS NULL
  -- Exclude already swiped listings
  AND NOT EXISTS (
    SELECT 1 FROM likes lk
    WHERE lk.user_id = cp.user_id
    AND lk.listing_id = l.id
  )
  -- Exclude blocked owners
  AND NOT EXISTS (
    SELECT 1 FROM user_blocks ub
    WHERE (ub.blocker_id = cp.user_id AND ub.blocked_id = l.owner_id)
       OR (ub.blocker_id = l.owner_id AND ub.blocked_id = cp.user_id)
  )
  -- Only safe clients (no criminal records)
  AND is_client_safe(cp.user_id);

-- =====================================================
-- 7. STATISTICS FUNCTIONS
-- =====================================================

-- Function to get platform-wide statistics
CREATE OR REPLACE FUNCTION get_platform_statistics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL),
    'total_clients', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'client'),
    'total_owners', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'owner'),
    'active_listings', (SELECT COUNT(*) FROM listings WHERE is_active = true AND deleted_at IS NULL),
    'total_matches', (
      SELECT COUNT(*) FROM likes l1
      INNER JOIN likes l2 ON l1.listing_id = l2.listing_id
      WHERE l1.direction = 'right' AND l2.direction = 'right'
      AND l1.created_at BETWEEN p_start_date AND p_end_date
    ),
    'total_conversations', (
      SELECT COUNT(*) FROM conversations
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'total_messages', (
      SELECT COUNT(*) FROM conversation_messages
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'avg_listing_price', (
      SELECT ROUND(AVG(price), 2) FROM listings
      WHERE is_active = true AND price IS NOT NULL
    ),
    'avg_user_rating', (
      SELECT ROUND(AVG(displayed_rating), 2) FROM rating_aggregates
      WHERE total_ratings > 0
    ),
    'trusted_users_percentage', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE trust_level = 'trusted')::NUMERIC /
         NULLIF(COUNT(*), 0) * 100), 2
      )
      FROM rating_aggregates
      WHERE total_ratings > 0
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 8. REFRESH FUNCTION FOR MATERIALIZED VIEWS
-- =====================================================

-- Function to refresh all analytics views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS TEXT AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY owner_dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY listing_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY client_engagement_metrics;

  RETURN 'Analytics views refreshed at ' || NOW()::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. SCHEDULED JOBS (via pg_cron extension if available)
-- =====================================================

-- Note: Requires pg_cron extension to be enabled
-- These are example configurations that can be added manually

COMMENT ON FUNCTION refresh_analytics_views() IS
  'Refresh all materialized views. Schedule with: SELECT cron.schedule(''refresh-analytics'', ''0 * * * *'', ''SELECT refresh_analytics_views()'');';

COMMENT ON FUNCTION archive_inactive_conversations(INTEGER) IS
  'Archive conversations inactive for specified days. Schedule with: SELECT cron.schedule(''cleanup-conversations'', ''0 3 * * 0'', ''SELECT archive_inactive_conversations(180)'');';

COMMENT ON FUNCTION cleanup_old_swipes(INTEGER) IS
  'Cleanup old swipe records. Schedule with: SELECT cron.schedule(''cleanup-swipes'', ''0 4 * * 0'', ''SELECT cleanup_old_swipes(365)'');';

-- =====================================================
-- 10. PERFORMANCE MONITORING VIEW
-- =====================================================

CREATE OR REPLACE VIEW database_performance_metrics AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
  n_live_tup AS estimated_rows,
  n_dead_tup AS dead_rows,
  ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_row_percentage,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_match_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_listings(TEXT, TEXT, NUMERIC, NUMERIC, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_statistics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON recommended_listings TO authenticated;
GRANT SELECT ON owner_dashboard_stats TO authenticated;
GRANT SELECT ON listing_analytics TO authenticated;
GRANT SELECT ON client_engagement_metrics TO authenticated;

-- Admin-only functions
GRANT EXECUTE ON FUNCTION archive_inactive_conversations(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_swipes(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION flag_stale_listings(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION refresh_analytics_views() TO service_role;
GRANT SELECT ON database_performance_metrics TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Create migrations metadata table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.migrations_metadata (
  id BIGSERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  description TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add migration record
INSERT INTO public.migrations_metadata (migration_name, description, applied_at)
VALUES (
  '20260126000000_comprehensive_app_improvements',
  'Performance optimizations, smart matching algorithm, analytics views, full-text search, and data cleanup functions',
  NOW()
)
ON CONFLICT (migration_name) DO NOTHING;

COMMENT ON MATERIALIZED VIEW owner_dashboard_stats IS 'Owner dashboard statistics including listings, likes, conversations, and ratings';
COMMENT ON MATERIALIZED VIEW listing_analytics IS 'Detailed analytics for each listing including views, likes, and engagement metrics';
COMMENT ON MATERIALIZED VIEW client_engagement_metrics IS 'Client activity metrics including swipes, messages, and engagement levels';
COMMENT ON FUNCTION calculate_match_score(UUID, UUID) IS 'Calculates compatibility score between client preferences and listing features';
COMMENT ON FUNCTION search_listings(TEXT, TEXT, NUMERIC, NUMERIC, TEXT, INTEGER) IS 'Full-text search for listings with filters';
COMMENT ON VIEW recommended_listings IS 'Personalized listing recommendations based on client preferences and match scores';
