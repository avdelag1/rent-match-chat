import { useQuery } from '@tanstack/react-query';
import { useUserSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/prodLogger';

type PropertyLimits = {
  max_listings: number;
  unlimited: boolean;
};

const PLAN_PROPERTY_LIMITS: Record<string, PropertyLimits> = {
  'free': { max_listings: 1, unlimited: false },
  'PREMIUM + OWNER': { max_listings: 2, unlimited: false },
  'PREMIUM ++ OWNER': { max_listings: 5, unlimited: false },
  'PREMIUM MAX OWNER': { max_listings: 10, unlimited: false },
  'UNLIMITED OWNER': { max_listings: 0, unlimited: true },
};

export function usePropertyLimits() {
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription();
  
  // Get the current plan name
  const planName = subscription?.subscription_packages?.name || 'free';
  const limits = PLAN_PROPERTY_LIMITS[planName] || PLAN_PROPERTY_LIMITS['free'];
  
  // Query to get active property count
  const { data: activePropertyCount = 0 } = useQuery({
    queryKey: ['active-properties-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .eq('status', 'active');
      
      if (error) {
        logger.error('Error fetching property count:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user,
  });
  
  const isUnlimited = limits.unlimited;
  const maxListings = limits.max_listings;
  const remainingListings = isUnlimited ? 999999 : Math.max(0, maxListings - activePropertyCount);
  const canCreateMore = isUnlimited || remainingListings > 0;
  
  return {
    activePropertyCount,
    maxListings,
    remainingListings,
    canCreateMore,
    isUnlimited,
    currentPlan: planName,
  };
}
