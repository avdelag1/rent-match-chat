-- Cleanup migration to remove duplicate policies and consolidate functions
-- This migration ensures idempotency and removes any duplicate policies that may exist

-- Drop and recreate duplicate policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure update_updated_at_column function exists and is up to date
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop duplicate handle_new_user function definitions and create canonical version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure handle_mutual_match function is consolidated
CREATE OR REPLACE FUNCTION public.handle_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's a reverse like to create a mutual match
  IF EXISTS (
    SELECT 1 FROM public.likes
    WHERE user_id = NEW.target_id
    AND target_id = NEW.user_id
    AND target_type = NEW.target_type
  ) THEN
    -- Update both likes to indicate mutual match
    UPDATE public.likes
    SET is_mutual = true
    WHERE (user_id = NEW.user_id AND target_id = NEW.target_id)
       OR (user_id = NEW.target_id AND target_id = NEW.user_id);
    
    -- Create or update match record
    INSERT INTO public.matches (client_id, owner_id, listing_id, is_mutual)
    VALUES (
      CASE WHEN NEW.target_type = 'profile' THEN NEW.user_id ELSE NULL END,
      CASE WHEN NEW.target_type = 'profile' THEN NEW.target_id ELSE NULL END,
      CASE WHEN NEW.target_type = 'listing' THEN NEW.target_id ELSE NULL END,
      true
    )
    ON CONFLICT (client_id, owner_id, COALESCE(listing_id, '00000000-0000-0000-0000-000000000000'::uuid))
    DO UPDATE SET is_mutual = true, updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure get_listings_for_client function is consolidated
CREATE OR REPLACE FUNCTION public.get_listings_for_client(client_user_id UUID)
RETURNS TABLE (
  listing_id UUID,
  owner_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  location JSONB,
  images JSONB,
  features JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as listing_id,
    l.user_id as owner_id,
    l.title,
    l.description,
    l.price,
    l.location,
    l.images,
    l.features,
    l.created_at
  FROM public.listings l
  WHERE l.status = 'active'
  AND l.user_id != client_user_id
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure get_clients_for_owner function is consolidated
CREATE OR REPLACE FUNCTION public.get_clients_for_owner(owner_user_id UUID)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  bio TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.full_name,
    p.bio,
    p.preferences,
    p.created_at
  FROM public.profiles p
  WHERE p.id != owner_user_id
  AND p.user_type = 'client'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure complete_user_onboarding function is consolidated
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  user_id_param UUID,
  onboarding_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update profile with onboarding completion
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now(),
    updated_at = now()
  WHERE id = user_id_param;
  
  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'user_id', user_id_param,
    'completed_at', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure calculate_compatibility_score function is consolidated
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(
  user1_id UUID,
  user2_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  user1_prefs JSONB;
  user2_prefs JSONB;
BEGIN
  -- Get user preferences
  SELECT preferences INTO user1_prefs FROM public.profiles WHERE id = user1_id;
  SELECT preferences INTO user2_prefs FROM public.profiles WHERE id = user2_id;
  
  -- Simple compatibility calculation (can be enhanced)
  -- This is a placeholder - implement actual matching logic based on preferences
  score := 50; -- Base score
  
  -- Add points for matching preferences
  IF user1_prefs IS NOT NULL AND user2_prefs IS NOT NULL THEN
    -- Example: check for matching interests or requirements
    score := score + 25;
  END IF;
  
  RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Ensure increment_usage_count function is consolidated
CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment usage count for package tracking
  UPDATE public.package_usage
  SET 
    current_count = current_count + 1,
    updated_at = now()
  WHERE user_id = NEW.user_id
  AND package_id = (
    SELECT package_id FROM public.user_subscriptions
    WHERE user_id = NEW.user_id AND is_active = true
    LIMIT 1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure grant_welcome_message_activations function is consolidated
CREATE OR REPLACE FUNCTION public.grant_welcome_message_activations()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant welcome message activations to new users
  INSERT INTO public.message_activations (
    user_id,
    activation_count,
    activation_type,
    created_at
  )
  VALUES (
    NEW.id,
    3, -- Grant 3 free activations
    'welcome',
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
