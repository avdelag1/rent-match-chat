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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const hasShownError = useRef(false);

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

  const isNewUser = userAgeMs < 20000; // Menos de 20 segundos desde registro

  const {
    data: userRole,
    isLoading: profileLoading,
    isFetching,
    error,
    isError,
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
    enabled: !!user && !loading,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: (query) => {
      const role = query.state.data as string | null | undefined;
      if (!user || loading || !isNewUser || role) return false;
      return 1000;
    },
  });

  const isLoadingRole = (profileLoading || isFetching) && userRole === undefined;

  useEffect(() => {
    if (!user || !isLoadingRole) {
      setLoadingTimeout(false);
      return;
    }
    const fallbackTimeout = setTimeout(() => {
      if (isLoadingRole) {
        logger.log("[Index] Loading timeout reached (6s)");
        setLoadingTimeout(true);
      }
    }, 6000);
    return () => clearTimeout(fallbackTimeout);
  }, [user, isLoadingRole]);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (isError && !isLoadingRole) {
        if (!hasShownError.current) {
          hasShownError.current = true;
          toast({
            title: "Account Setup Issue",
            description: "Taking longer than expected. Please refresh the page.",
            variant: "destructive",
          });
        }
        return;
      }

      if (isLoadingRole) return;

      if (userRole === null || userRole === undefined) {
        if (isNewUser) return;
        if (!hasShownError.current) {
          hasShownError.current = true;
          toast({
            title: "Account Setup Incomplete",
            description: "Please refresh the page or contact support if this persists.",
            variant: "destructive",
          });
        }
        return;
      }

      hasShownError.current = false;
      const targetPath = userRole === "client" ? "/client/dashboard" : "/owner/dashboard";
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, isLoadingRole, isError, isNewUser, navigate]);

  // Loading mientras espera el rol
  if (user && (isLoadingRole || (isNewUser && !userRole)) && !loadingTimeout) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Timeout error
  if (user && loadingTimeout) {
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
