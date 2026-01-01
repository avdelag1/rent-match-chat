import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "client" | "owner";
}

/**
 * iOS-grade loading skeleton for protected routes
 * Prevents flash/flicker during auth check by showing content structure
 */
function ProtectedRouteLoadingSkeleton() {
  return (
    <div
      className="min-h-screen min-h-dvh w-full bg-background flex flex-col"
      style={{
        paddingTop: 'calc(52px + var(--safe-top, 0px))',
        paddingBottom: 'calc(68px + var(--safe-bottom, 0px))',
      }}
    >
      {/* Top bar skeleton */}
      <div className="fixed top-0 left-0 right-0 h-[52px] bg-background border-b border-border/50 flex items-center justify-between px-4 z-50" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
        <Skeleton className="h-8 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Main content skeleton - mimics swipe card layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg aspect-[3/4] rounded-3xl overflow-hidden relative">
          <Skeleton className="absolute inset-0 rounded-3xl" />
          {/* Story dots */}
          <div className="absolute top-3 left-4 right-4 flex gap-1 z-10">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-1 h-1 rounded-full bg-white/20" />
            ))}
          </div>
          {/* Bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm rounded-t-[24px] p-4 pt-6">
            <Skeleton className="w-10 h-1.5 mx-auto mb-3 rounded-full bg-white/30" />
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/15" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-20 bg-white/20" />
                <Skeleton className="h-3 w-12 ml-auto bg-white/15" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12 bg-white/15 rounded" />
              <Skeleton className="h-4 w-12 bg-white/15 rounded" />
              <Skeleton className="h-4 w-16 bg-white/15 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-background border-t border-border/50 flex items-center justify-around px-4" style={{ paddingBottom: 'var(--safe-bottom, 0px)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const didNavigateRef = useRef(false);

  // Calculate user age to handle new users whose role row might not exist yet
  const userAgeMs = useMemo(() => {
    if (!user?.created_at) return Infinity;
    return Date.now() - new Date(user.created_at).getTime();
  }, [user?.created_at]);

  const isNewUser = userAgeMs < 20000; // Within 20 seconds of account creation

  const {
    data: userRole,
    isLoading: roleLoading,
    isFetching: roleFetching,
    isError,
  } = useQuery({
    queryKey: ["user-role", user?.id],
    // CRITICAL: Only enable when auth is stable (user exists AND loading is complete)
    enabled: !!user && !loading,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      // CRITICAL: Throw on error so React Query's isError works correctly
      if (error) {
        throw error;
      }
      return data?.role ?? null;
    },

    // For new users, poll briefly until role row exists (created by trigger)
    refetchInterval: (query) => {
      const role = query.state.data as string | null | undefined;
      if (!user) return false;
      if (loading) return false;
      if (!isNewUser) return false;
      if (role) return false; // Stop polling once we have a role
      return 1000; // Poll every 1 second for new users
    },

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    // Prevent duplicate navigations
    if (didNavigateRef.current) return;

    // Wait for auth to stabilize
    if (loading) return;

    // Not authenticated -> redirect to home (login/landing)
    if (!user) {
      didNavigateRef.current = true;
      navigate("/", { replace: true, state: { from: location } });
      return;
    }

    // If role query had a real error -> redirect to home
    if (isError) {
      didNavigateRef.current = true;
      navigate("/", { replace: true });
      return;
    }

    // CRITICAL FIX: While role is being resolved (loading/fetching or null for new users)
    // DO NOT redirect. Let Index.tsx handle the loading state and initial redirect.
    // This prevents the ping-pong: "/" -> "/dashboard" -> "/" -> "/dashboard"
    if (roleLoading || roleFetching || !userRole) return;

    // Role mismatch: redirect to the correct dashboard once
    if (requiredRole && userRole !== requiredRole) {
      didNavigateRef.current = true;
      const target = userRole === "client" ? "/client/dashboard" : "/owner/dashboard";
      navigate(target, { replace: true });
    }
  }, [
    user,
    loading,
    userRole,
    roleLoading,
    roleFetching,
    isError,
    requiredRole,
    navigate,
    location,
  ]);

  // Show skeleton while auth is loading - prevents flash
  if (loading) return <ProtectedRouteLoadingSkeleton />;

  // Not logged in: show skeleton briefly (effect will redirect)
  if (!user) return <ProtectedRouteLoadingSkeleton />;

  // Waiting for role: show skeleton (prevents blank screen)
  if (roleLoading || roleFetching || !userRole) return <ProtectedRouteLoadingSkeleton />;

  // Role mismatch: show skeleton briefly (effect will redirect)
  if (requiredRole && userRole !== requiredRole) return <ProtectedRouteLoadingSkeleton />;

  return <>{children}</>;
}
