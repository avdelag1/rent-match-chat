# Account Deletion Implementation Guide

## Overview
This guide explains the account deletion functionality implemented for both clients and owners in the rent-match-chat application.

## Features
- ✅ Complete account deletion for both client and owner users
- ✅ Cascade deletion of all user-related data across all tables
- ✅ Proper RLS (Row Level Security) policies
- ✅ User confirmation required (must type "DELETE")
- ✅ Secure implementation - users can only delete their own accounts
- ✅ Automatic sign-out after successful deletion

## How It Works

### User Interface
1. Navigate to Settings page (Client Settings or Owner Settings)
2. Click on the "Security" tab
3. Scroll to the "Danger Zone" section
4. Click the "Delete Account" button
5. A confirmation dialog appears with warnings about what will be deleted
6. Type "DELETE" (case-insensitive) in the confirmation field
7. Click "Delete Account Permanently"

### Backend Process
The account deletion is handled by the `delete_user_account` RPC function in Supabase, which:

1. **Verifies Authorization**: Ensures the requesting user is deleting their own account
2. **Deletes Data in Order**: Removes all user data from the following tables:
   - User reports (as reporter and reported)
   - Content shares
   - Viewing requests
   - Message attachments
   - Message activations
   - Package usage
   - Activation usage logs
   - Typing indicators
   - User security settings
   - Saved searches and their matches
   - Notifications
   - Conversation messages
   - Messages
   - Conversations
   - Matches
   - Likes
   - Swipes
   - Contracts
   - Review votes
   - Reviews (given and received)
   - User subscriptions
   - Saved filters
   - Search alerts
   - Notification preferences
   - Support messages and tickets
   - Listing views
   - Client category preferences
   - Owner client preferences
   - Listings (if owner)
   - Client profiles
   - Owner profiles
   - Main profiles
   - User roles
   - Authentication user record

3. **Returns Success/Failure**: Returns a JSON response indicating success or failure

## Database Migration

### Migration File
`supabase/migrations/20251110000000_fix_account_deletion_rls.sql`

This migration:
- Updates the `delete_user_account` function to include all tables
- Grants `EXECUTE` permission to authenticated users
- Implements proper error handling

### Deployment
To deploy this migration to your Supabase instance:

1. **Via Supabase CLI**:
   ```bash
   supabase db push
   ```

2. **Via Supabase Dashboard**:
   - Go to the SQL Editor
   - Copy the contents of the migration file
   - Execute the SQL

3. **Via deployment script** (if available):
   ```bash
   ./deploy-migrations.sh
   ```

## Security Considerations

### RLS Policies
- The function uses `SECURITY DEFINER` to run with elevated privileges
- Authorization check ensures users can only delete their own accounts
- All table deletions respect existing RLS policies

### Data Privacy
- All user data is permanently deleted and cannot be recovered
- Subscription data is removed (user should be notified about cancellation)
- Messages and conversations are deleted from both sides

### Permissions
- The function is granted to `authenticated` role only
- Anonymous users cannot execute the function
- Only the account owner can delete their account

## User Experience

### Warnings Displayed
Before deletion, users see warnings about:
- All saved properties/listings will be deleted
- Messages and conversation history will be removed
- Subscriptions will be cancelled immediately
- The action is irreversible

### Success Flow
1. User confirms deletion
2. Backend deletes all data
3. User is automatically signed out
4. User is redirected to home page
5. Success toast notification is displayed

### Error Handling
If deletion fails:
- Error message is displayed to user
- User is NOT signed out
- User can contact support for assistance
- No partial deletion occurs (database transaction ensures atomicity)

## Testing

### Manual Testing Steps
1. **Create test accounts**:
   - Create a client account
   - Create an owner account
   - Add some data (listings, messages, etc.)

2. **Test client deletion**:
   - Sign in as client
   - Navigate to Settings → Security
   - Attempt account deletion
   - Verify all data is removed from database

3. **Test owner deletion**:
   - Sign in as owner
   - Navigate to Settings → Security
   - Attempt account deletion
   - Verify all data including listings are removed

4. **Test error cases**:
   - Try to delete without typing "DELETE"
   - Verify error message is shown
   - Ensure account is NOT deleted

### Database Verification
After deletion, verify in Supabase dashboard that:
- User record is removed from `auth.users`
- All related records are removed from public tables
- No orphaned data remains

## Troubleshooting

### Common Issues

**Issue**: "Unauthorized" error
- **Cause**: User is not authenticated or trying to delete someone else's account
- **Solution**: Ensure user is properly signed in and deleting their own account

**Issue**: "Function does not exist" error
- **Cause**: Migration not deployed
- **Solution**: Deploy the migration file to Supabase

**Issue**: Partial deletion
- **Cause**: Database constraints or missing tables
- **Solution**: Check database logs, ensure all tables exist, verify foreign key constraints

**Issue**: Permission denied on auth.users
- **Cause**: Function lacks permissions to delete from auth schema
- **Solution**: Ensure function is `SECURITY DEFINER` and has proper grants

## Support

If users encounter issues with account deletion:
1. Check the browser console for error messages
2. Verify the migration is deployed to Supabase
3. Check Supabase logs for detailed error information
4. Contact support if the issue persists

## Related Files
- Frontend: `src/components/AccountSecurity.tsx`
- Migration: `supabase/migrations/20251110000000_fix_account_deletion_rls.sql`
- Previous migration: `supabase/migrations/20251106000833_85cf4e77-6964-4f6c-8a5c-2c4daeff47c8.sql`
