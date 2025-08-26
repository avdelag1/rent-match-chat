
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Lightweight type to avoid deep Supabase type inference
type UserSubscriptionResult = {
  id?: string;
  user_id?: string;
  status?: string;
  subscription_packages?: {
    features?: unknown;
  } | null;
} | null;

export function useSubscriptionPackages(userTier?: string) {
  return useQuery({
    queryKey: ['subscription-packages', userTier],
    queryFn: async () => {
      let query = supabase.from('subscription_packages').select('*');
      
      if (userTier) {
        query = query.eq('tier', userTier);
      }

      const { data, error } = await query.order('price', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUserSubscription() {
  return useQuery<UserSubscriptionResult>({
    queryKey: ['user-subscription'],
    queryFn: async (): Promise<UserSubscriptionResult> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Simplify the query to avoid complex type inference
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_packages(*)')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscriptionResult;
    },
  });
}

export function useHasPremiumFeature(feature: string) {
  const { data: subscription } = useUserSubscription();
  
  if (!subscription) return false;

  const featuresRaw = subscription.subscription_packages?.features;
  const features: string[] = Array.isArray(featuresRaw) ? (featuresRaw as string[]) : [];
  
  return features.includes(feature) || features.includes('all_features');
}

