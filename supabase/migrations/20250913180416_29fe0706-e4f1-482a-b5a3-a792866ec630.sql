-- Complete the security fix by removing remaining problematic policies
-- and creating secure access patterns

-- Remove the remaining public access policy that still exposes owner info
DROP POLICY IF EXISTS "Allow active users to insert listings" ON public.listings;

-- Replace with secure policy for authenticated users only
CREATE POLICY "Authenticated owners can create listings" 
ON public.listings 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = owner_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);

-- Create a secure public view that completely hides owner information
-- This view can be used for property browsing without exposing contact details
CREATE OR REPLACE VIEW public.listings_browse AS
SELECT 
  id,
  title,
  description,
  price,
  beds,
  baths,
  square_footage,
  property_type,
  city,
  neighborhood,
  location_zone,
  images,
  amenities,
  furnished,
  pet_friendly,
  created_at,
  view_count,
  -- Completely hide owner_id and any identifying information
  -- Users must go through the platform's matching system to contact owners
  'Available for viewing' as contact_status,
  'Use platform messaging' as contact_method
FROM public.listings
WHERE 
  is_active = true 
  AND status = 'active';

-- Grant access to browsing view for authenticated users only
GRANT SELECT ON public.listings_browse TO authenticated;

-- Revoke any existing grants on the main listings table to public
REVOKE ALL ON public.listings FROM public;

-- Add security comment
COMMENT ON TABLE public.listings IS 'Listings table with RLS policies - owner contact information protected. Use listings_browse view for safe public browsing.';
COMMENT ON VIEW public.listings_browse IS 'Secure view for browsing listings without exposing owner contact information';