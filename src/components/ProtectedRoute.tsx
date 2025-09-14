
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      return;
    }

    if (!profileLoading && profile) {
      // Check if user hasn't completed onboarding
      if (!profile.onboarding_completed && location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
        return;
      }

      // Check if user has completed onboarding but is still on onboarding page
      if (profile.onboarding_completed && location.pathname === '/onboarding') {
        const targetPath = profile.role === 'client' ? '/client/dashboard' : '/owner/dashboard';
        navigate(targetPath, { replace: true });
        return;
      }

      // Check role-based access for protected routes
      if (requiredRole && profile.role !== requiredRole) {
        const targetPath = profile.role === 'client' ? '/client/dashboard' : '/owner/dashboard';
        if (location.pathname !== targetPath) {
          navigate(targetPath, { replace: true });
        }
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profileLoading, profile, requiredRole, navigate, location.pathname]);

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

  if (!user || (requiredRole && profile?.role !== requiredRole) || (profile && !profile.onboarding_completed && location.pathname !== '/onboarding')) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

