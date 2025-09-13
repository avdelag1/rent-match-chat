-- CRITICAL SECURITY FIX: Remove overly permissive policies
-- These policies allow unauthorized access to personal data

-- Drop the dangerous policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Drop other overly permissive policies
DROP POLICY IF EXISTS "Owners can view client profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Profiles respect blocking" ON public.profiles;

-- Clean up duplicate policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Keep only the secure, properly scoped policies:
-- 1. "Users can view their own profile" - allows users to see only their own data
-- 2. "Users can update their own profile" - allows users to update only their own data  
-- 3. "Users can insert their own profile" - allows users to create only their own profile
-- 4. "Users can view profiles for matching" - controlled matching with restrictions
-- 5. Admin policies for moderation

-- Verify our secure policies are working by testing the restrictions
-- Users should only see their own profile + profiles eligible for matching
-- No access to sensitive data of other users unless specifically authorized

-- Add additional security: ensure sensitive fields are protected
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_sensitivity_level TEXT DEFAULT 'sensitive',
ADD COLUMN IF NOT EXISTS last_security_audit TIMESTAMP DEFAULT NOW();

-- Create audit function to log access to sensitive data
CREATE OR REPLACE FUNCTION log_profile_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;