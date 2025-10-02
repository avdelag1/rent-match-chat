import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';
import { ClientFilterPreferences } from './useClientFilterPreferences';

export interface MatchedListing extends Listing {
  matchPercentage: number;
  matchReasons: string[];
  incompatibleReasons: string[];
}

export interface MatchedClientProfile {
  id: number;
  user_id: string;
  name: string;
  bio: string;
  age: number;
  gender: string;
  interests: string[];
  preferred_activities: string[];
  location: any;
  lifestyle_tags: string[];
  profile_images: string[];
  preferred_listing_types?: string[];
  budget_min?: number;
  budget_max?: number;
  matchPercentage: number;
  matchReasons: string[];
  incompatibleReasons: string[];
}

// Calculate match percentage between client preferences and listing
function calculateListingMatch(preferences: ClientFilterPreferences, listing: Listing): {
  percentage: number;
  reasons: string[];
  incompatible: string[];
} {
  const criteria = [];
  const matchedReasons = [];
  const incompatibleReasons = [];

  // Critical filters (listing type) - if this fails, show 0% match
  if (preferences.preferred_listing_types?.length) {
    if (!preferences.preferred_listing_types.includes(listing.listing_type || 'rent')) {
      return {
        percentage: 0,
        reasons: [],
        incompatible: [`Looking for ${preferences.preferred_listing_types.join('/')} but this is for ${listing.listing_type}`]
      };
    }
    matchedReasons.push(`Matches ${listing.listing_type} preference`);
  }

  // Price range matching
  if (preferences.min_price && preferences.max_price) {
    criteria.push({
      weight: 20,
      matches: listing.price >= preferences.min_price && listing.price <= preferences.max_price,
      reason: `Price ${listing.price} within budget ${preferences.min_price}-${preferences.max_price}`,
      incompatibleReason: `Price ${listing.price} outside budget ${preferences.min_price}-${preferences.max_price}`
    });
  }

  // Bedrooms matching
  if (preferences.min_bedrooms && preferences.max_bedrooms) {
    criteria.push({
      weight: 15,
      matches: listing.beds >= preferences.min_bedrooms && listing.beds <= preferences.max_bedrooms,
      reason: `${listing.beds} beds matches requirement (${preferences.min_bedrooms}-${preferences.max_bedrooms})`,
      incompatibleReason: `${listing.beds} beds outside range (${preferences.min_bedrooms}-${preferences.max_bedrooms})`
    });
  }

  // Bathrooms matching
  if (preferences.min_bathrooms) {
    criteria.push({
      weight: 10,
      matches: listing.baths >= preferences.min_bathrooms,
      reason: `${listing.baths} baths meets minimum ${preferences.min_bathrooms}`,
      incompatibleReason: `Only ${listing.baths} baths, need minimum ${preferences.min_bathrooms}`
    });
  }

  // Property type matching
  if (preferences.property_types?.length) {
    criteria.push({
      weight: 15,
      matches: preferences.property_types.includes(listing.property_type),
      reason: `Property type ${listing.property_type} matches preferences`,
      incompatibleReason: `Property type ${listing.property_type} not in preferred types`
    });
  }

  // Pet friendly matching
  if (preferences.pet_friendly_required) {
    criteria.push({
      weight: 12,
      matches: listing.pet_friendly,
      reason: 'Pet-friendly property',
      incompatibleReason: 'Not pet-friendly but pets required'
    });
  }

  // Furnished matching
  if (preferences.furnished_required) {
    criteria.push({
      weight: 10,
      matches: listing.furnished,
      reason: 'Furnished property',
      incompatibleReason: 'Not furnished but furnished required'
    });
  }

  // Location zone matching
  if (preferences.location_zones?.length) {
    criteria.push({
      weight: 18,
      matches: preferences.location_zones.some(zone => 
        listing.tulum_location?.toLowerCase().includes(zone.toLowerCase()) ||
        listing.neighborhood?.toLowerCase().includes(zone.toLowerCase())
      ),
      reason: `Location matches preferred zones`,
      incompatibleReason: `Location not in preferred zones`
    });
  }

  // Amenities matching
  if (preferences.amenities_required?.length) {
    const matchingAmenities = listing.amenities?.filter(amenity => 
      preferences.amenities_required?.includes(amenity)
    ) || [];
    const amenityMatchRate = matchingAmenities.length / preferences.amenities_required.length;
    
    criteria.push({
      weight: 10,
      matches: amenityMatchRate >= 0.5, // At least 50% of required amenities
      reason: `${matchingAmenities.length}/${preferences.amenities_required.length} required amenities available`,
      incompatibleReason: `Only ${matchingAmenities.length}/${preferences.amenities_required.length} required amenities available`
    });
  }

  // Calculate weighted percentage
  let totalWeight = 0;
  let matchedWeight = 0;

  criteria.forEach(criterion => {
    totalWeight += criterion.weight;
    if (criterion.matches) {
      matchedWeight += criterion.weight;
      matchedReasons.push(criterion.reason);
    } else {
      incompatibleReasons.push(criterion.incompatibleReason);
    }
  });

  const percentage = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;

  return {
    percentage,
    reasons: matchedReasons,
    incompatible: incompatibleReasons
  };
}

