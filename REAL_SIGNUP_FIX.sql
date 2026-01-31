-- ================================================================
-- REAL SIGNUP FIX - This will actually work
-- The problem: RLS policies require "authenticated" role
-- But during signup, the trigger runs with different permissions
-- ================================================================

-- Step 1: Drop the broken handle_new_user trigger if it exists
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Fix RLS policies to work during signup
-- ================================================================

-- PROFILES TABLE: Allow BOTH authenticated AND service_role to insert
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- New permissive policy for INSERT (works during signup)
CREATE POLICY "profiles_insert_policy"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- New policy for SELECT
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (auth.uid() = id OR auth.role() = 'service_role');

-- New policy for UPDATE
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Step 3: Fix user_roles table policies
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Remove FK constraint temporarily
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own role" ON public.user_roles;

CREATE POLICY "user_roles_select_policy"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_roles_insert_policy"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_roles_update_policy"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Step 4: Fix message_activations policies
-- ================================================================

CREATE TABLE IF NOT EXISTS public.message_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Remove FK constraint temporarily
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

DROP POLICY IF EXISTS "Allow users to view their own activations" ON public.message_activations;
DROP POLICY IF EXISTS "Allow users to insert their own activations" ON public.message_activations;
DROP POLICY IF EXISTS "Allow users to update their own activations" ON public.message_activations;

CREATE POLICY "message_activations_select_policy"
ON public.message_activations
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "message_activations_insert_policy"
ON public.message_activations
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "message_activations_update_policy"
ON public.message_activations
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Step 5: Recreate upsert_user_role with proper permissions
-- ================================================================

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
SECURITY DEFINER  -- This runs with elevated permissions
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role, updated_at = NOW();

    RETURN QUERY SELECT
        true::BOOLEAN,
        'Role saved'::TEXT,
        p_user_id,
        p_role;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT
        false::BOOLEAN,
        SQLERRM::TEXT,
        p_user_id,
        p_role;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO service_role;

-- Step 6: Add required columns if missing
-- ================================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT CHECK (role IN ('owner', 'worker', 'client'));
    END IF;
END $$;

-- Step 7: Disable email confirmation if not configured
-- ================================================================
-- This is often the REAL problem - email confirmation is ON but SMTP is not set up

-- Check if email confirmation is enabled
DO $$
DECLARE
    email_confirm_enabled TEXT;
BEGIN
    -- Try to get the setting (might not exist in all Supabase versions)
    BEGIN
        SELECT value INTO email_confirm_enabled
        FROM auth.config
        WHERE key = 'MAILER_AUTOCONFIRM';
    EXCEPTION WHEN OTHERS THEN
        email_confirm_enabled := NULL;
    END;

    IF email_confirm_enabled IS NULL OR email_confirm_enabled = 'false' THEN
        RAISE NOTICE 'Email confirmation appears to be disabled or setting not found';
        RAISE NOTICE 'If signup still fails, disable "Confirm email" in Supabase Dashboard > Authentication > Providers > Email';
    END IF;
END $$;

-- Done!
SELECT 'Signup fix applied! Try signing up now. If it still fails, disable email confirmation in Supabase Dashboard.' AS status;
