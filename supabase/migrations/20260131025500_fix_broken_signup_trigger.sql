-- ============================================
-- FIX BROKEN SIGNUP TRIGGER - Permanent Fix
-- Date: 2026-01-31
-- ============================================

-- Drop ALL broken triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS hook_create_profile_on_signup ON auth.users;

-- Drop broken functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.hook_create_profile_on_signup() CASCADE;

-- Recreate handle_new_user function (FIXED - no user_metadata reference)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    -- FIXED: Only use raw_user_meta_data (user_metadata doesn't exist)
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

    -- Create profile
    INSERT INTO public.profiles (
        id, email, full_name, role, is_active, onboarding_completed,
        created_at, updated_at
    ) VALUES (
        NEW.id, NEW.email, v_full_name, v_role, true, true, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Create user_role (no updated_at column)
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (NEW.id, v_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
