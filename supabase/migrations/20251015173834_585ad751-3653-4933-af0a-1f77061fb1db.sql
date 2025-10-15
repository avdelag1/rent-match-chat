-- Fix user_roles table structure to match TypeScript expectations
-- The table already exists but we need to ensure it has all columns

-- Check if we need to add any missing columns
DO $$ 
BEGIN
    -- Add id column as primary key if it doesn't exist with proper name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_roles' AND column_name = 'id') THEN
        ALTER TABLE public.user_roles ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
END $$;