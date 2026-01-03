// src/pages/Index.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import App from "@/App.tsx"; // ← Correct import using your alias
import "@/index.css";
import "@/styles/responsive.css";

import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/prodLogger";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAST INITIAL RENDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const initialLoader = document.getElementById("initial-loader");
if (initialLoader) {
  initialLoader.style.opacity = "0";
  initialLoader.style.transition = "opacity 150ms ease-out";
  setTimeout(() => initialLoader.remove(), 150);
}

// Render the full app immediately for fastest possible interaction
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>,
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Index Page Component (your original smart logic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const hasShownError = useRef(false);

  const userAgeMs = useMemo(() => {
    if (!user?.created_at) return Infinity;
    return Date.now() - new Date(user.created_at).getTime();
  }, [user?.created_at]);

  const isNewUser = userAgeMs < 20000; // Within 20 seconds of signup

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
        logger.log("[Index] Loading timeout reached (6s), showing fallback...");
        setLoadingTimeout(true);
      }
    }, 6000);

    return () => clearTimeout(fallbackTimeout);
  }, [user, isLoadingRole]);

  useEffect(() => {
    logger.log("[Index] Redirect check:", {
      user: !!user,
      userEmail: user?.email,
      userRole,
      loading,
      isLoadingRole,
      isError,
    });

    if (loading) return;

    if (user) {
      if (isError && !isLoadingRole) {
        logger.error("[Index] Role query failed after retries");
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
        if (isNewUser) {
          logger.log("[Index] New user - waiting for role row creation...");
          return;
        }
        logger.error("[Index] No role found for user:", user.email);
        if (!hasShownError.current) {
          hasShownError.current = true;
          toast({
            title: "Account Setup Incomplete",
            description: "Please refresh the page or contact support.",
            variant: "destructive",
          });
        }
        return;
      }

      hasShownError.current = false;
      const targetPath = userRole === "client" ? "/client/dashboard" : "/owner/dashboard";
      logger.log(`[Index] Redirecting ${user.email} (${userRole}) → ${targetPath}`);
      navigate(targetPath, { replace: true });
    }
  }, [user, userRole, loading, isLoadingRole, isError, isNewUser, navigate]);

  // Loading state while waiting for role
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

  // Timeout fallback
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

  // Show landing page only for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  // Final fallback (redirecting)
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
};

export default Index;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFERRED INITIALIZATION (runs after first paint)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const deferredInit = (callback: () => void, timeout = 3000) => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
};

// Priority 1: Route prefetching
deferredInit(async () => {
  try {
    const { prefetchCriticalRoutes } = await import("@/utils/routePrefetcher");
    prefetchCriticalRoutes();
  } catch (e) {
    // Silent if file doesn't exist yet
  }
}, 1000);

// Priority 2: Performance tools
deferredInit(async () => {
  try {
    const [
      { logBundleSize },
      { setupUpdateChecker, checkAppVersion },
      { initPerformanceOptimizations },
      { initWebVitalsMonitoring },
    ] = await Promise.all([
      import("@/utils/performance"),
      import("@/utils/cacheManager"),
      import("@/utils/performanceMonitor"),
      import("@/utils/webVitals"),
    ]);

    logBundleSize();
    checkAppVersion();
    setupUpdateChecker();
    initPerformanceOptimizations();
    initWebVitalsMonitoring();
  } catch (e) {
    // Silent
  }
}, 3000);

// Priority 3: Native Capacitor setup
deferredInit(async () => {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#FF0000" });
    }
  } catch (e) {
    // Silent
  }
}, 5000);

// Service Worker (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
