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
    UPDATE public.conversations c
    SET
      client_id = CASE
        WHEN ur1.role = 'client' THEN c.participant_1_id
        WHEN ur2.role = 'client' THEN c.participant_2_id
        ELSE c.participant_1_id
      END,
      owner_id = CASE
        WHEN ur1.role = 'owner' THEN c.participant_1_id
        WHEN ur2.role = 'owner' THEN c.participant_2_id
        ELSE c.participant_2_id
      END
    FROM public.user_roles ur1
    INNER JOIN public.user_roles ur2 ON ur2.user_id = c.participant_2_id
    WHERE ur1.user_id = c.participant_1_id
      AND c.client_id IS NULL
      AND c.owner_id IS NULL
      AND (ur1.role = 'client' OR ur1.role = 'owner')
      AND (ur2.role = 'client' OR ur2.role = 'owner')
      AND ur1.role != ur2.role;

    -- Handle edge case
    UPDATE public.conversations c
    SET
      client_id = participant_1_id,
      owner_id = participant_2_id
    WHERE (client_id IS NULL OR owner_id IS NULL)
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur1
        INNER JOIN public.user_roles ur2 ON ur2.user_id = c.participant_2_id
        WHERE ur1.user_id = c.participant_1_id
          AND ur1.role = ur2.role
      );

    -- For any remaining conversations without proper role mapping
    UPDATE public.conversations
    SET
      client_id = participant_1_id,
      owner_id = participant_2_id
    WHERE client_id IS NULL OR owner_id IS NULL;

    -- Make the new columns NOT NULL
    ALTER TABLE public.conversations
      ALTER COLUMN client_id SET NOT NULL,
      ALTER COLUMN owner_id SET NOT NULL;

    -- Update RLS policies
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_owner_id ON public.conversations(owner_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON public.conversations(match_id);

    RAISE NOTICE 'Successfully migrated conversations table';
  ELSIF has_client_owner_cols THEN
    RAISE NOTICE 'Conversations table already has client_id/owner_id columns';
  END IF;
END $$;

-- Update unique conversation constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'unique_conversation'
    AND table_name = 'conversations'
  ) THEN
    ALTER TABLE public.conversations DROP CONSTRAINT unique_conversation;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations'
    AND column_name = 'client_id'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_pair
      ON public.conversations(LEAST(client_id, owner_id), GREATEST(client_id, owner_id))
      WHERE status = 'active';
  END IF;
END $$;
