# Messaging and Navigation Fixes

## Overview

This document explains the fixes applied to resolve two critical issues:
1. **Messaging between clients and owners not working**
2. **Circular listing button navigation issue**

## Issues Fixed

### 1. Messaging System

#### Problem
Messaging between clients and owners was not working due to a database schema mismatch:
- The code expected `client_id` and `owner_id` columns in the `conversations` table
- The code expected `message_text` column in the `conversation_messages` table
- The database had old column names: `participant_1_id`, `participant_2_id`, and `content`

#### Solution
Created and documented three database migrations:
1. `20251108000000_fix_conversations_schema.sql` - Migrates conversations table to use `client_id`/`owner_id`
2. `20251108000001_fix_conversation_messages_schema.sql` - Renames `content` to `message_text` and adds auto-population of `receiver_id`
3. `20251108000002_cleanup_old_participant_columns.sql` - Removes old columns after verification

#### How to Apply
Run the migration script:
```bash
# Set your Supabase database URL
export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres'

# Run the migration script
./apply-messaging-migrations.sh
```

Alternatively, apply migrations using Supabase CLI:
```bash
npx supabase db push
```

Or manually run each migration SQL file in your Supabase SQL Editor.

### 2. Circular Listing Button Navigation

#### Problem
The circular button in the center of the bottom navigation was opening an "Add Listing" dialog instead of showing the multi-listing management page.

#### Solution
Changed the BottomNavigation component to:
- **Circular center button (List icon)**: Now navigates directly to `/owner/properties` to show all listings
- **Regular "Add" button (Plus icon)**: Moved to a regular position, still opens the category dialog for adding new listings

This makes it easier to access the listings management page, which is a more frequently used feature than adding new listings.

## Files Changed

### 1. `/src/components/BottomNavigation.tsx`
- Changed the center circular button from "Add" to "Listings"
- Made the "Listings" button navigate to `/owner/properties` using `path` instead of `onClick`
- Moved "Add" button to regular position

## Testing

### Test Messaging
1. Log in as a client
2. Find a property you like
3. Start a conversation with the owner
4. Send a message
5. Log in as the owner (different browser/incognito)
6. Check that you received the message
7. Reply to the message
8. Verify the client receives the reply

### Test Listing Button
1. Log in as an owner
2. Look at the bottom navigation
3. Click the circular center button (with List icon)
4. Verify you're taken to `/owner/properties` showing all your listings in a grid
5. Verify you can view, edit, and delete listings
6. Click the "Add" button (regular button with Plus icon)
7. Verify the category selection dialog opens

## Migration Details

### Conversations Table Changes
- **Added columns**: `client_id`, `owner_id`, `listing_id`, `match_id`, `status`
- **Migrated data**: Automatically determined which participant is the client/owner based on `user_roles` table
- **Updated RLS policies**: Now use `client_id` and `owner_id` for access control
- **Added indexes**: For better query performance

### Conversation Messages Table Changes
- **Renamed column**: `content` → `message_text`
- **Added column**: `message_type` (text, image, file, system)
- **Added trigger**: Auto-populates `receiver_id` based on conversation participants
- **Made receiver_id nullable**: Can be derived from conversation, but trigger ensures it's always set

## Rollback Plan

If you need to rollback these changes:

### For Messaging
The migrations are designed to be safe and keep old columns until verification. To rollback:
1. Restore old columns from the migration backups
2. Restore old RLS policies
3. Update the code to use old column names

### For Navigation
Simply revert the BottomNavigation.tsx changes:
```bash
git revert <commit-hash>
```

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify migrations were applied successfully
4. Ensure RLS policies are correct

## Additional Notes

- Messages within existing conversations are **unlimited**
- Only starting new conversations is quota-limited (5-50 per month depending on tier)
- The trigger for auto-populating `receiver_id` ensures data integrity
- All changes are backwards-compatible during migration
