-- Migration: Add Worker/Service Provider Listing Support
-- This migration adds the necessary columns and policies to support worker/service listings
-- as part of the unified listings system (property, vehicle, worker)

-- Add worker-specific columns to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS custom_service_name TEXT,
ADD COLUMN IF NOT EXISTS pricing_unit TEXT DEFAULT 'per_hour',
ADD COLUMN IF NOT EXISTS availability TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Add comment explaining the new columns
COMMENT ON COLUMN public.listings.service_category IS 'Service category for worker listings (e.g., nanny, chef, cleaning, massage, yoga, etc.)';
COMMENT ON COLUMN public.listings.custom_service_name IS 'Custom service name when category is "other"';
COMMENT ON COLUMN public.listings.pricing_unit IS 'Pricing unit for workers (per_hour, per_session, per_day, per_week, per_month, quote)';
COMMENT ON COLUMN public.listings.availability IS 'Worker availability description';
COMMENT ON COLUMN public.listings.experience_years IS 'Years of experience for service providers';
COMMENT ON COLUMN public.listings.languages IS 'Languages spoken by the service provider';

-- Create index for service_category for faster filtering
CREATE INDEX IF NOT EXISTS idx_listings_service_category ON public.listings(service_category) WHERE category = 'worker';

-- Create index for worker listings discovery
CREATE INDEX IF NOT EXISTS idx_listings_worker_active ON public.listings(category, status, is_active)
WHERE category = 'worker' AND status = 'active' AND is_active = true;

-- Update the listings RLS policies to ensure proper access
-- Drop existing policies if they exist (to recreate them with proper permissions)
DO $$
BEGIN
    -- Check and drop existing policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'listings' AND policyname = 'Anyone can view active listings') THEN
        DROP POLICY "Anyone can view active listings" ON public.listings;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'listings' AND policyname = 'Owners can manage their own listings') THEN
        DROP POLICY "Owners can manage their own listings" ON public.listings;
    END IF;
END
$$;

-- Policy: Anyone can view active/published listings (including worker listings)
CREATE POLICY "Anyone can view active listings"
ON public.listings
FOR SELECT
USING (
    status = 'active' AND is_active = true
);

-- Policy: Only sellers (owner role) can create listings
-- Clients cannot create listings
CREATE POLICY "Sellers can create listings"
ON public.listings
FOR INSERT
WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'owner'
    )
);

-- Policy: Sellers can only update/delete their own listings
CREATE POLICY "Sellers can manage their own listings"
ON public.listings
FOR ALL
USING (
    auth.uid() = owner_id
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'owner'
    )
)
WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'owner'
    )
);

-- Ensure RLS is enabled on listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Add a check constraint to ensure valid service categories
-- (Optional - uncomment if you want strict validation)
-- ALTER TABLE public.listings ADD CONSTRAINT valid_service_category
-- CHECK (
--     category != 'worker' OR
--     service_category IN (
--         'nanny', 'chef', 'cleaning', 'massage', 'english_teacher',
--         'spanish_teacher', 'yoga', 'personal_trainer', 'handyman',
--         'gardener', 'pool_maintenance', 'driver', 'security',
--         'broker', 'tour_guide', 'photographer', 'pet_care',
--         'music_teacher', 'beauty', 'other'
--     )
-- );

-- Grant necessary permissions
GRANT SELECT ON public.listings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;
