-- Fix user_roles.id to have a default value
ALTER TABLE public.user_roles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Recreate the upsert_user_role function with explicit id generation
CREATE OR REPLACE FUNCTION public.upsert_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (id, user_id, role)
  VALUES (gen_random_uuid(), p_user_id, p_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;
END;
$$;