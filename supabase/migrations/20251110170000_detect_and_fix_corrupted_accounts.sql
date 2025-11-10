-- =====================================================
-- CRITICAL: Detect and Fix Corrupted User Accounts
-- =====================================================
-- This migration detects and reports accounts that were
-- corrupted by the role creation bug where clicking the
-- wrong login button could change a user's account type.
--
-- SAFE MODE: This migration only REPORTS issues by default.
-- To actually fix issues, you must manually run the fix
-- section at the end.

-- Step 1: Create function to audit role mismatches
CREATE OR REPLACE FUNCTION public.audit_role_mismatches()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  profile_role TEXT,
  user_roles_role TEXT,
  issue_type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.email,
    p.role::text as profile_role,
    ur.role as user_roles_role,
    CASE
      WHEN ur.role IS NULL THEN 'MISSING_USER_ROLE'
      WHEN p.role::text != ur.role THEN 'ROLE_MISMATCH'
      ELSE 'OK'
    END as issue_type,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE
    -- Either no role in user_roles OR roles don't match
    ur.role IS NULL OR p.role::text != ur.role
  ORDER BY p.created_at DESC;
END;
$$;

-- Step 2: Create function to find duplicate user_roles (multiple roles for same user)
CREATE OR REPLACE FUNCTION public.find_duplicate_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  roles TEXT[],
  role_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.user_id,
    p.email,
    array_agg(ur.role ORDER BY ur.created_at) as roles,
    COUNT(*)::INTEGER as role_count
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.id = ur.user_id
  GROUP BY ur.user_id, p.email
  HAVING COUNT(*) > 1
  ORDER BY role_count DESC;
END;
$$;

-- Step 3: Run audit and report findings
DO $$
DECLARE
  mismatch_count INTEGER;
  duplicate_count INTEGER;
  audit_record RECORD;
BEGIN
  -- Count mismatches
  SELECT COUNT(*) INTO mismatch_count
  FROM public.audit_role_mismatches();

  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM public.find_duplicate_roles();

  RAISE NOTICE '========================================';
  RAISE NOTICE 'ACCOUNT AUDIT REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Mismatched/Missing Roles: %', mismatch_count;
  RAISE NOTICE 'Duplicate Roles (multiple per user): %', duplicate_count;
  RAISE NOTICE '========================================';

  IF mismatch_count > 0 THEN
    RAISE NOTICE 'MISMATCHED ACCOUNTS:';
    FOR audit_record IN SELECT * FROM public.audit_role_mismatches() LOOP
      RAISE NOTICE '  User: % | Email: % | Profile Role: % | UserRoles Role: % | Issue: %',
        audit_record.user_id,
        audit_record.email,
        audit_record.profile_role,
        COALESCE(audit_record.user_roles_role, 'NULL'),
        audit_record.issue_type;
    END LOOP;
  END IF;

  IF duplicate_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'DUPLICATE ROLES (CRITICAL):';
    FOR audit_record IN SELECT * FROM public.find_duplicate_roles() LOOP
      RAISE NOTICE '  User: % | Email: % | Roles: % | Count: %',
        audit_record.user_id,
        audit_record.email,
        audit_record.roles,
        audit_record.role_count;
    END LOOP;
  END IF;

  RAISE NOTICE '========================================';

  IF mismatch_count > 0 OR duplicate_count > 0 THEN
    RAISE WARNING 'Found % issues that need attention!', (mismatch_count + duplicate_count);
    RAISE NOTICE 'To view details, run: SELECT * FROM public.audit_role_mismatches();';
    RAISE NOTICE 'To view duplicates, run: SELECT * FROM public.find_duplicate_roles();';
  ELSE
    RAISE NOTICE 'All accounts are healthy! ✓';
  END IF;
END $$;

