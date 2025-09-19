-- Update message tracking for conversation starters instead of individual messages
DROP TABLE IF EXISTS public.message_usage;

CREATE TABLE public.conversation_starters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  conversations_started INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.conversation_starters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conversation starters" 
  ON public.conversation_starters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversation starters" 
  ON public.conversation_starters 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Function to get current week's conversation starter count
CREATE OR REPLACE FUNCTION get_weekly_conversation_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    week_start DATE;
    conversation_count INTEGER;
BEGIN
    -- Get the start of current week (Monday)
    week_start := DATE_TRUNC('week', CURRENT_DATE);
    
    -- Get current conversation count for this week
    SELECT conversations_started INTO conversation_count
    FROM conversation_starters
    WHERE user_id = p_user_id AND week_start = week_start;
    
    -- Return 0 if no record exists
    RETURN COALESCE(conversation_count, 0);
END;
$$;

-- Function to check if user can start new conversation
CREATE OR REPLACE FUNCTION can_start_conversation(p_user_id UUID, p_other_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    week_start DATE;
    current_count INTEGER;
    max_conversations INTEGER := 5; -- Default free limit
BEGIN
    -- Check if conversation already exists
    IF EXISTS (
        SELECT 1 FROM conversations 
        WHERE (client_id = p_user_id AND owner_id = p_other_user_id)
        OR (client_id = p_other_user_id AND owner_id = p_user_id)
    ) THEN
        RETURN TRUE; -- Can continue existing conversation
    END IF;
    
    -- Get current count
    current_count := get_weekly_conversation_count(p_user_id);
    
    -- Check if user has premium subscription for unlimited conversations
    IF EXISTS (
        SELECT 1 FROM user_subscriptions us
        JOIN subscription_packages sp ON us.package_id = sp.id
        WHERE us.user_id = p_user_id 
        AND us.is_active = TRUE
        AND sp.tier != 'free'
    ) THEN
        RETURN TRUE; -- Unlimited for premium users
    END IF;
    
    -- Check if under limit
    RETURN current_count < max_conversations;
END;
$$;

-- Function to increment conversation starter count
CREATE OR REPLACE FUNCTION increment_conversation_count(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    week_start DATE;
BEGIN
    -- Get the start of current week (Monday)
    week_start := DATE_TRUNC('week', CURRENT_DATE);
    
    -- Increment count
    INSERT INTO conversation_starters (user_id, week_start, conversations_started)
    VALUES (p_user_id, week_start, 1)
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET 
        conversations_started = conversation_starters.conversations_started + 1,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$;

-- Enable real-time for messaging tables
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;