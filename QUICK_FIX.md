# 🚨 QUICK FIX - Restore Lovable App Access

## The Problem
Your app on Lovable is blocked because database security policies prevent:
- Creating profiles during signup (INSERT blocked)
- Updating profiles (UPDATE blocked)
- Browsing other profiles for matching (SELECT blocked)
- Viewing user roles for dashboard routing (SELECT blocked)

## The Solution (2 minutes)

### Step 1: Go to Supabase SQL Editor
Open this link: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/sql/new

### Step 2: Copy and paste this SQL (from below)

```sql
-- PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_users_can_browse_active_profiles" ON public.profiles;
CREATE POLICY "authenticated_users_can_browse_active_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND onboarding_completed = true
  );

-- USER_ROLES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_role" ON public.user_roles;
CREATE POLICY "users_view_own_role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
```

### Step 3: Click "Run"

### Step 4: Done! ✅
Your app should now be accessible immediately. Try refreshing your Lovable app.

## What This Fixes
- ✅ User signup (profile creation)
- ✅ Profile editing
- ✅ Profile browsing/swiping
- ✅ Dashboard routing
- ✅ Complete app functionality

## Security Note
This fix maintains security - users can only modify their own data and can only browse active, completed profiles. Sensitive data remains protected.
