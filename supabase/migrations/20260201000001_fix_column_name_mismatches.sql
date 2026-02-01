-- Fix column name mismatches to align database with application code
-- This is CRITICAL for property listings and client filters to work

-- ISSUE #1: Rename bedrooms/bathrooms in listings table
ALTER TABLE public.listings
  RENAME COLUMN bedrooms TO beds;

ALTER TABLE public.listings
  RENAME COLUMN bathrooms TO baths;

-- ISSUE #2: Update client filter preferences column names to match types.ts
ALTER TABLE public.client_filter_preferences
  RENAME COLUMN bedrooms_min TO min_bedrooms;

ALTER TABLE public.client_filter_preferences
  RENAME COLUMN bedrooms_max TO max_bedrooms;

-- Add min/max bathrooms columns if they don't exist
-- (they may have been added manually but not in migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='client_filter_preferences'
                 AND column_name='min_bathrooms') THEN
    ALTER TABLE public.client_filter_preferences ADD COLUMN min_bathrooms INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='client_filter_preferences'
                 AND column_name='max_bathrooms') THEN
    ALTER TABLE public.client_filter_preferences ADD COLUMN max_bathrooms INTEGER;
  END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN public.listings.beds IS 'Number of bedrooms';
COMMENT ON COLUMN public.listings.baths IS 'Number of bathrooms';
COMMENT ON COLUMN public.client_filter_preferences.min_bedrooms IS 'Minimum number of bedrooms';
COMMENT ON COLUMN public.client_filter_preferences.max_bedrooms IS 'Maximum number of bedrooms';
COMMENT ON COLUMN public.client_filter_preferences.min_bathrooms IS 'Minimum number of bathrooms';
COMMENT ON COLUMN public.client_filter_preferences.max_bathrooms IS 'Maximum number of bathrooms';

-- ISSUE #3: Add unique constraint on conversations to prevent duplicates
ALTER TABLE public.conversations
  ADD CONSTRAINT IF NOT EXISTS unique_conversation_per_match
  UNIQUE (client_id, owner_id, listing_id);
