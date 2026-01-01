import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OwnerStats {
  activeProperties: number;
  totalInquiries: number;
  activeMatches: number;
  totalViews: number;
  totalLikes: number;
  responseRate: number;
}

export function useOwnerStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-stats', user?.id],
    queryFn: async (): Promise<OwnerStats> => {
      if (!user) throw new Error('User not authenticated');

      // Run all queries in parallel for faster loading
      const [
        propertiesResult,
        matchesResult,
        conversationsResult,
        listingsResult
      ] = await Promise.all([
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .eq('is_active', true),
        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id),
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('listings')
          .select('view_count, likes')
          .eq('owner_id', user.id)
      ]);

      const activeProperties = propertiesResult.count || 0;
      const totalMatches = matchesResult.count || 0;
      const activeConversations = conversationsResult.count || 0;
      
      const totalViews = listingsResult.data?.reduce((sum, listing) => sum + (listing.view_count || 0), 0) || 0;
      const totalLikes = listingsResult.data?.reduce((sum, listing) => sum + (listing.likes || 0), 0) || 0;

      // Calculate response rate
      const responseRate = totalMatches > 0 ? Math.round(activeConversations * 100 / totalMatches) : 0;

      return {
        activeProperties,
        totalInquiries: totalMatches,
        activeMatches: activeConversations,
        totalViews,
        totalLikes,
        responseRate
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}