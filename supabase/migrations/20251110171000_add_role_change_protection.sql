-- =====================================================
-- SECURITY: Prevent Unauthorized Role Changes
-- =====================================================
-- This migration adds RLS policies to prevent users from
-- changing their own roles or other users' roles.

-- Step 1: Ensure RLS is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies that might allow role changes
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can read user_roles" ON public.user_roles;

-- Step 3: Create strict READ-ONLY policy for users
-- Users can only READ their own role, never UPDATE/DELETE
CREATE POLICY "Users can view own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 4: ONLY allow role creation during signup via RPC function
-- Block direct INSERT/UPDATE from client code
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;
CREATE POLICY "Service role can manage roles"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 5: Create audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all role changes to audit_logs
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      changed_by,
      details
    ) VALUES (
      'user_roles',
      'ROLE_CHANGED',
      NEW.user_id,
      COALESCE(auth.uid(), NEW.user_id),
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_at', NOW(),
        'ip_address', current_setting('request.headers', true)::json->>'x-real-ip'
      )
    );

    -- Log warning for suspicious changes
    RAISE WARNING '[SECURITY] Role changed for user %: % -> %',
      NEW.user_id, OLD.role, NEW.role;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      changed_by,
      details
    ) VALUES (
      'user_roles',
      'ROLE_CREATED',
      NEW.user_id,
      COALESCE(auth.uid(), NEW.user_id),
      jsonb_build_object(
        'role', NEW.role,
        'created_at', NOW()
      )
    );
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      changed_by,
      details
    ) VALUES (
      'user_roles',
      'ROLE_DELETED',
      OLD.user_id,
      auth.uid(),
      jsonb_build_object(
        'role', OLD.role,
        'deleted_at', NOW()
      )
    );

    -- Log critical warning for role deletions
    RAISE WARNING '[SECURITY CRITICAL] Role deleted for user %: %',
      OLD.user_id, OLD.role;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 6: Create trigger for audit
DROP TRIGGER IF EXISTS trg_audit_role_changes ON public.user_roles;
CREATE TRIGGER trg_audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

-- Step 7: Update upsert_user_role function to be more secure
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

-- Step 8: Create function to safely check user role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = COALESCE(p_user_id, auth.uid())
  LIMIT 1;
$$;

-- Step 9: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Step 10: Add comments
COMMENT ON POLICY "Users can view own role" ON public.user_roles IS
'Users can only READ their own role. UPDATE/DELETE/INSERT blocked for security.';

COMMENT ON FUNCTION public.audit_role_changes() IS
'Logs all role changes to audit_logs table and raises warnings for security team';

COMMENT ON FUNCTION public.upsert_user_role(UUID, TEXT) IS
'Securely creates or updates user role. Prevents changes to existing users after 1 minute.';

COMMENT ON FUNCTION public.get_user_role(UUID) IS
'Safely retrieves a user role. Returns NULL if not found.';

-- Step 11: Grant necessary permissions
GRANT SELECT ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_role(UUID, TEXT) TO service_role;

-- Step 12: Final report
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLE CHANGE PROTECTION ENABLED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ RLS policies updated';
  RAISE NOTICE '✓ Audit logging enabled';
  RAISE NOTICE '✓ Role change prevention active';
  RAISE NOTICE '✓ All role changes will be logged';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users can now only READ their roles';
  RAISE NOTICE 'Role changes require service_role access';
  RAISE NOTICE 'All changes are audited in audit_logs';
  RAISE NOTICE '========================================';
END $$;
