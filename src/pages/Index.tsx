import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/prodLogger";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Fetch user role from secure user_roles table
  const { data: userRole, isLoading: profileLoading, isFetching, refetch, error, isError } = useQuery({
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
    retry: 3, // Increased from 2 to 3 for better reliability on new signups
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    staleTime: 60000, // 60 seconds - user roles don't change frequently
    gcTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
  });

  // Add timeout fallback - if query takes too long, force refetch with faster timeout
  useEffect(() => {
    if (user && (profileLoading || isFetching)) {
      const timeout = setTimeout(() => {
        logger.log('[Index] Query taking too long (2s), forcing faster refetch...');
        refetch();
      }, 2000); // Reduced from 5s to 2s for faster feedback

      return () => clearTimeout(timeout);
    }
  }, [user, profileLoading, isFetching, refetch]);

  // Add timeout to prevent infinite loading - show landing page after 6 seconds
  useEffect(() => {
    if (user && (profileLoading || isFetching || !userRole)) {
      const timeout = setTimeout(() => {
        logger.log('[Index] Loading timeout reached (6s), showing fallback...');
        setLoadingTimeout(true);
      }, 6000); // Reduced from 10s to 6s for faster feedback on timeout

      return () => clearTimeout(timeout);
    }
  }, [user, profileLoading, isFetching, userRole]);

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    logger.log('[Index] Redirect check:', {
      user: !!user,
      userEmail: user?.email,
      userRole,
      loading,
      profileLoading,
      isFetching,
      isError
    });

    if (loading) return;

    if (user) {
      // If query failed after all retries, show error ONLY if we're not in the middle of signup
      if (isError && !profileLoading && !isFetching) {
        logger.error('[Index] User authenticated but role query failed after retries');

        // Don't show error immediately after signup - give cache more time
        const userAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity;
        if (userAge > 20000) { // Give new users up to 20s for profile setup
          toast({
            title: "Account Setup Issue",
            description: "Taking longer than expected. Please refresh the page.",
            variant: "destructive"
          });
        } else {
          logger.log('[Index] New user detected (age: ' + userAge + 'ms), waiting for profile setup...');
        }
        return;
      }

      // If still loading or fetching, wait
      if (profileLoading || isFetching) {
        logger.log('[Index] Still loading role...');
        return;
      }

      // If no role found after query completed
      if (!userRole) {
        logger.error('[Index] ❌ No role found for authenticated user:', user.email);
        const userAge = user.created_at ? Date.now() - new Date(user.created_at).getTime() : Infinity;

        // For brand new users, be more patient (up to 20s)
        if (userAge < 20000) {
          logger.log('[Index] Brand new user (age: ' + userAge + 'ms), waiting for role creation...');
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
  }, [user, userRole, loading, profileLoading, isFetching, isError, navigate]);

  // Show loading spinner when user is authenticated but role is loading
  // This prevents showing the "I'm a Client" / "I'm an Owner" buttons after login
  if (user && (profileLoading || isFetching || !userRole) && !loadingTimeout) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center space-y-4">
          {/* Simple loading spinner */}
          <div className="w-12 h-12 mx-auto border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If loading timeout reached, show error with retry option
  if (user && loadingTimeout) {
    logger.error('[Index] Loading timeout - showing error');
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center space-y-4 px-6">
          <p className="text-white/90 text-lg font-medium">Taking longer than expected</p>
          <p className="text-white/60 text-sm">Please refresh the page or try signing in again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Show landing page ONLY if user is NOT authenticated
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  // User is authenticated and has role - show loading while redirecting
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
};


export default Index;
