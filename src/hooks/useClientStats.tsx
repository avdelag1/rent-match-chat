import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ClientStats {
  likesReceived: number; // Likes from owners
  matchesCount: number; // Mutual matches
  activeChats: number; // Active conversations
}

/**
 * Hook to fetch client statistics
 * - Likes received from property owners
 * - Total matches (mutual likes)
 * - Active chat conversations
 */
export function useClientStats() {
  const { user } = useAuth();

  return useQuery<ClientStats>({
    queryKey: ['client-stats', user?.id],
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    queryFn: async () => {
      if (!user?.id) {
        return { likesReceived: 0, matchesCount: 0, activeChats: 0 };
      }

      // Count likes received from owners (owner_likes table)
      const { count: likesReceived } = await supabase
        .from('owner_likes')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id);

      // Count mutual matches
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('is_mutual', true);

      // Count active conversations
      const { count: activeChats } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'active');

      return {
        likesReceived: likesReceived || 0,
        matchesCount: matchesCount || 0,
        activeChats: activeChats || 0,
      };
    },
  });
}
