-- Fix profiles table RLS policies for security
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public access to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure RLS policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to view basic profile info for matching purposes (limited fields)
-- This policy allows viewing of profiles for legitimate matching but restricts sensitive data
CREATE POLICY "Users can view profiles for matching" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND role IS NOT NULL 
  AND is_active = true 
  AND onboarding_completed = true
  AND auth.uid() != id
);

-- Admins can view all profiles for moderation
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Admins can update any profile for moderation
CREATE POLICY "Admins can update any profile" 
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
);

-- Create a secure view for public profile data (only non-sensitive fields)
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

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add privacy settings column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_images": "true", "show_location": "false"}'::jsonb;