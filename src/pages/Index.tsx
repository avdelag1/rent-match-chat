import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/prodLogger";
import { STORAGE } from "@/constants/app";

const Index = () => {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasNavigated = useRef(false);

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

  const {
    data: userRole,
    isLoading: profileLoading,
    isFetching,
    error,
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
    retry: 10, // More retries for reliability
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Poll for role until we have one (not based on user age - that can cause issues)
    // Stop polling after 30 seconds to prevent infinite polling
    refetchInterval: (query) => {
      const role = query.state.data as string | null | undefined;
      // Stop if no user, or we have a role
      if (!user || role) return false;
      // Stop polling after 30 seconds (user age check)
      if (userAgeMs > 30000) return false;
      return 800; // Poll every 800ms while waiting for role
    },
  });

  const isLoadingRole = (profileLoading || isFetching) && userRole === undefined;

  // CRITICAL FIX: Navigate as soon as we have role, don't wait
  useEffect(() => {
    if (hasNavigated.current) return;
    if (!initialized) return; // Wait for auth to initialize
    if (loading) return;
    
    // Not logged in - show landing page
    if (!user) return;

    // Have role - navigate immediately
    if (userRole) {
      hasNavigated.current = true;
      const targetPath = userRole === "client" ? "/client/dashboard" : "/owner/dashboard";
      logger.log("[Index] Navigating to:", targetPath);
      navigate(targetPath, { replace: true });
      return;
    }

    // New user without role yet - check metadata for fallback
    if (isNewUser && !userRole && !isLoadingRole) {
      const metadataRole = user.user_metadata?.role as 'client' | 'owner' | undefined;
      if (metadataRole) {
        hasNavigated.current = true;
        const targetPath = metadataRole === "client" ? "/client/dashboard" : "/owner/dashboard";
        logger.log("[Index] Using metadata role, navigating to:", targetPath);
        navigate(targetPath, { replace: true });
        return;
      }
    }
  }, [user, userRole, loading, initialized, isLoadingRole, isNewUser, navigate]);

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

  // User exists but still loading role - show loading
  if (user && (isLoadingRole || (isNewUser && !userRole))) {
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
