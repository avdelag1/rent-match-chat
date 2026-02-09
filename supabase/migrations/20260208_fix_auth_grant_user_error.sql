-- ============================================
-- FIX: Auth "Database error granting user" during sign-in
-- This fixes the trigger on auth.users that fails when logging in
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if handle_new_user trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name ILIKE '%handle_new_user%' OR trigger_name ILIKE '%create_profile%';

-- Step 2: Check for any failing triggers on auth.users
-- If there's an error, the trigger is broken

-- Step 3: Temporarily disable the trigger to test if login works
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Test login now. If it works, the trigger is the problem.

-- Step 4: Recreate the trigger safely (run ONLY if login failed before)
-- This version has proper error handling and schema qualification

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        'User'
    );
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

    -- Safe insert with exception handling - NEVER fail the auth flow
    BEGIN
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
            is_active = true,
            onboarding_completed = true,
            updated_at = NOW();

        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (NEW.id, v_role, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            updated_at = NOW();
    EXCEPTION 
        WHEN OTHERS THEN
            -- Log the error but NEVER fail the auth flow
            RAISE NOTICE 'Profile creation failed for user %, but login will continue: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Step 5: Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Step 6: Verify the trigger is working
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- ALTERNATIVE: Quick fix - drop trigger if you don't need it
-- Only run this if you don't need automatic profile creation
-- ============================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
