-- Fix listings listing_type check constraint
-- The constraint only allows 'rent', 'buy', 'service' but the frontend
-- might be sending other values or NULL

-- 1. Drop the restrictive check
ALTER TABLE public.listings 
  DROP CONSTRAINT IF EXISTS listings_listing_type_check;

-- 2. Add more flexible check that allows NULL and 'both'
ALTER TABLE public.listings
  ADD CONSTRAINT listings_listing_type_check
  CHECK (
    listing_type IS NULL OR 
    LOWER(listing_type) IN ('rent', 'buy', 'service')
  );

-- 3. Also fix the mode check - frontend sends 'both' but it might not be allowed
ALTER TABLE public.listings 
  DROP CONSTRAINT IF EXISTS listings_mode_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_mode_check
  CHECK (
    mode IS NULL OR 
    LOWER(mode) IN ('rent', 'sale', 'both')
  );
