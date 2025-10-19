-- Drop and recreate the handle_mutual_match function to fix trigger issues
DROP FUNCTION IF EXISTS public.handle_mutual_match() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_mutual_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create conversation when both parties have liked each other
  IF NEW.client_liked_at IS NOT NULL AND NEW.owner_liked_at IS NOT NULL THEN
    -- Create conversation if it doesn't exist
    -- This runs AFTER the match is inserted, so NEW.id is valid
    INSERT INTO public.conversations (match_id, client_id, owner_id, listing_id)
    VALUES (NEW.id, NEW.client_id, NEW.owner_id, NEW.listing_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger to use the fixed function
DROP TRIGGER IF EXISTS on_mutual_match ON public.matches;
DROP TRIGGER IF EXISTS handle_match_trigger ON public.matches;
DROP TRIGGER IF EXISTS mutual_match_trigger ON public.matches;

CREATE TRIGGER on_mutual_match
  AFTER INSERT OR UPDATE ON public.matches
  FOR EACH ROW
  WHEN (NEW.is_mutual = true)
  EXECUTE FUNCTION public.handle_mutual_match();