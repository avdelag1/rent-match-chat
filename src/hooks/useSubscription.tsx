
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Use the actual database schema types
export function useSubscriptionPackages(role?: 'client' | 'owner') {
  return useQuery({
    queryKey: ['subscription-packages', role],
    queryFn: async () => {
      let query = supabase.from('subscription_packages').select('*');
      
      if (role) {
        query = query.in('role', [role, 'universal']);
      }

      const { data, error } = await query.order('price', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useUserSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_packages (*)
        `)
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}

export function useHasPremiumFeature(feature: string) {
  const { data: subscription } = useUserSubscription();
  
  if (!subscription) return false;
  
  const features = subscription.subscription_packages?.features as string[] || [];
  return features.includes(feature) || features.includes('all_features');
}
