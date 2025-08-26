
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'owner';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

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
      window.location.href = '/';
      return;
    }

    if (!profileLoading && profile && requiredRole && profile.role !== requiredRole) {
      // Redirect to correct dashboard based on user's role
      if (profile.role === 'client') {
        window.location.href = '/client/dashboard';
      } else if (profile.role === 'owner') {
        window.location.href = '/owner/dashboard';
      }
      return;
    }
  }, [loading, user, profileLoading, profile, requiredRole]);

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

  if (!user || (requiredRole && profile?.role !== requiredRole)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
