import { useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/prodLogger";
import { STORAGE } from "@/constants/app";

const Index = () => {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasNavigated = useRef(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Capture referral code from URL if present (works for app-wide referral links)
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && refCode.length > 0) {
      // Don't capture if it's the current user's own referral
      if (user?.id && user.id === refCode) return;

      // Store referral code with timestamp
      const referralData = {
        code: refCode,
        capturedAt: Date.now(),
        source: '/',
      };
      localStorage.setItem(STORAGE.REFERRAL_CODE_KEY, JSON.stringify(referralData));
    }
  }, [searchParams, user?.id]);

  const userAgeMs = useMemo(() => {
    if (!user?.created_at) return Infinity;
    return Date.now() - new Date(user.created_at).getTime();
  }, [user?.created_at]);

  const isNewUser = userAgeMs < 60000; // Less than 60 seconds since registration (increased from 30s)

  // Track polling start time to prevent infinite loops
  const roleQueryStartTimeRef = useRef(Date.now());

  const {
    data: userRole,
    isLoading: profileLoading,
    isFetching,
  } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      logger.log("[Index] Fetching role for user:", user.id);
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();

      if (error) {
        logger.error("[Index] Role fetch error:", error);
        throw error;
      }
      logger.log("[Index] Role fetched successfully:", data?.role);
      return data?.role;
    },
    enabled: !!user && initialized,
    retry: 3, // Reduced to prevent excessive retries
    retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 2000),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Poll for role but with strong safety guards
    refetchInterval: (query) => {
      const role = query.state.data as string | null | undefined;

      // Stop if we have a role
      if (role) return false;

      // Stop if no user
      if (!user) return false;

      // Maximum polling duration: 25 seconds
      const elapsedMs = Date.now() - roleQueryStartTimeRef.current;
      if (elapsedMs > 25000) {
        logger.warn('[Index] Stopping role polling after 25 seconds');
        return false;
      }

      // Only poll new users - existing users should have role in metadata
      if (!isNewUser) {
        logger.warn('[Index] Not polling role for existing user - will use metadata');
        return false;
      }

      return 800; // Poll every 800ms while waiting for role
    },
  });

  const isLoadingRole = (profileLoading || isFetching) && userRole === undefined;

  // Helper: resolve role from all available sources
  const resolveRole = (): 'client' | 'owner' | null => {
    // 1. DB role (most authoritative)
    if (userRole) return userRole as 'client' | 'owner';
    // 2. User metadata role (set during signup)
    const metadataRole = user?.user_metadata?.role as 'client' | 'owner' | undefined;
    if (metadataRole) return metadataRole;
    // 3. Pending OAuth role from localStorage (set before OAuth redirect)
    const pendingOAuthRole = localStorage.getItem('pendingOAuthRole') as 'client' | 'owner' | null;
    if (pendingOAuthRole) return pendingOAuthRole;
    return null;
  };

  // CRITICAL FIX: Navigate as soon as we have role from ANY source
  useEffect(() => {
    if (hasNavigated.current) return;
    if (!initialized) return;
    if (loading) return;
    if (!user) return;

    const role = resolveRole();

    if (role) {
      hasNavigated.current = true;
      // Clean up pendingOAuthRole if it was used
      localStorage.removeItem('pendingOAuthRole');
      const targetPath = role === "client" ? "/client/dashboard" : "/owner/dashboard";
      logger.log("[Index] Navigating to:", targetPath, "(source: role resolved)");
      navigate(targetPath, { replace: true });
      return;
    }

    // No role from any source yet - for new users, set a short timeout fallback
    // to prevent getting stuck forever on the loading page
    if (!navigationTimeoutRef.current) {
      navigationTimeoutRef.current = setTimeout(() => {
        if (hasNavigated.current) return;
        // Last resort: default to 'client' so user isn't stuck on loading forever
        hasNavigated.current = true;
        logger.warn("[Index] Fallback timeout - no role found, defaulting to client");
        navigate("/client/dashboard", { replace: true });
      }, 8000); // 8 second max wait
    }
  }, [user, userRole, loading, initialized, isLoadingRole, isNewUser, navigate]);

  // Clean up timeout on unmount or when user changes
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset navigation flag when user changes
  useEffect(() => {
    if (!user) {
      hasNavigated.current = false;
    }
  }, [user?.id]);

  // CRITICAL: Show loading spinner while auth is initializing
  // This prevents the landing page from flashing before redirecting to dashboard
  if (!initialized || loading) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // User exists but navigation hasn't happened yet - show brief loading
  // CRITICAL: If hasNavigated is true, skip this entirely (navigate is in progress)
  if (user && !hasNavigated.current && !resolveRole()) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Solo muestra landing page si NO hay usuario logueado
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  // Caso final (redirigiendo)
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
};

export default Index;
