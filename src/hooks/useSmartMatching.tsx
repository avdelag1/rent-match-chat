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

  // Price range matching with 20% flexibility
  if (preferences.min_price && preferences.max_price) {
    const priceFlexibility = 0.2;
    const adjustedMinPrice = preferences.min_price * (1 - priceFlexibility);
    const adjustedMaxPrice = preferences.max_price * (1 + priceFlexibility);
    const priceInRange = listing.price >= adjustedMinPrice && listing.price <= adjustedMaxPrice;
    criteria.push({
      weight: 20,
      matches: priceInRange,
      reason: `Price $${listing.price} within flexible budget`,
      incompatibleReason: `Price $${listing.price} outside flexible budget range`
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

  // Property type matching - only check if listing has property_type
  if (preferences.property_types?.length && listing.property_type) {
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

  // Location zone matching - only check if listing has location data
  if (preferences.location_zones?.length && (listing.tulum_location || listing.neighborhood)) {
    criteria.push({
      weight: 18,
      matches: preferences.location_zones.some(zone => 
        listing.tulum_location?.toLowerCase().includes(zone.toLowerCase()) ||
        listing.neighborhood?.toLowerCase().includes(zone.toLowerCase())
      ),
      reason: `Location matches preferred zones`,
      incompatibleReason: `Location not in preferred zones`
    });
  } else if (preferences.location_zones?.length && !listing.tulum_location && !listing.neighborhood) {
    // Don't penalize listings without location data
    criteria.push({
      weight: 18,
      matches: true,
      reason: 'Location not specified',
      incompatibleReason: ''
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
    queryKey: ['smart-listings'], // Removed excludeSwipedIds from key
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

        // Get ALL active listings - no exclusions
        const { data: listings, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('is_active', true)
          .limit(50);

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

        // Sort by match percentage - show all listings, even low matches
        const sortedListings = matchedListings
          .filter(listing => listing.matchPercentage >= 0)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 50); // Limit final results

        console.log(`Smart matching: ${sortedListings.length} listings. Top matches:`, 
          sortedListings.slice(0, 3).map(l => `${l.title?.slice(0, 30)}... (${l.matchPercentage}%)`));
        
        // Fallback: if no matches found but we have listings, show them all with default score
        if (sortedListings.length === 0 && listings.length > 0) {
          console.log('No smart matches found, showing all', listings.length, 'listings');
          return listings.map(listing => ({
            ...listing as Listing,
            matchPercentage: 20,
            matchReasons: ['General listing'],
            incompatibleReasons: []
          })).slice(0, 50);
        }

        return sortedListings;
      } catch (error) {
        console.error('Error in smart listing matching:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
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

        // Get client user IDs from user_roles table
        const { data: clientRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'client');

        console.log('useSmartClientMatching: Client roles result:', { count: clientRoles?.length, error: rolesError });
        if (rolesError) throw rolesError;
        if (!clientRoles?.length) {
          console.log('useSmartClientMatching: No client roles found');
          return [];
        }

        const clientUserIds = clientRoles.map(r => r.user_id);

        // Get ALL profiles for these client users - no exclusions based on swipes
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', clientUserIds)
          .eq('is_active', true)
          .neq('id', user.user.id) // Only exclude current owner
          .limit(50);

        console.log('useSmartClientMatching: Profiles result:', { count: profiles?.length, error: profileError });
        if (profileError) throw profileError;
        if (!profiles?.length) {
          console.log('useSmartClientMatching: No active client profiles found');
          return [];
        }

        // Fetch preferences for matching
        const { data: preferences } = await supabase
          .from('client_filter_preferences')
          .select('user_id, preferred_listing_types, lifestyle_tags, min_price, max_price')
          .in('user_id', clientUserIds);

        console.log('useSmartClientMatching: Preferences result:', { count: preferences?.length });

        const preferencesMap = new Map();
        preferences?.forEach(pref => {
          preferencesMap.set(pref.user_id, pref);
        });

        // Get owner's listing for matching (if provided)
        let listing: Listing | null = null;
        if (listingId) {
          const { data: listingData } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .eq('owner_id', user.user.id)
            .maybeSingle();
          listing = listingData as Listing;
        }

        // Calculate match scores
        const matchedClients: MatchedClientProfile[] = profiles.map(profile => {
          const clientPrefs = preferencesMap.get(profile.id);
          const match = listing 
            ? calculateClientMatch(listing, clientPrefs || {})
            : { percentage: 60, reasons: ['General compatibility'], incompatible: [] };

          return {
            id: Math.floor(Math.random() * 1000000), // Generate unique ID
            user_id: profile.id,
            name: profile.full_name || 'Anonymous',
            bio: profile.bio || '',
            age: profile.age || 0,
            gender: '',
            interests: profile.interests || [],
            preferred_activities: profile.preferred_activities || [],
            location: profile.city ? { city: profile.city } : {},
            lifestyle_tags: clientPrefs?.lifestyle_tags || [],
            profile_images: profile.images || [],
            preferred_listing_types: clientPrefs?.preferred_listing_types || ['rent'],
            budget_min: clientPrefs?.min_price || 0,
            budget_max: clientPrefs?.max_price || 100000,
            matchPercentage: match.percentage,
            matchReasons: match.reasons,
            incompatibleReasons: match.incompatible
          };
        });

        // Sort and filter
        const sortedClients = matchedClients
          .filter(client => client.matchPercentage >= 10)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 20);

        console.log('useSmartClientMatching: Returning', sortedClients.length, 'clients');
        return sortedClients;
      } catch (error) {
        console.error('Error in smart client matching:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}