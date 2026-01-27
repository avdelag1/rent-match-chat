
-- Fix missing user roles for users who signed up but didn't get roles assigned
-- This can happen if the signup process was interrupted

-- Add missing roles for users without roles (default to 'client')
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'client'
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role IS NULL
ON CONFLICT (user_id) DO NOTHING;
