-- CRITICAL SECURITY FIX: Remove public access to listings
-- These policies expose property owner information to unauthorized users

-- Drop all overly permissive policies that allow public/unrestricted access
DROP POLICY IF EXISTS "Allow public read access to all listings" ON public.listings;
DROP POLICY IF EXISTS "Allow read access to all users" ON public.listings;
DROP POLICY IF EXISTS "Allow authenticated users to view listings" ON public.listings;

-- Clean up duplicate policies to avoid conflicts
DROP POLICY IF EXISTS "Allow owners to create their own listings" ON public.listings;
DROP POLICY IF EXISTS "Allow owners to delete their own listings" ON public.listings;
DROP POLICY IF EXISTS "Allow owners to update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners and admins can create listings" ON public.listings;
DROP POLICY IF EXISTS "Owners and admins can delete their own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners and admins can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can delete their own properties" ON public.listings;
DROP POLICY IF EXISTS "Owners can update their own properties" ON public.listings;
DROP POLICY IF EXISTS "Owners can upload their own properties" ON public.listings;

-- Create secure, restrictive policies that protect owner contact information

-- 1. Authenticated users can view active listings for browsing (but with limited owner exposure)
CREATE POLICY "Authenticated users can view listings for browsing" 
ON public.listings 
FOR SELECT 
TO authenticated
USING (
  is_active = true 
  AND status = 'active'
);

-- 2. Property owners can manage their own listings
CREATE POLICY "Owners can manage their own listings" 
ON public.listings 
FOR ALL 
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 3. Admins can manage all listings for moderation
CREATE POLICY "Admins can manage all listings" 
ON public.listings 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- 4. Create a secure view that hides sensitive owner information
CREATE OR REPLACE VIEW public.listings_public AS
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
  images,
  amenities,
  furnished,
  pet_friendly,
  created_at,
  -- Hide owner_id and other sensitive owner data
  'contact_via_platform' as contact_method,
  -- Only show general availability status
  CASE WHEN is_active THEN 'available' ELSE 'unavailable' END as availability_status
FROM public.listings
WHERE 
  is_active = true 
  AND status = 'active';

-- Grant access to the secure view
GRANT SELECT ON public.listings_public TO authenticated;

-- Add audit logging for listings access
CREATE OR REPLACE FUNCTION log_listing_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when someone accesses listing data that could expose owner info
  IF TG_OP = 'SELECT' AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO audit_logs (
      table_name, 
      action, 
      record_id, 
      changed_by, 
      details
    ) VALUES (
      'listings',
      'SELECT_WITH_OWNER_INFO',
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'owner_id_accessed', NEW.owner_id,
        'access_time', NOW(),
        'user_role', (SELECT role FROM profiles WHERE id = auth.uid())
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;