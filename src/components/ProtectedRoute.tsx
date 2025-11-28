
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
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

  const { data: userRole, isLoading: profileLoading } = useQuery({
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
    retry: 3,
    retryDelay: 500,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes (roles rarely change)
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });

  useEffect(() => {
    // Show loading while checking auth/role
    if (loading || profileLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      console.log('[ProtectedRoute] No user found, redirecting to login');
      navigate('/', { replace: true, state: { from: location } });
      return;
    }

    if (!userRole) {
      // Role not found after React Query retries - this shouldn't happen
      console.error('[ProtectedRoute] ❌ User authenticated but no role found after retries');
      toast({
        title: "Account setup incomplete",
        description: "Please refresh or contact support if this persists.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
      return;
    }

    // CRITICAL: Check role-based access for protected routes
    if (requiredRole && userRole !== requiredRole) {
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      console.log(`[ProtectedRoute] 🚨 AUTHORIZATION VIOLATION: User role="${userRole}" tried to access ${location.pathname} which requires role="${requiredRole}"`);
      console.log(`[ProtectedRoute] Redirecting to correct dashboard:`, targetPath);

      toast({
        title: "Access Denied",
        description: `Redirecting to your ${userRole} dashboard.`,
        variant: "destructive"
      });

      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, profileLoading, navigate, location, requiredRole]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && userRole !== requiredRole)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

