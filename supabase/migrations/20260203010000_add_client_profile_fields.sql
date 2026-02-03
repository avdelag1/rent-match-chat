-- ==========================================================
-- Add new fields to client_profiles table for better matching
-- ==========================================================

-- Add services_needed field (what professional services they're looking for)
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS services_needed TEXT[] DEFAULT '{}';

-- Add budget_range field (their budget for rentals/purchases)
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- Add move_in_timeline field (when they need to move in)
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS move_in_timeline TEXT;

-- Add location preferences
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS location_city TEXT;

ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'Mexico';

-- Add occupation field
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_profiles_services_needed
  ON public.client_profiles USING GIN(services_needed);

CREATE INDEX IF NOT EXISTS idx_client_profiles_budget_range
  ON public.client_profiles(budget_range);

CREATE INDEX IF NOT EXISTS idx_client_profiles_location
  ON public.client_profiles(location_country, location_city);

-- Add comments for documentation
COMMENT ON COLUMN public.client_profiles.services_needed IS 'Array of service categories the client is looking for (e.g., nanny, chef, cleaning)';
COMMENT ON COLUMN public.client_profiles.budget_range IS 'Client budget range (e.g., under_500, 500_1000, 1000_2000, etc.)';
COMMENT ON COLUMN public.client_profiles.move_in_timeline IS 'When the client needs to move in (e.g., immediately, within_month, 1_3_months, etc.)';
COMMENT ON COLUMN public.client_profiles.location_city IS 'Preferred city for property/rental search';
COMMENT ON COLUMN public.client_profiles.location_country IS 'Preferred country for property/rental search';
COMMENT ON COLUMN public.client_profiles.occupation IS 'Client occupation/profession';
