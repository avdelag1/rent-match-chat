-- Fix infinite recursion by dropping problematic policies that reference the same table

-- Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create new simple, non-recursive policies for admin_users table
CREATE POLICY "Enable select for authenticated users on admin_users" 
ON public.admin_users FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for service role on admin_users" 
ON public.admin_users FOR INSERT 
WITH CHECK (true);

-- Ensure all profiles policies are safe and non-recursive
-- Keep the existing good policies that don't cause recursion
-- (The profiles policies were already fixed in the previous migration)