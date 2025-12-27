import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { AuthRedirectScreen } from "@/components/AuthRedirectScreen";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/prodLogger";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Fetch user role from secure user_roles table
  const {
    data: userRole,
    isLoading: profileLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      logger.log("[Index] Fetching role for user:", user.id);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        logger.error("[Index] Role fetch error:", error);
        throw error; // Let React Query handle retries
      }

      logger.log("[Index] Role fetched successfully:", data?.role);
      return data?.role;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Add timeout fallback - if query takes too long, force refetch with faster timeout
  useEffect(() => {
    if (user && profileLoading) {
      const timeout = setTimeout(() => {
        logger.log("[Index] Query taking too long (2s), forcing faster refetch...");
        refetch();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [user, profileLoading, refetch]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (user && (profileLoading || !userRole)) {
      const timeout = setTimeout(() => {
        logger.log("[Index] Loading timeout reached (6s), showing fallback...");
        setLoadingTimeout(true);
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [user, profileLoading, userRole]);

  // Notify only once if role loading gets stuck
  useEffect(() => {
    if (user && loadingTimeout) {
      toast({
        title: "Loading Issue",
        description: "Still loading your account. Please refresh and try again.",
        variant: "destructive",
      });
    }
  }, [user, loadingTimeout]);

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    logger.log("[Index] Redirect check:", {
      user: !!user,
      userEmail: user?.email,
      userRole,
      loading,
      profileLoading,
      isError,
    });

    if (loading) return;

    if (user) {
      // If query failed after all retries
      if (isError && !profileLoading) {
        logger.error("[Index] User authenticated but role query failed after retries");
        return;
      }

      // If still loading, wait
      if (profileLoading) {
        logger.log("[Index] Still loading role...");
        return;
      }

      // If no role found after query completed
      if (!userRole) {
        logger.error("[Index] ❌ No role found for authenticated user:", user.email);
        return;
      }

      // Success - redirect to correct dashboard based on role
      const targetPath = userRole === "client" ? "/client/dashboard" : "/owner/dashboard";
      logger.log(
        `[Index] ✅ Authenticated user ${user.email} with role="${userRole}" -> Redirecting to: ${targetPath}`
      );
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, profileLoading, isError, navigate]);

  // IMPORTANT: never flash the landing page for authenticated users
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  if (profileLoading && !loadingTimeout) {
    return <AuthRedirectScreen title="Signing you in…" description="Loading your dashboard" />;
  }

  if (loadingTimeout) {
    return (
      <AuthRedirectScreen
        title="Still loading…"
        description="Please refresh. If it persists, sign out and try again."
      />
    );
  }

  // While navigation/redirect happens
  return <AuthRedirectScreen />;
};

export default Index;

