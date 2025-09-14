-- Fix Security Definer functions by adding secure search paths
-- This prevents search path injection attacks

-- Fix unblock_user function
CREATE OR REPLACE FUNCTION public.unblock_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    DELETE FROM public.user_blocks
    WHERE blocker_id = auth.uid() AND blocked_id = target_user_id;

    RETURN TRUE;
END;
$function$;

-- Fix is_user_blocked function  
CREATE OR REPLACE FUNCTION public.is_user_blocked(potential_blocker_id uuid, potential_blocked_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_blocks 
        WHERE 
            (blocker_id = potential_blocker_id AND blocked_id = potential_blocked_id)
            OR 
            (blocker_id = potential_blocked_id AND blocked_id = potential_blocker_id)
    );
$function$;

-- Fix block_user function
CREATE OR REPLACE FUNCTION public.block_user(target_user_id uuid, reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    rate_limit_result BOOLEAN;
BEGIN
    -- Check rate limit for blocking
    rate_limit_result := check_rate_limit(auth.uid(), 'block', 5, '1 day');
    IF NOT rate_limit_result THEN
        RAISE EXCEPTION 'Rate limit exceeded for blocking users';
    END IF;

    -- Prevent self-blocking
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot block yourself';
    END IF;

    -- Insert or ignore if already blocked
    INSERT INTO public.user_blocks (blocker_id, blocked_id, block_reason)
    VALUES (auth.uid(), target_user_id, reason)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

    RETURN TRUE;
END;
$function$;

-- Fix get_user_like_history function
CREATE OR REPLACE FUNCTION public.get_user_like_history(target_user_id uuid)
RETURNS TABLE(liker_id uuid, liker_email text, like_status boolean, liked_at timestamp with time zone, category text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT 
        ul.liker_id,
        au.email AS liker_email,
        ul.is_liked AS like_status,
        ul.liked_at,
        ul.category
    FROM public.user_likes ul
    JOIN auth.users au ON ul.liker_id = au.id
    WHERE ul.liked_id = target_user_id
    ORDER BY ul.liked_at DESC;
$function$;

-- Fix get_user_like_insights function
CREATE OR REPLACE FUNCTION public.get_user_like_insights(target_user_id uuid)
RETURNS TABLE(total_likes bigint, positive_likes bigint, negative_likes bigint, positive_like_percentage numeric, most_recent_like timestamp with time zone, most_active_liker uuid, most_active_liker_email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
WITH like_stats AS (
    SELECT 
        COUNT(*) AS total_likes,
        COUNT(CASE WHEN is_liked THEN 1 END) AS positive_likes,
        COUNT(CASE WHEN NOT is_liked THEN 1 END) AS negative_likes,
        ROUND(
            100.0 * COUNT(CASE WHEN is_liked THEN 1 END) / NULLIF(COUNT(*), 0), 
            2
        ) AS positive_like_percentage,
        MAX(liked_at) AS most_recent_like
    FROM public.user_likes
    WHERE liked_id = target_user_id
),
active_liker AS (
    SELECT 
        liker_id,
        au.email AS liker_email,
        COUNT(*) AS like_count
    FROM public.user_likes ul
    JOIN auth.users au ON ul.liker_id = au.id
    WHERE liked_id = target_user_id AND is_liked
    GROUP BY liker_id, au.email
    ORDER BY like_count DESC
    LIMIT 1
)
SELECT 
    ls.total_likes,
    ls.positive_likes,
    ls.negative_likes,
    ls.positive_like_percentage,
    ls.most_recent_like,
    al.liker_id AS most_active_liker,
    al.liker_email AS most_active_liker_email
FROM like_stats ls
CROSS JOIN active_liker al;
$function$;