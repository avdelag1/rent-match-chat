-- Enable realtime for conversation_messages table
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.conversation_messages;

-- Also enable realtime for conversations table
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.conversations;

-- Make sure likes table has realtime enabled too
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.likes;