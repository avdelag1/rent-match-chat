import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user role from secure user_roles table
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
        console.error('Role fetch error:', error);
        return null;
      }
      return data?.role;
    },
    enabled: !!user,
    retry: 3, // Retry up to 3 times for newly created users
    retryDelay: 500, // Wait 500ms between retries
  });

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    if (loading || profileLoading) return;
    
    if (user) {
      if (!userRole) {
        // User is authenticated but has no role yet
        // This can happen during signup - wait a bit and retry
        console.log('User authenticated but no role found, waiting...');
        const timer = setTimeout(() => {
          refetch();
        }, 1000);
        return () => clearTimeout(timer);
      }
      
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      console.log('Redirecting authenticated user to dashboard:', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, profileLoading, navigate, refetch]);

  // Show loading state while checking authentication
  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
        </div>
      </div>
    );
  }

  // Only show landing page if user is NOT authenticated
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  return null; // Will redirect via useEffect
};

export default Index;
