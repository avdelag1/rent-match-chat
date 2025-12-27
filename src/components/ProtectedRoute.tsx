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

// Loading spinner component to prevent white page - defined outside to avoid recreation
const LoadingSpinner = () => (
  <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 mx-auto border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-white/70 text-sm">Loading...</p>
    </div>
  </div>
);

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

  const { data: userRole, isLoading: profileLoading, isError, isFetching } = useQuery({
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
    retry: 3, // Increased from 2 to match Index.tsx
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Match Index.tsx exponential backoff
    staleTime: 60000, // Match Index.tsx (60 seconds)
    gcTime: 300000, // Match Index.tsx (5 minutes)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    // Handle timeout - redirect to home
    if (timedOut && !user) {
      navigate('/', { replace: true });
      return;
    }

    // Show loading while checking auth/role
    if (loading || profileLoading || isFetching) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/', { replace: true, state: { from: location } });
      return;
    }

    // Handle query error - only after retries are exhausted and we're not fetching
    if (isError && !profileLoading && !isFetching) {
      console.error('[ProtectedRoute] Role query failed after retries');
      navigate('/', { replace: true });
      return;
    }

    // Only redirect if we're certain there's no role (not loading, not fetching, query completed)
    if (!userRole && !profileLoading && !isFetching) {
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
  }, [user, userRole, loading, profileLoading, isFetching, navigate, location, requiredRole, timedOut, isError]);

  // Show loading spinner during auth check - prevents white page
  if (loading || isFetching) {
    return <LoadingSpinner />;
  }

  // Show loading spinner while fetching role
  if (profileLoading) {
    return <LoadingSpinner />;
  }

  // Don't render if user is not authenticated (useEffect will redirect)
  if (!user) {
    return <LoadingSpinner />;
  }

  // Show loading while waiting for role (useEffect will redirect)
  if (!userRole) {
    return <LoadingSpinner />;
  }

  // If a specific role is required, check if user has that role
  // Both 'client' and 'owner' roles are valid - routes without requiredRole allow both
  if (requiredRole && userRole !== requiredRole) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
