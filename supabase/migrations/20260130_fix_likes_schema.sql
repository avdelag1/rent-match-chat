-- ============================================
-- FIX LIKES TABLE SCHEMA MISMATCH
-- Date: 2026-01-30
-- Purpose: Add missing columns for frontend compatibility
-- ============================================

-- Add missing columns to likes table if they don't exist
DO $$
BEGIN
  -- Add target_id column (for flexible targeting)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'target_id') THEN
    ALTER TABLE public.likes ADD COLUMN target_id UUID;
  END IF;
  
  -- Add target_type column (listing, client, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'target_type') THEN
    ALTER TABLE public.likes ADD COLUMN target_type TEXT DEFAULT 'listing';
  END IF;
  
  -- Add direction column (left=dislike, right=like)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'direction') THEN
    ALTER TABLE public.likes ADD COLUMN direction TEXT DEFAULT 'right';
  END IF;
  
  -- Add source column (web, ios, android)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'source') THEN
    ALTER TABLE public.likes ADD COLUMN source TEXT DEFAULT 'web';
  END IF;
END $$;

-- Update NULL values with defaults
UPDATE public.likes SET target_type = 'listing' WHERE target_type IS NULL;
UPDATE public.likes SET direction = 'right' WHERE direction IS NULL;
UPDATE public.likes SET source = 'web' WHERE source IS NULL;

-- Migrate existing target_listing_id data to target_id (if legacy column exists)
-- This ensures backward compatibility - guarded to prevent errors
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'likes' 
    AND column_name = 'target_listing_id'
  ) THEN
    UPDATE public.likes 
    SET target_id = target_listing_id 
    WHERE target_id IS NULL AND target_listing_id IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- CLEANUP: Remove old unused columns (optional - safe to skip)
-- ============================================
-- These columns are kept for compatibility with any legacy code:
-- - target_listing_id (old column, kept for migration reference)

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Create index on target_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_likes_target_id ON public.likes(target_id);

-- Create index on target_type for filtering
CREATE INDEX IF NOT EXISTS idx_likes_target_type ON public.likes(target_type);

-- Create index on direction for filtering (right=likes, left=dislikes)
CREATE INDEX IF NOT EXISTS idx_likes_direction ON public.likes(direction);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_likes_user_direction ON public.likes(user_id, direction) 
WHERE direction = 'right';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if columns were added successfully
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'likes' 
-- ORDER BY ordinal_position;

-- Check sample data
-- SELECT * FROM public.likes LIMIT 5;
