import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/prodLogger";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user role from secure user_roles table
  const { data: userRole, isLoading: profileLoading, refetch, error, isError } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      logger.log('[Index] Fetching role for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('[Index] Role fetch error:', error);
        throw error; // Let React Query handle retries
      }

      logger.log('[Index] Role fetched successfully:', data?.role);
      return data?.role;
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 500,
    staleTime: 60000, // Increased from 5s to 60s - user roles don't change frequently
    cacheTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
  });

  // Add timeout fallback - if query takes too long, force refetch
  useEffect(() => {
    if (user && profileLoading) {
      const timeout = setTimeout(() => {
        logger.log('[Index] Query taking too long, forcing refetch...');
        refetch();
      }, 5000); // Increase from 3s to 5s for new users

      return () => clearTimeout(timeout);
    }
  }, [user, profileLoading, refetch]);

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    logger.log('[Index] Redirect check:', {
      user: !!user,
      userEmail: user?.email,
      userRole,
      loading,
      profileLoading,
      isError
    });

    if (loading) return;

    if (user) {
      // If query failed after all retries, show error ONLY if we're not in the middle of signup
      if (isError && !profileLoading) {
        logger.error('[Index] User authenticated but role query failed after retries');

        // Don't show error immediately after signup - give cache more time
        const userAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity;
        if (userAge > 15000) { // Increase from 10s to 15s for new users
          toast({
            title: "Account Setup Issue",
            description: "Taking longer than expected. Please refresh the page.",
            variant: "destructive"
          });
        } else {
          logger.log('[Index] New user detected, waiting for profile setup...');
        }
        return;
      }

      // If still loading, wait
      if (profileLoading) {
        logger.log('[Index] Still loading role...');
        return;
      }

      // If no role found after query completed
      if (!userRole) {
        logger.error('[Index] ❌ No role found for authenticated user:', user.email);
        const userAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity;

        // For brand new users, be more patient
        if (userAge < 15000) {
          logger.log('[Index] Brand new user, waiting for role creation...');
          return;
        }

        toast({
          title: "Account Setup Incomplete",
          description: "Please refresh the page or contact support if this persists.",
          variant: "destructive"
        });
        return;
      }

      // CRITICAL: Success - redirect to correct dashboard based on ACTUAL role from DB
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      logger.log(`[Index] ✅ Authenticated user ${user.email} with role="${userRole}" -> Redirecting to: ${targetPath}`);
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, profileLoading, isError, navigate]);

  // Show loading state ONLY when user is authenticated AND we're fetching their role
  if (user && profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
        </div>
      </div>
    );
  }

  // Show landing page if user is NOT authenticated (or while checking auth on initial load)
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  // Show loading state while navigating to dashboard (user is authenticated and has role)
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
