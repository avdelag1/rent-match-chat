
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/prodLogger';

export interface InterestedClient {
  id: string; // like id
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  listing: {
    id: string;
    title: string;
  };
}

/**
 * OWNER SIDE - Fetch users who liked owner's listings
 *
 * This hook uses the RLS policy "owners can see likes on their listings"
 * to fetch all likes where the target listing is owned by the current user.
 *
 * ARCHITECTURE:
 * - Single source of truth from likes table
 * - Uses Supabase subquery to filter by owner's listings
 * - Joins with profiles and listings for display data
 */
export function useOwnerInterestedClients() {
  return useQuery<InterestedClient[]>({
    queryKey: ['owner-interested-clients'],
    // Keep previous data during refetch to prevent UI blanking
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      const ownerId = userData.user.id;

      // First, get all listings owned by this user
      const { data: ownerListings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('owner_id', ownerId);

      if (listingsError) {
        logger.error('[useOwnerInterestedClients] Error fetching owner listings:', listingsError);
        throw listingsError;
      }

      if (!ownerListings || ownerListings.length === 0) {
        return [];
      }

      const listingIds = ownerListings.map(l => l.id);

      // CORRECT QUERY: Fetch likes on owner's listings with user and listing info
      const { data, error } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          user_id,
          target_listing_id
        `)
        .in('target_listing_id', listingIds)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[useOwnerInterestedClients] Error fetching likes:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch user profiles for all users who liked
      const userIds = [...new Set(data.map(like => like.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar')
        .in('id', userIds);

      if (profilesError) {
        logger.error('[useOwnerInterestedClients] Error fetching profiles:', profilesError);
      }

      // Fetch listing details
      const { data: listings, error: listingsDetailError } = await supabase
        .from('listings')
        .select('id, title')
        .in('id', listingIds);

      if (listingsDetailError) {
        logger.error('[useOwnerInterestedClients] Error fetching listing details:', listingsDetailError);
      }

      // Map profiles and listings to lookups
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const listingMap = new Map(listings?.map(l => [l.id, l]) || []);

      // Combine the data
      const interestedClients: InterestedClient[] = data
        .map(like => {
          const profile = profileMap.get(like.user_id);
          const listing = listingMap.get(like.target_listing_id);

          if (!profile || !listing) {
            return null;
          }

          return {
            id: like.id,
            created_at: like.created_at,
            user: {
              id: profile.id,
              full_name: profile.full_name || 'Anonymous',
              avatar: profile.avatar
            },
            listing: {
              id: listing.id,
              title: listing.title || 'Untitled Listing'
            }
          };
        })
        .filter((item): item is InterestedClient => item !== null);

      return interestedClients;
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Alternative hook that uses the view (if created)
 * This can be simpler but requires the view to be set up in the database
 */
export function useOwnerInterestedClientsView() {
  return useQuery<InterestedClient[]>({
    queryKey: ['owner-interested-clients-view'],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      const { data, error } = await supabase
        .from('listing_interested_clients')
        .select('*')
        .eq('owner_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[useOwnerInterestedClientsView] Error:', error);
        throw error;
      }

      return (data || []).map(row => ({
        id: row.like_id,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          full_name: row.full_name || 'Anonymous',
          avatar: row.avatar
        },
        listing: {
          id: row.target_listing_id,
          title: row.listing_title || 'Untitled Listing'
        }
      }));
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchInterval: 30000,
  });
}
