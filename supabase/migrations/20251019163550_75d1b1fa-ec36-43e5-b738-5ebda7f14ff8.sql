-- Add missing budget and income columns to owner_client_preferences table
ALTER TABLE public.owner_client_preferences
ADD COLUMN IF NOT EXISTS min_budget numeric,
ADD COLUMN IF NOT EXISTS max_budget numeric,
ADD COLUMN IF NOT EXISTS min_monthly_income numeric,
ADD COLUMN IF NOT EXISTS requires_employment_proof boolean DEFAULT false;