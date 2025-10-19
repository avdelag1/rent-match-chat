-- Create owner_client_preferences table for owner filter preferences
CREATE TABLE IF NOT EXISTS public.owner_client_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Budget filters
  min_budget NUMERIC,
  max_budget NUMERIC,
  
  -- Age filters
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 65,
  
  -- Lifestyle compatibility
  compatible_lifestyle_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Property rules
  allows_pets BOOLEAN DEFAULT true,
  allows_smoking BOOLEAN DEFAULT false,
  allows_parties BOOLEAN DEFAULT false,
  
  -- Client requirements
  requires_employment_proof BOOLEAN DEFAULT false,
  requires_references BOOLEAN DEFAULT false,
  min_monthly_income NUMERIC,
  
  -- Preferred client attributes
  preferred_occupations TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_nationalities TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.owner_client_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Owners can manage their own preferences
CREATE POLICY "Owners can view own preferences"
  ON public.owner_client_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert own preferences"
  ON public.owner_client_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own preferences"
  ON public.owner_client_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete own preferences"
  ON public.owner_client_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_owner_client_preferences_user_id ON public.owner_client_preferences(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_owner_client_preferences_updated_at
  BEFORE UPDATE ON public.owner_client_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();