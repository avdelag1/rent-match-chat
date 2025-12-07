import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useCallback } from 'react';

export function useUnreadMatches() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    staleTime: 30000, // Data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to app
  });

  // Debounced refetch for real-time updates
  const debouncedRefetch = useCallback(() => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    refetchTimeoutRef.current = setTimeout(() => {
      refetch();
    }, 500);
  }, [refetch]);

  // Real-time subscription for instant updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unread-matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          // Check if this match involves the current user
          const newMatch = payload.new as any;
          const oldMatch = payload.old as any;

          if (
            newMatch?.client_id === user.id ||
            newMatch?.owner_id === user.id ||
            oldMatch?.client_id === user.id ||
            oldMatch?.owner_id === user.id
          ) {
            debouncedRefetch();
          }
        }
      )
      .subscribe();

    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [user?.id, debouncedRefetch]);

  return {
    unreadCount: data?.count || 0,
    isLoading,
    refetch,
  };
}
