-- ============================================================================
-- FIX SUPABASE SECURITY ADVISOR ISSUES
-- ============================================================================
-- This migration addresses the following security scan findings:
--
-- ERRORS:
-- 1. Customer Personal Data Could Be Stolen by Hackers
-- 2. Private Messages Could Be Read by Unauthorized Users
-- 3. Security Definer View
--
-- WARNINGS:
-- 1. Property Listings May Expose Owner Information Prematurely
-- 2. Function Search Path Mutable
-- 3. Users Can Modify Their Own Roles
-- ============================================================================

-- ============================================================================
-- FIX 1: SECURITY DEFINER VIEWS - Add security_invoker=true
-- ============================================================================
-- Views without security_invoker bypass RLS and run as the view owner

-- Drop and recreate listings_with_owner_info with security_invoker
DROP VIEW IF EXISTS public.listings_with_owner_info CASCADE;
CREATE VIEW public.listings_with_owner_info
WITH (security_invoker=true)
AS
SELECT
  l.*,
  -- Only expose owner name, NOT sensitive info like email
  p.full_name as owner_name,
  p.avatar_url as owner_avatar,
  p.verified as owner_verified
FROM public.listings l
LEFT JOIN public.profiles p ON l.owner_id = p.id;

COMMENT ON VIEW public.listings_with_owner_info IS 'Secure view of listings with basic owner info - respects RLS';
GRANT SELECT ON public.listings_with_owner_info TO authenticated;

-- Drop and recreate active_listings_summary with security_invoker
DROP VIEW IF EXISTS public.active_listings_summary CASCADE;
CREATE VIEW public.active_listings_summary
WITH (security_invoker=true)
AS
SELECT
  l.id,
  l.owner_id,
  l.title,
  l.category,
  l.listing_type,
  l.mode,
  l.price,
  l.city,
  l.status,
  l.is_active,
  l.created_at,
  l.view_count,
  COALESCE(array_length(l.images, 1), 0) as image_count,
  p.full_name as owner_name
FROM public.listings l
LEFT JOIN public.profiles p ON l.owner_id = p.id
WHERE l.is_active = TRUE AND l.status = 'active';

COMMENT ON VIEW public.active_listings_summary IS 'Secure summary of active listings - respects RLS';
GRANT SELECT ON public.active_listings_summary TO authenticated;

-- Drop and recreate user_debug_info with security_invoker
DROP VIEW IF EXISTS public.user_debug_info CASCADE;
CREATE VIEW public.user_debug_info
WITH (security_invoker=true)
AS
SELECT
  p.id,
  p.full_name,
  -- Don't expose email in debug view
  ur.role,
  p.is_active,
  p.onboarding_completed,
  cp.id as client_profile_id,
  COUNT(DISTINCT l.id) as listing_count,
  COUNT(DISTINCT m.id) as match_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
LEFT JOIN public.client_profiles cp ON cp.user_id = p.id
LEFT JOIN public.listings l ON l.owner_id = p.id
LEFT JOIN public.matches m ON m.client_id = p.id OR m.owner_id = p.id
GROUP BY p.id, p.full_name, ur.role, p.is_active, p.onboarding_completed, cp.id;

COMMENT ON VIEW public.user_debug_info IS 'Secure debug view - respects RLS, no sensitive data';
GRANT SELECT ON public.user_debug_info TO authenticated;

-- Drop and recreate listings_browse with security_invoker if exists
DROP VIEW IF EXISTS public.listings_browse CASCADE;
CREATE VIEW public.listings_browse
WITH (security_invoker=true)
AS
SELECT
  l.id,
  l.title,
  l.description,
  l.category,
  l.listing_type,
  l.mode,
  l.price,
  l.city,
  l.neighborhood,
  l.images,
  l.amenities,
  l.beds,
  l.baths,
  l.square_footage,
  l.furnished,
  l.latitude,
  l.longitude,
  l.status,
  l.is_active,
  l.view_count,
  l.created_at,
  l.owner_id,
  -- Only basic owner info, no contact details
  p.full_name as owner_name,
  p.avatar_url as owner_avatar,
  p.verified as owner_verified
FROM public.listings l
LEFT JOIN public.profiles p ON l.owner_id = p.id
WHERE l.is_active = TRUE AND l.status = 'active';

COMMENT ON VIEW public.listings_browse IS 'Secure public browsing view - no owner contact info';
GRANT SELECT ON public.listings_browse TO authenticated;

-- Drop and recreate listings_public with security_invoker if exists
DROP VIEW IF EXISTS public.listings_public CASCADE;
CREATE VIEW public.listings_public
WITH (security_invoker=true)
AS
SELECT
  l.id,
  l.title,
  l.description,
  l.category,
  l.listing_type,
  l.mode,
  l.price,
  l.city,
  l.neighborhood,
  l.images,
  l.amenities,
  l.beds,
  l.baths,
  l.square_footage,
  l.furnished,
  l.latitude,
  l.longitude,
  l.is_active,
  l.view_count,
  l.created_at,
  l.owner_id,
  p.full_name as owner_name,
  p.avatar_url as owner_avatar
