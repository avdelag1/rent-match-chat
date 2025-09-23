-- Fix likes functionality and ensure matches table exists
-- First check if matches table exists, if not create it
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  listing_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_mutual boolean DEFAULT false,
  status text DEFAULT 'pending',
  client_liked_at timestamp with time zone,
  owner_liked_at timestamp with time zone
);

-- Enable RLS on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for matches
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;

CREATE POLICY "Users can view their matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() IN (client_id, owner_id));

CREATE POLICY "Users can create matches"
ON public.matches
FOR INSERT
WITH CHECK (auth.uid() IN (client_id, owner_id));

CREATE POLICY "Users can update their matches"
ON public.matches
FOR UPDATE
USING (auth.uid() IN (client_id, owner_id));

-- Ensure likes table has proper policies
DROP POLICY IF EXISTS "Allow users to insert their own likes" ON public.likes;
DROP POLICY IF EXISTS "Allow users to update their own likes" ON public.likes;
DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Allow authenticated users to read likes" ON public.likes;

CREATE POLICY "Allow users to insert their own likes" 
ON public.likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own likes"
ON public.likes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes"
ON public.likes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to read likes"
ON public.likes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Ensure conversation_messages table has realtime enabled
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;

-- Enable realtime for these tables
INSERT INTO supabase_realtime.schema_migrations (version, inserted_at) 
VALUES ('20250923_realtime_setup', NOW()) 
ON CONFLICT DO NOTHING;

-- Create index for better performance on likes queries
CREATE INDEX IF NOT EXISTS idx_likes_user_target ON public.likes(user_id, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_direction ON public.likes(direction);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);

-- Make match_id nullable in conversations table to allow conversations without matches first
ALTER TABLE public.conversations ALTER COLUMN match_id DROP NOT NULL;