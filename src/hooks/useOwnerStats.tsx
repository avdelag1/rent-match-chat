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

      // Get active properties count
      const { count: activeProperties } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('is_active', true);

      // Get total matches/inquiries
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // Get active conversations
      const { count: activeConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'active');

      // Get total views from all properties
      const { data: viewsData } = await supabase
        .from('listings')
        .select('view_count')
        .eq('owner_id', user.id);

      const totalViews = viewsData?.reduce((sum, listing) => sum + (listing.view_count || 0), 0) || 0;

      // Get total likes from all properties
      const { data: likesData } = await supabase
        .from('listings')
        .select('likes')
        .eq('owner_id', user.id);

      const totalLikes = likesData?.reduce((sum, listing) => sum + (listing.likes || 0), 0) || 0;

      // Calculate response rate (simplified - based on active conversations vs total matches)
      const responseRate = totalMatches > 0 ? Math.round((activeConversations || 0) * 100 / totalMatches) : 0;

      return {
        activeProperties: activeProperties || 0,
        totalInquiries: totalMatches || 0,
        activeMatches: activeConversations || 0,
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