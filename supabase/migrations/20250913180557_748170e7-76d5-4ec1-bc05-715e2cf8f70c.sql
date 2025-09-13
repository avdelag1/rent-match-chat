-- Fix RLS security issue by enabling RLS on the spatial_ref_sys table
-- This is a PostGIS system table containing spatial reference system definitions

-- Enable RLS on the spatial_ref_sys table
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a read-only policy for spatial reference data
-- This table contains public reference data that applications need to read
-- but should not be modified by regular users
CREATE POLICY "Allow read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
TO public
USING (true);

-- Restrict write operations to authenticated users only (typically admins)
CREATE POLICY "Restrict spatial_ref_sys modifications to authenticated users" 
ON public.spatial_ref_sys 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Add security documentation
COMMENT ON TABLE public.spatial_ref_sys IS 'PostGIS spatial reference systems table - RLS enabled for security compliance. Read access allowed for spatial operations, write access restricted to admins.';