-- Create client category preferences table
CREATE TABLE IF NOT EXISTS public.client_category_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('property', 'moto', 'bicycle', 'yacht')),
  interest_type TEXT NOT NULL CHECK (interest_type IN ('rent', 'buy', 'both')),
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.client_category_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage their own category preferences"
  ON public.client_category_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add columns to owner_client_preferences
ALTER TABLE public.owner_client_preferences
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'property' CHECK (category IN ('property', 'moto', 'bicycle', 'yacht')),
ADD COLUMN IF NOT EXISTS interest_type TEXT CHECK (interest_type IN ('rent', 'buy', 'both')),
ADD COLUMN IF NOT EXISTS category_filters JSONB DEFAULT '{}';

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_owner_prefs_category 
  ON public.owner_client_preferences(user_id, category);

-- Create index for client category prefs
CREATE INDEX IF NOT EXISTS idx_client_category_prefs 
  ON public.client_category_preferences(user_id, category);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION public.update_client_category_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_client_category_prefs_timestamp
  BEFORE UPDATE ON public.client_category_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_category_prefs_timestamp();