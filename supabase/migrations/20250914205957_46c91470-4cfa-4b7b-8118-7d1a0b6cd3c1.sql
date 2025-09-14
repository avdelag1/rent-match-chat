-- Fix the missing trigger that creates profiles when users sign up
-- This is the core issue causing the signup failures

-- First ensure the trigger exists on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Also ensure the profiles table has the correct structure
-- Check if we need to add any missing columns that the function expects
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
  
  -- Add full_name column if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name text;
  END IF;
END $$;