-- Add has_esc column to listings table
ALTER TABLE public.listings ADD COLUMN has_esc BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.listings.has_esc IS 'Electronic Stability Control feature for motorcycles';
