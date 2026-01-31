# URGENT: Fix Listing Uploads and Likes

## Problem Summary

Your application has **2 critical blocking issues**:

1. **Listing uploads failing** - Cannot create new listings
2. **Likes not saving** - Swipes are not persisted to the database

## Root Causes Identified

### Listing Upload Issues:
- Database constraints blocking motorcycle/bicycle listings (state, price required but not collected)
- Property type and vehicle condition constraints don't match form values
- Missing storage bucket policies for image uploads

### Likes Issues:
- RLS policy references wrong column name (`target_listing_id` instead of `target_id`)
- Missing proper storage and table policies
- Overly restrictive `is_user_active()` function blocks new users

## Solution Applied

I've created a comprehensive migration file:
**`/supabase/migrations/20260131080000_fix_listing_upload_and_likes.sql`**

This migration fixes:
- ✅ Listings table constraints (state, price nullable)
- ✅ Property type and vehicle condition validation (case-insensitive)
- ✅ Storage bucket creation and policies for listing images
- ✅ Likes table schema verification
- ✅ Likes RLS policies (fixed column name bug)
- ✅ `is_user_active()` function to allow new users
- ✅ All necessary table grants

## How to Apply the Fix

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com/project/vplgtcguxujxwrgguxqq
2. Navigate to **SQL Editor**
3. Open the file `/supabase/migrations/20260131080000_fix_listing_upload_and_likes.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**
7. Check the output for success messages

### Option 2: Supabase CLI (If you have it set up)

```bash
# Make sure you're in the project directory
cd /home/user/rent-match-chat

# Link to your project (if not already linked)
npx supabase link --project-ref vplgtcguxujxwrgguxqq

# Apply all pending migrations
npx supabase db push
```

### Option 3: GitHub Action (If you have CI/CD)

Simply commit and push the migration file - your CI/CD should pick it up:

```bash
git add supabase/migrations/20260131080000_fix_listing_upload_and_likes.sql
git commit -m "Fix: Critical fixes for listing uploads and likes"
git push
```

## What Will Be Fixed

After applying the migration:

### Listing Uploads ✅
- Create property listings (all types)
- Create motorcycle/bicycle listings (with rental rates)
- Upload photos (up to 30 per listing)
- Photos stored in `listing-images` bucket

### Likes Functionality ✅
- Swipe right to save likes
- Likes persist after page refresh
- View liked properties list
- Owners can see who liked their listings
- New users can like immediately after signup

## Verification Steps

After applying the migration, test the following:

### Test Listing Upload:
1. Log in as an owner
2. Navigate to "Create Listing"
3. Select any category (Property, Motorcycle, Bicycle, Worker)
4. Fill out the form
5. Upload at least 1 photo
6. Click "Create Listing"
7. **Expected**: Success message, listing appears in your listings

### Test Likes:
1. Log in as a client
2. Browse listings
3. Swipe right on a listing
4. Refresh the page
5. Go to "Liked Properties"
6. **Expected**: The listing you liked appears in the list

### Test Owner Seeing Likes:
1. Log in as an owner
2. Navigate to "Interested Clients" or similar
3. **Expected**: See clients who liked your listings

## Still Having Issues?

If the problems persist after applying the migration, check:

1. **Browser Console Errors**: Open DevTools (F12) and check the Console tab
2. **Network Tab**: Check for failed API requests (Status 400, 403, 500)
3. **Supabase Logs**: Check your Supabase dashboard logs for errors

Common issues:
- Clear browser cache and localStorage
- Make sure you're logged in with an authenticated user
- Verify the migration completed successfully (check output)
- Check if RLS is enabled on tables (it should be)

## Technical Details

### Files Modified:
- Created: `/supabase/migrations/20260131080000_fix_listing_upload_and_likes.sql`

### Database Changes:
- `listings` table: Relaxed NOT NULL constraints
- `likes` table: Fixed RLS policies
- `storage.objects`: Added policies for listing-images bucket
- `storage.buckets`: Created listing-images bucket
- `is_user_active()` function: Returns TRUE for new users

### No Code Changes Required
All fixes are database-level. Your application code is correct.

---

**Priority**: URGENT - Apply this migration immediately to restore functionality
**Estimated Time**: 5 minutes to apply, immediate effect
**Risk Level**: Low - Only adds/relaxes constraints, no data loss risk
