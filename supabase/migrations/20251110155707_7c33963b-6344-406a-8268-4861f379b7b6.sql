-- Fix get_current_user_role function to use user_roles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

-- Fix manage_property_availability function to use user_roles table instead of user_profiles
CREATE OR REPLACE FUNCTION public.manage_property_availability(
    p_property_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_is_available BOOLEAN,
    p_blocked_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    property_id UUID,
    start_date DATE,
    end_date DATE,
    is_available BOOLEAN,
    blocked_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Check property ownership or admin status
    SELECT 
        owner_id,
        EXISTS (
            SELECT 1 
            FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        ) INTO v_owner_id, v_is_admin
    FROM public.properties
    WHERE id = p_property_id;

    -- Validate access
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Property not found';
    END IF;

    IF auth.uid() != v_owner_id AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Only property owner or admin can manage availability';
    END IF;

    -- Delete existing availability records for the date range
    DELETE FROM public.property_availability
    WHERE 
        property_id = p_property_id 
        AND (
            (start_date <= p_end_date AND end_date >= p_start_date)
            OR (start_date >= p_start_date AND end_date <= p_end_date)
        );

    -- Insert new availability record
    INSERT INTO public.property_availability (
        property_id, 
        start_date, 
        end_date, 
        is_available, 
        blocked_reason
    ) VALUES (
        p_property_id,
        p_start_date,
        p_end_date,
        p_is_available,
        p_blocked_reason
    );

    -- Return the inserted/updated record
    RETURN QUERY
    SELECT 
        pa.property_id,
        pa.start_date,
        pa.end_date,
        pa.is_available,
        pa.blocked_reason
    FROM public.property_availability pa
    WHERE 
        pa.property_id = p_property_id 
        AND pa.start_date = p_start_date 
        AND pa.end_date = p_end_date;
END;
$$;

-- Fix audit_logs RLS policy to allow inserts from authenticated users
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.audit_logs;
CREATE POLICY "Allow authenticated inserts"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = changed_by OR changed_by IS NOT NULL);