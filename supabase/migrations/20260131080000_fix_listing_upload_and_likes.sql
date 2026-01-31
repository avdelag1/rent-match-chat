-- ============================================
-- COMPREHENSIVE FIX: LISTING UPLOADS AND LIKES
-- Date: 2026-01-31
-- Purpose: Fix all blocking issues for listing uploads and saving likes
-- ============================================

-- ============================================
-- PART 1: VERIFY AND FIX LISTINGS TABLE CONSTRAINTS
-- ============================================

-- Ensure state and price are nullable (required for motorcycle/bicycle listings)
ALTER TABLE public.listings ALTER COLUMN state DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN price DROP NOT NULL;

-- Fix property_type constraint to support all form values with case-insensitive matching
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_property_type_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_property_type_check
  CHECK (property_type IS NULL OR LOWER(property_type) IN (
    'apartment', 'house', 'room', 'studio', 'commercial', 'land',
    'villa', 'condo', 'loft', 'penthouse', 'townhouse', 'other'
  ));

-- Fix vehicle_condition constraint to include 'needs work' and be case-insensitive
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_vehicle_condition_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_vehicle_condition_check
  CHECK (vehicle_condition IS NULL OR LOWER(vehicle_condition) IN (
    'new', 'excellent', 'good', 'fair', 'poor', 'needs work'
  ));

-- ============================================
-- PART 2: ENSURE LISTINGS RLS POLICIES ARE CORRECT
-- ============================================

-- Allow owners to insert listings
DROP POLICY IF EXISTS "owners_can_insert_listings" ON public.listings;
CREATE POLICY "owners_can_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow owners to update their own listings
DROP POLICY IF EXISTS "owners_can_update_own_listings" ON public.listings;
CREATE POLICY "owners_can_update_own_listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Allow browsing active listings
DROP POLICY IF EXISTS "users_can_browse_active_listings" ON public.listings;
CREATE POLICY "users_can_browse_active_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = owner_id);

-- ============================================
-- PART 3: FIX STORAGE POLICIES FOR LISTING IMAGES
-- ============================================

-- Ensure the listing-images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

-- Allow public read access to listing images
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'listing-images');

-- Allow users to update their own uploads
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- PART 4: FIX LIKES TABLE AND RLS POLICIES
-- ============================================

-- Ensure likes table has correct schema
DO $$
BEGIN
  -- Add target_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'likes' AND column_name = 'target_id') THEN
    ALTER TABLE public.likes ADD COLUMN target_id UUID;
  END IF;

  -- Add target_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'likes' AND column_name = 'target_type') THEN
    ALTER TABLE public.likes ADD COLUMN target_type TEXT DEFAULT 'listing';
  END IF;

  -- Add direction if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'likes' AND column_name = 'direction') THEN
    ALTER TABLE public.likes ADD COLUMN direction TEXT DEFAULT 'right';
  END IF;
END $$;

-- Fix the unique constraint to use correct columns
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_target_unique;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_target_id_target_type_key;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_target_id_target_type_key
  UNIQUE (user_id, target_id, target_type);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_target_id ON public.likes(target_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_type ON public.likes(target_type);
CREATE INDEX IF NOT EXISTS idx_likes_direction ON public.likes(direction);
CREATE INDEX IF NOT EXISTS idx_likes_user_direction ON public.likes(user_id, direction)
WHERE direction = 'right';

-- ============================================
-- PART 5: FIX LIKES RLS POLICIES (CRITICAL)
-- ============================================

-- Allow users to view their own likes
DROP POLICY IF EXISTS "users_can_view_own_likes" ON public.likes;
CREATE POLICY "users_can_view_own_likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert likes (NO restrictive is_user_active check)
DROP POLICY IF EXISTS "users_can_insert_likes" ON public.likes;
CREATE POLICY "users_can_insert_likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
DROP POLICY IF EXISTS "users_can_delete_own_likes" ON public.likes;
CREATE POLICY "users_can_delete_own_likes"
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own likes (for direction changes)
DROP POLICY IF EXISTS "users_can_update_own_likes" ON public.likes;
CREATE POLICY "users_can_update_own_likes"
  ON public.likes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CRITICAL: Allow owners to see who liked their listings (FIXED COLUMN NAME)
DROP POLICY IF EXISTS "owners_can_see_likes_on_listings" ON public.likes;
CREATE POLICY "owners_can_see_likes_on_listings"
  ON public.likes FOR SELECT
  TO authenticated
  USING (
    target_type = 'listing' AND
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = likes.target_id  -- FIXED: was target_listing_id
      AND listings.owner_id = auth.uid()
    )
  );

-- ============================================
-- PART 6: UPDATE is_user_active FUNCTION (NO ONBOARDING BLOCKS)
-- ============================================

DROP FUNCTION IF EXISTS public.is_user_active(UUID);
CREATE OR REPLACE FUNCTION public.is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT
        NOT COALESCE(is_suspended, false)
        AND NOT COALESCE(is_blocked, false)
      FROM public.profiles
      WHERE id = user_uuid
    ),
    -- If no profile exists yet, return TRUE (allow new users)
    true
  );
$$;

COMMENT ON FUNCTION public.is_user_active IS
  'Returns TRUE if user is active (not suspended/blocked). Returns TRUE for new users without profiles.';

-- ============================================
-- PART 7: ENSURE ALL NECESSARY GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- ============================================
-- VERIFICATION AND DIAGNOSTICS
-- ============================================

DO $$
DECLARE
  listings_count INTEGER;
  likes_count INTEGER;
  storage_bucket_exists BOOLEAN;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'LISTING UPLOAD AND LIKES FIX APPLIED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';

  -- Check listings table
  SELECT COUNT(*) INTO listings_count FROM public.listings;
  RAISE NOTICE 'Current listings in database: %', listings_count;

  -- Check likes table
  SELECT COUNT(*) INTO likes_count FROM public.likes;
  RAISE NOTICE 'Current likes in database: %', likes_count;

  -- Check storage bucket
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'listing-images') INTO storage_bucket_exists;
  RAISE NOTICE 'Listing-images bucket exists: %', storage_bucket_exists;

  RAISE NOTICE '';
  RAISE NOTICE 'Fixes Applied:';
  RAISE NOTICE '  ✓ Listings table constraints relaxed (state, price nullable)';
  RAISE NOTICE '  ✓ Property type and vehicle condition constraints fixed';
  RAISE NOTICE '  ✓ Listings RLS policies updated';
  RAISE NOTICE '  ✓ Storage bucket and policies configured';
  RAISE NOTICE '  ✓ Likes table schema verified';
  RAISE NOTICE '  ✓ Likes RLS policies fixed (target_id column)';
  RAISE NOTICE '  ✓ is_user_active function allows new users';
  RAISE NOTICE '';
  RAISE NOTICE 'What should now work:';
  RAISE NOTICE '  1. Creating new listings (all categories)';
  RAISE NOTICE '  2. Uploading listing photos';
  RAISE NOTICE '  3. Swiping right to save likes';
  RAISE NOTICE '  4. Viewing liked properties';
  RAISE NOTICE '  5. Owners seeing who liked their listings';
  RAISE NOTICE '============================================================';
END $$;
