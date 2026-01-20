
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';
import { logger } from '@/utils/prodLogger';

/**
 * Fetch liked properties using the CORRECT query pattern.
 *
 * ARCHITECTURE:
 * - This hook fetches ONLY from Supabase (single source of truth)
 * - Never derives likes from swipe state
 * - Never infers likes from cards
 *
 * The query uses Supabase's relation syntax to join likes with listings
 * in a single query, preventing race conditions and flicker.
 */
export function useLikedProperties() {
  return useQuery<Listing[]>({
    queryKey: ['liked-properties'],
    // INSTANT NAVIGATION: Keep previous data during refetch to prevent UI blanking
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      // CORRECT QUERY: Single fetch using Supabase relation syntax
      // This is the ONLY correct way to fetch liked listings
      const { data, error } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          listing:target_listing_id (*)
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[useLikedProperties] Error fetching likes:', error);
        throw error;
      }

      // If no likes found, return empty array
      if (!data || data.length === 0) {
        return [];
      }

      // Extract listings from the joined result, filter out nulls (deleted listings)
      const listings = data
        .map((like: any) => like.listing)
        .filter((listing: any): listing is Listing =>
          listing !== null && listing.is_active === true
        );

      return listings;
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 15000, // Refetch every 15 seconds for faster updates
  });
}
