-- Fix conversations table schema to match code expectations
-- The code expects client_id and owner_id columns, but the table has participant_1_id and participant_2_id

-- First, check if the conversations table has the old participant columns
DO $$ 
DECLARE
  has_participant_cols BOOLEAN;
  has_client_owner_cols BOOLEAN;
BEGIN
  -- Check if participant columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name IN ('participant_1_id', 'participant_2_id')
  ) INTO has_participant_cols;

  -- Check if client/owner columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name IN ('client_id', 'owner_id')
  ) INTO has_client_owner_cols;

  -- If we have participant columns but not client/owner columns, migrate
  IF has_participant_cols AND NOT has_client_owner_cols THEN
    -- Add new columns
    ALTER TABLE public.conversations 
      ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'));

    -- Migrate data from participant columns to role-based columns
    -- We need to determine which participant is the client and which is the owner
    UPDATE public.conversations c
    SET 
      client_id = CASE 
        WHEN ur1.role = 'client' THEN c.participant_1_id
        WHEN ur2.role = 'client' THEN c.participant_2_id
        ELSE c.participant_1_id -- fallback
      END,
      owner_id = CASE 
        WHEN ur1.role = 'owner' THEN c.participant_1_id
        WHEN ur2.role = 'owner' THEN c.participant_2_id
        ELSE c.participant_2_id -- fallback
      END
    FROM public.user_roles ur1
    LEFT JOIN public.user_roles ur2 ON ur2.user_id = c.participant_2_id
    WHERE ur1.user_id = c.participant_1_id
      AND c.client_id IS NULL 
      AND c.owner_id IS NULL;

    -- For any remaining conversations without proper role mapping, make a best guess
    UPDATE public.conversations
    SET 
      client_id = participant_1_id,
      owner_id = participant_2_id
    WHERE client_id IS NULL OR owner_id IS NULL;

    -- Make the new columns NOT NULL now that they're populated
    ALTER TABLE public.conversations 
      ALTER COLUMN client_id SET NOT NULL,
      ALTER COLUMN owner_id SET NOT NULL;

    -- Drop the old participant columns (after ensuring data is migrated)
    -- Uncomment these lines after verifying migration worked:
    -- ALTER TABLE public.conversations DROP COLUMN IF EXISTS participant_1_id;
    -- ALTER TABLE public.conversations DROP COLUMN IF EXISTS participant_2_id;

    -- Update RLS policies to use new columns
    DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;

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

    -- Create indexes for the new columns (may already exist from health check migration)
    CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_owner_id ON public.conversations(owner_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON public.conversations(match_id);

    RAISE NOTICE 'Successfully migrated conversations table from participant_*_id to client_id/owner_id';
  ELSIF has_client_owner_cols THEN
    RAISE NOTICE 'Conversations table already has client_id/owner_id columns, no migration needed';
  ELSE
    RAISE NOTICE 'Conversations table structure is unexpected, manual intervention may be required';
  END IF;
END $$;

-- Also update the unique conversation constraint to use new columns
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_conversation' 
    AND table_name = 'conversations'
  ) THEN
    ALTER TABLE public.conversations DROP CONSTRAINT unique_conversation;
  END IF;

  -- Add new constraint on client_id and owner_id if columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'client_id'
  ) THEN
    -- Ensure unique conversations between client and owner
    CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_pair 
      ON public.conversations(LEAST(client_id, owner_id), GREATEST(client_id, owner_id))
      WHERE status = 'active';
  END IF;
END $$;

-- Update typing_indicators table RLS policies to use new column names
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'client_id'
  ) THEN
    DROP POLICY IF EXISTS "Conversation participants can view typing indicators" ON public.typing_indicators;
    
    CREATE POLICY "Conversation participants can view typing indicators"
      ON public.typing_indicators
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.conversations
          WHERE id = typing_indicators.conversation_id
            AND (client_id = auth.uid() OR owner_id = auth.uid())
        )
      );
  END IF;
END $$;
