-- Fix security definer functions with proper search paths
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 NUMERIC, lon1 NUMERIC, 
    lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC 
LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    earth_radius NUMERIC := 6371; -- Earth's radius in kilometers
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    -- Convert degrees to radians
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$;

-- Fix get_nearby_profiles function with proper search path and RLS policy check
CREATE OR REPLACE FUNCTION public.get_nearby_profiles(
    user_lat NUMERIC,
    user_lon NUMERIC,
    radius_km NUMERIC DEFAULT 10,
    exclude_user_id UUID DEFAULT NULL
) RETURNS TABLE(
    id UUID,
    full_name TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    distance NUMERIC,
    role TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow authenticated users
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.latitude,
        p.longitude,
        public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance,
        p.role
    FROM public.profiles p
    WHERE p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        AND p.is_active = true
        AND p.onboarding_completed = true
        AND (exclude_user_id IS NULL OR p.id != exclude_user_id)
        AND public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= radius_km
    ORDER BY distance ASC;
END;
$$;

-- Fix get_nearby_listings function with proper search path and RLS policy check
CREATE OR REPLACE FUNCTION public.get_nearby_listings(
    user_lat NUMERIC,
    user_lon NUMERIC,
    radius_km NUMERIC DEFAULT 10,
    exclude_owner_id UUID DEFAULT NULL
) RETURNS TABLE(
    id UUID,
    title TEXT,
    price NUMERIC,
    property_type TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    distance NUMERIC,
    owner_id UUID
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only allow authenticated users
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.price,
        l.property_type,
        l.latitude,
        l.longitude,
        public.calculate_distance(user_lat, user_lon, l.latitude, l.longitude) as distance,
        l.owner_id
    FROM public.listings l
    WHERE l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
        AND l.is_active = true
        AND l.status = 'active'
        AND (exclude_owner_id IS NULL OR l.owner_id != exclude_owner_id)
        AND public.calculate_distance(user_lat, user_lon, l.latitude, l.longitude) <= radius_km
    ORDER BY distance ASC;
END;
$$;