export function useSmartListingMatching(excludeSwipedIds: string[] = []) {
  return useQuery({
    queryKey: ['smart-listings', excludeSwipedIds],
    queryFn: async () => {
      try {
        // Get current user's preferences
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        const { data: preferences } = await supabase
          .from('client_filter_preferences')
          .select('*')
          .eq('user_id', user.user.id)
          .maybeSingle();

        // Get active listings
        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('is_active', true);

        // Exclude swiped properties
        if (excludeSwipedIds.length > 0) {
          query = query.not('id', 'in', `(${excludeSwipedIds.join(',')})`);
        }

        query = query.limit(50); // Get more listings for better matching

        const { data: listings, error } = await query;
        if (error) throw error;

        if (!preferences || !listings?.length) {
          return (listings as Listing[])?.map(listing => ({
            ...listing,
            matchPercentage: 50,
            matchReasons: ['No preferences set'],
            incompatibleReasons: []
          })) || [];
        }

        // Calculate match percentage for each listing
        const matchedListings: MatchedListing[] = listings.map(listing => {
          const match = calculateListingMatch(preferences, listing as Listing);
          return {
            ...listing as Listing,
            matchPercentage: match.percentage,
            matchReasons: match.reasons,
            incompatibleReasons: match.incompatible
          };
        });

        // Sort by match percentage (highest first) and filter out 0% matches
        const sortedListings = matchedListings
          .filter(listing => listing.matchPercentage >= 10) // Minimum 10% match
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 20); // Limit final results

        console.log(`Matched ${sortedListings.length} listings with min 10% compatibility`);
        return sortedListings;
      } catch (error) {
        console.error('Error in smart listing matching:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
}

// Calculate match between owner preferences (from listing) and client profile
function calculateClientMatch(listing: Listing, clientProfile: any): {
  percentage: number;
  reasons: string[];
  incompatible: string[];
} {
  const criteria = [];
  const matchedReasons = [];
  const incompatibleReasons = [];

  // Budget compatibility (if client has income info)
  if (clientProfile.budget_max && listing.price) {
    criteria.push({
      weight: 25,
      matches: clientProfile.budget_max >= listing.price,
      reason: `Budget ${clientProfile.budget_max} covers rent ${listing.price}`,
      incompatibleReason: `Budget ${clientProfile.budget_max} below rent ${listing.price}`
    });
  }

  // Lifestyle compatibility
  if (listing.lifestyle_compatible?.length && clientProfile.lifestyle_compatibility?.length) {
    const matchingLifestyle = clientProfile.lifestyle_compatibility.filter((tag: string) => 
      listing.lifestyle_compatible.includes(tag)
    );
    const lifestyleMatchRate = matchingLifestyle.length / listing.lifestyle_compatible.length;
    
    criteria.push({
      weight: 20,
      matches: lifestyleMatchRate >= 0.3,
      reason: `${matchingLifestyle.length} shared lifestyle interests`,
      incompatibleReason: `Limited lifestyle compatibility`
    });
  }

  // Pet compatibility
  if (listing.pet_friendly !== null && clientProfile.pet_ownership !== null) {
    criteria.push({
      weight: 15,
      matches: !clientProfile.pet_ownership || listing.pet_friendly,
      reason: listing.pet_friendly ? 'Pet-friendly property' : 'No pets, no restrictions',
      incompatibleReason: 'Has pets but property not pet-friendly'
    });
  }

  // Age appropriateness (if property has age preferences)
  if (clientProfile.age) {
    const ageAppropriate = clientProfile.age >= 18 && clientProfile.age <= 65;
    criteria.push({
      weight: 10,
      matches: ageAppropriate,
      reason: `Age ${clientProfile.age} appropriate for rental`,
      incompatibleReason: `Age ${clientProfile.age} may not meet requirements`
    });
  }

  // Verification status
  if (clientProfile.income_verification || clientProfile.background_check_completed) {
    criteria.push({
      weight: 15,
      matches: true,
      reason: 'Verified client profile',
      incompatibleReason: ''
    });
  }

  // Communication style match
  if (clientProfile.communication_style) {
    criteria.push({
      weight: 15,
      matches: true, // Assume all communication styles are acceptable
      reason: `${clientProfile.communication_style} communication style`,
      incompatibleReason: ''
    });
  }

  // Calculate weighted percentage
  let totalWeight = 0;
  let matchedWeight = 0;

  criteria.forEach(criterion => {
    totalWeight += criterion.weight;
    if (criterion.matches) {
      matchedWeight += criterion.weight;
      if (criterion.reason) matchedReasons.push(criterion.reason);
    } else {
      if (criterion.incompatibleReason) incompatibleReasons.push(criterion.incompatibleReason);
    }
  });

  const percentage = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 70;

  return {
    percentage,
    reasons: matchedReasons,
    incompatible: incompatibleReasons
  };
}

export function useSmartClientMatching(listingId?: string) {
  return useQuery({
    queryKey: ['smart-clients', listingId],
    queryFn: async () => {
      try {
        console.log('useSmartClientMatching: Starting fetch...');
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          console.log('useSmartClientMatching: No authenticated user');
          return [];
        }
        console.log('useSmartClientMatching: Authenticated user:', user.user.id);

        // Get owner's listing for matching criteria
        let listing: Listing | null = null;
        if (listingId) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .eq('owner_id', user.user.id)
            .single();
          listing = listingData as Listing;
        }

        // Get client profiles
        console.log('useSmartClientMatching: Fetching client profiles...');
        const { data: profiles, error: profileError } = await supabase
          .from('client_profiles')
          .select('*')
          .limit(50);

        console.log('useSmartClientMatching: Profile query result:', { count: profiles?.length, error: profileError });
        if (profileError) {
          console.error('useSmartClientMatching: Database error:', profileError);
          throw profileError;
        }
        if (!profiles?.length) {
          console.log('useSmartClientMatching: No profiles found');
          return [];
        }

        // Fetch preferences for all client profiles
        const userIds = profiles.map(p => p.user_id);
        const { data: preferences, error: prefError } = await supabase
          .from('client_filter_preferences')
          .select('user_id, preferred_listing_types, lifestyle_tags, min_price, max_price')
          .in('user_id', userIds);

        console.log('useSmartClientMatching: Preferences query result:', { count: preferences?.length, error: prefError });

        // Create a map of user_id to preferences
        const preferencesMap = new Map();
        preferences?.forEach(pref => {
          preferencesMap.set(pref.user_id, pref);
        });

        // Calculate match percentage for each client
        const matchedClients: MatchedClientProfile[] = profiles.map(profile => {
          const clientPrefs = preferencesMap.get(profile.user_id);
          const match = listing 
            ? calculateClientMatch(listing, clientPrefs || {})
            : { percentage: 60, reasons: ['General compatibility'], incompatible: [] };

          return {
            id: profile.id,
            user_id: profile.user_id || '',
            name: profile.name || 'Anonymous',
            bio: profile.bio || '',
            age: profile.age || 0,
            gender: profile.gender || '',
            interests: profile.interests || [],
            preferred_activities: profile.preferred_activities || [],
            location: profile.location || {},
            lifestyle_tags: clientPrefs?.lifestyle_tags || [],
            profile_images: profile.profile_images || [],
            preferred_listing_types: clientPrefs?.preferred_listing_types || ['rent'],
            budget_min: clientPrefs?.min_price || 0,
            budget_max: clientPrefs?.max_price || 100000,
            matchPercentage: match.percentage,
            matchReasons: match.reasons,
            incompatibleReasons: match.incompatible
          };
        });

        // Sort by match percentage and filter
        const sortedClients = matchedClients
          .filter(client => client.matchPercentage >= 10)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 20);

        console.log('useSmartClientMatching: Returning', sortedClients.length, 'sorted clients with preferences');
        return sortedClients;
      } catch (error) {
        console.error('Error in smart client matching:', error);
        return [];
      }
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
  });
}