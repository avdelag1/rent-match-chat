-- Create role validation security definer function to prevent recursive RLS issues
CREATE OR REPLACE FUNCTION public.validate_user_role_access(
  p_user_id UUID,
  p_required_role TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
    AND role = p_required_role::app_role
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_user_role_access(UUID, TEXT) TO authenticated;