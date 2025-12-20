
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  owner_id: string;
  description: string;
  status: string;
  
  // Mode and category
  category?: string;
  mode?: string;
  
  // Property fields
  address?: string;
  city?: string;
  neighborhood?: string;
  property_type?: string;
  beds?: number;
  baths?: number;
  square_footage?: number;
  furnished?: boolean;
  pet_friendly?: boolean;
  amenities?: string[];
  listing_type?: string;
  tulum_location?: string;
  lifestyle_compatible?: string[];
  
  // Common fields (vehicles)
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  latitude?: number;
  longitude?: number;
  
  // Yacht fields
  length_m?: number;
  berths?: number;
  max_passengers?: number;
  hull_material?: string;
  engines?: string;
  fuel_type?: string;
  equipment?: string[];
  rental_rates?: any;
  
  // Motorcycle fields
  mileage?: number;
  engine_cc?: number;
  transmission?: string;
  color?: string;
  license_required?: string;
  vehicle_type?: string;
  
  // Bicycle fields
  frame_size?: string;
  wheel_size?: number;
  frame_material?: string;
  brake_type?: string;
  gear_type?: string;
  electric_assist?: boolean;
  battery_range?: number;
  
  // Additional details
  description_short?: string;
  description_full?: string;
  
  // Timestamps
  updated_at?: string;
  created_at?: string;
}

export function useListings(excludeSwipedIds: string[] = [], options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['listings', excludeSwipedIds, 'with-filters'],
    queryFn: async () => {
      try {
        // Get current user's filter preferences for listing types
        const { data: user } = await supabase.auth.getUser();
        let preferredListingTypes = ['rent']; // Default to rent
        
        if (user.user) {
          const { data: preferences, error: prefError } = await supabase
            .from('client_filter_preferences')
            .select('preferred_listing_types')
            .eq('user_id', user.user.id)
            .maybeSingle();

          if (prefError) {
            console.error('Error fetching filter preferences:', prefError);
          }

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

        // Exclude swiped properties - use array directly for parameterized query
        if (excludeSwipedIds.length > 0) {
          query = query.not('id', 'in', `(${excludeSwipedIds.map(id => `"${id}"`).join(',')})`);
        }

        query = query.limit(20);

        const { data: listings, error } = await query;
        if (error) {
          console.error('Listings query error:', error);
          throw error;
        }

        return (listings as Listing[]) || [];
      } catch (error) {
        console.error('Error in useListings:', error);
        // Return empty array instead of throwing to prevent UI crash
        return [];
      }
    },
    enabled: options.enabled !== false,
    retry: 3,
    retryDelay: 1000,
  });
}

// Hook for owners to view their own listings (no filtering by listing type)
export function useOwnerListings() {
  return useQuery({
    queryKey: ['owner-listings'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          return [];
        }

        const { data: listings, error } = await supabase
          .from('listings')
          .select('*')
          .eq('owner_id', user.user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(100); // Prevent loading too many listings at once

        if (error) {
          console.error('Owner listings query error:', error);
          throw error;
        }

        return (listings as Listing[]) || [];
      } catch (error) {
        console.error('Error in useOwnerListings:', error);
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

        // Only exclude listings swiped within the last 1 day (reset after next day)
        const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

        const { data: likes, error } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.user.id)
          .gte('created_at', oneDayAgo);

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
