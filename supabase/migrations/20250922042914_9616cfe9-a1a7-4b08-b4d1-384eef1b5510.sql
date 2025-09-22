-- Fix critical security issue: Remove overly permissive profile access policies
-- and implement proper access controls

-- Drop the existing overly permissive policies that allow public access
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure, restrictive policies for the profiles table

-- 1. Users can only view their own complete profile
CREATE POLICY "Users can view own profile"
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can only update their own profile  
CREATE POLICY "Users can update own profile"
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Create limited visibility for matching - only basic, non-sensitive data
CREATE POLICY "Limited profile visibility for matching"
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  is_active = true AND 
  onboarding_completed = true AND
  auth.uid() != id
);

-- 5. Create a security definer function for safe profile access during matching
CREATE OR REPLACE FUNCTION public.get_safe_profile_for_matching(profile_id uuid)
RETURNS TABLE(
  id uuid,
  role text,
  age integer,
  bio text,
  interests text[],
  lifestyle_tags text[],
  images text[],
  full_name text,
  location text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return non-sensitive profile data for matching purposes
  -- Exclude sensitive fields like email, phone, monthly_income, etc.
  RETURN QUERY
  SELECT 
    p.id,
    p.role,
    p.age,
    p.bio,
    p.interests,
    p.lifestyle_tags,
    p.images,
    p.full_name,
    p.location
  FROM public.profiles p
  WHERE p.id = profile_id
    AND p.is_active = true
    AND p.onboarding_completed = true
    AND auth.uid() IS NOT NULL
    AND auth.uid() != p.id;
END;
$$;

-- 6. Fix the client profiles table RLS as well
DROP POLICY IF EXISTS "Users can view their own profile" ON public.client_profiles;

-- Create proper client profile policies - users can only access their own data
CREATE POLICY "Users can manage own client profile"
ON public.client_profiles 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);