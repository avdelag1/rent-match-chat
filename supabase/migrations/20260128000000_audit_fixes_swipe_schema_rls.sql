-- ============================================================================
-- AUDIT FIXES: SWIPE SCHEMA AND RLS HARDENING
-- ============================================================================
-- Date: 2026-01-28
-- Purpose: Fix critical schema mismatches and add missing RLS policies
-- Based on: AUDIT_REPORT_2026-01-28.md
-- ============================================================================

-- ============================================================================
-- PART 1: FIX LIKES TABLE SCHEMA
-- ============================================================================
-- The migration 20260120000000 should have renamed target_id to target_listing_id,
-- but TypeScript types still show target_id. This ensures consistency.

-- Check if target_id exists and target_listing_id doesn't
DO $$
BEGIN
  -- If target_id exists but target_listing_id doesn't, rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'likes'
    AND column_name = 'target_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'likes'
    AND column_name = 'target_listing_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.likes RENAME COLUMN target_id TO target_listing_id';
    RAISE NOTICE 'Renamed target_id to target_listing_id in likes table';
  END IF;

  -- If both exist (shouldn't happen), drop target_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'likes'
    AND column_name = 'target_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'likes'
    AND column_name = 'target_listing_id'
  ) THEN
    -- Migrate any data from target_id to target_listing_id where target_listing_id is null
    EXECUTE 'UPDATE public.likes SET target_listing_id = target_id WHERE target_listing_id IS NULL AND target_id IS NOT NULL';
    EXECUTE 'ALTER TABLE public.likes DROP COLUMN target_id';
    RAISE NOTICE 'Dropped duplicate target_id column from likes table';
  END IF;
END $$;

-- Ensure proper constraints exist
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_target_id_key;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_target_id_direction_key;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS unique_user_target_direction;

-- Add the correct unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'likes_user_listing_unique'
    AND conrelid = 'public.likes'::regclass
  ) THEN
    ALTER TABLE public.likes ADD CONSTRAINT likes_user_listing_unique UNIQUE (user_id, target_listing_id);
    RAISE NOTICE 'Added unique constraint likes_user_listing_unique';
  END IF;
END $$;

-- Drop direction column if it exists (likes are always right swipes now)
ALTER TABLE public.likes DROP COLUMN IF EXISTS direction;

-- ============================================================================
-- PART 2: ADD MISSING RLS POLICIES FOR PROFILES
-- ============================================================================
-- Ensure suspended/blocked/inactive profiles are never visible to other users

-- Drop existing policy if it conflicts
DROP POLICY IF EXISTS "only_active_profiles_visible" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_view_profiles" ON public.profiles;

-- Create comprehensive profile visibility policy
CREATE POLICY "profiles_visible_if_active"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR (
    -- Other profiles must be active and not suspended/blocked
    COALESCE(is_active, true) = true
    AND COALESCE(is_suspended, false) = false
    AND COALESCE(is_blocked, false) = false
  )
);

-- ============================================================================
-- PART 3: ADD MISSING RLS POLICIES FOR CONVERSATIONS
-- ============================================================================
-- Ensure deleted conversations are never visible

DROP POLICY IF EXISTS "exclude_deleted_conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_select_policy" ON public.conversations;

-- Create conversation visibility policy that excludes deleted
CREATE POLICY "conversations_visible_if_not_deleted"
ON public.conversations FOR SELECT
TO authenticated
USING (
  -- Only show non-deleted conversations
  deleted_at IS NULL
  AND (
    participant_1_id = auth.uid()
    OR participant_2_id = auth.uid()
    OR client_id = auth.uid()
    OR owner_id = auth.uid()
  )
);

-- ============================================================================
-- PART 4: CREATE RPC FUNCTION FOR SWIPE EXCLUSION
-- ============================================================================
-- This function returns listings excluding already-swiped ones at SQL level

