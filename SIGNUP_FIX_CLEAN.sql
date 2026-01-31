-- ============================================
-- URGENT SIGNUP FIX - Database error saving new user
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Fix profiles table RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

CREATE POLICY "Allow authenticated users to insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 2: Ensure user_roles table exists
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

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

-- Step 3: Create upsert_user_role function
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
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    IF auth.uid() != p_user_id THEN
        RETURN QUERY SELECT
            false::BOOLEAN,
            'Unauthorized'::TEXT,
            p_user_id,
            p_role;
        RETURN;
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM public.user_roles WHERE user_id = p_user_id
    ) INTO v_exists;

    IF v_exists THEN
        UPDATE public.user_roles
        SET role = p_role, updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (p_user_id, p_role)
        ON CONFLICT (user_id) DO UPDATE
        SET role = EXCLUDED.role, updated_at = NOW();
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
$function$;

GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO authenticated;

-- Step 4: Fix message_activations table
-- ============================================

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

ALTER TABLE public.message_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activations" ON public.message_activations;
DROP POLICY IF EXISTS "Users can update own activations" ON public.message_activations;
DROP POLICY IF EXISTS "Authenticated users can insert activations for themselves" ON public.message_activations;

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

-- Step 5: Add missing columns to profiles
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT CHECK (role IN ('owner', 'worker', 'client'));
    END IF;
END $$;

-- Step 6: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_message_activations_user_id ON public.message_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_message_activations_type ON public.message_activations(activation_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Done!
SELECT 'Signup fix complete! Try signing up now.' AS status;
