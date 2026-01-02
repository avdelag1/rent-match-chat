import { useEffect, useMemo, useRef, useState } from "react";
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

  const hasShownError = useRef(false);

  const userAgeMs = useMemo(() => {
    if (!user?.created_at) return Infinity;
    return Date.now() - new Date(user.created_at).getTime();
  }, [user?.created_at]);

  const isNewUser = userAgeMs < 20000;

  const {
    data: userRole,
    isLoading,
    isFetching,
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

      logger.log("[Index] Role fetched:", data?.role);
      return data?.role ?? null;
    },
    enabled: !!user && !loading,
    retry: 3,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 3000),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: (q) => {
      const role = q.state.data as string | null | undefined;
      if (!user) return false;
      if (loading) return false;
      if (!isNewUser) return false;
      if (role) return false;
      return 1000;
    },
  });

  const isLoadingRole = (isLoading || isFetching) && userRole === undefined;

  useEffect(() => {
    if (!user || !isLoadingRole) {
      setLoadingTimeout(false);
      return;
    }

    const t = setTimeout(() => {
      if (isLoadingRole) setLoadingTimeout(true);
    }, 6000);

    return () => clearTimeout(t);
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

  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
};

export default Index;
