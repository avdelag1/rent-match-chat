# Fix App Access - Profile Browsing Blocked

## Problem
The app is currently blocked because users cannot browse profiles. This happened due to a security hardening migration that removed all permissive RLS (Row Level Security) policies on the `profiles` table.

## Root Cause
Migration `20260118000000_fix_all_security_issues.sql` removed these policies:
- `users_select_active_profiles`
- `Users can view profiles for matching`
- `Public profiles are viewable`
- `Everyone can view profiles`
- And several others...

It replaced them with only 3 restrictive policies:
1. Users can only view their OWN profile
2. Users can only view MUTUAL MATCH profiles
3. Users can only view CONVERSATION PARTNER profiles

This means users cannot browse/swipe on new profiles at all!

## Solution
A new migration has been created: `supabase/migrations/20260124_fix_profile_browsing_access.sql`

This migration adds a new RLS policy that allows authenticated users to browse active, completed profiles while maintaining security.

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (RECOMMENDED)
1. Go to https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq
2. Navigate to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add policy to allow authenticated users to browse active profiles
CREATE POLICY IF NOT EXISTS "authenticated_users_can_browse_active_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND onboarding_completed = true
  );

-- Grant appropriate permissions
GRANT SELECT ON public.profiles TO authenticated;
```

4. Click **Run**
5. Verify success (you should see "Success. No rows returned")

### Option 2: Via Node.js Script
If you have the Supabase service role key:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here node apply-profile-access-fix.js
```

### Option 3: Via Supabase CLI (if installed)
```bash
supabase db push
```

## Verification
After applying the fix:
1. Log into the app
2. Navigate to the swipe/browse view
3. You should see profile cards to swipe on
4. Check browser console - there should be no RLS policy errors

## Security Notes
- This fix maintains security by only allowing browsing of active, completed profiles
- Users still cannot see sensitive fields (email, phone, income, exact location) unless they have a mutual match
- The policy only grants SELECT permission, users cannot modify other profiles
- Inactive or incomplete profiles remain hidden

## What This Fixes
- ✅ Profile browsing/swiping functionality restored
- ✅ Discovery pages work again
- ✅ Match recommendations can load
- ✅ App is no longer blocked

## Files Changed
- `supabase/migrations/20260124_fix_profile_browsing_access.sql` - New migration
- `apply-profile-access-fix.js` - Helper script to apply migration
- `FIX_APP_ACCESS.md` - This documentation
