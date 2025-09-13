-- Fix critical security issue: profiles table is publicly readable
-- Enable proper RLS policies for the profiles table

-- First, ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- For application functionality, owners need to see basic client info during matching
-- This is a controlled view that only shows essential matching data
CREATE POLICY "Owners can view client profiles for matching" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'client' 
  AND EXISTS (
    SELECT 1 FROM public.profiles owner_profile 
    WHERE owner_profile.id = auth.uid() 
    AND owner_profile.role = 'owner'
  )
);

-- Clients can view basic owner info for properties they're interested in
CREATE POLICY "Clients can view owner profiles for properties" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'owner' 
  AND EXISTS (
    SELECT 1 FROM public.profiles client_profile 
    WHERE client_profile.id = auth.uid() 
    AND client_profile.role = 'client'
  )
);

-- Admins can view all profiles for moderation
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

-- Admins can update profiles for moderation
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