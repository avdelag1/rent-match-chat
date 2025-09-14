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

-- Add audit logging function for admin data access attempts
CREATE OR REPLACE FUNCTION public.log_admin_data_access(accessed_admin_id uuid, accessed_admin_email text)
RETURNS void
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
    accessed_admin_id,
    jsonb_build_object(
      'accessed_admin_email', accessed_admin_email,
      'access_timestamp', NOW()
    )
  );
END;
$function$;