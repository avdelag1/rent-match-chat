
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'owner';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: userRole, isLoading: profileLoading, refetch } = useQuery({
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
  });

  useEffect(() => {
    if (!loading && !user) {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      return;
    }

    if (!profileLoading && user) {
      if (!userRole) {
        // User is authenticated but has no role
        // This can happen during signup - wait and retry
        console.log('ProtectedRoute: User authenticated but no role found, waiting...');
        const timer = setTimeout(() => {
          refetch();
        }, 1000);
        return () => clearTimeout(timer);
      }

      // Check role-based access for protected routes
      if (requiredRole && userRole !== requiredRole) {
        const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
        if (location.pathname !== targetPath) {
          navigate(targetPath, { replace: true });
        }
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profileLoading, userRole, requiredRole, navigate, location.pathname]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
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

