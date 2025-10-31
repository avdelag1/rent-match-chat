-- ============================================================================
-- COMPREHENSIVE LISTINGS MANAGEMENT SYSTEM
-- ============================================================================
-- This migration creates a complete listings management system for owners
-- Supports: Properties, Motorcycles, Bicycles, and Yachts
-- Features: Storage buckets, RLS policies, indexes, and triggers
-- ============================================================================

-- ============================================================================
-- 1. STORAGE BUCKETS SETUP
-- ============================================================================

-- Ensure listing-images bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true, -- Public access for listing photos
  10485760, -- 10MB limit for high-quality listing photos
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================================
-- 2. STORAGE POLICIES FOR LISTING IMAGES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "listing_images_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_view_policy" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_delete_policy" ON storage.objects;

-- Allow authenticated users to upload listing images
-- Path format: {user_id}/{listing_id}/{filename}
CREATE POLICY "listing_images_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view listing images (public bucket)
CREATE POLICY "listing_images_view_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Allow users to update their own listing images
CREATE POLICY "listing_images_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'listing-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own listing images
CREATE POLICY "listing_images_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 3. ENSURE LISTINGS TABLE EXISTS WITH ALL FIELDS
-- ============================================================================
-- Note: This assumes the listings table already exists from previous migrations.
-- We're adding any missing columns that may not have been created.

-- Add any missing essential columns
DO $$
BEGIN
  -- Ensure all critical columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'mode') THEN
    ALTER TABLE public.listings ADD COLUMN mode TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'beds') THEN
    ALTER TABLE public.listings ADD COLUMN beds INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'baths') THEN
    ALTER TABLE public.listings ADD COLUMN baths DECIMAL(3,1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'address') THEN
    ALTER TABLE public.listings ADD COLUMN address TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'neighborhood') THEN
    ALTER TABLE public.listings ADD COLUMN neighborhood TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'brand') THEN
    ALTER TABLE public.listings ADD COLUMN brand TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'model') THEN
    ALTER TABLE public.listings ADD COLUMN model TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'year') THEN
    ALTER TABLE public.listings ADD COLUMN year INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'square_footage') THEN
    ALTER TABLE public.listings ADD COLUMN square_footage INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'furnished') THEN
    ALTER TABLE public.listings ADD COLUMN furnished BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE HELPFUL VIEWS FOR OWNERS
-- ============================================================================

-- Drop existing views
DROP VIEW IF EXISTS listings_with_owner_info CASCADE;
DROP VIEW IF EXISTS active_listings_summary CASCADE;

-- View: Listings with owner information
CREATE OR REPLACE VIEW listings_with_owner_info AS
SELECT
  l.*,
  p.full_name as owner_name,
  p.email as owner_email,
  p.avatar_url as owner_avatar
FROM public.listings l
LEFT JOIN public.profiles p ON l.owner_id = p.id;

COMMENT ON VIEW listings_with_owner_info IS 'Listings joined with owner profile information';

-- View: Active listings summary with statistics
CREATE OR REPLACE VIEW active_listings_summary AS
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

COMMENT ON VIEW active_listings_summary IS 'Summary of all active listings with basic statistics';

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS FOR LISTING MANAGEMENT
-- ============================================================================

-- Function: Get owner's listing statistics
CREATE OR REPLACE FUNCTION get_owner_listing_stats(p_owner_id UUID)
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

COMMENT ON FUNCTION get_owner_listing_stats IS 'Get comprehensive statistics for an owner''s listings';

-- Function: Soft delete listing (archive instead of hard delete)
CREATE OR REPLACE FUNCTION archive_listing(p_listing_id UUID, p_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

COMMENT ON FUNCTION archive_listing IS 'Soft delete a listing by archiving it instead of hard deletion';

-- Function: Activate listing
CREATE OR REPLACE FUNCTION activate_listing(p_listing_id UUID, p_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

COMMENT ON FUNCTION activate_listing IS 'Activate a listing making it visible to clients';

-- Function: Increment view count
CREATE OR REPLACE FUNCTION increment_listing_view_count(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.listings
  SET
    view_count = COALESCE(view_count, 0) + 1,
    updated_at = NOW()
  WHERE id = p_listing_id;
END;
$$;

COMMENT ON FUNCTION increment_listing_view_count IS 'Increment the view count for a listing when viewed';

-- ============================================================================
-- 6. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger function: Update listing search index (for future full-text search)
CREATE OR REPLACE FUNCTION update_listing_search_index()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- This can be expanded with full-text search functionality
  -- For now, just ensure updated_at is set
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_listing_search ON public.listings;
CREATE TRIGGER trg_update_listing_search
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_search_index();

-- ============================================================================
-- 7. GRANT APPROPRIATE PERMISSIONS
-- ============================================================================

-- Grant permissions on views
GRANT SELECT ON listings_with_owner_info TO authenticated;
GRANT SELECT ON active_listings_summary TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_owner_listing_stats TO authenticated;
GRANT EXECUTE ON FUNCTION archive_listing TO authenticated;
GRANT EXECUTE ON FUNCTION activate_listing TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_view_count TO authenticated;

-- ============================================================================
-- 8. CREATE USEFUL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_owner_active ON public.listings(owner_id, is_active, status)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_listings_category_active ON public.listings(category, is_active, created_at DESC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_listings_city_category ON public.listings(city, category, price)
  WHERE is_active = TRUE AND status = 'active';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'LISTINGS MANAGEMENT SYSTEM SETUP COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Created/Updated:';
  RAISE NOTICE '  ✓ Storage bucket: listing-images (10MB limit)';
  RAISE NOTICE '  ✓ RLS policies for secure image uploads';
  RAISE NOTICE '  ✓ Helper views: listings_with_owner_info, active_listings_summary';
  RAISE NOTICE '  ✓ Helper functions for listing management';
  RAISE NOTICE '  ✓ Triggers for automatic updates';
  RAISE NOTICE '  ✓ Performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Owners can now:';
  RAISE NOTICE '  • Create listings for properties, motorcycles, bicycles, yachts';
  RAISE NOTICE '  • Upload and manage listing images securely';
  RAISE NOTICE '  • View statistics with get_owner_listing_stats()';
  RAISE NOTICE '  • Activate/archive listings instead of deleting';
  RAISE NOTICE '  • Track view counts automatically';
  RAISE NOTICE '============================================================';
END $$;