-- Step 4: Create function to fix corrupted accounts (must be called manually)
CREATE OR REPLACE FUNCTION public.fix_corrupted_account(p_user_id UUID, p_correct_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_profile_role TEXT;
  v_old_user_roles_role TEXT;
BEGIN
  -- Get current roles
  SELECT role::text INTO v_old_profile_role
  FROM public.profiles WHERE id = p_user_id;

  SELECT role INTO v_old_user_roles_role
  FROM public.user_roles WHERE user_id = p_user_id;

  -- Validate correct_role
  IF p_correct_role NOT IN ('client', 'owner', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be client, owner, or admin', p_correct_role;
  END IF;

  -- Log the change
  RAISE NOTICE 'Fixing account % | Old Profile Role: % | Old UserRoles Role: % | New Role: %',
    p_user_id,
    v_old_profile_role,
    COALESCE(v_old_user_roles_role, 'NULL'),
    p_correct_role;

  -- Update profiles table
  UPDATE public.profiles
  SET role = p_correct_role::user_role,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Update user_roles table (will be synced by trigger, but do it explicitly for safety)
  UPDATE public.user_roles
  SET role = p_correct_role,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If no row was updated, insert it
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_correct_role)
    ON CONFLICT (user_id) DO UPDATE SET role = p_correct_role;
  END IF;

  -- Log to audit_logs
  INSERT INTO public.audit_logs (table_name, action, record_id, changed_by, details)
  VALUES (
    'user_roles',
    'ROLE_CORRECTED',
    p_user_id,
    p_user_id,
    jsonb_build_object(
      'old_profile_role', v_old_profile_role,
      'old_user_roles_role', v_old_user_roles_role,
      'new_role', p_correct_role,
      'fixed_at', NOW()
    )
  );

  RAISE NOTICE 'Account fixed successfully! ✓';
  RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to fix account %: %', p_user_id, SQLERRM;
  RETURN FALSE;
END;
$$;

-- Step 5: Create function to remove duplicate roles (keeps oldest)
CREATE OR REPLACE FUNCTION public.remove_duplicate_roles(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_kept_role TEXT;
  v_deleted_count INTEGER;
BEGIN
  -- Keep the oldest role, delete the rest
  WITH oldest_role AS (
    SELECT id, role
    FROM public.user_roles
    WHERE user_id = p_user_id
    ORDER BY created_at ASC
    LIMIT 1
  )
  SELECT role INTO v_kept_role FROM oldest_role;

  -- Delete duplicate roles
  WITH deleted AS (
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id
      AND id NOT IN (
        SELECT id FROM public.user_roles
        WHERE user_id = p_user_id
        ORDER BY created_at ASC
        LIMIT 1
      )
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER INTO v_deleted_count FROM deleted;

  RAISE NOTICE 'Removed % duplicate roles for user %. Kept role: %',
    v_deleted_count, p_user_id, v_kept_role;

  RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to remove duplicates for %: %', p_user_id, SQLERRM;
  RETURN FALSE;
END;
$$;

-- Step 6: Add comments
COMMENT ON FUNCTION public.audit_role_mismatches() IS
'Returns all accounts with mismatched or missing roles between profiles and user_roles tables';

COMMENT ON FUNCTION public.find_duplicate_roles() IS
'Returns all users with multiple roles in user_roles table (data corruption)';

COMMENT ON FUNCTION public.fix_corrupted_account(UUID, TEXT) IS
'Manually fix a corrupted account by setting the correct role. USE WITH CAUTION!';

COMMENT ON FUNCTION public.remove_duplicate_roles(UUID) IS
'Remove duplicate roles for a user, keeping the oldest one';

-- =====================================================
-- MANUAL FIX INSTRUCTIONS
-- =====================================================
-- To fix a corrupted account, use these commands:
--
-- 1. View all issues:
--    SELECT * FROM public.audit_role_mismatches();
--    SELECT * FROM public.find_duplicate_roles();
--
-- 2. Fix a specific account (replace with actual user_id and correct role):
--    SELECT public.fix_corrupted_account('USER_ID_HERE', 'client');
--    -- OR
--    SELECT public.fix_corrupted_account('USER_ID_HERE', 'owner');
--
-- 3. Remove duplicate roles:
--    SELECT public.remove_duplicate_roles('USER_ID_HERE');
--
-- 4. Verify the fix:
--    SELECT * FROM public.audit_role_mismatches();
-- =====================================================