DROP FUNCTION IF EXISTS public.get_swipeable_listings(UUID, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.get_swipeable_listings(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price NUMERIC,
  images TEXT[],
  city TEXT,
  neighborhood TEXT,
  beds INTEGER,
  baths INTEGER,
  square_footage INTEGER,
  category TEXT,
  listing_type TEXT,
  property_type TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  amenities TEXT[],
  pet_friendly BOOLEAN,
  furnished BOOLEAN,
  owner_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.price,
    l.images,
    l.city,
    l.neighborhood,
    l.beds,
    l.baths,
    l.square_footage,
    l.category,
    l.listing_type,
    l.property_type,
    l.brand,
    l.model,
    l.year,
    l.amenities,
    l.pet_friendly,
    l.furnished,
    l.owner_id,
    l.created_at
  FROM listings l
  WHERE l.is_active = true
    AND l.status = 'active'
    -- Exclude own listings
    AND l.owner_id != p_user_id
    -- CRITICAL: Exclude already-liked listings at SQL level
    AND l.id NOT IN (
      SELECT lk.target_listing_id
      FROM likes lk
      WHERE lk.user_id = p_user_id
    )
    -- CRITICAL: Exclude dismissed listings
    AND l.id NOT IN (
      SELECT sd.target_id
      FROM swipe_dismissals sd
      WHERE sd.user_id = p_user_id
      AND sd.target_type = 'listing'
    )
    -- CRITICAL: Exclude permanent dislikes (> 3 days old)
    AND l.id NOT IN (
      SELECT d.target_id
      FROM dislikes d
      WHERE d.user_id = p_user_id
      AND d.target_type = 'listing'
      AND d.created_at < NOW() - INTERVAL '3 days'
    )
    -- Apply optional filters
    AND (p_category IS NULL OR l.category = p_category)
    AND (p_listing_type IS NULL OR l.listing_type = p_listing_type)
    AND (p_min_price IS NULL OR l.price >= p_min_price)
    AND (p_max_price IS NULL OR l.price <= p_max_price)
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_swipeable_listings(UUID, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.get_swipeable_listings IS
'Returns listings for swipe deck, excluding already-liked, dismissed, and disliked items at SQL level.
This prevents items from reappearing and ensures proper pagination.';

-- ============================================================================
-- PART 5: CREATE RPC FUNCTION FOR CLIENT PROFILES
-- ============================================================================
-- This function returns client profiles excluding already-swiped ones

DROP FUNCTION IF EXISTS public.get_swipeable_clients(UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.get_swipeable_clients(
  p_owner_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  city TEXT,
  images TEXT[],
  avatar_url TEXT,
  verified BOOLEAN,
  interests TEXT[],
  preferred_activities TEXT[],
  lifestyle_tags TEXT[],
  budget_min NUMERIC,
  budget_max NUMERIC,
  monthly_income NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.age,
    p.gender,
    p.city,
    p.images,
    p.avatar_url,
    p.verified,
    p.interests,
    p.preferred_activities,
    p.lifestyle_tags,
    p.budget_min,
    p.budget_max,
    p.monthly_income,
    p.created_at
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id != p_owner_id
    AND ur.role = 'client'
    -- Only active, non-suspended, non-blocked profiles
    AND COALESCE(p.is_active, true) = true
    AND COALESCE(p.is_suspended, false) = false
    AND COALESCE(p.is_blocked, false) = false
    -- CRITICAL: Exclude already-liked clients at SQL level
    AND p.id NOT IN (
      SELECT ol.client_id
      FROM owner_likes ol
      WHERE ol.owner_id = p_owner_id
    )
    -- CRITICAL: Exclude dismissed clients
    AND p.id NOT IN (
      SELECT sd.target_id
      FROM swipe_dismissals sd
      WHERE sd.user_id = p_owner_id
      AND sd.target_type = 'client'
    )
    -- CRITICAL: Exclude permanent dislikes (> 3 days old)
    AND p.id NOT IN (
      SELECT d.target_id
      FROM dislikes d
      WHERE d.user_id = p_owner_id
      AND d.target_type = 'profile'
      AND d.created_at < NOW() - INTERVAL '3 days'
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_swipeable_clients(UUID, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.get_swipeable_clients IS
'Returns client profiles for owner swipe deck, excluding already-liked, dismissed, and disliked clients at SQL level.
This prevents profiles from reappearing and ensures proper pagination.';

-- ============================================================================
-- PART 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for likes lookup by user (for swipe exclusion)
CREATE INDEX IF NOT EXISTS idx_likes_user_target_listing
ON public.likes(user_id, target_listing_id);

-- Index for owner_likes lookup (for client swipe exclusion)
CREATE INDEX IF NOT EXISTS idx_owner_likes_owner_client
ON public.owner_likes(owner_id, client_id);

-- Index for swipe_dismissals lookup
CREATE INDEX IF NOT EXISTS idx_swipe_dismissals_user_target
ON public.swipe_dismissals(user_id, target_id, target_type);

-- Index for dislikes lookup with date
CREATE INDEX IF NOT EXISTS idx_dislikes_user_target_date
ON public.dislikes(user_id, target_id, target_type, created_at);

-- Index for active/non-suspended profiles
CREATE INDEX IF NOT EXISTS idx_profiles_active_status
ON public.profiles(is_active, is_suspended, is_blocked)
WHERE COALESCE(is_active, true) = true
AND COALESCE(is_suspended, false) = false
AND COALESCE(is_blocked, false) = false;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'AUDIT FIXES MIGRATION COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Schema Fixes:';
  RAISE NOTICE '  - Standardized likes.target_listing_id column';
  RAISE NOTICE '  - Removed deprecated direction column from likes';
  RAISE NOTICE '  - Added proper unique constraints';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies Added:';
  RAISE NOTICE '  - profiles_visible_if_active (excludes suspended/blocked)';
  RAISE NOTICE '  - conversations_visible_if_not_deleted';
  RAISE NOTICE '';
  RAISE NOTICE 'RPC Functions Added:';
  RAISE NOTICE '  - get_swipeable_listings() - SQL-level swipe exclusion';
  RAISE NOTICE '  - get_swipeable_clients() - SQL-level client exclusion';
  RAISE NOTICE '';
  RAISE NOTICE 'Performance Indexes Added:';
  RAISE NOTICE '  - idx_likes_user_target_listing';
  RAISE NOTICE '  - idx_owner_likes_owner_client';
  RAISE NOTICE '  - idx_swipe_dismissals_user_target';
  RAISE NOTICE '  - idx_dislikes_user_target_date';
  RAISE NOTICE '  - idx_profiles_active_status';
  RAISE NOTICE '============================================================';
END $$;
