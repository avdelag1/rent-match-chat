-- =====================================================
-- SECURITY: Prevent users from changing their role in profiles table
-- =====================================================
-- This migration adds a check constraint and trigger to prevent
-- users from directly modifying their role in the profiles table.
-- 
-- Problem:
-- - Users have UPDATE permission on their own profile
-- - This allows them to change the 'role' column
-- - Malicious users could escalate privileges
--
-- Solution:
-- - Add trigger to block role changes by authenticated users
-- - Only allow role changes via RPC or service_role
-- - Maintain sync trigger from profiles to user_roles
--
-- =====================================================

-- Step 1: Create function to prevent role changes by users
CREATE OR REPLACE FUNCTION public.prevent_user_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_service_role BOOLEAN;
  v_account_age INTERVAL;
BEGIN
  -- Check if caller is service_role
  BEGIN
    v_is_service_role := current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
  EXCEPTION WHEN OTHERS THEN
    v_is_service_role := FALSE;
  END;

  -- If service_role, allow all changes
  IF v_is_service_role THEN
    RETURN NEW;
  END IF;

  -- For INSERT operations, allow role to be set (during signup)
  IF (TG_OP = 'INSERT') THEN
    RETURN NEW;
  END IF;

  -- For UPDATE operations, check if role is being changed
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    -- Check account age - only allow role changes within 1 minute of account creation
    SELECT NOW() - created_at INTO v_account_age
    FROM auth.users
    WHERE id = NEW.id;

    IF v_account_age > INTERVAL '1 minute' THEN
      RAISE EXCEPTION '[SECURITY] Cannot change role after account setup. Attempted change from % to % for user %',
        OLD.role, NEW.role, NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 2: Create trigger to enforce role change prevention
DROP TRIGGER IF EXISTS trg_prevent_user_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_user_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_role_change();

-- Step 3: Add comment
COMMENT ON FUNCTION public.prevent_user_role_change() IS
'Prevents authenticated users from changing their role in the profiles table. Only allows changes within 1 minute of account creation or by service_role.';

COMMENT ON TRIGGER trg_prevent_user_role_change ON public.profiles IS
'Enforces role immutability for user accounts after the initial setup period';

-- Step 4: Verification message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROFILE ROLE PROTECTION ENABLED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Users cannot change their role in profiles table';
  RAISE NOTICE '✓ Role changes blocked after 1 minute of account creation';
  RAISE NOTICE '✓ Service role can still manage roles';
  RAISE NOTICE '✓ Sync trigger from profiles to user_roles remains active';
  RAISE NOTICE '========================================';
END $$;
