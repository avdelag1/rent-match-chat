-- Fix critical security vulnerability: Admin user data exposure
-- Remove overly permissive SELECT policy that allows all authenticated users to read admin data

-- Drop the dangerous policy that allows all authenticated users to view admin data
DROP POLICY IF EXISTS "Enable select for authenticated users on admin_users" ON public.admin_users;

-- Create a secure policy that only allows admin users to view other admin users
CREATE POLICY "Only admin users can view admin profiles"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  -- Only allow if the requesting user is an admin themselves
  EXISTS (
    SELECT 1 
    FROM public.admin_users au 
    WHERE au.id = auth.uid() 
    AND au.is_active = true
  )
);

-- Ensure the existing policy for users viewing their own profile remains
-- (This should already exist but let's make sure)
CREATE POLICY "Admin users can view their own profile" 
ON public.admin_users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Add audit logging for admin data access attempts
CREATE OR REPLACE FUNCTION public.log_admin_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log when admin data is accessed
  INSERT INTO public.admin_activity_logs (
    admin_user_id,
    action,
    target_table,
    target_id,
    details
  ) VALUES (
    auth.uid(),
    'VIEW_ADMIN_DATA',
    'admin_users',
    NEW.id,
    jsonb_build_object(
      'accessed_admin_email', NEW.email,
      'access_timestamp', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Add trigger to log admin data access
DROP TRIGGER IF EXISTS log_admin_data_access_trigger ON public.admin_users;
CREATE TRIGGER log_admin_data_access_trigger
  AFTER SELECT ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_data_access();