import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingQuestionnaire } from '@/components/OnboardingQuestionnaire';
import { Skeleton } from '@/components/ui/skeleton';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'client' | 'owner' | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
      return;
    }

    if (user) {
      // Get user role and check onboarding status
      const fetchProfile = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, onboarding_completed')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            // If profile doesn't exist, try to get role from user metadata
            const role = user.user_metadata?.role;
            if (role === 'client' || role === 'owner') {
              setUserRole(role);
            } else {
              navigate('/', { replace: true });
            }
            return;
          }

          if (profile.onboarding_completed) {
            // User has already completed onboarding, redirect to dashboard
            const targetPath = profile.role === 'client' ? '/client/dashboard' : '/owner/dashboard';
            navigate(targetPath, { replace: true });
            return;
          }

          setUserRole(profile.role as 'client' | 'owner');
        } catch (error) {
          console.error('Error in onboarding:', error);
          navigate('/', { replace: true });
        } finally {
          setIsLoadingProfile(false);
        }
      };

      fetchProfile();
    }
  }, [user, loading, navigate]);

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-2 w-full" />
          <div className="space-y-4 mt-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return <OnboardingQuestionnaire userRole={userRole} />;
}