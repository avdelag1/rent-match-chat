-- Fix critical security issue: profiles table is publicly readable
-- First drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view client profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Clients can view owner profiles for properties" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create secure RLS policies for profiles table
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile during registration
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- For application functionality, owners need to see client profiles for matching
CREATE POLICY "Owners can view client profiles for matching" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'client' 
  AND public.get_current_user_role() = 'owner'
);

-- Clients can view owner profiles for properties
CREATE POLICY "Clients can view owner profiles for properties" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'owner' 
  AND public.get_current_user_role() = 'client'
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Admins can update profiles
CREATE POLICY "Admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);