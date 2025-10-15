-- Create function to upsert user role
CREATE OR REPLACE FUNCTION public.upsert_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;
END;
$$;