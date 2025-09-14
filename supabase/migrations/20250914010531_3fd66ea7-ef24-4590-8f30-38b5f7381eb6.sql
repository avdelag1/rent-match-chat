-- Fix infinite recursion in admin_users and profiles policies
-- First drop problematic policies that might cause recursion

-- Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Enable read access for users to their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- If admin_users table exists, fix its policies too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        -- Drop problematic admin policies
        DROP POLICY IF EXISTS "Admin users can view all data" ON public.admin_users;
        DROP POLICY IF EXISTS "Admin users can manage admin_users" ON public.admin_users;
        
        -- Create simple admin policies
        CREATE POLICY "Admin users can view their own data" 
        ON public.admin_users FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Admin users can update their own data" 
        ON public.admin_users FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;