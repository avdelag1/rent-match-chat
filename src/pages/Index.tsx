import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LegendaryLandingPage from "@/components/LegendaryLandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user profile to determine role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Redirect authenticated users based on their status
  useEffect(() => {
    if (!loading && !profileLoading && user && profile) {
      if (!profile.onboarding_completed) {
        // Redirect to onboarding if not completed
        console.log('Redirecting to onboarding - incomplete profile');
        navigate('/onboarding', { replace: true });
      } else if (profile.onboarding_completed) {
        // Redirect to dashboard if onboarding is complete
        const targetPath = profile.role === 'client' ? '/client/dashboard' : '/owner/dashboard';
        console.log('Redirecting to dashboard:', targetPath);
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, profile, loading, profileLoading, navigate]);

  // Show loading state while checking authentication
  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
        </div>
      </div>
    );
  }

  // Only show landing page if user is NOT authenticated
  if (!user || !profile?.onboarding_completed) {
    return (
      <div className="min-h-screen">
        <LegendaryLandingPage />
      </div>
    );
  }

  return null; // Will redirect via useEffect
};

export default Index;
