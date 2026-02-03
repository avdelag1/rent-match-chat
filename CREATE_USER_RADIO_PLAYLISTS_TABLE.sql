-- Create user_radio_playlists table for storing custom radio station playlists
-- This table allows users to create and manage their own playlists of radio stations

CREATE TABLE IF NOT EXISTS user_radio_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  station_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure user_id is indexed for fast lookups
  CONSTRAINT user_radio_playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_radio_playlists_user_id ON user_radio_playlists(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_radio_playlists_created_at ON user_radio_playlists(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_radio_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own playlists

-- Policy for SELECT: Users can view their own playlists
CREATE POLICY "Users can view their own radio playlists"
  ON user_radio_playlists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for INSERT: Users can create their own playlists
CREATE POLICY "Users can create their own radio playlists"
  ON user_radio_playlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can update their own playlists
CREATE POLICY "Users can update their own radio playlists"
  ON user_radio_playlists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Users can delete their own playlists
CREATE POLICY "Users can delete their own radio playlists"
  ON user_radio_playlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_radio_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_radio_playlists_updated_at
  BEFORE UPDATE ON user_radio_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_user_radio_playlists_updated_at();

-- Grant permissions
GRANT ALL ON user_radio_playlists TO authenticated;
GRANT ALL ON user_radio_playlists TO service_role;

-- Add comment for documentation
COMMENT ON TABLE user_radio_playlists IS 'User-created playlists for radio stations';
COMMENT ON COLUMN user_radio_playlists.station_ids IS 'Array of station IDs in the playlist';
