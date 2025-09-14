import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClientStats {
  savedProperties: number;
  totalMatches: number;
  activeConversations: number;
  profileViews: number;
  swipesSent: number;
  matchRate: number;
}

export function useClientStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-stats', user?.id],
    queryFn: async (): Promise<ClientStats> => {
      if (!user) throw new Error('User not authenticated');

      // Get saved properties (favorites)
      const { count: savedProperties } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total matches
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('is_mutual', true);

      // Get active conversations
      const { count: activeConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'active');

      // Get total swipes sent (from matches table where client initiated)
      const { count: swipesSent } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .not('client_liked_at', 'is', null);

      // Calculate match rate
      const matchRate = swipesSent > 0 ? Math.round((totalMatches || 0) * 100 / swipesSent) : 0;

      // For profile views, we'd need analytics data - using a placeholder for now
      const profileViews = 0;

      return {
        savedProperties: savedProperties || 0,
        totalMatches: totalMatches || 0,
        activeConversations: activeConversations || 0,
        profileViews,
        swipesSent: swipesSent || 0,
        matchRate
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}