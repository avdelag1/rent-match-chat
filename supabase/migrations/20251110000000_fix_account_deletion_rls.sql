-- Migration: Fix account deletion to include all tables and proper permissions
-- Date: 2025-11-10
-- Description: Updates delete_user_account function to include all user-related tables
--              and grants proper permissions for authenticated users to delete their accounts

-- Drop existing function to recreate with all tables
DROP FUNCTION IF EXISTS delete_user_account(UUID);

-- Create comprehensive delete_user_account RPC function
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_profile_id UUID;
BEGIN
  -- Check if the requesting user is deleting their own account
  IF auth.uid() != user_id_to_delete THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: You can only delete your own account'
    );
  END IF;

  -- Get the profile ID for this user (needed for some tables)
  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = user_id_to_delete LIMIT 1;

  -- Delete all related data in order (respecting foreign key constraints)
  
  -- Delete user reports (as reporter or reported)
  DELETE FROM user_reports WHERE reporter_id = v_profile_id;
  DELETE FROM user_reports WHERE reported_user_id = v_profile_id;
  
  -- Delete content shares
  DELETE FROM content_shares WHERE sharer_id = v_profile_id;
  DELETE FROM content_shares WHERE shared_profile_id = v_profile_id;
  
  -- Delete viewing requests
  DELETE FROM viewing_requests WHERE client_id = user_id_to_delete OR owner_id = user_id_to_delete;
  
  -- Delete message attachments
  DELETE FROM message_attachments WHERE sender_id = user_id_to_delete;
  
  -- Delete message activations
  DELETE FROM message_activations WHERE user_id = user_id_to_delete;
  
  -- Delete package usage
  DELETE FROM package_usage WHERE user_id = user_id_to_delete;
  
  -- Delete activation usage log
  DELETE FROM activation_usage_log WHERE user_id = user_id_to_delete;
  
  -- Delete typing indicators
  DELETE FROM typing_indicators WHERE user_id = user_id_to_delete;
  
  -- Delete user security settings
  DELETE FROM user_security_settings WHERE user_id = user_id_to_delete;
  
  -- Delete saved searches and their matches
  DELETE FROM saved_search_matches WHERE saved_search_id IN (
    SELECT id FROM saved_searches WHERE user_id = user_id_to_delete
  );
  DELETE FROM saved_searches WHERE user_id = user_id_to_delete;
  
  -- Delete notifications
  DELETE FROM notifications WHERE user_id = user_id_to_delete OR sender_id = user_id_to_delete;
  
  -- Delete conversation messages
  DELETE FROM conversation_messages WHERE sender_id = user_id_to_delete;
  
  -- Delete messages (old table if still exists)
  DELETE FROM messages WHERE sender_id = user_id_to_delete OR recipient_id = user_id_to_delete;
  
  -- Delete conversations
  DELETE FROM conversations WHERE user1_id = user_id_to_delete OR user2_id = user_id_to_delete;
  
  -- Delete matches
  DELETE FROM matches WHERE client_id = user_id_to_delete OR owner_id = user_id_to_delete;
  
  -- Delete likes
  DELETE FROM likes WHERE user_id = user_id_to_delete OR owner_id = user_id_to_delete;
  
  -- Delete swipes
  DELETE FROM swipes WHERE user_id = user_id_to_delete;
  
  -- Delete contracts
  DELETE FROM contracts WHERE client_id = user_id_to_delete OR owner_id = user_id_to_delete;
  
  -- Delete review helpful votes
  DELETE FROM review_helpful_votes WHERE user_id = user_id_to_delete;
  
  -- Delete reviews (given and received)
  DELETE FROM reviews WHERE reviewer_id = user_id_to_delete OR reviewee_id = user_id_to_delete;
  
  -- Delete user subscriptions
  DELETE FROM user_subscriptions WHERE user_id = user_id_to_delete;
  
  -- Delete subscriptions (old table if still exists)
  DELETE FROM subscriptions WHERE user_id = user_id_to_delete;
  
  -- Delete saved filters
  DELETE FROM saved_filters WHERE user_id = user_id_to_delete;
  
  -- Delete search alerts
  DELETE FROM search_alerts WHERE user_id = user_id_to_delete;
  
  -- Delete notification preferences
  DELETE FROM notification_preferences WHERE user_id = user_id_to_delete;
  
  -- Delete support messages and tickets
  DELETE FROM support_messages WHERE user_id = user_id_to_delete;
  DELETE FROM support_tickets WHERE user_id = user_id_to_delete;
  
  -- Delete listing views
  DELETE FROM listing_views WHERE user_id = user_id_to_delete;
  
  -- Delete client category preferences
  DELETE FROM client_category_preferences WHERE user_id = user_id_to_delete;
  
  -- Delete owner client preferences
  DELETE FROM owner_client_preferences WHERE owner_id = user_id_to_delete;
  
  -- Delete listings (if owner)
  DELETE FROM listings WHERE owner_id = user_id_to_delete;
  
  -- Delete profiles
  DELETE FROM client_profiles WHERE user_id = user_id_to_delete;
  DELETE FROM owner_profiles WHERE user_id = user_id_to_delete;
  DELETE FROM profiles WHERE user_id = user_id_to_delete;
  
  -- Delete user role
  DELETE FROM user_roles WHERE user_id = user_id_to_delete;

  -- Delete the auth user (this will cascade to any remaining references)
  -- Note: This requires the function to be SECURITY DEFINER with proper grants
  DELETE FROM auth.users WHERE id = user_id_to_delete;

  v_result := jsonb_build_object(
    'success', true,
    'message', 'Account successfully deleted'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user_account(UUID) IS 'Deletes a user account and all associated data. Users can only delete their own accounts. This is a complete cascade delete of all user data across all tables.';
