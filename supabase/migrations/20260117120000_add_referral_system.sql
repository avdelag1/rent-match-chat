-- Add referral system tables and fields
-- This migration adds support for invitation codes and tracking referrals

-- Add invitation_code field to profiles table
-- This is a unique, user-friendly code that users can share
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_invitation_code ON profiles(invitation_code);

-- Generate unique invitation codes for existing users
-- Format: First 3 letters of name (or random) + 4 random digits
-- This will be done via a function to ensure uniqueness
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code (alphanumeric)
    new_code := upper(substring(md5(random()::text) from 1 for 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE invitation_code = new_code) INTO code_exists;

    -- If unique, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles to have invitation codes
UPDATE profiles
SET invitation_code = generate_invitation_code()
WHERE invitation_code IS NULL;

-- Make invitation_code NOT NULL after populating existing records
ALTER TABLE profiles
ALTER COLUMN invitation_code SET NOT NULL;

-- Create trigger to auto-generate invitation code for new users
CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code();

-- Create user_referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL, -- The invitation code or user ID that was used
  referral_source TEXT, -- Where the referral link was clicked (/, /profile/:id, /listing/:id)
  reward_granted BOOLEAN DEFAULT false, -- Whether the referrer received their reward
  reward_activation_id UUID REFERENCES message_activations(id), -- The activation granted to referrer
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate referrals
  UNIQUE(referrer_id, referred_user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_user ON user_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_created_at ON user_referrals(created_at);

-- Add updated_at trigger
CREATE TRIGGER set_user_referrals_updated_at
  BEFORE UPDATE ON user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for user_referrals
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (both as referrer and referred)
CREATE POLICY "Users can view their own referrals"
  ON user_referrals
  FOR SELECT
  USING (
    auth.uid() = referrer_id OR
    auth.uid() = referred_user_id
  );

-- Only system can insert/update referral records (via triggers/functions)
CREATE POLICY "System can insert referrals"
  ON user_referrals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON user_referrals
  FOR UPDATE
  USING (true);

-- Create a view for referral statistics
CREATE OR REPLACE VIEW referral_stats AS
SELECT
  p.id as user_id,
  p.full_name,
  p.invitation_code,
  COUNT(DISTINCT ur.referred_user_id) as total_referrals,
  COUNT(DISTINCT CASE WHEN ur.reward_granted THEN ur.referred_user_id END) as rewarded_referrals,
  SUM(CASE WHEN ur.reward_granted THEN 1 ELSE 0 END) as total_rewards_earned,
  MIN(ur.created_at) as first_referral_date,
  MAX(ur.created_at) as latest_referral_date
FROM profiles p
LEFT JOIN user_referrals ur ON p.id = ur.referrer_id
GROUP BY p.id, p.full_name, p.invitation_code;

-- Grant access to the view
GRANT SELECT ON referral_stats TO authenticated;

-- Add helpful comments
COMMENT ON TABLE user_referrals IS 'Tracks referral relationships between users for invitation rewards';
COMMENT ON COLUMN profiles.invitation_code IS 'Unique invitation code that users can share to refer new users';
COMMENT ON COLUMN user_referrals.referral_code IS 'The actual code or user ID that was used in the referral URL';
COMMENT ON COLUMN user_referrals.referral_source IS 'The page where the referral link was clicked';
COMMENT ON COLUMN user_referrals.reward_granted IS 'Whether the referrer has received their bonus message activation';
