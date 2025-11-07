-- CLEANUP MIGRATION: Drop old participant columns from conversations table
-- Run this ONLY AFTER verifying that the main migration worked correctly
-- and all conversations have been properly migrated to client_id/owner_id

-- This migration should be run manually after confirming:
-- 1. All conversations have non-null client_id and owner_id
-- 2. Messaging functionality is working correctly
-- 3. No applications are still using participant_1_id or participant_2_id

DO $$ 
BEGIN
  -- Safety check: Ensure all conversations have been migrated
  IF EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE client_id IS NULL OR owner_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot drop participant columns: Some conversations still have NULL client_id or owner_id. Migration may not be complete.';
  END IF;

  -- Check if old columns still exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name IN ('participant_1_id', 'participant_2_id')
  ) THEN
    -- Drop the old columns
    ALTER TABLE public.conversations 
      DROP COLUMN IF EXISTS participant_1_id,
      DROP COLUMN IF EXISTS participant_2_id;

    RAISE NOTICE 'Successfully dropped old participant columns from conversations table';
  ELSE
    RAISE NOTICE 'Old participant columns do not exist, nothing to drop';
  END IF;
END $$;

-- Also drop the old unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_conversation' 
    AND table_name = 'conversations'
  ) THEN
    ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS unique_conversation;
    RAISE NOTICE 'Dropped old unique_conversation constraint';
  END IF;
END $$;

COMMENT ON TABLE public.conversations IS 'Chat conversations between clients and owners. Uses client_id and owner_id columns (migrated from participant_1_id/participant_2_id).';
