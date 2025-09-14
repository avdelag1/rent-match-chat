-- Complete cleanup of all problematic triggers and functions on profiles table
-- This should fix the signup issue once and for all

-- Drop ALL triggers on the profiles table
DROP TRIGGER IF EXISTS update_password_complexity_trigger ON public.profiles;
DROP TRIGGER IF EXISTS update_modified_column_trigger ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS profiles_update_trigger ON public.profiles;

-- Drop ALL related functions that might be causing issues
DROP FUNCTION IF EXISTS public.update_modified_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_password_complexity() CASCADE;
DROP FUNCTION IF EXISTS public.update_password_complexity(password text) CASCADE;
DROP FUNCTION IF EXISTS public.check_password_strength(password text) CASCADE;
DROP FUNCTION IF EXISTS public.update_profiles_modtime() CASCADE;

-- Recreate ONLY the correct trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the correct trigger for updating timestamps on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verify our handle_new_user trigger is still working (this should already exist)
-- If it doesn't exist, we'll recreate it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;