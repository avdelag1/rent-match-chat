
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';

export function useLikedProperties() {
  return useQuery<Listing[]>({
    queryKey: ['liked-properties'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Get liked listing IDs from likes table
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id, created_at, direction')
        .eq('user_id', user.user.id)
        .eq('direction', 'right')
        .order('created_at', { ascending: false });

      if (likesError) {
        throw likesError;
      }

      // If no likes found, check swipes table as backup
      if (!likes || likes.length === 0) {
        const { data: swipes, error: swipesError } = await supabase
          .from('swipes')
          .select('target_id, created_at')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false });

        if (swipesError) {
          throw swipesError;
        }

        if (swipes && swipes.length > 0) {
          const likedIds = swipes.map(s => s.target_id);

          const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('*')
            .in('id', likedIds)
            .eq('is_active', true);

          if (listingsError) {
            throw listingsError;
          }

          return (listings || []) as Listing[];
        }

        return [];
      }

      const likedIds = likes.map(l => l.target_id);

      // Get the actual listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('id', likedIds)
        .eq('is_active', true);

      if (listingsError) {
        throw listingsError;
      }
      
      return (listings || []) as Listing[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces deprecated cacheTime)
  });
}
