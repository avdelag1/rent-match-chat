-- Database Health Check and Fixes
-- This migration ensures all critical database connections are properly set up

-- 1. Ensure RLS is enabled on all critical tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create indexes on foreign keys for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_matches_client_id ON public.matches(client_id);
CREATE INDEX IF NOT EXISTS idx_matches_owner_id ON public.matches(owner_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON public.matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_owner_id ON public.conversations(owner_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender_id ON public.conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 3. Add performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 4. Ensure profiles.images column exists and is properly typed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'images'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 5. Ensure client_profiles has all required fields (defensive programming)
DO $$ 
BEGIN
  -- Check and add missing columns one by one
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_profiles' AND column_name = 'profile_images') THEN
    ALTER TABLE public.client_profiles ADD COLUMN profile_images TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_profiles' AND column_name = 'preferred_activities') THEN
    ALTER TABLE public.client_profiles ADD COLUMN preferred_activities TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 6. Add updated_at triggers for better data tracking
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to critical tables if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_listings_updated_at') THEN
    CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_profiles_updated_at') THEN
    CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 7. Ensure conversations table has proper structure
DO $$ 
BEGIN
  -- Make match_id nullable if it isn't already (for direct messaging without match)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'match_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.conversations ALTER COLUMN match_id DROP NOT NULL;
  END IF;
END $$;

-- 8. Add helpful comments for developers
COMMENT ON TABLE public.profiles IS 'Main user profiles table - used by both clients and owners';
COMMENT ON TABLE public.client_profiles IS 'Extended client profile data - preferences, tags, etc';
COMMENT ON TABLE public.listings IS 'Property/vehicle listings created by owners';
COMMENT ON TABLE public.matches IS 'Tracks client-owner matches/likes';
COMMENT ON TABLE public.conversations IS 'Chat conversations between clients and owners';
COMMENT ON TABLE public.user_roles IS 'Defines user role (client or owner) - critical for auth';

-- 9. Verify critical foreign key relationships exist
DO $$
BEGIN
  -- Ensure listings.owner_id references profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'listings_owner_id_fkey'
  ) THEN
    ALTER TABLE public.listings 
    ADD CONSTRAINT listings_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Ensure client_profiles.user_id references profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.client_profiles 
    ADD CONSTRAINT client_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 10. Create helpful view for debugging user data
CREATE OR REPLACE VIEW public.user_debug_info AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  ur.role,
  p.is_active,
  p.onboarding_completed,
  cp.id as client_profile_id,
  cp.profile_images,
  COUNT(DISTINCT l.id) as listing_count,
  COUNT(DISTINCT m.id) as match_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
LEFT JOIN public.client_profiles cp ON cp.user_id = p.id
LEFT JOIN public.listings l ON l.owner_id = p.id
LEFT JOIN public.matches m ON m.client_id = p.id OR m.owner_id = p.id
GROUP BY p.id, p.full_name, p.email, ur.role, p.is_active, p.onboarding_completed, cp.id, cp.profile_images;

-- Grant access to the view
GRANT SELECT ON public.user_debug_info TO authenticated;

COMMENT ON VIEW public.user_debug_info IS 'Helpful view for debugging user data - shows profile, role, and activity counts';
