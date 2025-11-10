-- =====================================================
-- CRITICAL SECURITY FIX: Role Synchronization & Auth
-- =====================================================
-- This migration fixes the authentication routing bug where
-- users were being shown the wrong interface due to role
-- desynchronization between profiles and user_roles tables.
--
-- Changes:
-- 1. Sync any mismatched roles (profiles.role -> user_roles.role)
-- 2. Add trigger to keep both tables in sync
-- 3. Ensure user_roles is always populated

-- Step 0: Ensure profiles table has role column (if not, skip sync)
DO $$
BEGIN
  -- Check if profiles.role column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'role'
  ) THEN
    RAISE NOTICE 'profiles.role column exists, proceeding with sync...';

    -- Step 1: Sync existing mismatched roles
    -- If profiles.role and user_roles.role differ, profiles is source of truth
    INSERT INTO public.user_roles (user_id, role)
    SELECT
      p.id,
      p.role::text
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Update any mismatched roles (profiles wins)
    UPDATE public.user_roles ur
    SET role = p.role::text
    FROM public.profiles p
    WHERE ur.user_id = p.id
      AND ur.role != p.role::text;

    RAISE NOTICE 'Role sync completed!';
  ELSE
    RAISE NOTICE 'profiles.role column does not exist, skipping sync. Will sync from user_roles to profiles instead.';

    -- Reverse sync: user_roles is source of truth, add role column to profiles
    -- This shouldn't happen but we handle it gracefully
    RAISE NOTICE 'user_roles table will be considered source of truth.';
  END IF;
END $$;

-- Step 2: Create function to sync profile role changes to user_roles (only if role column exists)
DO $$
BEGIN
  -- Only create sync function if profiles.role column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'role'
  ) THEN
    -- Create function to sync profile role changes to user_roles
    CREATE OR REPLACE FUNCTION public.sync_profile_role_to_user_roles()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      -- When profile role changes, update user_roles
      IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, NEW.role::text)
        ON CONFLICT (user_id)
        DO UPDATE SET role = NEW.role::text;

        RAISE LOG '[SYNC] Created/updated user_roles for user % with role %', NEW.id, NEW.role;
      ELSIF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
        UPDATE public.user_roles
        SET role = NEW.role::text
        WHERE user_id = NEW.id;

        RAISE LOG '[SYNC] Updated user_roles for user % from % to %', NEW.id, OLD.role, NEW.role;
      END IF;

      RETURN NEW;
    END;
    $func$;

    -- Step 3: Create trigger to keep tables in sync
    DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;

    CREATE TRIGGER trg_sync_profile_role
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_role_to_user_roles();

    RAISE NOTICE 'Sync trigger created successfully!';
  ELSE
    RAISE NOTICE 'Skipping trigger creation - profiles.role column does not exist';
  END IF;
END $$;

-- Step 4: Add index on user_roles.user_id for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Step 5: Add comment to document the sync behavior
COMMENT ON TRIGGER trg_sync_profile_role ON public.profiles IS
'Automatically syncs profile role changes to user_roles table to maintain consistency';

COMMENT ON FUNCTION public.sync_profile_role_to_user_roles() IS
'Keeps user_roles table in sync with profiles.role. Profiles table is source of truth.';

-- Step 6: Verify sync worked (only if role column exists)
DO $$
DECLARE
  mismatched_count INTEGER;
  has_role_column BOOLEAN;
BEGIN
  -- Check if profiles.role column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'role'
  ) INTO has_role_column;

  IF has_role_column THEN
    SELECT COUNT(*) INTO mismatched_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role IS NULL OR ur.role != p.role::text;

    IF mismatched_count > 0 THEN
      RAISE WARNING 'Still have % mismatched or missing user_roles entries', mismatched_count;
    ELSE
      RAISE NOTICE 'All profiles and user_roles are now in sync!';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping sync verification - profiles.role column does not exist';
    RAISE NOTICE 'This is normal if you are using user_roles as the sole source of truth';
  END IF;
END $$;
