-- ============================================
-- EMERGENCY SIGNUP FIX
-- Run this in Supabase SQL Editor if signup is broken
-- ============================================

-- 1. Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

-- 4. Create policies
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
    ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role"
    ON public.user_roles FOR UPDATE USING (auth.uid() = user_id);

-- 5. Ensure profiles table allows INSERT for new users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Check if upsert_user_role function exists
DROP FUNCTION IF EXISTS public.upsert_user_role(UUID, TEXT);
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
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id
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
$$;

-- 7. Test the setup
SELECT 'Setup complete! Try signing up now.' as status;
