-- Fix infinite recursion in RLS policies by removing problematic cross-table references

-- Drop all conflicting policies that might cause recursion
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admin users can view admin profiles" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create simple policy for admin_users that doesn't reference other tables
CREATE POLICY "Admin users can view admin profiles" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = id);

-- Create simple policy for audit_logs
CREATE POLICY "Authenticated users can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);