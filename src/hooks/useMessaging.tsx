
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHasPremiumFeature } from '@/hooks/useSubscription';

export function useMessaging() {
  return useQuery({
    queryKey: ['user-messaging-access'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { hasAccess: false, reason: 'not_authenticated' };

      // Allow messaging for all authenticated users
      return { 
        hasAccess: true, 
        reason: 'authenticated_user',
        message: 'You have access to messaging!'
      };
    }
  });
}

export function useCanAccessMessaging() {
  return {
    canAccess: true, // Allow messaging for all users
    needsUpgrade: false
  };
}
