-- Add comprehensive filter columns to saved_filters table
ALTER TABLE public.saved_filters
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS listing_types text[] DEFAULT ARRAY['property']::text[],
ADD COLUMN IF NOT EXISTS client_types text[] DEFAULT ARRAY['tenant']::text[],
ADD COLUMN IF NOT EXISTS min_budget numeric,
ADD COLUMN IF NOT EXISTS max_budget numeric,
ADD COLUMN IF NOT EXISTS min_age integer DEFAULT 18,
ADD COLUMN IF NOT EXISTS max_age integer DEFAULT 65,
ADD COLUMN IF NOT EXISTS lifestyle_tags text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS preferred_occupations text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS allows_pets boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allows_smoking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allows_parties boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_employment_proof boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_references boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_monthly_income numeric;

-- Add unique constraint on user_id and name combination
CREATE UNIQUE INDEX IF NOT EXISTS saved_filters_user_name_unique 
ON public.saved_filters(user_id, name) 
WHERE name IS NOT NULL;

-- Add index for active filter lookup
CREATE INDEX IF NOT EXISTS saved_filters_user_active_idx 
ON public.saved_filters(user_id, is_active) 
WHERE is_active = true;

-- Update RLS policies for saved_filters
DROP POLICY IF EXISTS "Users can view their own saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can create their own saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can update their own saved filters" ON public.saved_filters;
DROP POLICY IF EXISTS "Users can delete their own saved filters" ON public.saved_filters;

CREATE POLICY "Users can manage their own saved filters" 
ON public.saved_filters 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);