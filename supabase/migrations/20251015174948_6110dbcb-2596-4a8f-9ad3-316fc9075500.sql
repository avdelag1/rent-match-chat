-- Drop profiles.role column with CASCADE to remove all dependencies
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Recreate RLS policies using user_roles table
CREATE POLICY "Owners and admins can create properties"
ON public.properties FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Owners and admins can update their own properties"
ON public.properties FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Owners and admins can delete their own properties"
ON public.properties FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Recreate profiles_public view without role column
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id, full_name, age, bio, occupation, nationality, monthly_income, location,
  interests, preferred_activities, lifestyle_tags, images, verified,
  latitude, longitude, avatar_url, has_pets, smoking
FROM public.profiles WHERE is_active = true;

GRANT SELECT ON public.profiles_public TO authenticated;

-- Fix SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.get_all_clients_for_owner(owner_user_id uuid DEFAULT NULL)
RETURNS TABLE(id uuid, user_id uuid, full_name text, name text, profile_name text, age integer, images text[], profile_images text[], occupation text, profession text, nationality text, bio text, monthly_income text, monthly_income_range text, location text, verified boolean, interests text[], preferences text[], preferred_activities text[])
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.id, p.full_name, p.full_name, p.full_name, p.age, p.images, p.images, p.occupation, p.occupation, p.nationality, p.bio, p.monthly_income, p.monthly_income, p.location, p.verified, p.interests, COALESCE(p.preferred_activities, ARRAY[]::text[]), p.preferred_activities
  FROM public.profiles p
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'client')
    AND p.is_active = true AND (owner_user_id IS NULL OR p.id != owner_user_id)
  ORDER BY p.created_at DESC LIMIT 50;
END; $$;

CREATE OR REPLACE FUNCTION public.get_clients_for_owner(owner_user_id uuid)
RETURNS TABLE(id uuid, full_name text, age integer, images text[], occupation text, nationality text, bio text, monthly_income text, location text, verified boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.age, p.images, p.occupation, p.nationality, p.bio, p.monthly_income, p.location, p.verified
  FROM public.profiles p
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'client')
    AND p.is_active = true AND p.id != owner_user_id
    AND NOT EXISTS (SELECT 1 FROM public.swipes s WHERE s.user_id = owner_user_id AND s.target_id = p.id AND s.target_type = 'profile');
END; $$;

CREATE OR REPLACE FUNCTION public.get_listings_for_client(client_user_id uuid)
RETURNS TABLE(id uuid, title text, price numeric, images text[], address text, city text, neighborhood text, property_type text, beds integer, baths integer, square_footage integer, furnished boolean, owner_name text, owner_avatar text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.title, l.price, l.images, l.address, l.city, l.neighborhood, l.property_type, l.beds, l.baths, l.square_footage, l.furnished, p.full_name, p.avatar_url
  FROM public.listings l JOIN public.profiles p ON l.owner_id = p.id
  WHERE l.status = 'active' AND l.is_active = true AND l.owner_id != client_user_id
    AND NOT EXISTS (SELECT 1 FROM public.swipes s WHERE s.user_id = client_user_id AND s.target_id = l.id AND s.target_type = 'listing');
END; $$;

CREATE OR REPLACE FUNCTION public.manage_user_verification(p_admin_id uuid, p_user_id uuid, p_verification_status text)
RETURNS TABLE(user_id uuid, full_name text, previous_status text, new_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_is_admin BOOLEAN; v_previous_status TEXT;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_admin_id AND role = 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN RAISE EXCEPTION 'Only admins can manage user verification'; END IF;
    SELECT verification_status INTO v_previous_status FROM public.profiles WHERE id = p_user_id;
    UPDATE public.profiles SET verification_status = p_verification_status, updated_at = NOW() WHERE id = p_user_id;
    RETURN QUERY SELECT p.id, p.full_name, v_previous_status, p.verification_status FROM public.profiles p WHERE p.id = p_user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.manage_user_ban(p_admin_id uuid, p_user_id uuid, p_is_banned boolean)
RETURNS TABLE(user_id uuid, full_name text, previous_ban_status boolean, new_ban_status boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_is_admin BOOLEAN; v_previous_ban_status BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_admin_id AND role = 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN RAISE EXCEPTION 'Only admins can manage user bans'; END IF;
    SELECT is_banned INTO v_previous_ban_status FROM public.profiles WHERE id = p_user_id;
    UPDATE public.profiles SET is_banned = p_is_banned, updated_at = NOW() WHERE id = p_user_id;
    RETURN QUERY SELECT p.id, p.full_name, v_previous_ban_status, p.is_banned FROM public.profiles p WHERE p.id = p_user_id;
END; $$;

-- Drop admin_credentials table
DROP TABLE IF EXISTS public.admin_credentials CASCADE;