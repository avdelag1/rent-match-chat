
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';
import { logger } from '@/utils/prodLogger';

export function useLikedProperties() {
  return useQuery<Listing[]>({
    queryKey: ['liked-properties'],
    // INSTANT NAVIGATION: Keep previous data during refetch to prevent UI blanking
    placeholderData: (prev) => prev,
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
        logger.error('[useLikedProperties] Error fetching likes:', likesError);
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
          logger.error('[useLikedProperties] Error fetching swipes:', swipesError);
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
            logger.error('[useLikedProperties] Error fetching listings from swipes:', listingsError);
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
        logger.error('[useLikedProperties] Error fetching listings:', listingsError);
        throw listingsError;
      }

      return (listings || []) as Listing[];
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 15000, // Refetch every 15 seconds for faster updates
  });
}
