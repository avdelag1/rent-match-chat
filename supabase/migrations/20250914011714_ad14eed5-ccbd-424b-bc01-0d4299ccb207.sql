-- Continue fixing Security Definer functions by adding secure search paths

-- Fix remaining functions that don't have secure search paths
-- This prevents search path injection attacks

-- Fix get_users_who_liked function
CREATE OR REPLACE FUNCTION public.get_users_who_liked(target_user_id uuid, liked_status boolean DEFAULT true)
RETURNS TABLE(liker_id uuid, liker_email text, liked_at timestamp with time zone, category text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT 
        ul.liker_id,
        au.email AS liker_email,
        ul.liked_at,
        ul.category
    FROM public.user_likes ul
    JOIN auth.users au ON ul.liker_id = au.id
    WHERE 
        ul.liked_id = target_user_id 
        AND ul.is_liked = liked_status
    ORDER BY ul.liked_at DESC;
$function$;

-- Fix refresh_user_engagement_metrics function
CREATE OR REPLACE FUNCTION public.refresh_user_engagement_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Recalculate engagement metrics for all users
    INSERT INTO public.user_engagement_metrics (
        user_id, 
        total_matches, 
        total_interactions, 
        last_active_timestamp,
        match_success_rate
    )
    SELECT 
        u.id,
        (SELECT COUNT(*) FROM public.matches WHERE initiator_id = u.id OR recipient_id = u.id),
        (SELECT COUNT(*) FROM public.interactions WHERE sender_id = u.id),
        MAX(COALESCE(m.created_at, i.created_at, NOW())),
        COALESCE(
            (SELECT COUNT(*) FROM public.matches WHERE (initiator_id = u.id OR recipient_id = u.id) AND status = 'accepted') * 1.0 / 
            NULLIF((SELECT COUNT(*) FROM public.matches WHERE initiator_id = u.id OR recipient_id = u.id), 0),
            0
        )
    FROM 
        auth.users u
    LEFT JOIN public.matches m ON u.id IN (m.initiator_id, m.recipient_id)
    LEFT JOIN public.interactions i ON u.id = i.sender_id
    GROUP BY u.id
    ON CONFLICT (user_id) DO UPDATE
    SET 
        total_matches = EXCLUDED.total_matches,
        total_interactions = EXCLUDED.total_interactions,
        last_active_timestamp = EXCLUDED.last_active_timestamp,
        match_success_rate = EXCLUDED.match_success_rate;
END;
$function$;

-- Fix manage_user_verification function (add search_path)
CREATE OR REPLACE FUNCTION public.manage_user_verification(p_admin_id uuid, p_user_id uuid, p_verification_status text)
RETURNS TABLE(user_id uuid, full_name text, previous_status text, new_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_is_admin BOOLEAN;
    v_previous_status TEXT;
BEGIN
    -- Check if the admin is actually an admin
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_profiles 
        WHERE user_id = p_admin_id AND role = 'admin'
    ) INTO v_is_admin;

    -- Throw an error if not an admin
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only admins can manage user verification';
    END IF;

    -- Get previous verification status
    SELECT verification_status INTO v_previous_status
    FROM public.user_profiles
    WHERE user_id = p_user_id;

    -- Update verification status
    UPDATE public.user_profiles
    SET 
        verification_status = p_verification_status,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Return updated user details
    RETURN QUERY
    SELECT 
        user_id,
        full_name,
        v_previous_status AS previous_status,
        verification_status AS new_status
    FROM public.user_profiles
    WHERE user_id = p_user_id;
END;
$function$;

-- Fix save_property_recommendations function (add search_path)
CREATE OR REPLACE FUNCTION public.save_property_recommendations(p_user_id uuid)
RETURNS TABLE(property_id bigint, recommendation_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Delete existing recommendations for the user
    DELETE FROM public.property_recommendations
    WHERE user_id = p_user_id;

    -- Insert new recommendations based on advanced search
    INSERT INTO public.property_recommendations (
        user_id, 
        property_id, 
        recommendation_score
    )
    SELECT 
        p_user_id,
        property_id,
        recommendation_score
    FROM public.advanced_property_search(p_user_id)
    LIMIT 50;  -- Limit to top 50 recommendations

    -- Return the saved recommendations
    RETURN QUERY
    SELECT 
        property_id, 
        recommendation_score
    FROM public.property_recommendations
    WHERE user_id = p_user_id
    ORDER BY recommendation_score DESC;
END;
$function$;