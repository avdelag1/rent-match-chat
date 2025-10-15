-- ============================================
-- CRITICAL DATABASE SECURITY FIX - Phase 1
-- Fixed version with DROP IF EXISTS
-- ============================================

-- 1. Fix profiles table - CRITICAL: Contains PII
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create strict policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Secure listings table
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;

CREATE POLICY "Public can view active listings"
ON public.listings FOR SELECT
TO authenticated
USING (is_active = true AND status = 'active');

-- 3. Secure matches table
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update own matches" ON public.matches;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
ON public.matches FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can create matches"
ON public.matches FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can update own matches"
ON public.matches FOR UPDATE
TO authenticated
USING (client_id = auth.uid() OR owner_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR owner_id = auth.uid());

-- 4. Secure swipes table
DROP POLICY IF EXISTS "Users can view own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can create own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can update own swipes" ON public.swipes;

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own swipes"
ON public.swipes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own swipes"
ON public.swipes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own swipes"
ON public.swipes FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Secure user_likes table
DROP POLICY IF EXISTS "Users can view relevant likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can create own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can update own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.user_likes;

ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant likes"
ON public.user_likes FOR SELECT
TO authenticated
USING (liker_id = auth.uid() OR liked_id = auth.uid());

CREATE POLICY "Users can create own likes"
ON public.user_likes FOR INSERT
TO authenticated
WITH CHECK (liker_id = auth.uid());

CREATE POLICY "Users can update own likes"
ON public.user_likes FOR UPDATE
TO authenticated
USING (liker_id = auth.uid())
WITH CHECK (liker_id = auth.uid());

CREATE POLICY "Users can delete own likes"
ON public.user_likes FOR DELETE
TO authenticated
USING (liker_id = auth.uid());

-- 6. Fix Security Definer Views
DROP VIEW IF EXISTS public.listings_browse CASCADE;
DROP VIEW IF EXISTS public.property_recommendations_view CASCADE;
DROP VIEW IF EXISTS public.user_match_recommendations CASCADE;

CREATE OR REPLACE VIEW public.listings_browse AS
SELECT 
  l.id,
  l.title,
  l.description,
  l.price,
  l.property_type,
  l.beds,
  l.baths,
  l.images,
  l.amenities,
  l.city,
  l.neighborhood,
  l.is_active,
  l.status,
  l.owner_id,
  l.created_at
FROM public.listings l
WHERE l.is_active = true AND l.status = 'active';

-- 7. Fix function search paths
DO $$
BEGIN
  ALTER FUNCTION public.get_weekly_conversation_count(uuid) SET search_path = 'public';
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.can_start_conversation(uuid, uuid) SET search_path = 'public';
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.increment_conversation_count(uuid) SET search_path = 'public';
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.calculate_distance(numeric, numeric, numeric, numeric) SET search_path = 'public';
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.get_nearby_profiles(numeric, numeric, numeric, uuid) SET search_path = 'public';
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

-- 8. Create secure helper function
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() = profile_user_id
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.is_mutual = true
      AND (
        (m.client_id = auth.uid() AND m.owner_id = profile_user_id)
        OR (m.owner_id = auth.uid() AND m.client_id = profile_user_id)
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.client_id = auth.uid() AND c.owner_id = profile_user_id)
      OR (c.owner_id = auth.uid() AND c.client_id = profile_user_id)
    );
$$;

GRANT EXECUTE ON FUNCTION public.can_view_profile TO authenticated;