-- Fix remaining security issues for profiles table
-- First, check existing policies and only add what's missing

-- Drop any overly permissive policies that might exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow public access to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Only create new policies that don't exist yet
DO $$
BEGIN
  -- Add matching policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view profiles for matching'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view profiles for matching" 
    ON public.profiles 
    FOR SELECT 
    USING (
      auth.uid() IS NOT NULL 
      AND role IS NOT NULL 
      AND is_active = true 
      AND onboarding_completed = true
      AND auth.uid() != id
    )';
  END IF;

  -- Add admin view policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all profiles" 
    ON public.profiles 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = auth.uid() AND is_active = true
      )
    )';
  END IF;

  -- Add admin update policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can update any profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update any profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = auth.uid() AND is_active = true
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = auth.uid() AND is_active = true
      )
    )';
  END IF;
END
$$;

-- Add privacy settings column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_images": "true", "show_location": "false"}'::jsonb;

-- Create secure view for public profile data (only non-sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  age,
  role,
  verified,
  created_at,
  -- Only include profile image if user allows it
  CASE WHEN privacy_settings->>'show_images' = 'true' THEN avatar_url ELSE NULL END as avatar_url,
  -- Only show general location, not specific address
  CASE WHEN privacy_settings->>'show_location' = 'true' THEN location ELSE NULL END as general_location
FROM public.profiles
WHERE 
  is_active = true 
  AND onboarding_completed = true
  AND (privacy_settings->>'profile_visibility' = 'public' OR privacy_settings->>'profile_visibility' IS NULL);

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO authenticated;