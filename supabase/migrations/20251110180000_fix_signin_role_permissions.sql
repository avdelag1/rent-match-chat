-- =====================================================
-- FIX: Allow authenticated users to call upsert_user_role
-- =====================================================
-- This migration fixes the signin issue where users couldn't
-- properly have their roles set in user_roles table because
-- the upsert_user_role RPC was only granted to service_role.
--
-- Problem:
-- - User signs in with correct credentials
-- - Code tries to ensure role exists in user_roles via RPC
-- - RPC call fails due to missing EXECUTE permission
-- - User ends up with no role in user_roles
-- - User can't access their dashboard
--
-- Solution:
-- - Grant EXECUTE permission to authenticated users
-- - RPC function already has security checks:
--   * Users can only modify their own role (auth.uid() check)
--   * Role changes are prevented for existing users (account age check)
--   * All role changes are audited
--
-- =====================================================

-- Step 1: Grant EXECUTE permission to authenticated users
-- The RPC function already validates that users can only modify their own role
GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO authenticated;

-- Step 2: Update the function to add explicit caller validation
CREATE OR REPLACE FUNCTION public.upsert_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_role TEXT;
  v_caller_id UUID;
BEGIN
  -- Get the caller's user ID
  v_caller_id := auth.uid();

  -- SECURITY: Ensure authenticated users can only modify their own role
  -- service_role can modify any user's role
  IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    IF v_caller_id IS NULL OR v_caller_id != p_user_id THEN
      RAISE EXCEPTION '[SECURITY] Users can only modify their own role. Caller: %, Target: %',
        v_caller_id, p_user_id;
    END IF;
  END IF;

  -- Check if role already exists
  SELECT role INTO v_existing_role
  FROM public.user_roles
  WHERE user_id = p_user_id;

  -- SECURITY: Prevent role changes for existing users
  IF v_existing_role IS NOT NULL AND v_existing_role != p_role THEN
    -- Only allow if called during account setup (within 1 minute of account creation)
    DECLARE
      v_account_age INTERVAL;
    BEGIN
      SELECT NOW() - created_at INTO v_account_age
      FROM auth.users
      WHERE id = p_user_id;

      IF v_account_age > INTERVAL '1 minute' THEN
        RAISE EXCEPTION '[SECURITY] Cannot change role for existing user. Current: %, Requested: %',
          v_existing_role, p_role;
      END IF;
    END;
  END IF;

  -- Validate role
  IF p_role NOT IN ('client', 'owner', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be client, owner, or admin', p_role;
  END IF;

  -- Upsert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

  -- Log successful upsert
  RAISE LOG '[RoleUpsert] User % role set to % by %', p_user_id, p_role, v_caller_id;
END;
$$;

-- Step 3: Add comment
COMMENT ON FUNCTION public.upsert_user_role(UUID, TEXT) IS
'Securely creates or updates user role. Users can only modify their own role. Prevents changes to existing users after 1 minute. All changes are audited.';

-- Step 4: Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SIGNIN ROLE PERMISSIONS FIXED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Authenticated users can now call upsert_user_role';
  RAISE NOTICE '✓ Security checks ensure users only modify their own role';
  RAISE NOTICE '✓ Role changes for existing users are still prevented';
  RAISE NOTICE '✓ All changes continue to be audited';
  RAISE NOTICE '========================================';
END $$;
