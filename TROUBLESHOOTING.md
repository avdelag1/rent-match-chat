# App Access Troubleshooting Guide

## ⚠️ CRITICAL FIRST STEP

**Have you run the SQL in Supabase Dashboard?**

The fix I created is in the code repository, but **the database policies haven't been updated yet**. You MUST run this SQL in your Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/sql/new
2. Paste the SQL from FIX_APP_ACCESS.md (lines 42-81)
3. Click "Run"

**Without running this SQL, the app will remain blocked!**

---

## Common Error Scenarios & Solutions

### Error 1: "Failed to fetch" or "Network error"
**Cause:** Supabase connection issue or environment variables missing
**Check:**
```bash
cat .env
```
Should show:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_PROJECT_ID

**Fix:** Ensure .env file exists with correct values

---

### Error 2: "Row Level Security policy violation" or "new row violates row-level security policy"
**Cause:** RLS policies haven't been applied to database
**Fix:** You MUST run the SQL from FIX_APP_ACCESS.md in Supabase Dashboard

---

### Error 3: Blank page / Infinite loading
**Possible Causes:**
1. RLS policies blocking profile/role queries
2. JavaScript error in console
3. Authentication stuck in loading state

**Debug Steps:**
1. Open browser console (F12)
2. Look for red errors
3. Check Network tab for failed requests (status 403, 406, 500)
4. Share the errors with me

---

### Error 4: "Cannot read property 'role' of null"
**Cause:** user_roles query failing due to RLS
**Fix:** Run the SQL to add user_roles SELECT policy

---

### Error 5: Getting redirected to home page immediately
**Cause:** ProtectedRoute.tsx redirecting because:
- No user session, OR
- Cannot read user role from database

**Check:**
1. Are you logged in? (check Application > Cookies in DevTools)
2. Can you see `sb-access-token` cookie?
3. Is there an RLS error in console?

---

## How to Share Error Details

Please provide:
1. **Screenshot of browser console** (F12 > Console tab)
2. **Screenshot of Network tab errors** (F12 > Network tab, filter by "Fetch/XHR", look for red items)
3. **What you see on screen:** Blank page? Error message? Loading spinner?
4. **Did you run the SQL?** Yes/No

---

## Verify Database Policies (After Running SQL)

Go to: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/database/policies

Check that these policies exist:

### profiles table should have:
- ✅ users_insert_own_profile (INSERT)
- ✅ users_update_own_profile (UPDATE)
- ✅ users_select_own_profile (SELECT)
- ✅ authenticated_users_can_browse_active_profiles (SELECT)

### user_roles table should have:
- ✅ users_view_own_role (SELECT)

If any are missing, the SQL wasn't run correctly.

---

## Quick Test

Try this in Supabase SQL Editor:
```sql
-- Test if you can see your own profile
SELECT id, full_name, email FROM profiles WHERE id = auth.uid();

-- Test if you can see your role
SELECT role FROM user_roles WHERE user_id = auth.uid();

-- Test if you can browse other profiles
SELECT id, full_name FROM profiles WHERE is_active = true AND onboarding_completed = true LIMIT 5;
```

If any of these fail with "policy violation", the RLS policies weren't applied.
