# 🔥 URGENT FIX: Likes Not Saving Issue

## Problem Summary

**Issue:** Users cannot save likes when they swipe right. The swipe happens but the like is NOT saved to the database.

**Root Cause:** The `is_user_active()` database function was returning `NULL` for new users without complete profiles. This caused the RLS (Row Level Security) policies on the `likes` and `owner_likes` tables to BLOCK the insert operations.

## What Happened?

1. You replaced `useSwipeWithMatch` with `useSwipe` in the code (commit 270ea7e)
2. The simpler `useSwipe` hook works correctly on the frontend
3. BUT the database RLS policies were blocking the saves for some users
4. The `is_user_active()` function required a complete profile record, which new users don't have

## The Fix

I've created a SQL script that fixes this issue: **`FIX_LIKES_SAVE_ISSUE.sql`**

### How to Apply the Fix (2 methods)

#### Method 1: Supabase Dashboard (Recommended - Takes 30 seconds)

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and paste the contents of `FIX_LIKES_SAVE_ISSUE.sql`
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see success messages in the output

#### Method 2: Supabase CLI (If you have it installed)

```bash
# Install Supabase CLI (if not installed)
brew install supabase/tap/supabase  # macOS
# OR
scoop install supabase  # Windows

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push the migrations
supabase db push
```

## What the Fix Does

1. **Updates `is_user_active()` function** - Now returns `TRUE` for new users without profiles instead of `NULL`
2. **Updates Profile SELECT policy** - Removes the requirement for `onboarding_completed`
3. **Refreshes likes table RLS policies** - Ensures they work with the fixed `is_user_active()` function
4. **Refreshes owner_likes table RLS policies** - Ensures owner swipes work correctly

## Testing the Fix

After applying the SQL script:

1. **Clear your browser cache** (or open incognito/private window)
2. Log in to your app
3. Swipe right on a property or profile
4. Verify you see a success message (no errors)
5. Go to your "Liked" page
6. **Refresh the page** (F5 or Cmd+R)
7. Verify the liked items are still there

## Why This Happened

The swipe code replacement (useSwipeWithMatch → useSwipe) was **correct and simpler**, but it exposed a hidden database permission issue that was being masked by the more complex hook's error handling.

The database migrations that fix this issue exist in your `supabase/migrations/` folder:
- `20260127000000_fix_is_user_active_for_new_users.sql`
- `20260127000001_comprehensive_fix_new_user_swipes.sql`

But they weren't applied to your remote database yet.

## Expected Results After Fix

✅ Users can save likes immediately when they swipe right
✅ Owners can swipe on client profiles without errors
✅ Likes persist after page refresh
✅ New Google sign-up users can use the app instantly
✅ No "Failed to save your like" errors

## Still Having Issues?

If you still see errors after applying this fix:

1. Check the browser console for error messages
2. Go to Supabase Dashboard → Authentication → Policies
3. Verify the policies exist for `likes` and `owner_likes` tables
4. Check if there are any other RLS policies blocking the operation

## Files Changed

- ✅ Created: `FIX_LIKES_SAVE_ISSUE.sql` - The database fix
- ✅ Created: `FIX_LIKES_README.md` - This guide

## Questions?

If you need help applying this fix, message me and I'll walk you through it step by step!

---

**Created:** 2026-01-27
**Branch:** `claude/fix-frame-corners-H662d`
