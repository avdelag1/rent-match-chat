-- CRITICAL SECURITY FIXES: Phase 1 - Database Security

-- 1. Secure admin_users table with proper RLS policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

-- Only allow current admins to view admin users (prevent data exposure)
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users existing_admin
    WHERE existing_admin.id = auth.uid() 
    AND existing_admin.is_active = true
  )
);

-- Only allow current admins to manage admin users
CREATE POLICY "Admins can manage admin users" 
ON public.admin_users 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users existing_admin
    WHERE existing_admin.id = auth.uid() 
    AND existing_admin.is_active = true
  )
);

-- 2. Fix Security Definer Functions - Add proper search_path settings
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log when someone accesses profile data
  INSERT INTO audit_logs (
    table_name, 
    action, 
    record_id, 
    changed_by, 
    details
  ) VALUES (
    'profiles',
    'SELECT',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'accessed_fields', TG_ARGV[0],
      'access_time', NOW(),
      'user_role', (SELECT role FROM profiles WHERE id = auth.uid())
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_mutual_match_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if both parties have liked each other
  IF NEW.client_liked_at IS NOT NULL AND NEW.owner_liked_at IS NOT NULL THEN
    NEW.is_mutual = TRUE;
    NEW.status = 'accepted';
    
    -- Create conversation if it doesn't exist
    INSERT INTO public.conversations (match_id, client_id, owner_id, listing_id)
    VALUES (NEW.id, NEW.client_id, NEW.owner_id, NEW.listing_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action_type text, p_max_actions integer DEFAULT 10, p_time_window interval DEFAULT '01:00:00'::interval)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
declare
    current_count int;
    last_action timestamp;
begin
    -- Check if rate limit record exists
    select action_count, last_action_timestamp 
    into current_count, last_action 
    from public.rate_limits 
    where user_id = p_user_id and action_type = p_action_type;

    -- If no record exists, create one
    if current_count is null then
        insert into public.rate_limits (user_id, action_type)
        values (p_user_id, p_action_type);
        return true;
    end if;

    -- Check if within time window and action limit
    if last_action > now() - p_time_window and current_count >= p_max_actions then
        return false;
    end if;

    -- Reset count if outside time window
    if last_action <= now() - p_time_window then
        update public.rate_limits
        set action_count = 1, last_action_timestamp = now()
        where user_id = p_user_id and action_type = p_action_type;
        return true;
    end if;

    -- Increment count within time window
    update public.rate_limits
    set action_count = action_count + 1, last_action_timestamp = now()
    where user_id = p_user_id and action_type = p_action_type;
    return true;
end;
$$;

-- 3. Add missing RLS policies for critical tables

-- Secure listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can manage their listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;

CREATE POLICY "Users can view active listings" 
ON public.listings 
FOR SELECT 
USING (is_active = true AND status = 'active');

CREATE POLICY "Owners can manage their listings" 
ON public.listings 
FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all listings" 
ON public.listings 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Secure matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;

CREATE POLICY "Users can view their matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() IN (client_id, owner_id));

CREATE POLICY "Users can update their matches" 
ON public.matches 
FOR UPDATE
USING (auth.uid() IN (client_id, owner_id));

-- Secure conversations table  
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() IN (client_id, owner_id));

CREATE POLICY "Users can update their conversations" 
ON public.conversations 
FOR UPDATE
USING (auth.uid() IN (client_id, owner_id));

-- Secure messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can view their messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 4. Add message content validation trigger to prevent contact info sharing
CREATE OR REPLACE FUNCTION public.validate_message_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  phone_pattern TEXT := '\+?[\d\s\-\(\)\.]{7,}';
  email_pattern TEXT := '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}';
  social_pattern TEXT := '@[A-Za-z0-9._]+|instagram\.com|facebook\.com|twitter\.com|whatsapp|telegram';
BEGIN
  -- Check content for contact information
  IF NEW.content IS NOT NULL AND (NEW.content ~ phone_pattern OR NEW.content ~ email_pattern OR NEW.content ~ social_pattern) THEN
    RAISE EXCEPTION 'Contact information sharing is not allowed in messages';
  END IF;
  
  -- Validate content length
  IF NEW.content IS NOT NULL AND LENGTH(NEW.content) > 1000 THEN
    RAISE EXCEPTION 'Message must be less than 1000 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the validation trigger to messages
DROP TRIGGER IF EXISTS validate_message_content_trigger ON public.messages;
CREATE TRIGGER validate_message_content_trigger
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content();

-- 5. Secure audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- 6. Add comprehensive security logging
CREATE OR REPLACE FUNCTION public.log_security_event(p_action_type text, p_action_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
    insert into public.security_audit_log (
        user_id, 
        action_type, 
        action_details, 
        ip_address, 
        user_agent
    ) values (
        auth.uid(),
        p_action_type,
        p_action_details,
        coalesce(
            current_setting('request.headers', true), 
            'Unknown'
        ),
        coalesce(
            current_setting('request.headers.user-agent', true), 
            'Unknown'
        )
    );
end;
$$;