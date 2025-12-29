import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "client" | "owner";
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

  // Render nothing while auth is loading
  if (loading) return null;

  // Not logged in: block render (effect will redirect)
  if (!user) return null;

  // Waiting for role: block render (Index.tsx handles showing a loader)
  if (roleLoading || roleFetching || !userRole) return null;

  // Role mismatch: block render (effect will redirect)
  if (requiredRole && userRole !== requiredRole) return null;

  return <>{children}</>;
}
