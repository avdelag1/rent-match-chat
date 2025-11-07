-- Add free_messaging column to matches table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'free_messaging'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN free_messaging BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add free_messaging column to conversations table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'free_messaging'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN free_messaging BOOLEAN DEFAULT false;
  END IF;
END $$;