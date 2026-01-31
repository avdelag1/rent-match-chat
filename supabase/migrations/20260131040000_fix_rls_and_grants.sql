-- ============================================
-- FIX RLS POLICIES, GRANTS, AND ADD EMAIL-CHECK RPC
-- Date: 2026-01-31
--
-- 1. conversations policies: live DB columns are client_id / owner_id.
--
-- 2. messages table is actually conversation_messages on the live DB.
--
-- 3. message_activations INSERT policy required auth.uid() = user_id.
--    processReferralReward inserts an activation for the *referrer*,
--    not the current user, so referral bonuses always failed silently.
--
-- 4. user_roles and message_activations had no explicit GRANT to
--    authenticated, which can cause direct client-side queries to
--    fail depending on Supabase default-grant state.
--
-- 5. profiles SELECT and user_roles SELECT are both restricted to
--    authenticated users.  checkExistingAccount runs before signup
--    (anon context) so it could never see existing profiles or roles.
--    Added a SECURITY DEFINER RPC that the frontend can call from
--    any auth context.
-- ============================================

-- ============================================
-- 1. FIX CONVERSATIONS RLS
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
-- 2. FIX MESSAGES RLS (table is conversation_messages)
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
-- 3. FIX MESSAGE_ACTIVATIONS INSERT POLICY
--    Referral rewards are inserted for the referrer (a different
--    user).  The old policy auth.uid() = user_id blocked every
--    referral bonus silently.
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can insert activations for themselves" ON public.message_activations;
CREATE POLICY "Authenticated users can insert activations"
  ON public.message_activations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- 4. ADD MISSING GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.message_activations TO authenticated;

-- ============================================
-- 5. ADD check_email_exists RPC (SECURITY DEFINER)
--    Called by the frontend before signup to detect duplicate emails
--    and role conflicts.  Must be SECURITY DEFINER because anon
--    users cannot SELECT from profiles or user_roles.
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
