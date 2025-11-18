-- Add availability_status column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'
CHECK (availability_status IN ('available', 'rented', 'sold', 'pending'));

-- Add comment
COMMENT ON COLUMN public.listings.availability_status IS 
'Availability status of the listing: available, rented, sold, or pending';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_listings_availability_status 
ON public.listings(availability_status) 
WHERE availability_status IS NOT NULL;

-- Create function to toggle availability
CREATE OR REPLACE FUNCTION public.toggle_listing_availability(
  p_listing_id UUID,
  p_new_availability TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate availability status
  IF p_new_availability NOT IN ('available', 'rented', 'sold', 'pending') THEN
    RAISE EXCEPTION 'Invalid availability status: %', p_new_availability;
  END IF;

  -- Update listing
  UPDATE public.listings
  SET 
    availability_status = p_new_availability,
    updated_at = NOW()
  WHERE id = p_listing_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found: %', p_listing_id;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.toggle_listing_availability(UUID, TEXT) TO authenticated;

-- Add oauth_pending_role and oauth_provider columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS oauth_pending_role TEXT 
CHECK (oauth_pending_role IN ('client', 'owner'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_pending_role 
ON public.profiles(oauth_pending_role) 
WHERE oauth_pending_role IS NOT NULL;

COMMENT ON COLUMN public.profiles.oauth_pending_role IS 
'Stores the pending role for OAuth users during signup flow';

COMMENT ON COLUMN public.profiles.oauth_provider IS 
'OAuth provider used for authentication (google, facebook, etc)';