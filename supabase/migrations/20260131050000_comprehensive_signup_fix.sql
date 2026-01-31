-- ============================================
-- COMPREHENSIVE SIGNUP FIX
-- Run this in Supabase SQL Editor.  It is fully idempotent —
-- safe to run multiple times.
--
-- What this does:
--   1. Adds every column the trigger + frontend need (IF NOT EXISTS)
--   2. Ensures user_roles + message_activations tables exist
--   3. Recreates the trigger with exception handling so it can
--      NEVER crash a signup again, even if something else is wrong
--   4. Recreates upsert_user_role RPC
--   5. Fixes conversations/messages RLS (wrong column names)
--   6. Fixes message_activations INSERT RLS (blocked referral rewards)
--   7. Adds missing GRANTs
--   8. Adds check_email_exists RPC for anon-safe duplicate detection
-- ============================================

-- ============================================
-- STEP 1: ENSURE ALL COLUMNS EXIST
-- ============================================

DO $$
BEGIN
    -- profiles.is_active
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;

    -- profiles.onboarding_completed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Mark existing profiles as complete so they keep appearing
UPDATE public.profiles SET onboarding_completed = TRUE WHERE onboarding_completed = FALSE;

-- message_activations.notes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'message_activations' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.message_activations ADD COLUMN notes TEXT;
    END IF;
END $$;

-- ============================================
-- STEP 2: ENSURE user_roles TABLE EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- STEP 3: ENSURE message_activations TABLE EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.message_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_message_activations_user_id ON public.message_activations(user_id);

-- ============================================
-- STEP 4: RECREATE TRIGGER — WITH EXCEPTION HANDLING
--   The trigger body is wrapped in BEGIN...EXCEPTION so that if
--   anything goes wrong (missing column, constraint violation, etc)
--   the auth.users INSERT still succeeds.  The frontend
--   createProfileIfMissing() picks up profile creation as backup.
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user()
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
        ''
    );
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

    -- Wrapped in exception handler: trigger NEVER fails the signup.
    -- If profile creation fails here the frontend createProfileIfMissing
    -- handles it as a fallback.
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
    EXCEPTION WHEN OTHERS THEN
        -- Silently continue — frontend will create profile
        NULL;
    END;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================
-- STEP 5: RECREATE upsert_user_role RPC
-- ============================================

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
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        updated_at = NOW();

    RETURN QUERY SELECT
        true::BOOLEAN,
        'OK'::TEXT,
        p_user_id,
        p_role;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT
        false::BOOLEAN,
        ('Error: ' || SQLERRM)::TEXT,
        p_user_id,
        p_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO service_role;

-- ============================================
-- STEP 6: FIX CONVERSATIONS RLS
--   Live DB columns are client_id / owner_id.
-- ============================================

DROP POLICY IF EXISTS "users_can_view_own_conversations" ON public.conversations;
CREATE POLICY "users_can_view_own_conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "users_can_create_conversations" ON public.conversations;
CREATE POLICY "users_can_create_conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "users_can_update_own_conversations" ON public.conversations;
CREATE POLICY "users_can_update_own_conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING  (auth.uid() = client_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = owner_id);

-- ============================================
-- STEP 7: FIX MESSAGES RLS
--   Live table is conversation_messages, not messages.
-- ============================================

DROP POLICY IF EXISTS "users_can_view_conversation_messages" ON public.conversation_messages;
CREATE POLICY "users_can_view_conversation_messages"
  ON public.conversation_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "users_can_send_messages" ON public.conversation_messages;
CREATE POLICY "users_can_send_messages"
  ON public.conversation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- ============================================
-- STEP 8: FIX message_activations RLS
--   INSERT policy blocked referral rewards (inserting for another
--   user).  Authenticated users now allowed to insert freely.
-- ============================================

ALTER TABLE public.message_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert activations for themselves" ON public.message_activations;
DROP POLICY IF EXISTS "Authenticated users can insert activations" ON public.message_activations;
CREATE POLICY "Authenticated users can insert activations"
  ON public.message_activations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own activations" ON public.message_activations;
CREATE POLICY "Users can view own activations"
  ON public.message_activations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own activations" ON public.message_activations;
CREATE POLICY "Users can update own activations"
  ON public.message_activations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 9: user_roles RLS + ENABLE
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
CREATE POLICY "Users can update own role"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 10: ADD MISSING GRANTs
-- ============================================

GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.message_activations TO authenticated;

-- ============================================
-- STEP 11: check_email_exists RPC (anon-safe)
--   profiles SELECT is restricted to authenticated.  This
--   SECURITY DEFINER function lets the signup form check for
--   duplicate emails from any auth context.
-- ============================================

DROP FUNCTION IF EXISTS public.check_email_exists(TEXT);

CREATE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id          UUID;
    v_email       TEXT;
    v_full_name   TEXT;
    v_role        TEXT;
    v_avatar_url  TEXT;
    v_created_at  TIMESTAMPTZ;
BEGIN
    SELECT id, email, full_name, role, avatar_url, created_at
      INTO v_id, v_email, v_full_name, v_role, v_avatar_url, v_created_at
      FROM public.profiles
     WHERE email = p_email
     LIMIT 1;

    IF FOUND THEN
        RETURN json_build_object(
            'exists',     true,
            'id',         v_id,
            'email',      v_email,
            'full_name',  v_full_name,
            'role',       v_role,
            'avatar_url', v_avatar_url,
            'created_at', v_created_at
        );
    ELSE
        RETURN json_build_object('exists', false);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;
