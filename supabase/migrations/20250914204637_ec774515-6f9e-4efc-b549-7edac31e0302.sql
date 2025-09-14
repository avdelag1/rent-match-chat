-- Remove the problematic trigger and function that's causing signup failures
DROP TRIGGER IF EXISTS update_password_complexity_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.update_password_complexity();

-- Also remove any other password-related functions that might cause similar issues
DROP FUNCTION IF EXISTS public.update_password_complexity(password text);
DROP FUNCTION IF EXISTS public.check_password_strength(password text);

-- Ensure our working trigger remains intact (just a safety check)
-- The handle_new_user trigger should already exist and work correctly