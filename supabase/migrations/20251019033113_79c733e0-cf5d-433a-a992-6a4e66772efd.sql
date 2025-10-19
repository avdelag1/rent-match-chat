-- Fix the handle_mutual_match trigger to run AFTER instead of BEFORE
-- This prevents the foreign key constraint violation

-- First, check what triggers exist
DROP TRIGGER IF EXISTS on_mutual_match ON public.matches;
DROP TRIGGER IF EXISTS handle_match_trigger ON public.matches;
DROP TRIGGER IF EXISTS mutual_match_trigger ON public.matches;

-- Recreate trigger with proper timing
-- For INSERT operations, we can't check OLD values, so we simplify
CREATE TRIGGER on_mutual_match
  AFTER INSERT OR UPDATE ON public.matches
  FOR EACH ROW
  WHEN (NEW.is_mutual = true)
  EXECUTE FUNCTION public.handle_mutual_match();