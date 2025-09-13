-- CRITICAL SECURITY FIXES: Phase 2 - Address remaining security issues

-- 1. Fix remaining tables that need RLS policies

-- Secure swipe_analytics table
ALTER TABLE public.swipe_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.swipe_analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.swipe_analytics;

CREATE POLICY "Users can view their own analytics" 
ON public.swipe_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" 
ON public.swipe_analytics 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Secure swipes table
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own swipes" ON public.swipes;

CREATE POLICY "Users can manage their own swipes" 
ON public.swipes 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Secure subscriptions table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
    
    CREATE POLICY "Users can view their own subscriptions" 
    ON public.subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Fix security definer functions that still need search_path
CREATE OR REPLACE FUNCTION public.increment_usage_count(p_user_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update usage based on action
  CASE p_action
    WHEN 'message' THEN
      UPDATE package_usage 
      SET messages_sent_this_week = messages_sent_this_week + 1
      WHERE user_id = p_user_id;
    
    WHEN 'post_property' THEN
      UPDATE package_usage 
      SET properties_posted_this_month = properties_posted_this_month + 1
      WHERE user_id = p_user_id;
    
    WHEN 'super_like' THEN
      UPDATE package_usage 
      SET super_likes_used_this_month = super_likes_used_this_month + 1
      WHERE user_id = p_user_id;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_mutual_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if this action results in a new mutual match
  IF NEW.client_liked_at IS NOT NULL AND NEW.owner_liked_at IS NOT NULL AND OLD.is_mutual IS DISTINCT FROM TRUE THEN
    NEW.is_mutual = TRUE;

    -- Create a conversation if one doesn't already exist for this match
    IF NOT EXISTS (SELECT 1 FROM public.conversations WHERE match_id = NEW.id) THEN
        INSERT INTO public.conversations (match_id, client_id, owner_id, listing_id)
        VALUES (NEW.id, NEW.client_id, NEW.owner_id, NEW.listing_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(owner_id uuid, client_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score numeric := 0;
  owner_prefs record;
  client_profile record;
BEGIN
  -- Get owner preferences
  SELECT * INTO owner_prefs
  FROM owner_client_preferences
  WHERE user_id = owner_id
  LIMIT 1;
  
  -- Get client profile
  SELECT * INTO client_profile
  FROM profiles
  WHERE id = client_id;
  
  -- Calculate score based on various factors
  IF owner_prefs IS NOT NULL AND client_profile IS NOT NULL THEN
    -- Age compatibility (20 points max)
    IF client_profile.age BETWEEN owner_prefs.min_age AND owner_prefs.max_age THEN
      score := score + 20;
    END IF;
    
    -- Budget compatibility (25 points max)
    IF client_profile.budget_max >= (
      SELECT MIN(price) FROM listings WHERE owner_id = owner_id AND is_active = true
    ) THEN
      score := score + 25;
    END IF;
    
    -- Lifestyle compatibility (20 points max)
    IF owner_prefs.compatible_lifestyle_tags && client_profile.lifestyle_tags THEN
      score := score + (
        array_length(
          array(
            SELECT unnest(owner_prefs.compatible_lifestyle_tags)
            INTERSECT
            SELECT unnest(client_profile.lifestyle_tags)
          ), 1
        ) * 5
      );
    END IF;
    
    -- Pet compatibility (15 points max)
    IF (owner_prefs.allows_pets = true AND client_profile.has_pets = true) OR
       (owner_prefs.allows_pets = false AND client_profile.has_pets = false) THEN
      score := score + 15;
    END IF;
    
    -- Verification bonus (10 points max)
    IF client_profile.verified = true THEN
      score := score + 10;
    END IF;
    
    -- References bonus (10 points max)
    IF owner_prefs.requires_references = true AND client_profile.has_references = true THEN
      score := score + 10;
    END IF;
  END IF;
  
  RETURN LEAST(score, 100); -- Cap at 100
END;
$$;

CREATE OR REPLACE FUNCTION public.get_listings_for_client(client_user_id uuid)
RETURNS TABLE(id uuid, title text, price numeric, images text[], address text, city text, neighborhood text, property_type text, beds integer, baths integer, square_footage integer, furnished boolean, owner_name text, owner_avatar text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.price,
    l.images,
    l.address,
    l.city,
    l.neighborhood,
    l.property_type,
    l.beds,
    l.baths,
    l.square_footage,
    l.furnished,
    p.full_name as owner_name,
    p.avatar_url as owner_avatar
  FROM public.listings l
  JOIN public.profiles p ON l.owner_id = p.id
  WHERE l.status = 'active'
    AND l.is_active = true
    AND l.owner_id != client_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.swipes s 
      WHERE s.user_id = client_user_id 
        AND s.target_id = l.id 
        AND s.target_type = 'listing'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_clients_for_owner(owner_user_id uuid)
RETURNS TABLE(id uuid, full_name text, age integer, images text[], occupation text, nationality text, bio text, monthly_income text, location text, verified boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.age,
    p.images,
    p.occupation,
    p.nationality,
    p.bio,
    p.monthly_income,
    p.location,
    p.verified
  FROM public.profiles p
  WHERE p.role = 'client'
    AND p.is_active = true
    AND p.onboarding_completed = true
    AND p.id != owner_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.swipes s 
      WHERE s.user_id = owner_user_id 
        AND s.target_id = p.id 
        AND s.target_type = 'profile'
    );
END;
$$;

-- 3. Move extensions from public schema to extensions schema if needed
-- Note: This requires careful consideration as it affects system functionality
-- For now, we'll add a security audit note instead

-- 4. Add enhanced security monitoring
CREATE OR REPLACE FUNCTION public.audit_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('admin_users', 'profiles', 'messages', 'conversations') THEN
    INSERT INTO security_audit_log (
      user_id,
      action_type,
      action_details
    ) VALUES (
      auth.uid(),
      'TABLE_ACCESS',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;