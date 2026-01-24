-- ============================================================================
-- Optimization: Client Profiles View
-- ============================================================================
-- This view combines profiles_public, user_roles, and client_profiles
-- into a single query to eliminate the N+1 query pattern in useClientProfiles
--
-- BEFORE: 2 queries (profiles_public + client_profiles lookup)
-- AFTER: 1 query (materialized view with all data)
-- ============================================================================

-- Create optimized view for client profile discovery
CREATE OR REPLACE VIEW client_profiles_discovery AS
SELECT
  p.id as user_id,
  p.full_name,
  p.age,
  p.city,
  p.avatar_url,
  p.verified,
  p.interests,
  p.preferred_activities,
  p.images as profile_images_fallback,
  -- Prefer client_profiles data if available (newer/more accurate)
  COALESCE(cp.name, p.full_name, 'User') as name,
  COALESCE(cp.age, p.age, 25) as display_age,
  COALESCE(cp.profile_images, p.images, ARRAY[]::text[]) as profile_images,
  cp.budget,
  cp.preferred_listing_types,
  cp.moto_types,
  cp.bicycle_types,
  p.created_at,
  p.updated_at
FROM profiles_public p
INNER JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN client_profiles cp ON cp.user_id = p.id
WHERE ur.role = 'client'
  AND p.is_active = true;

-- Add index for common filter patterns
CREATE INDEX IF NOT EXISTS idx_client_profiles_discovery_created_at
  ON profiles_public(created_at DESC)
  WHERE EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles_public.id AND user_roles.role = 'client');

COMMENT ON VIEW client_profiles_discovery IS
  'Optimized view for client profile discovery that combines profiles_public, user_roles, and client_profiles in a single query. Eliminates N+1 query pattern.';
