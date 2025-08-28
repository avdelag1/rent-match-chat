
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHasPremiumFeature } from '@/hooks/useSubscription';

export function useMessaging() {
  const hasPremiumMessaging = useHasPremiumFeature('messaging');
  
  return useQuery({
    queryKey: ['user-messaging-access'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { hasAccess: false, reason: 'not_authenticated' };

      // Check if user has premium messaging features
      if (!hasPremiumMessaging) {
        return { 
          hasAccess: false, 
          reason: 'premium_required',
          message: 'Upgrade to premium to unlock messaging features!'
        };
      }

      return { 
        hasAccess: true, 
        reason: 'premium_user',
        message: 'You have access to messaging!'
      };
    },
    enabled: !!hasPremiumMessaging
  });
}

export function useCanAccessMessaging() {
  const hasPremiumMessaging = useHasPremiumFeature('messaging');
  
  return {
    canAccess: hasPremiumMessaging,
    needsUpgrade: !hasPremiumMessaging
  };
}
