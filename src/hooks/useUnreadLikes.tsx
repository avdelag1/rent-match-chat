import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/prodLogger';

export function useUnreadLikes() {
  const { user } = useAuth();
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unread-likes', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };

      // Get user's role to determine what to count
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const userRole = (profile as any)?.role;
      if (!userRole) return { count: 0 };

      let query;

      if (userRole === 'owner') {
        // Owners: Count likes on their listings
        // First get owner's listings
        const { data: listings } = await supabase
          .from('listings')
          .select('id')
          .eq('owner_id', user.id);

        if (!listings || listings.length === 0) return { count: 0 };

        const listingIds = listings.map(l => l.id);

        // Count likes on these listings
        const { count, error } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('target_id', listingIds)
          .eq('direction', 'right');

        if (error) {
          logger.error('Error fetching unread likes for owner:', error);
          return { count: 0 };
        }

        return { count: count || 0 };
      } else {
        // Clients: Count likes received on their profile
        const { count, error } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', user.id)
          .eq('direction', 'right');

        if (error) {
          logger.error('Error fetching unread likes for client:', error);
          return { count: 0 };
        }

        return { count: count || 0 };
      }
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

  // Real-time subscription for instant like updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unread-likes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
        },
        (payload) => {
          // Refetch on any new like - the query will filter appropriately
          debouncedRefetch();
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
