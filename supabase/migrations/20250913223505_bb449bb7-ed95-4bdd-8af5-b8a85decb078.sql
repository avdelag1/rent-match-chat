-- Add listing types preference to client filter preferences
ALTER TABLE public.client_filter_preferences 
ADD COLUMN IF NOT EXISTS preferred_listing_types text[] DEFAULT ARRAY['rent'];