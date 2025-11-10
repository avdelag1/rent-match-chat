# 🚨 Account Corruption Fix Guide

## Problem Description

A critical bug in the authentication system allowed user account roles to be changed incorrectly. This happened when:

1. A user's `user_roles` table entry was missing
2. The user logged in and clicked the wrong role button (e.g., "Login as Owner" when they should be a client)
3. The old buggy code created a NEW role based on the button clicked, NOT the user's actual account type

**Result:** Client accounts were changed to Owner accounts (and vice versa), preventing users from accessing their correct dashboard.

## How to Check Your Account

### Step 1: Run the Audit

The migration automatically runs an audit report. Check the Supabase logs or run:

```sql
SELECT * FROM public.audit_role_mismatches();
```

This shows all accounts with mismatched or missing roles.

### Step 2: Check for Duplicates

Some users may have MULTIPLE roles (critical corruption):

```sql
SELECT * FROM public.find_duplicate_roles();
```

## How to Fix Your Account

### If You Know Your Correct Role:

Run this command in Supabase SQL Editor:

```sql
-- For CLIENT accounts:
SELECT public.fix_corrupted_account('YOUR_USER_ID_HERE', 'client');

-- For OWNER accounts:
SELECT public.fix_corrupted_account('YOUR_USER_ID_HERE', 'owner');
```

### If You Have Duplicate Roles:

First, remove duplicates (keeps the oldest role):

```sql
SELECT public.remove_duplicate_roles('YOUR_USER_ID_HERE');
```

Then verify which role was kept:

```sql
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID_HERE';
```

If the wrong role was kept, fix it:

```sql
SELECT public.fix_corrupted_account('YOUR_USER_ID_HERE', 'correct_role_here');
```

## Finding Your User ID

### Option 1: By Email

```sql
SELECT id, email, role FROM public.profiles WHERE email = 'your_email@example.com';
```

### Option 2: From Browser Console

While logged in, open browser console and run:

```javascript
JSON.parse(localStorage.getItem('supabase.auth.token')).user.id
```

## Quick Fix for Specific Accounts

### Fix client@client.com (if it was changed to owner):

```sql
-- Get user ID
SELECT id FROM public.profiles WHERE email = 'client@client.com';

-- Fix the account (replace USER_ID with the actual ID)
SELECT public.fix_corrupted_account('USER_ID', 'client');
```

### Fix owner@owner.com (if it was changed to client):

```sql
-- Get user ID
SELECT id FROM public.profiles WHERE email = 'owner@owner.com';

-- Fix the account (replace USER_ID with the actual ID)
SELECT public.fix_corrupted_account('USER_ID', 'owner');
```

## Verify the Fix

After fixing, verify:

```sql
-- Check profiles table
SELECT id, email, role FROM public.profiles WHERE email = 'your_email@example.com';

-- Check user_roles table
SELECT user_id, role FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';

-- Should be the same!
```

Then log out and log back in. You should be routed to the correct dashboard.

## What Was Fixed in the Code

1. **useAuth.tsx**
   - ✅ Login no longer creates roles
   - ✅ Falls back to profiles table if user_roles is empty
   - ✅ Always syncs FROM profiles TO user_roles (profiles is source of truth)

2. **useAccountLinking.tsx**
   - ✅ Fixed `onConflict` to prevent duplicate roles
   - ✅ Added safeguards against role changes during OAuth

3. **Database**
   - ✅ Added trigger to auto-sync profiles.role → user_roles.role
   - ✅ Added audit functions to detect corruption
   - ✅ Added fix functions to correct corrupted accounts

4. **ProtectedRoute.tsx**
   - ✅ Added authorization violation logging
   - ✅ Shows user-facing errors when wrong role tries to access route

## Prevention

The following safeguards are now in place to prevent this from happening again:

1. ✅ Login NEVER creates roles (only signup does)
2. ✅ Database trigger keeps tables synced
3. ✅ Proper onConflict constraints prevent duplicate roles
4. ✅ Enhanced logging for debugging
5. ✅ Route protection blocks unauthorized access

## Support

If you're still having issues after following this guide:

1. Check the browser console for detailed logs
2. Run the audit query to see current state
3. Check Supabase logs for errors
4. Reach out with:
   - Your email address
   - Current role from database
   - Expected role
   - Error messages from console

## Emergency Rollback

If you need to revert to a working state before these changes, the database migration IDs are:

- Role sync: `20251110163000_fix_role_sync_and_auth.sql`
- Account audit: `20251110170000_detect_and_fix_corrupted_accounts.sql`

However, the CODE changes are necessary to prevent future corruption, so don't revert those.
