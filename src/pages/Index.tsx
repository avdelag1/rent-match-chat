import { useEffect, useState, useRef, useMemo } from "react";
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

  // Ref to prevent toast spam on re-renders
  const hasShownError = useRef(false);

  // Calculate user age to handle new users whose role row might not exist yet
  const userAgeMs = useMemo(() => {
    if (!user?.created_at) return Infinity;
    return Date.now() - new Date(user.created_at).getTime();
  }, [user?.created_at]);

  const isNewUser = userAgeMs < 20000; // Within 20 seconds of account creation

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
    // CRITICAL: Only enable when auth is stable (user exists AND loading is complete)
    enabled: !!user && !loading,
    retry: 3, // Increased from 2 to 3 for better reliability on new signups
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    staleTime: 60000, // 60 seconds - user roles don't change frequently
    gcTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: true, // Refetch on mount to ensure fresh data

    // For new users, poll briefly until role row exists (created by trigger)
    refetchInterval: (query) => {
      const role = query.state.data as string | null | undefined;
      if (!user) return false;
      if (loading) return false;
      if (!isNewUser) return false;
      if (role) return false; // Stop polling once we have a role
      return 1000; // Poll every 1 second for new users
    },
  });

  // Better loading condition - distinguishes between undefined (loading) and null (no data)
  // userRole is undefined while loading, null if no record exists, or a string if found
  const isLoadingRole = (profileLoading || isFetching) && userRole === undefined;

  // Combined timeout handling to prevent race conditions between multiple timers
  useEffect(() => {
    // Reset timeout if user logs out or loading completes
    if (!user || !isLoadingRole) {
      setLoadingTimeout(false);
      return;
    }

    // Single timeout for fallback UI after 6 seconds
    const fallbackTimeout = setTimeout(() => {
      // Double-check we're still loading before showing error (prevents race condition)
      if (isLoadingRole) {
        logger.log('[Index] Loading timeout reached (6s), showing fallback...');
        setLoadingTimeout(true);
      }
    }, 6000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [user, isLoadingRole]);

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    logger.log('[Index] Redirect check:', {
      user: !!user,
      userEmail: user?.email,
      userRole,
      loading,
      isLoadingRole,
      isError
    });

    if (loading) return;

    if (user) {
      // If query failed after all retries, show error (with spam prevention)
      if (isError && !isLoadingRole) {
        logger.error('[Index] User authenticated but role query failed after retries');

        if (!hasShownError.current) {
          hasShownError.current = true;
          toast({
            title: "Account Setup Issue",
            description: "Taking longer than expected. Please refresh the page.",
            variant: "destructive"
          });
        }
        return;
      }

      // If still loading, wait
      if (isLoadingRole) {
        logger.log('[Index] Still loading role...');
        return;
      }

      // userRole is null (no record found) vs undefined (still loading)
      // At this point, isLoadingRole is false, so userRole should be null or a string
      if (userRole === null || userRole === undefined) {
        // For new users, keep waiting - the role row might be created by a trigger
        if (isNewUser) {
          logger.log('[Index] New user - role row may still be creating, continuing to poll...');
          return;
        }

        logger.error('[Index] ❌ No role found for authenticated user:', user.email);

        if (!hasShownError.current) {
          hasShownError.current = true;
          toast({
            title: "Account Setup Incomplete",
            description: "Please refresh the page or contact support if this persists.",
            variant: "destructive"
          });
        }
        return;
      }

      // CRITICAL: Success - redirect to correct dashboard based on ACTUAL role from DB
      // Reset error flag on successful redirect (for future sessions)
      hasShownError.current = false;
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      logger.log(`[Index] ✅ Authenticated user ${user.email} with role="${userRole}" -> Redirecting to: ${targetPath}`);
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, isLoadingRole, isError, isNewUser, navigate]);

  // Show loading spinner when user is authenticated but role is loading
  // This prevents showing the "I'm a Client" / "I'm an Owner" buttons after login
  // Also show spinner for new users waiting for role row to be created
  if (user && (isLoadingRole || (isNewUser && !userRole)) && !loadingTimeout) {
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
