-- ==========================================================
-- Fix property column names to match production database
-- Production DB uses 'beds' and 'baths' (not 'bedrooms' and 'bathrooms')
-- ==========================================================

-- Rename bedrooms to beds (if the column is named bedrooms)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'listings'
    AND column_name = 'bedrooms'
  ) THEN
    ALTER TABLE public.listings RENAME COLUMN bedrooms TO beds;
  END IF;
END $$;

-- Rename bathrooms to baths (if the column is named bathrooms)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'listings'
    AND column_name = 'bathrooms'
  ) THEN
    ALTER TABLE public.listings RENAME COLUMN bathrooms TO baths;
  END IF;
END $$;

-- Also update client_filter_preferences table for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'client_filter_preferences'
    AND column_name = 'bedrooms_min'
  ) THEN
    ALTER TABLE public.client_filter_preferences RENAME COLUMN bedrooms_min TO beds_min;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'client_filter_preferences'
    AND column_name = 'bedrooms_max'
  ) THEN
    ALTER TABLE public.client_filter_preferences RENAME COLUMN bedrooms_max TO beds_max;
  END IF;
END $$;
