import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadLikes() {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unread-likes', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };

      // Get user's role to determine what to count
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile?.role) return { count: 0 };

      let query;

      if (profile.role === 'owner') {
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
          console.error('Error fetching unread likes for owner:', error);
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
          console.error('Error fetching unread likes for client:', error);
          return { count: 0 };
        }

        return { count: count || 0 };
      }
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
