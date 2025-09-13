-- Fix the likes table foreign key constraint issue
-- The current constraint expects target_id to reference users table, but it should allow listing IDs too
-- Drop the existing foreign key constraint that's causing the error
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_target_id_fkey;

-- Add a unique constraint to prevent duplicate likes
ALTER TABLE public.likes ADD CONSTRAINT unique_user_target_direction 
UNIQUE (user_id, target_id, direction);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_likes_user_target ON public.likes(user_id, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_id ON public.likes(target_id);