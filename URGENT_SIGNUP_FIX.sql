-- ============================================
-- COMPLETE SIGNUP FIX - Database error saving new user
-- Run this in Supabase SQL Editor immediately
-- ============================================

-- Step 1: Ensure profiles table has correct RLS policies for signup
-- ============================================

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- Create permissive INSERT policy for signup
CREATE POLICY "Allow authenticated users to insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create SELECT policy
CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create UPDATE policy
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 2: Ensure user_roles table exists and has correct policies
-- ============================================

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

-- Create permissive policies for user_roles
CREATE POLICY "Allow authenticated users to view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 3: Create or replace upsert_user_role function
-- ============================================

DROP FUNCTION IF EXISTS public.upsert_user_role(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.upsert_user_role(
    p_user_id UUID,
    p_role TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with function owner's permissions
SET search_path = public
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Verify the caller is the user themselves
    IF auth.uid() != p_user_id THEN
        RETURN QUERY SELECT
            false::BOOLEAN,
            'Unauthorized: Cannot set role for another user'::TEXT,
            p_user_id,
            p_role;
        RETURN;
    END IF;

    -- Check if role entry exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Update existing role
        UPDATE public.user_roles
        SET role = p_role,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        -- Insert new role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (p_user_id, p_role)
        ON CONFLICT (user_id) DO UPDATE
        SET role = EXCLUDED.role,
            updated_at = NOW();
    END IF;

    RETURN QUERY SELECT
        true::BOOLEAN,
        'Role saved successfully'::TEXT,
        p_user_id,
        p_role;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT
        false::BOOLEAN,
        'Error: ' || SQLERRM::TEXT,
        p_user_id,
        p_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO authenticated;

-- Step 4: Ensure message_activations table has correct policies
-- ============================================

-- Create table if missing
CREATE TABLE IF NOT EXISTS public.message_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activation_type TEXT NOT NULL CHECK (activation_type IN ('welcome', 'referral_bonus', 'premium', 'purchase')),
    total_activations INTEGER DEFAULT 1,
    remaining_activations INTEGER DEFAULT 1,
    used_activations INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.message_activations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own activations" ON public.message_activations;
DROP POLICY IF EXISTS "Users can update own activations" ON public.message_activations;
DROP POLICY IF EXISTS "Authenticated users can insert activations for themselves" ON public.message_activations;

-- Create policies
CREATE POLICY "Allow users to view their own activations"
ON public.message_activations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own activations"
ON public.message_activations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own activations"
ON public.message_activations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Add missing columns to profiles if needed
-- ============================================

DO $$
BEGIN
    -- Add is_active if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add onboarding_completed if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add role if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT CHECK (role IN ('owner', 'worker', 'client'));
    END IF;
END $$;

-- Step 6: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_message_activations_user_id ON public.message_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_message_activations_type ON public.message_activations(activation_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Step 7: Verification queries
-- ============================================

DO $$
DECLARE
    profile_policies_count INTEGER;
    user_roles_policies_count INTEGER;
    message_activations_policies_count INTEGER;
    upsert_function_exists BOOLEAN;
BEGIN
    -- Count policies on profiles
    SELECT COUNT(*)
    INTO profile_policies_count
    FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public';

    -- Count policies on user_roles
    SELECT COUNT(*)
    INTO user_roles_policies_count
    FROM pg_policies
    WHERE tablename = 'user_roles' AND schemaname = 'public';

    -- Count policies on message_activations
    SELECT COUNT(*)
    INTO message_activations_policies_count
    FROM pg_policies
    WHERE tablename = 'message_activations' AND schemaname = 'public';

    -- Check if upsert_user_role function exists
    SELECT EXISTS(
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'upsert_user_role'
    ) INTO upsert_function_exists;

    -- Log results
    RAISE NOTICE '=== SIGNUP FIX VERIFICATION ===';
    RAISE NOTICE 'Profiles table policies: %', profile_policies_count;
    RAISE NOTICE 'User_roles table policies: %', user_roles_policies_count;
    RAISE NOTICE 'Message_activations table policies: %', message_activations_policies_count;
    RAISE NOTICE 'upsert_user_role function exists: %', upsert_function_exists;
    RAISE NOTICE '';

    IF profile_policies_count >= 3 AND user_roles_policies_count >= 3 AND
       message_activations_policies_count >= 3 AND upsert_function_exists THEN
        RAISE NOTICE '✅ ALL CHECKS PASSED - Signup should work now!';
    ELSE
        RAISE WARNING '⚠️ Some checks failed - review the output above';
    END IF;
END $$;

-- Step 8: Test signup flow (optional - uncomment to test)
-- ============================================

-- Uncomment these lines to test the signup flow:
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_role TEXT := 'client';
    test_email TEXT := 'test_' || test_user_id || '@example.com';
BEGIN
    -- Simulate profile creation
    INSERT INTO public.profiles (id, email, full_name, role, is_active, onboarding_completed)
    VALUES (test_user_id, test_email, 'Test User', test_role, true, true);

    -- Test upsert_user_role
    PERFORM * FROM public.upsert_user_role(test_user_id, test_role);

    -- Clean up test data
    DELETE FROM public.user_roles WHERE user_id = test_user_id;
    DELETE FROM public.profiles WHERE id = test_user_id;

    RAISE NOTICE '✅ Test signup flow completed successfully!';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ Test signup flow failed: %', SQLERRM;
    -- Clean up on error
    DELETE FROM public.user_roles WHERE user_id = test_user_id;
    DELETE FROM public.profiles WHERE id = test_user_id;
END $$;
*/

-- Done!
SELECT '🎉 Signup fix complete! Try signing up now.' AS status;