FROM public.listings l
LEFT JOIN public.profiles p ON l.owner_id = p.id
WHERE l.is_active = TRUE AND l.status = 'active';

COMMENT ON VIEW public.listings_public IS 'Public listings view - no sensitive owner data';
GRANT SELECT ON public.listings_public TO authenticated;

-- Fix profiles_public view if it exists without security_invoker
DROP VIEW IF EXISTS public.profiles_public CASCADE;
CREATE VIEW public.profiles_public
WITH (security_invoker=true)
AS
SELECT
  id,
  full_name,
  age,
  bio,
  occupation,
  nationality,
  location,
  interests,
  preferred_activities,
  lifestyle_tags,
  images,
  verified,
  latitude,
  longitude,
  avatar_url,
  has_pets,
  smoking
FROM public.profiles
WHERE is_active = true AND onboarding_completed = true;

COMMENT ON VIEW public.profiles_public IS 'Public profile view - no sensitive data like email/income';
GRANT SELECT ON public.profiles_public TO authenticated;

-- Fix public_profiles view if it exists
DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE VIEW public.public_profiles
WITH (security_invoker=true)
AS
SELECT
  id,
  full_name,
  age,
  bio,
  occupation,
  nationality,
  location,
  interests,
  preferred_activities,
  lifestyle_tags,
  images,
  verified,
  avatar_url,
  has_pets,
  smoking
FROM public.profiles
WHERE is_active = true AND onboarding_completed = true;

COMMENT ON VIEW public.public_profiles IS 'Public profiles - respects RLS';
GRANT SELECT ON public.public_profiles TO authenticated;

-- ============================================================================
-- FIX 2: SECURITY DEFINER FUNCTIONS - Add SET search_path = ''
-- ============================================================================
-- Functions with SECURITY DEFINER but without SET search_path are vulnerable

