-- Make match_id nullable to avoid foreign key constraint issues
ALTER TABLE public.conversations 
ALTER COLUMN match_id DROP NOT NULL;

-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS on_mutual_match ON public.matches;
DROP TRIGGER IF EXISTS handle_match_trigger ON public.matches;
DROP TRIGGER IF EXISTS mutual_match_trigger ON public.matches;
DROP FUNCTION IF EXISTS public.handle_mutual_match();