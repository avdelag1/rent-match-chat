import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'owner';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout to prevent infinite loading - redirect to home after 10s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [loading]);

  const { data: userRole, isLoading: profileLoading, isError } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Role fetch error in ProtectedRoute:', error);
        return null;
      }
      return data?.role;
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 300,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    // Handle timeout - redirect to home
    if (timedOut && !user) {
      navigate('/', { replace: true });
      return;
    }

    // Show loading while checking auth/role
    if (loading || profileLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/', { replace: true, state: { from: location } });
      return;
    }

    // Handle query error
    if (isError) {
      console.error('[ProtectedRoute] Role query failed');
      navigate('/', { replace: true });
      return;
    }

    if (!userRole && !profileLoading) {
      console.error('[ProtectedRoute] User authenticated but no role found');
      toast({
        title: "Account setup incomplete",
        description: "Please try signing in again.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
      return;
    }

    // Check role-based access for protected routes
    if (requiredRole && userRole && userRole !== requiredRole) {
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      toast({
        title: "Access Denied",
        description: `Redirecting to your ${userRole} dashboard.`,
        variant: "destructive"
      });
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, profileLoading, navigate, location, requiredRole, timedOut, isError]);

  // Return null during loading - no blocking screen
  if (loading) {
    return null;
  }

  // Return null while fetching role
  if (profileLoading && userRole === undefined) {
    return null;
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't render if user has no role (useEffect will redirect)
  if (!userRole) {
    return null;
  }

  // If a specific role is required, check if user has that role
  // Both 'client' and 'owner' roles are valid - routes without requiredRole allow both
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