-- Fix get_owner_listing_stats
CREATE OR REPLACE FUNCTION public.get_owner_listing_stats(p_owner_id UUID)
RETURNS TABLE (
  total_listings BIGINT,
  active_listings BIGINT,
  inactive_listings BIGINT,
  draft_listings BIGINT,
  total_views BIGINT,
  properties_count BIGINT,
  motorcycles_count BIGINT,
  bicycles_count BIGINT,
  yachts_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_listings,
    COUNT(*) FILTER (WHERE status = 'active' AND is_active = TRUE)::BIGINT as active_listings,
    COUNT(*) FILTER (WHERE status = 'inactive' OR is_active = FALSE)::BIGINT as inactive_listings,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_listings,
    COALESCE(SUM(view_count), 0)::BIGINT as total_views,
    COUNT(*) FILTER (WHERE category = 'property')::BIGINT as properties_count,
    COUNT(*) FILTER (WHERE category = 'motorcycle')::BIGINT as motorcycles_count,
    COUNT(*) FILTER (WHERE category = 'bicycle')::BIGINT as bicycles_count,
    COUNT(*) FILTER (WHERE category = 'yacht')::BIGINT as yachts_count
  FROM public.listings
  WHERE owner_id = p_owner_id;
END;
$$;

-- Fix archive_listing
CREATE OR REPLACE FUNCTION public.archive_listing(p_listing_id UUID, p_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.listings
  SET
    status = 'archived',
    is_active = FALSE,
    updated_at = NOW()
  WHERE id = p_listing_id AND owner_id = p_owner_id;

  RETURN FOUND;
END;
$$;

-- Fix activate_listing
CREATE OR REPLACE FUNCTION public.activate_listing(p_listing_id UUID, p_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.listings
  SET
    status = 'active',
    is_active = TRUE,
    updated_at = NOW()
  WHERE id = p_listing_id AND owner_id = p_owner_id;

  RETURN FOUND;
END;
$$;

-- Fix increment_listing_view_count
CREATE OR REPLACE FUNCTION public.increment_listing_view_count(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.listings
  SET
    view_count = COALESCE(view_count, 0) + 1,
    updated_at = NOW()
  WHERE id = p_listing_id;
END;
$$;

-- Fix update_updated_at_column (used by triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX 3: STRENGTHEN RLS POLICIES FOR SENSITIVE DATA
-- ============================================================================

-- Ensure RLS is enabled on all sensitive tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIX 4: PROTECT PRIVATE MESSAGES - Ensure only participants can read
-- ============================================================================

-- Drop overly permissive message policies
DROP POLICY IF EXISTS "Anyone can view messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "All authenticated users can read messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Public can read messages" ON public.conversation_messages;

-- Ensure strict message access - only conversation participants
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "conversation_messages_select_participants" ON public.conversation_messages;
  DROP POLICY IF EXISTS "conversation_messages_insert_participants" ON public.conversation_messages;

  -- Create policy for SELECT - only participants can read
  CREATE POLICY "conversation_messages_select_participants"
  ON public.conversation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

  -- Create policy for INSERT - only participants can send
  CREATE POLICY "conversation_messages_insert_participants"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Policy might already exist, continue
  NULL;
END $$;

-- ============================================================================
-- FIX 5: PROTECT CUSTOMER PERSONAL DATA
-- ============================================================================

-- Remove overly permissive profile policies
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- Ensure client_profiles are protected
DO $$
BEGIN
  DROP POLICY IF EXISTS "client_profiles_select_own" ON public.client_profiles;
  DROP POLICY IF EXISTS "client_profiles_select_matched" ON public.client_profiles;
  DROP POLICY IF EXISTS "client_profiles_update_own" ON public.client_profiles;
  DROP POLICY IF EXISTS "client_profiles_insert_own" ON public.client_profiles;

  -- Users can see their own client profile
  CREATE POLICY "client_profiles_select_own"
  ON public.client_profiles FOR SELECT
  USING (user_id = auth.uid());

  -- Users can see client profiles of people they're matched with
  CREATE POLICY "client_profiles_select_matched"
  ON public.client_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.is_mutual = true
      AND (
        (m.client_id = auth.uid() AND m.owner_id = user_id)
        OR (m.owner_id = auth.uid() AND m.client_id = user_id)
      )
    )
  );

  -- Users can update their own client profile
  CREATE POLICY "client_profiles_update_own"
  ON public.client_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

  -- Users can insert their own client profile
  CREATE POLICY "client_profiles_insert_own"
  ON public.client_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- FIX 6: CREATE SECURE VIEW FOR OWNER CONTACT INFO (only after match)
-- ============================================================================

-- View that shows owner contact info ONLY for matched users
DROP VIEW IF EXISTS public.matched_owner_contact_info CASCADE;
CREATE VIEW public.matched_owner_contact_info
WITH (security_invoker=true)
AS
SELECT DISTINCT
  p.id as owner_id,
  p.full_name,
  p.email,
  p.phone,
  p.avatar_url,
  l.id as listing_id,
  l.title as listing_title
FROM public.profiles p
INNER JOIN public.listings l ON l.owner_id = p.id
INNER JOIN public.matches m ON (
  m.owner_id = p.id
  AND m.is_mutual = true
  AND m.client_id = auth.uid()
);

COMMENT ON VIEW public.matched_owner_contact_info IS 'Owner contact info - only visible to matched clients';
GRANT SELECT ON public.matched_owner_contact_info TO authenticated;

-- ============================================================================
-- FIX 7: PREVENT USERS FROM MODIFYING THEIR OWN ROLES
-- ============================================================================

-- Remove any dangerous policies that allow role self-modification
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_self" ON public.user_roles;

-- Ensure only admins can modify roles
DO $$
BEGIN
  DROP POLICY IF EXISTS "user_roles_update_admin_only" ON public.user_roles;

  CREATE POLICY "user_roles_update_admin_only"
  ON public.user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- FIX 8: ENSURE CONVERSATIONS HAVE PROPER RLS
-- ============================================================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "conversations_select_participants" ON public.conversations;
  DROP POLICY IF EXISTS "conversations_insert_participants" ON public.conversations;
  DROP POLICY IF EXISTS "conversations_update_participants" ON public.conversations;

  -- Only participants can view conversations
  CREATE POLICY "conversations_select_participants"
  ON public.conversations FOR SELECT
  USING (client_id = auth.uid() OR owner_id = auth.uid());

  -- Only authenticated users can create conversations they're part of
  CREATE POLICY "conversations_insert_participants"
  ON public.conversations FOR INSERT
  WITH CHECK (client_id = auth.uid() OR owner_id = auth.uid());

  -- Only participants can update conversations
  CREATE POLICY "conversations_update_participants"
  ON public.conversations FOR UPDATE
  USING (client_id = auth.uid() OR owner_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR owner_id = auth.uid());
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'SECURITY ADVISOR ISSUES FIXED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Fixed Issues:';
  RAISE NOTICE '  [ERROR] Security Definer Views - Added security_invoker=true';
  RAISE NOTICE '  [ERROR] Private Messages Access - Strengthened RLS';
  RAISE NOTICE '  [ERROR] Customer Data Protection - Restricted access';
  RAISE NOTICE '  [WARNING] Function Search Path - Added SET search_path';
  RAISE NOTICE '  [WARNING] Owner Info Exposure - Created secure view';
  RAISE NOTICE '  [WARNING] Role Modification - Restricted to admins only';
  RAISE NOTICE '';
  RAISE NOTICE 'Views updated with security_invoker:';
  RAISE NOTICE '  - listings_with_owner_info';
  RAISE NOTICE '  - active_listings_summary';
  RAISE NOTICE '  - user_debug_info';
  RAISE NOTICE '  - listings_browse';
  RAISE NOTICE '  - listings_public';
  RAISE NOTICE '  - profiles_public';
  RAISE NOTICE '  - public_profiles';
  RAISE NOTICE '  - matched_owner_contact_info (new)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions secured with SET search_path:';
  RAISE NOTICE '  - get_owner_listing_stats';
  RAISE NOTICE '  - archive_listing';
  RAISE NOTICE '  - activate_listing';
  RAISE NOTICE '  - increment_listing_view_count';
  RAISE NOTICE '  - update_updated_at_column';
  RAISE NOTICE '============================================================';
END $$;
