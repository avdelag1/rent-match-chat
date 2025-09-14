
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  address: string;
  city: string;
  neighborhood: string;
  property_type: string;
  beds: number;
  baths: number;
  square_footage: number;
  furnished: boolean;
  pet_friendly: boolean;
  owner_id: string;
  description: string;
  amenities: string[];
  status: string;
}

export function useListings(excludeSwipedIds: string[] = []) {
  return useQuery({
    queryKey: ['listings', excludeSwipedIds, 'with-filters'],
    queryFn: async () => {
      try {
        // Get current user's filter preferences for listing types
        const { data: user } = await supabase.auth.getUser();
        let preferredListingTypes = ['rent']; // Default to rent
        
        if (user.user) {
          const { data: preferences } = await supabase
            .from('client_filter_preferences')
            .select('preferred_listing_types')
            .eq('user_id', user.user.id)
            .maybeSingle();
          
          if (preferences?.preferred_listing_types?.length) {
            preferredListingTypes = preferences.preferred_listing_types;
          }
        }

        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('is_active', true);

        // Filter by listing types (rent/buy) based on user preferences
        if (preferredListingTypes.length > 0 && !preferredListingTypes.includes('both')) {
          query = query.in('listing_type', preferredListingTypes);
        }

        // Exclude swiped properties
        if (excludeSwipedIds.length > 0) {
          query = query.not('id', 'in', `(${excludeSwipedIds.join(',')})`);
        }

        query = query.limit(20);

        const { data: listings, error } = await query;
        if (error) {
          console.error('Listings query error:', error);
          throw error;
        }
        
        console.log(`Loaded ${listings?.length || 0} listings`);
        return (listings as Listing[]) || [];
      } catch (error) {
        console.error('Error in useListings:', error);
        // Return empty array instead of throwing to prevent UI crash
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
}

export function useSwipedListings() {
  return useQuery({
    queryKey: ['swipes'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        // Only exclude listings swiped within the last 5 days
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data: likes, error } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.user.id)
          .gte('created_at', fiveDaysAgo);

        if (error) {
          console.error('Swipes query error:', error);
          return [];
        }
        
        return likes?.map(l => l.target_id) || [];
      } catch (error) {
        console.error('Error in useSwipedListings:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
}
