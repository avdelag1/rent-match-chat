import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  
  // Fetch user profile to determine role
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('[Index] Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[Index] Profile fetch error:', error);
        throw error;
      }
      
      console.log('[Index] Profile fetched:', data);
      return data;
    },
    enabled: !!user,
    retry: 1,
  });

  // Reset redirect guard when auth state changes
  useEffect(() => {
    setHasRedirected(false);
    setRedirectMessage(null);
  }, [user?.id]);

  // Redirect authenticated users based on their status
  useEffect(() => {
    if (loading || profileLoading || !user || hasRedirected) {
      return;
    }

    if (profileError) {
      console.error('[Index] Profile error detected, retrying...');
      setRedirectMessage('Loading your profile...');
      return;
    }

    if (!profile) {
      console.log('[Index] Waiting for profile creation...');
      setRedirectMessage('Setting up your account...');
      return;
    }

    // Prevent multiple redirects
    setHasRedirected(true);

    if (!profile.onboarding_completed) {
      console.log('[Index] ✅ Redirecting to onboarding - incomplete profile');
      setRedirectMessage('Redirecting to onboarding...');
      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 100);
    } else if (profile.onboarding_completed) {
      const targetPath = profile.role === 'client' ? '/client/dashboard' : '/owner/dashboard';
      console.log('[Index] ✅ Redirecting to dashboard:', targetPath);
      setRedirectMessage('Redirecting to your dashboard...');
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 100);
    }
  }, [user, profile, loading, profileLoading, profileError, navigate, hasRedirected]);

  // Show error state if profile fetch failed after retry
  if (profileError && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-2xl font-bold text-white">Profile Loading Error</h2>
          <p className="text-gray-300">
            We couldn't load your profile. This might be a temporary issue.
          </p>
          <button
            onClick={() => refetch()}
            className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
          {redirectMessage && (
            <p className="text-gray-300 text-sm animate-pulse">{redirectMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // Only show landing page if user is NOT authenticated
  if (!user) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  return null; // Will redirect via useEffect
};

export default Index;
