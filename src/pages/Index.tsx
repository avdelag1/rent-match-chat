import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Remove static loading screen when actual content is ready
  useEffect(() => {
    if (!loading && !user) {
      const loadingScreen = document.getElementById('app-loading-screen');
      if (loadingScreen) {
        loadingScreen.remove();
      }
    }
  }, [loading, user]);
  
  // Fetch user role from secure user_roles table
  const { data: userRole, isLoading: profileLoading, refetch, error, isError } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('[Index] Fetching role for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[Index] Role fetch error:', error);
        throw error; // Let React Query handle retries
      }
      
      console.log('[Index] Role fetched successfully:', data?.role);
      return data?.role;
    },
    enabled: !!user,
    retry: 3, // Reduce retries from 5 to 3
    retryDelay: 800, // Reduce delay from 1000ms to 800ms
    staleTime: 5000, // Cache role data for 5s to prevent immediate refetch
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on focus
  });

  // Add timeout fallback - if query takes too long, force refetch
  useEffect(() => {
    if (user && profileLoading) {
      const timeout = setTimeout(() => {
        console.log('[Index] Query taking too long, forcing refetch...');
        refetch();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, profileLoading, refetch]);

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    console.log('[Index] Redirect check:', { user: !!user, userRole, loading, profileLoading, isError });
    
    if (loading) return;
    
    if (user) {
      // If query failed after all retries, show error ONLY if we're not in the middle of signup
      if (isError && !profileLoading) {
        console.error('[Index] User authenticated but role query failed after retries');
        
        // Don't show error immediately after signup - give cache more time
        const userAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity;
        if (userAge > 10000) { // Only show error if account is older than 10 seconds
          toast({
            title: "Account setup incomplete",
            description: "Please refresh the page or contact support.",
            variant: "destructive"
          });
        } else {
          console.log('[Index] New user detected, waiting for cache to update...');
        }
        return;
      }
      
      // If still loading, wait
      if (profileLoading) {
        console.log('[Index] Still loading role...');
        return;
      }
      
      // If no role found after query completed
      if (!userRole) {
        console.error('[Index] No role found for authenticated user');
        toast({
          title: "Account setup incomplete",
          description: "Please refresh the page or contact support.",
          variant: "destructive"
        });
        return;
      }
      
      // Success - redirect
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      console.log('[Index] Redirecting to:', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, profileLoading, isError, navigate]);

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

  // Show loading state while navigating to dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
        <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
      </div>
    </div>
  );
};

export default Index;
