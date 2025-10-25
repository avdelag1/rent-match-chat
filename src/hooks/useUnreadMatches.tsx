import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadMatches() {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unread-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };

      // Count mutual matches (where both users have liked each other)
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
        .eq('is_mutual', true);

      if (error) {
        console.error('Error fetching unread matches:', error);
        return { count: 0 };
      }

      return { count: count || 0 };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    unreadCount: data?.count || 0,
    isLoading,
    refetch,
  };
}
