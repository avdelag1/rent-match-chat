-- Fix RLS policies to use client_id and owner_id instead of participant_1_id and participant_2_id
-- This migration ensures chat functionality works correctly after the schema migration

-- Update RLS policies for conversations table
-- Drop old policies that use participant_1_id and participant_2_id
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;

-- Create new policies using client_id and owner_id
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR auth.uid() = owner_id
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id OR auth.uid() = owner_id
  );

CREATE POLICY "Users can update their own conversations"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id OR auth.uid() = owner_id
  )
  WITH CHECK (
    auth.uid() = client_id OR auth.uid() = owner_id
  );

-- Update RLS policy for conversation_messages table
-- Drop old policy that checks participant_1_id and participant_2_id in EXISTS clause
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.conversation_messages;

-- Create new policy using client_id and owner_id
CREATE POLICY "Users can send messages in their conversations"
  ON public.conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Update RLS policy for typing_indicators table
-- Drop old policy that checks participant_1_id and participant_2_id
DROP POLICY IF EXISTS "Conversation participants can view typing indicators" ON public.typing_indicators;

-- Create new policy using client_id and owner_id
CREATE POLICY "Conversation participants can view typing indicators"
  ON public.typing_indicators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = typing_indicators.conversation_id
        AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Add comment to document the migration
COMMENT ON TABLE public.conversations IS 'Conversations between clients and property owners. RLS policies updated to use client_id/owner_id columns.';
COMMENT ON TABLE public.conversation_messages IS 'Messages in conversations. RLS policies updated to use client_id/owner_id columns.';
