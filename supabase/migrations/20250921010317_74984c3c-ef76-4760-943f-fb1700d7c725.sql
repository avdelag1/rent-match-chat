-- Make match_id nullable in conversations table to avoid foreign key constraint issues
ALTER TABLE public.conversations ALTER COLUMN match_id DROP NOT NULL;

-- Also add an index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(client_id, owner_id);