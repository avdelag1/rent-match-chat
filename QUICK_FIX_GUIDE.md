# Quick Fix Guide: Messaging Send Errors

## Problem
You're experiencing errors when trying to send messages. This is caused by a database schema mismatch between what the code expects and what exists in the database.

## Root Cause
The code expects:
- `message_text` column in `conversation_messages` table
- `message_type` column in `conversation_messages` table
- `client_id` and `owner_id` columns in `conversations` table

But the database may still have the old schema:
- `content` column (instead of `message_text`)
- `participant_1_id` and `participant_2_id` (instead of `client_id`/`owner_id`)

## Solution

### Step 1: Verify the Issue

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `verify-messaging-schema.sql`
4. Run the query
5. Check the results:
   - If you see `content` instead of `message_text`, the migrations need to be applied
   - If you see `message_text`, the schema is correct and the issue is elsewhere

### Step 2: Apply Missing Migrations

The following migrations need to be applied to your Supabase database in order:

1. **20251108000000_fix_conversations_schema.sql** - Fixes conversations table
2. **20251108000001_fix_conversation_messages_schema.sql** - Fixes message table
3. **20251108000003_fix_message_triggers_and_policies.sql** - Updates triggers and policies

#### How to Apply Migrations:

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations to remote database
supabase db push
```

**Option B: Manual Application via SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Open each migration file in order and run them one by one:
   - `supabase/migrations/20251108000000_fix_conversations_schema.sql`
   - `supabase/migrations/20251108000001_fix_conversation_messages_schema.sql`
   - `supabase/migrations/20251108000003_fix_message_triggers_and_policies.sql`

### Step 3: Test the Fix

After applying migrations:

1. Clear your browser cache and reload the app
2. Try sending a test message
3. The message should send successfully

## Additional Issues

### Emulator Connection Error

The "Emulator failed to connect within 5 minutes" error is a separate Android/Capacitor issue.

**Fix:**
```bash
# Make sure you're in the project root
cd /home/user/rent-match-chat

# Rebuild the app
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Then run the app from Android Studio with an emulator or physical device
```

If you don't have an emulator set up:
1. Open Android Studio
2. Go to Tools → Device Manager
3. Create a new Virtual Device
4. Select a device (e.g., Pixel 6)
5. Select a system image (e.g., API 33)
6. Click Finish

## Verification Checklist

- [ ] Database schema verification completed
- [ ] Migrations applied successfully
- [ ] Test message sent successfully
- [ ] No console errors in browser
- [ ] Android emulator configured (if testing on Android)

## Still Having Issues?

If you're still experiencing errors after following these steps:

1. Check the browser console (F12) for specific error messages
2. Check the Supabase logs in your dashboard
3. Verify your environment variables are set correctly:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

## Error Messages to Look For

### If you see: "column 'message_text' does not exist"
→ Migration 20251108000001 hasn't been applied

### If you see: "column 'client_id' does not exist"
→ Migration 20251108000000 hasn't been applied

### If you see: "new row violates row-level security policy"
→ Migration 20251108000003 hasn't been applied or RLS policies need updating

### If you see: "Cannot determine receiver_id"
→ The trigger is working but the conversation doesn't exist or sender is not a participant
