-- Fix critical security issues: Enable RLS on tables that need it and fix function security

-- Enable RLS on tables that are missing it
ALTER TABLE public.blockchain_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_participants ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lake_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_compute_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_footprint_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for blockchain_identities
CREATE POLICY "Users can manage their own blockchain identity" ON public.blockchain_identities
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Add missing RLS policies for channel_participants  
CREATE POLICY "Users can manage their own channel participation" ON public.channel_participants
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Add missing RLS policies for communication_channels
CREATE POLICY "Users can view channels they participate in" ON public.communication_channels
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.channel_participants cp 
  WHERE cp.channel_id = communication_channels.id AND cp.user_id = auth.uid()
));

-- Add admin policies for system tables
CREATE POLICY "Admins can manage data access logs" ON public.data_access_logs
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can manage data lake metadata" ON public.data_lake_metadata  
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can manage edge compute nodes" ON public.edge_compute_nodes
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'  
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can manage carbon footprint metrics" ON public.carbon_footprint_metrics
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- System tables should be read-only for regular users
CREATE POLICY "Public can read geometry columns" ON public.geometry_columns FOR SELECT USING (true);
CREATE POLICY "Public can read geography columns" ON public.geography_columns FOR SELECT USING (true);

-- Fix function search paths (examples for most critical functions)
CREATE OR REPLACE FUNCTION public.get_weekly_conversation_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    week_start DATE;
    conversation_count INTEGER;
BEGIN
    week_start := DATE_TRUNC('week', CURRENT_DATE);
    
    SELECT conversations_started INTO conversation_count
    FROM conversation_starters
    WHERE user_id = p_user_id AND week_start = week_start;
    
    RETURN COALESCE(conversation_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_start_conversation(p_user_id uuid, p_other_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    week_start DATE;
    current_count INTEGER;
    max_conversations INTEGER := 5;
BEGIN
    IF EXISTS (
        SELECT 1 FROM conversations 
        WHERE (client_id = p_user_id AND owner_id = p_other_user_id)
        OR (client_id = p_other_user_id AND owner_id = p_user_id)
    ) THEN
        RETURN TRUE;
    END IF;
    
    current_count := get_weekly_conversation_count(p_user_id);
    
    IF EXISTS (
        SELECT 1 FROM user_subscriptions us
        JOIN subscription_packages sp ON us.package_id = sp.id
        WHERE us.user_id = p_user_id 
        AND us.is_active = TRUE
        AND sp.tier != 'free'
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN current_count < max_conversations;
END;
$$;