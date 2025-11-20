import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientWithMatchScore {
  userId: string;
  matchScore: number;
  matchReasons: string[];
  budgetMatch: boolean;
  propertyTypeMatch: boolean;
  locationMatch: boolean;
  amenitiesMatch: number;
}

/**
 * Hook to filter and rank clients based on what they're looking for
 * AND what the owner offers (contextual filtering)
 */
export function useOwnerClientFiltering(ownerListingId?: string) {
  return useQuery({
    queryKey: ['owner-client-filtering', ownerListingId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get owner's listing details (what they offer)
      const { data: listing } = ownerListingId
        ? await supabase
            .from('listings')
            .select('*')
            .eq('id', ownerListingId)
            .single()
        : await supabase
            .from('listings')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

      if (!listing) {
        return { clients: [], totalMatches: 0 };
      }

      // Get all client filter preferences
      const { data: clientPreferences } = await supabase
        .from('client_filter_preferences')
        .select(`
          user_id,
          property_types,
          min_price,
          max_price,
          location_zones,
          amenities_required,
          min_bedrooms,
          max_bedrooms
        `);

      if (!clientPreferences) {
        return { clients: [], totalMatches: 0 };
      }

      // Score each client based on match with listing
      const scoredClients: ClientWithMatchScore[] = clientPreferences
        .map((pref) => {
          let score = 0;
          const reasons: string[] = [];

          // Budget matching (40 points)
          const listingPrice = listing.price || 0;
          if (listingPrice >= (pref.min_price || 0) && listingPrice <= (pref.max_price || 999999)) {
            score += 40;
            reasons.push('Budget match');
          }

          // Property type matching (30 points)
          const propertyTypeMatch = pref.property_types?.includes(listing.property_type || '');
          if (propertyTypeMatch) {
            score += 30;
            reasons.push(`Looking for ${listing.property_type}`);
          }

          // Location matching (20 points)
          const locationMatch = pref.location_zones?.some(zone => 
            listing.city?.toLowerCase().includes(zone.toLowerCase()) ||
            listing.neighborhood?.toLowerCase().includes(zone.toLowerCase())
          );
          if (locationMatch) {
            score += 20;
            reasons.push('Preferred location');
          }

          // Amenities matching (10 points)
          const amenitiesMatch = pref.amenities_required?.filter(amenity =>
            listing.amenities?.includes(amenity)
          ).length || 0;
          score += Math.min(amenitiesMatch * 2, 10);
          if (amenitiesMatch > 0) {
            reasons.push(`${amenitiesMatch} matching amenities`);
          }

          return {
            userId: pref.user_id,
            matchScore: score,
            matchReasons: reasons,
            budgetMatch: score >= 40,
            propertyTypeMatch: propertyTypeMatch || false,
            locationMatch: locationMatch || false,
            amenitiesMatch,
          };
        })
        .filter(client => client.matchScore > 0) // Only return clients with some match
        .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

      return {
        clients: scoredClients,
        totalMatches: scoredClients.length,
        listing: {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          propertyType: listing.property_type,
          city: listing.city,
          neighborhood: listing.neighborhood,
        },
      };
    },
    enabled: !!ownerListingId,
  });
}
