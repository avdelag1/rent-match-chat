-- Create delete_user_account RPC function with cascade delete for all user data
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if the requesting user is deleting their own account
  IF auth.uid() != user_id_to_delete THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: You can only delete your own account'
    );
  END IF;

  -- Delete all related data in order (respecting foreign key constraints)
  
  -- Delete notifications
  DELETE FROM notifications WHERE user_id = user_id_to_delete OR sender_id = user_id_to_delete;
  
  -- Delete messages
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
  
  -- Delete reviews (given and received)
  DELETE FROM reviews WHERE reviewer_id = user_id_to_delete OR reviewee_id = user_id_to_delete;
  
  -- Delete subscriptions
  DELETE FROM subscriptions WHERE user_id = user_id_to_delete;
  
  -- Delete saved filters
  DELETE FROM saved_filters WHERE user_id = user_id_to_delete;
  
  -- Delete search alerts
  DELETE FROM search_alerts WHERE user_id = user_id_to_delete;
  
  -- Delete listings (if owner)
  DELETE FROM listings WHERE owner_id = user_id_to_delete;
  
  -- Delete profiles
  DELETE FROM client_profiles WHERE user_id = user_id_to_delete;
  DELETE FROM owner_profiles WHERE user_id = user_id_to_delete;
  
  -- Delete user role
  DELETE FROM user_roles WHERE user_id = user_id_to_delete;

  -- Delete the auth user (this will cascade to any remaining references)
  -- Note: This uses auth.users which requires special permissions
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