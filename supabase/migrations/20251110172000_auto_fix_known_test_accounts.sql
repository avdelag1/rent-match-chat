-- =====================================================
-- AUTO-FIX: Known Test Accounts
-- =====================================================
-- Automatically fixes client@client.com and owner@owner.com
-- to have the correct roles

DO $$
DECLARE
  v_client_user_id UUID;
  v_owner_user_id UUID;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AUTO-FIXING TEST ACCOUNTS';
  RAISE NOTICE '========================================';

  -- Fix client@client.com -> should be CLIENT
  SELECT id INTO v_client_user_id
  FROM public.profiles
  WHERE email = 'client@client.com';

  IF v_client_user_id IS NOT NULL THEN
    -- Update profiles table
    UPDATE public.profiles
    SET role = 'client'::user_role,
        updated_at = NOW()
    WHERE id = v_client_user_id;

    -- Update user_roles table
    DELETE FROM public.user_roles WHERE user_id = v_client_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_client_user_id, 'client');

    RAISE NOTICE '✓ Fixed client@client.com -> CLIENT (user_id: %)', v_client_user_id;
  ELSE
    RAISE NOTICE '  client@client.com not found (will be created on first signup)';
  END IF;

  -- Fix owner@owner.com -> should be OWNER
  SELECT id INTO v_owner_user_id
  FROM public.profiles
  WHERE email = 'owner@owner.com';

  IF v_owner_user_id IS NOT NULL THEN
    -- Update profiles table
    UPDATE public.profiles
    SET role = 'owner'::user_role,
        updated_at = NOW()
    WHERE id = v_owner_user_id;

    -- Update user_roles table
    DELETE FROM public.user_roles WHERE user_id = v_owner_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_owner_user_id, 'owner');

    RAISE NOTICE '✓ Fixed owner@owner.com -> OWNER (user_id: %)', v_owner_user_id;
  ELSE
    RAISE NOTICE '  owner@owner.com not found (will be created on first signup)';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST ACCOUNTS FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Log out of the app';
  RAISE NOTICE '2. Clear browser cache (or use incognito)';
  RAISE NOTICE '3. Log in with client@client.com -> Should see CLIENT dashboard';
  RAISE NOTICE '4. Log in with owner@owner.com -> Should see OWNER dashboard';
  RAISE NOTICE '========================================';
END $$;
