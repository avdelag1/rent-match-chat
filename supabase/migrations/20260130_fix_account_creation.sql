-- ============================================
-- FIX ACCOUNT CREATION ISSUES
-- Date: 2026-01-30
-- Purpose: Add missing user_roles table and upsert_user_role function
-- ============================================

-- ============================================
-- STEP 1: CREATE USER_ROLES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================
-- STEP 2: ENABLE RLS ON USER_ROLES
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own role during signup
CREATE POLICY "Users can insert own role"
    ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own role
CREATE POLICY "Users can update own role"
    ON public.user_roles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: CREATE UPSERT_USER_ROLE RPC FUNCTION
-- ============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.upsert_user_role(UUID, TEXT);

-- Create the function that signup code depends on
CREATE FUNCTION public.upsert_user_role(
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
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if role entry already exists
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

        RETURN QUERY SELECT
            true::BOOLEAN,
            'Role updated successfully'::TEXT,
            p_user_id,
            p_role;
    ELSE
        -- Insert new role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (p_user_id, p_role)
        ON CONFLICT (user_id) DO UPDATE
        SET role = EXCLUDED.role,
            updated_at = NOW();

        RETURN QUERY SELECT
            true::BOOLEAN,
            'Role created successfully'::TEXT,
            p_user_id,
            p_role;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT
        false::BOOLEAN,
        'Error: ' || SQLERRM::TEXT,
        p_user_id,
        p_role;
END;
$$;

-- ============================================
-- STEP 4: CREATE MESSAGE_ACTIVATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.message_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activation_type TEXT NOT NULL CHECK (activation_type IN ('welcome', 'referral_bonus', 'premium', 'purchase')),
    total_activations INTEGER DEFAULT 1,
    remaining_activations INTEGER DEFAULT 1,
    used_activations INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_message_activations_user_id ON public.message_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_message_activations_type ON public.message_activations(activation_type);
CREATE INDEX IF NOT EXISTS idx_message_activations_expires ON public.message_activations(expires_at);

-- ============================================
-- STEP 5: ENABLE RLS ON MESSAGE_ACTIVATIONS
-- ============================================

ALTER TABLE public.message_activations ENABLE ROW LEVEL SECURITY;

-- Users can view their own activations
CREATE POLICY "Users can view own activations"
    ON public.message_activations FOR SELECT USING (auth.uid() = user_id);

-- Users can use their own activations (update)
CREATE POLICY "Users can update own activations"
    ON public.message_activations FOR UPDATE USING (auth.uid() = user_id);

-- System can insert (via RPC or trigger)
CREATE POLICY "Authenticated users can insert activations for themselves"
    ON public.message_activations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 6: ADD IS_ACTIVE TO PROFILES IF MISSING
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

-- ============================================
-- STEP 7: POPULATE EXISTING USER_ROLES
-- ============================================

-- For any existing profiles without a user_role entry, create one
INSERT INTO public.user_roles (user_id, role)
SELECT id, role
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check user_roles table exists and has correct structure
-- SELECT * FROM public.user_roles LIMIT 1;

-- Check upsert_user_role function exists
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public' AND routine_name = 'upsert_user_role';

-- Check message_activations table exists
-- SELECT * FROM public.message_activations LIMIT 1;
