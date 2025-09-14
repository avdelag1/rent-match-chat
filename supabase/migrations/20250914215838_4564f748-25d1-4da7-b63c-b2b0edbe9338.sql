-- Drop the problematic trigger temporarily
DROP TRIGGER IF EXISTS profile_update_trigger ON profiles;

-- Fix the log_profile_update function
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
    perform log_security_event(
        'profile_update', 
        jsonb_build_object(
            'old_email', old.email,
            'new_email', new.email,
            'profile_id', new.id,
            'changes', row_to_json(new) - row_to_json(old)
        )
    );
    return new;
end;
$$;

-- Update owner profiles to mark onboarding as completed
UPDATE profiles 
SET onboarding_completed = true 
WHERE role = 'owner' 
  AND (onboarding_completed = false OR onboarding_completed IS NULL);