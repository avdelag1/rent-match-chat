-- Rename bedrooms/bathrooms columns to match TypeScript types
-- This fixes the mismatch between database column names and application code

-- Rename bedrooms to beds
ALTER TABLE public.listings
  RENAME COLUMN bedrooms TO beds;

-- Rename bathrooms to baths
ALTER TABLE public.listings
  RENAME COLUMN bathrooms TO baths;

-- Update client_filter_preferences table to match
ALTER TABLE public.client_filter_preferences
  RENAME COLUMN bedrooms_min TO min_bedrooms;

ALTER TABLE public.client_filter_preferences
  RENAME COLUMN bedrooms_max TO max_bedrooms;

-- Add helpful comment
COMMENT ON COLUMN public.listings.beds IS 'Number of bedrooms (renamed from bedrooms for consistency)';
COMMENT ON COLUMN public.listings.baths IS 'Number of bathrooms (renamed from bathrooms for consistency)';
