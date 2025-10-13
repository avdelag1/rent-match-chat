-- Add theme_preference column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'default' CHECK (theme_preference IN ('default', 'dark', 'amber', 'red'));