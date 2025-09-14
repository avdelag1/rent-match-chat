-- Enable RLS and create proper policies for data access

-- First, let's ensure RLS policies work correctly for listings
DROP POLICY IF EXISTS "Authenticated users can view listings for browsing" ON public.listings;
DROP POLICY IF EXISTS "Users can view active listings" ON public.listings;

-- Create a simple, working policy for viewing active listings
CREATE POLICY "Anyone can view active listings" 
ON public.listings 
FOR SELECT 
USING (is_active = true AND status = 'active');

-- Ensure client_filter_preferences has proper policies
DROP POLICY IF EXISTS "Users can view their own client filter preferences" ON public.client_filter_preferences;
CREATE POLICY "Users can view their own client filter preferences" 
ON public.client_filter_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure profiles table has proper policies for viewing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Ensure likes table has proper policies
DROP POLICY IF EXISTS "Allow authenticated users to read likes" ON public.likes;
CREATE POLICY "Allow authenticated users to read likes" 
ON public.likes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);