-- Fix the missing preferred_activities column in profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_activities TEXT[];