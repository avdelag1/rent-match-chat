-- ============================================================================
-- Rating System Helper Functions
-- ============================================================================

-- Function to increment helpful count on a rating
CREATE OR REPLACE FUNCTION increment_rating_helpful(rating_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ratings
  SET helpful_count = helpful_count + 1
  WHERE id = rating_id AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_rating_helpful IS 'Increment helpful count for a rating';

GRANT EXECUTE ON FUNCTION increment_rating_helpful TO authenticated;

-- Function to get rating statistics for a user (for profile display)
CREATE OR REPLACE FUNCTION get_user_rating_stats(p_user_id UUID)
RETURNS TABLE (
  as_client_rating DECIMAL,
  as_client_count INT,
  as_owner_rating DECIMAL,
  as_owner_count INT,
  total_ratings_given INT,
  average_rating_given DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(
      (SELECT displayed_rating FROM rating_aggregates
       WHERE user_id = p_user_id AND category_id = 'client' LIMIT 1),
      5.0
    ) as as_client_rating,
    COALESCE(
      (SELECT total_ratings FROM rating_aggregates
       WHERE user_id = p_user_id AND category_id = 'client' LIMIT 1),
      0
    ) as as_client_count,
    COALESCE(
      (SELECT AVG(displayed_rating) FROM rating_aggregates
       WHERE user_id = p_user_id AND category_id != 'client'),
      5.0
    ) as as_owner_rating,
    COALESCE(
      (SELECT SUM(total_ratings) FROM rating_aggregates
       WHERE user_id = p_user_id AND category_id != 'client'),
      0::BIGINT
    )::INT as as_owner_count,
    COALESCE(
      (SELECT COUNT(*)::INT FROM ratings WHERE reviewer_id = p_user_id AND is_active = TRUE),
      0
    ) as total_ratings_given,
    COALESCE(
      (SELECT AVG(overall_rating) FROM ratings WHERE reviewer_id = p_user_id AND is_active = TRUE),
      5.0
    ) as average_rating_given;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_user_rating_stats IS 'Get comprehensive rating statistics for a user';

GRANT EXECUTE ON FUNCTION get_user_rating_stats TO anon, authenticated;

-- Function to soft-delete a rating (users can delete their own ratings)
CREATE OR REPLACE FUNCTION soft_delete_rating(rating_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  deleted BOOLEAN := FALSE;
BEGIN
  UPDATE ratings
  SET
    is_active = FALSE,
    deleted_at = NOW()
  WHERE
    id = rating_id
    AND reviewer_id = user_id
    AND is_active = TRUE
    AND EXTRACT(EPOCH FROM (NOW() - created_at)) < 604800; -- Can delete within 7 days

  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION soft_delete_rating IS 'Soft delete a rating (users can delete their own ratings within 7 days)';

GRANT EXECUTE ON FUNCTION soft_delete_rating TO authenticated;
