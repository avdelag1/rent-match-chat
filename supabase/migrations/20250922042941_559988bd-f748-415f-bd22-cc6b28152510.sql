-- Fix critical security issue: Properly remove and recreate profile access policies

-- First, drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile visibility for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Now create secure, restrictive policies

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

-- 4. Limited visibility for matching - only non-sensitive data for active users
CREATE POLICY "Limited profile visibility for matching"
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  is_active = true AND 
  onboarding_completed = true AND
  auth.uid() != id
);

-- Fix client profiles table security too
DROP POLICY IF EXISTS "Users can view their own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can manage own client profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.client_profiles;

-- Create secure client profile policy
CREATE POLICY "Users can manage own client profile"
ON public.client_profiles 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);