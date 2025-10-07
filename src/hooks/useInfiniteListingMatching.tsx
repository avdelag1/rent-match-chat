import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 10;

export interface MatchedListing {
  id: string;
  title: string;
  price: number;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  baths?: number;
  property_type?: string;
  city?: string;
  address?: string;
  neighborhood?: string;
  amenities?: string[];
  status?: string;
  is_active?: boolean;
  matchPercentage: number;
  matchReasons: string[];
  incompatibleReasons: string[];
  [key: string]: any;
}

function calculateListingMatch(preferences: any, listing: any) {
  let score = 0;
  let maxScore = 0;
  const reasons: string[] = [];
  const incompatible: string[] = [];

  // Price matching (weight: 30)
  maxScore += 30;
  if (preferences.min_price && preferences.max_price) {
    const listingPrice = listing.price || 0;
    if (listingPrice >= preferences.min_price && listingPrice <= preferences.max_price) {
      score += 30;
      reasons.push('Price matches your budget');
    } else {
      incompatible.push('Price outside your range');
    }
  }

  // Bedrooms (weight: 20)
  maxScore += 20;
  if (preferences.min_bedrooms) {
    if ((listing.bedrooms || 0) >= preferences.min_bedrooms) {
      score += 20;
      reasons.push('Has enough bedrooms');
    } else {
      incompatible.push('Not enough bedrooms');
    }
  }

  // Property type (weight: 15)
  maxScore += 15;
  if (preferences.property_types?.length > 0 && listing.property_type) {
    if (preferences.property_types.includes(listing.property_type)) {
      score += 15;
      reasons.push('Property type matches');
    }
  }

  // Amenities (weight: 20)
  maxScore += 20;
  if (preferences.required_amenities?.length > 0) {
    const listingAmenities = listing.amenities || [];
    const matchedAmenities = preferences.required_amenities.filter((amenity: string) =>
      listingAmenities.includes(amenity)
    );
    const amenityScore = (matchedAmenities.length / preferences.required_amenities.length) * 20;
    score += amenityScore;
    if (amenityScore > 10) {
      reasons.push(`Has ${matchedAmenities.length}/${preferences.required_amenities.length} amenities`);
    }
  }

  // Location proximity (weight: 15)
  maxScore += 15;
  if (preferences.preferred_locations?.length > 0 && listing.city) {
    if (preferences.preferred_locations.some((loc: string) => 
      listing.city?.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 15;
      reasons.push('In preferred location');
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  return { percentage, reasons, incompatible };
}

export function useInfiniteListingMatching(excludeSwipedIds: string[] = []) {
  return useInfiniteQuery({
    queryKey: ['infinite-listings', excludeSwipedIds],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { listings: [], nextPage: null };

      const { data: preferences } = await supabase
        .from('client_filter_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('is_active', true)
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      if (excludeSwipedIds.length > 0) {
        query = query.not('id', 'in', `(${excludeSwipedIds.join(',')})`);
      }

      const { data: listings, error } = await query;
      if (error) throw error;

      if (!listings?.length) {
        return { listings: [], nextPage: null };
      }

      const matchedListings = listings.map(listing => {
        const match = preferences 
          ? calculateListingMatch(preferences, listing)
          : { percentage: 50, reasons: ['No preferences set'], incompatible: [] };
        
        return {
          ...listing,
          matchPercentage: match.percentage,
          matchReasons: match.reasons,
          incompatibleReasons: match.incompatible
        };
      });

      const filteredListings = matchedListings
        .filter(listing => listing.matchPercentage >= 10)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      return {
        listings: filteredListings,
        nextPage: filteredListings.length === ITEMS_PER_PAGE ? pageParam + 1 : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    retry: 3,
    retryDelay: 1000,
  });
}
