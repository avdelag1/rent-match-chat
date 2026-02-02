-- Migration: Add swipe_sound_theme column to profiles table
-- Description: Adds user preference for swipe sound effects
-- Date: 2026-02-02

-- Add swipe_sound_theme column to profiles table
-- Valid values: 'none', 'book', 'water', 'funny', 'calm', 'randomZen'
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS swipe_sound_theme TEXT DEFAULT 'none'
CHECK (swipe_sound_theme IN ('none', 'book', 'water', 'funny', 'calm', 'randomZen'));

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.swipe_sound_theme IS 'User preference for swipe sound effects: none, book, water, funny, calm, or randomZen';
