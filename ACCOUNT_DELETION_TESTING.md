# Account Deletion Testing Guide

## Testing Instructions for Deployment

This guide provides step-by-step instructions to test the account deletion functionality before and after deploying to production.

## Pre-Deployment Checklist

- [ ] Review the migration file: `supabase/migrations/20251110000000_fix_account_deletion_rls.sql`
- [ ] Ensure you have Supabase CLI installed or access to Supabase Dashboard
- [ ] Backup production database (if testing on production)
- [ ] Read the ACCOUNT_DELETION_GUIDE.md for full documentation

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd /path/to/rent-match-chat

# Login to Supabase (if not already logged in)
supabase login

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the migration file: `supabase/migrations/20251110000000_fix_account_deletion_rls.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run" to execute
7. Verify no errors in the output

### Option 3: Using Node.js Deployment Script

```bash
# If you have the deploy-migrations script
./deploy-migrations.sh
```

## Post-Deployment Testing

### Test Environment Setup

Before testing in production, test in a development/staging environment:

1. **Create Test Accounts**
   ```
   Client Test Account:
   - Email: test-client@example.com
   - Password: TestPass123!
   
   Owner Test Account:
   - Email: test-owner@example.com
   - Password: TestPass123!
   ```

2. **Add Test Data**
   - Client: Save some properties, send messages, create searches
   - Owner: Create listings, upload documents, interact with clients

### Test Scenarios

#### Scenario 1: Client Account Deletion

**Steps:**
1. Log in as the test client account
2. Navigate to Settings → Security tab
3. Scroll to "Danger Zone" section
4. Click "Delete Account" button
5. In the confirmation dialog, verify warnings are displayed
6. Type "delete" (lowercase) in the confirmation field
7. Click "Delete Account Permanently"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ User is automatically signed out
- ✅ Redirected to home page
- ✅ Cannot log in with deleted credentials
- ✅ All client data removed from database (verify in Supabase)

**Database Verification:**
```sql
-- Should return 0 rows for deleted user
SELECT * FROM auth.users WHERE email = 'test-client@example.com';
SELECT * FROM client_profiles WHERE user_id = 'DELETED_USER_ID';
SELECT * FROM saved_searches WHERE user_id = 'DELETED_USER_ID';
SELECT * FROM messages WHERE sender_id = 'DELETED_USER_ID';
```

#### Scenario 2: Owner Account Deletion

**Steps:**
1. Log in as the test owner account
2. Navigate to Settings → Security tab
3. Scroll to "Danger Zone" section
4. Click "Delete Account" button
5. In the confirmation dialog, verify warnings mention listings
6. Type "DELETE" (uppercase) in the confirmation field
7. Click "Delete Account Permanently"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ User is automatically signed out
- ✅ Redirected to home page
- ✅ All listings owned by this user are deleted
- ✅ All owner data removed from database (verify in Supabase)

**Database Verification:**
```sql
-- Should return 0 rows for deleted user
SELECT * FROM auth.users WHERE email = 'test-owner@example.com';
SELECT * FROM owner_profiles WHERE user_id = 'DELETED_USER_ID';
SELECT * FROM listings WHERE owner_id = 'DELETED_USER_ID';
SELECT * FROM availability_slots WHERE owner_id = 'PROFILE_ID';
```

#### Scenario 3: Invalid Deletion Attempts

**Test Case 3a: Wrong Confirmation Text**
1. Attempt to delete account
2. Type "remove" instead of "delete"
3. Click delete button

**Expected:**
- ❌ Error message: "Please type DELETE to confirm account deletion"
- ❌ Account is NOT deleted
- ❌ User remains signed in

**Test Case 3b: Unauthorized Deletion**
This is handled at the database level but worth understanding:
```sql
-- This should fail with "Unauthorized" error
SELECT delete_user_account('some-other-user-id');
```

### Verification Queries

After each successful deletion, run these queries in Supabase SQL Editor:

```sql
-- Replace DELETED_USER_ID with the actual UUID

-- Check auth.users (should be empty)
SELECT COUNT(*) FROM auth.users WHERE id = 'DELETED_USER_ID';

-- Check profiles (should be empty)
SELECT COUNT(*) FROM profiles WHERE user_id = 'DELETED_USER_ID';

-- Check messages (should be empty)
SELECT COUNT(*) FROM messages WHERE sender_id = 'DELETED_USER_ID' OR recipient_id = 'DELETED_USER_ID';

-- Check conversations (should be empty)
SELECT COUNT(*) FROM conversations WHERE user1_id = 'DELETED_USER_ID' OR user2_id = 'DELETED_USER_ID';

-- Check listings (should be empty for owner)
SELECT COUNT(*) FROM listings WHERE owner_id = 'DELETED_USER_ID';

