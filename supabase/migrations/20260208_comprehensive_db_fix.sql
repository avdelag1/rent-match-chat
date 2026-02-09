-- ============================================
-- COMPREHENSIVE DATABASE FIX
-- Fixes storage buckets, RLS policies, and profile creation
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Create storage buckets (if not exist)
-- ============================================

-- Create listing-images bucket for listing photos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'listing-images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('listing-images', 'Listing Images', true);
  END IF;
END $$;

-- Create profile-images bucket for profile photos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-images', 'Profile Images', true);
  END IF;
END $$;

-- ============================================
-- STEP 2: Fix storage policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;

-- Allow authenticated users to UPLOAD to listing-images
CREATE POLICY "Allow listing image uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

-- Allow anyone to VIEW listing images (public read)
CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'listing-images');

-- Allow authenticated users to UPLOAD to profile-images
CREATE POLICY "Allow profile image uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-images');

-- Allow anyone to VIEW profile images (public read)
CREATE POLICY "Public can view profile images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'profile-images');

-- ============================================
-- STEP 3: Create RPC function for safe profile creation
-- ============================================

DROP FUNCTION IF EXISTS public.create_profile_from_auth(UUID);

CREATE OR REPLACE FUNCTION public.create_profile_from_auth(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, profile_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
  v_role TEXT;
  v_profile_id UUID;
BEGIN
  -- Get user data from auth.users
  SELECT email, 
         COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
         COALESCE(raw_user_meta_data->>'role', 'client')
  INTO v_email, v_full_name, v_role
  FROM auth.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found in auth.users', NULL;
    RETURN;
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id, email, full_name, role, is_active, onboarding_completed,
    created_at, updated_at
  ) VALUES (
    p_user_id, v_email, v_full_name, v_role, true, true, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = true,
    onboarding_completed = true,
    updated_at = NOW()
  )
  RETURNING id INTO v_profile_id;

  -- Insert or update user role
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (p_user_id, v_role, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN QUERY SELECT true, 'Profile created/updated successfully', v_profile_id;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, SQLERRM, NULL;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_from_auth(UUID) TO authenticated;

-- ============================================
-- STEP 4: Fix handle_new_user trigger to use RPC
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result RECORD;
BEGIN
    -- Call the RPC function to create profile
    SELECT * INTO v_result
    FROM public.create_profile_from_auth(NEW.id);

    -- Log success/failure (optional - could insert into a logs table)
    IF NOT v_result.success THEN
      RAISE NOTICE 'Profile creation for user % failed: %', NEW.id, v_result.message;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================
-- STEP 5: Fix RLS policies on public tables
-- ============================================

-- profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- user_roles table
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- listings table
DROP POLICY IF EXISTS "owners_can_insert_listings" ON public.listings;
CREATE POLICY "owners_can_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owners_can_update_own_listings" ON public.listings;
CREATE POLICY "owners_can_update_own_listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "users_can_browse_active_listings" ON public.listings;
CREATE POLICY "users_can_browse_active_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = owner_id);

-- ============================================
-- STEP 6: Verify setup
-- ============================================

-- Check storage buckets
SELECT id, name, public FROM storage.buckets WHERE id IN ('listing-images', 'profile-images');

-- Check storage policies
SELECT policyname, tablename, cmd, qual
FROM pg_policies
WHERE tablename = 'objects';

-- Check trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RPC function exists
SELECT proname, proargnames
FROM pg_proc WHERE proname = 'create_profile_from_auth';

-- ============================================
-- TEST: Run this to test profile creation
-- SELECT * FROM public.create_profile_from_auth(auth.uid());
-- ============================================
