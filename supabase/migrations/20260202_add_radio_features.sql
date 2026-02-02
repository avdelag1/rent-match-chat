-- Migration: Add radio player features
-- Description: Adds radio player preferences and user playlists
-- Date: 2026-02-02

-- Add radio preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS radio_skin TEXT DEFAULT 'iphone'
CHECK (radio_skin IN ('iphone', 'vinyl', 'ipod'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS radio_current_city TEXT DEFAULT 'tulum'
CHECK (radio_current_city IN ('new-york', 'miami', 'ibiza', 'tulum', 'california', 'texas', 'french', 'podcasts'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS radio_current_station_id TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS radio_volume DECIMAL(3, 2) DEFAULT 0.7
CHECK (radio_volume >= 0 AND radio_volume <= 1);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS radio_shuffle_mode BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS radio_favorite_stations TEXT[] DEFAULT '{}';

-- Add comments to document the columns
COMMENT ON COLUMN public.profiles.radio_skin IS 'Radio player UI skin: iphone (modern), vinyl (retro), or ipod (classic)';
COMMENT ON COLUMN public.profiles.radio_current_city IS 'Current city/location for radio stations';
COMMENT ON COLUMN public.profiles.radio_current_station_id IS 'ID of the currently playing station';
COMMENT ON COLUMN public.profiles.radio_volume IS 'Radio player volume level (0.0 to 1.0)';
COMMENT ON COLUMN public.profiles.radio_shuffle_mode IS 'Whether shuffle mode is enabled';
COMMENT ON COLUMN public.profiles.radio_favorite_stations IS 'Array of favorite station IDs';

-- Create user_radio_playlists table
CREATE TABLE IF NOT EXISTS public.user_radio_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  station_ids TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_playlists_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Add RLS policies for user_radio_playlists
ALTER TABLE public.user_radio_playlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own playlists
CREATE POLICY "Users can view their own radio playlists"
  ON public.user_radio_playlists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own playlists
CREATE POLICY "Users can create their own radio playlists"
  ON public.user_radio_playlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own playlists
CREATE POLICY "Users can update their own radio playlists"
  ON public.user_radio_playlists
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own playlists
CREATE POLICY "Users can delete their own radio playlists"
  ON public.user_radio_playlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster playlist queries
CREATE INDEX IF NOT EXISTS idx_user_radio_playlists_user_id ON public.user_radio_playlists(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_radio_playlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_radio_playlist_timestamp
  BEFORE UPDATE ON public.user_radio_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_radio_playlist_updated_at();