-- Check saved searches (should be empty for client)
SELECT COUNT(*) FROM saved_searches WHERE user_id = 'DELETED_USER_ID';

-- Check subscriptions (should be empty)
SELECT COUNT(*) FROM user_subscriptions WHERE user_id = 'DELETED_USER_ID';

-- Check notifications (should be empty)
SELECT COUNT(*) FROM notifications WHERE user_id = 'DELETED_USER_ID';

-- Summary query - all should return 0
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users WHERE id = 'DELETED_USER_ID'
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles WHERE user_id = 'DELETED_USER_ID'
UNION ALL
SELECT 'messages', COUNT(*) FROM messages WHERE sender_id = 'DELETED_USER_ID'
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations WHERE user1_id = 'DELETED_USER_ID'
UNION ALL
SELECT 'listings', COUNT(*) FROM listings WHERE owner_id = 'DELETED_USER_ID'
UNION ALL
SELECT 'saved_searches', COUNT(*) FROM saved_searches WHERE user_id = 'DELETED_USER_ID'
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions WHERE user_id = 'DELETED_USER_ID';
```

## Performance Testing

For accounts with large amounts of data:

1. **Create a test account with significant data**
   - 100+ messages
   - 50+ saved searches
   - 20+ listings (for owner)
   - Multiple subscriptions

2. **Measure deletion time**
   - Time the deletion process
   - Check database logs for query performance
   - Ensure deletion completes within reasonable time (<30 seconds)

3. **Verify transaction integrity**
   - Ensure either ALL data is deleted or NONE (no partial deletions)
   - Check for any orphaned records

## Error Handling Tests

### Test Database Errors

Temporarily modify the function to cause errors and verify error handling:

```sql
-- This is for testing only, do NOT deploy this
-- Test 1: Foreign key violation (shouldn't happen with our order)
-- Test 2: Permission errors (shouldn't happen with SECURITY DEFINER)
-- Test 3: Network interruption (should rollback transaction)
```

### Test Frontend Error Handling

1. **Network Error Simulation**
   - Disconnect internet during deletion
   - Verify error message is shown
   - Verify user is not signed out

2. **Invalid Response Handling**
   - Check browser console for errors
   - Verify graceful error messages

## Monitoring After Deployment

### Week 1: Close Monitoring

- Monitor Supabase logs for any deletion errors
- Check for any support tickets related to account deletion
- Verify no orphaned data appears in regular queries
- Review error tracking (Sentry, etc.) for deletion-related errors

### Metrics to Track

- Number of account deletions per day/week
- Success rate of deletions
- Average time for deletion to complete
- Error rate and types
- Support tickets related to deletion issues

## Rollback Plan

If issues are discovered after deployment:

### Immediate Rollback (Within 24 hours)

```sql
-- Restore the previous version of the function
-- Copy contents from: supabase/migrations/20251106000833_85cf4e77-6964-4f6c-8a5c-2c4daeff47c8.sql
-- And execute in SQL Editor
```

### Long-term Fix

1. Identify the specific issue
2. Create a new migration to fix it
3. Test thoroughly in development
4. Deploy the fix

## Security Audit Checklist

After deployment, verify:

- [ ] Users can only delete their own accounts
- [ ] Anonymous users cannot call the function
- [ ] All sensitive data is properly removed
- [ ] No data leaks to other users
- [ ] Audit logs are created for deletions (if applicable)
- [ ] RLS policies are respected throughout the deletion
- [ ] Function cannot be exploited for DOS attacks

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass in staging environment
- [ ] Database backup is current
- [ ] Rollback plan is documented and tested
- [ ] Support team is notified of new feature
- [ ] Monitoring is set up for deletion operations
- [ ] Error tracking is configured
- [ ] Documentation is updated
- [ ] Migration has been reviewed by team
- [ ] Security audit completed
- [ ] Performance testing completed

## Support Documentation

Prepare support team with:

1. **Common User Questions**
   - "Can I recover my deleted account?" (No, it's permanent)
   - "What happens to my data?" (All permanently deleted)
   - "Will I be charged after deletion?" (No, subscriptions cancelled)
   - "Can I delete someone else's account?" (No, only your own)

2. **Troubleshooting Guide**
   - User can't delete account → Check they're typing "DELETE" correctly
   - Deletion fails → Check Supabase logs
   - Partial deletion → Contact engineering (shouldn't happen)

3. **Escalation Process**
   - If user reports unable to delete → Check account status
   - If data persists after deletion → Engineering ticket
   - If deletion takes too long → Check database performance

## Conclusion

This comprehensive testing guide ensures the account deletion feature works correctly and securely. Follow all steps before deploying to production.

For questions or issues, refer to:
- ACCOUNT_DELETION_GUIDE.md for implementation details
- Supabase documentation for RLS and SECURITY DEFINER functions
- Project team for escalations
