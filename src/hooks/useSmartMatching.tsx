import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Listing } from './useListings';
import { ClientFilterPreferences } from './useClientFilterPreferences';
import { useVisibilityRanking } from './useVisibilityRanking';

export interface MatchedListing extends Listing {
  matchPercentage: number;
  matchReasons: string[];
  incompatibleReasons: string[];
}

export interface MatchedClientProfile {
  id: number;
  user_id: string;
  name: string;
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
  city?: string;
  avatar_url?: string;
  verified?: boolean;
  
  // Category-specific preferences
  moto_types?: string[];
  bicycle_types?: string[];
  yacht_types?: string[];
  vehicle_types?: string[];
  vehicle_body_types?: string[];
  budget?: { min?: number; max?: number };
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

export interface ListingFilters {
  category?: 'property' | 'motorcycle' | 'bicycle' | 'yacht';
  listingType?: 'rent' | 'sale' | 'both';
  propertyType?: string[];
  priceRange?: [number, number];
  bedrooms?: number[];
  bathrooms?: number[];
  amenities?: string[];
  distance?: number;
  // Additional filters
  premiumOnly?: boolean;
  verified?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  lifestyleTags?: string[];
  dietaryPreferences?: string[];
}

export function useSmartListingMatching(
  excludeSwipedIds: string[] = [], 
  filters?: ListingFilters,
  page: number = 0,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ['smart-listings', filters, page], // Include page in query key
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

        // Fetch ALL swiped listings (both left and right) to exclude them
        // This prevents cards from reappearing after sign in
        const { data: swipedListings, error: swipesError } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.user.id);

        // If likes table has permission issues, just continue without filtering
        const swipedListingIds = new Set(!swipesError ? (swipedListings?.map(like => like.target_id) || []) : []);

        // Build query with filters - simplified to avoid foreign key issues
        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('is_active', true);

        // Apply filter-based query constraints
        if (filters) {
          // Category filter
          if (filters.category) {
            query = query.eq('category', filters.category);
          }

          // Listing type filter
          if (filters.listingType && filters.listingType !== 'both') {
            query = query.eq('listing_type', filters.listingType);
          }

          // Price range filter
          if (filters.priceRange) {
            query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
          }

          // Property type filter (for properties)
          if (filters.propertyType && filters.propertyType.length > 0) {
            query = query.in('property_type', filters.propertyType);
          }

          // Bedrooms filter
          if (filters.bedrooms && filters.bedrooms.length > 0) {
            const minBeds = Math.min(...filters.bedrooms);
            query = query.gte('beds', minBeds);
          }

          // Bathrooms filter
          if (filters.bathrooms && filters.bathrooms.length > 0) {
            const minBaths = Math.min(...filters.bathrooms);
            query = query.gte('baths', minBaths);
          }

          // Pet friendly filter
          if (filters.petFriendly) {
            query = query.eq('pet_friendly', true);
          }

          // Furnished filter
          if (filters.furnished) {
            query = query.eq('furnished', true);
          }

          // Verified filter (owner has verified documents)
          if (filters.verified) {
            query = query.eq('has_verified_documents', true);
          }

          // Premium only filter (owner has premium subscription)
          // This will be applied client-side after we get subscription data
        }

        // Apply pagination
        const start = page * pageSize;
        const end = start + pageSize - 1;
        const { data: listings, error } = await query.range(start, end);

        if (error) {
          // Only log non-RLS errors to avoid console spam
          if (error.code !== '42501' && error.code !== 'PGRST301') {
            console.error('[SmartMatching] Error fetching listings:', error.message);
          }
          throw error;
        }

        if (!listings?.length) {
          return [];
        }

        // Apply client-side filters for amenities (can't be done in SQL easily with JSONB)
        let filteredListings = listings as unknown as Listing[];
        if (filters?.amenities && filters.amenities.length > 0) {
          filteredListings = filteredListings.filter(listing => {
            const listingAmenities = listing.amenities || [];
            return filters.amenities!.some(amenity => listingAmenities.includes(amenity));
          });
        }

        // Premium only filter - check if owner has premium subscription
        if (filters?.premiumOnly) {
          filteredListings = filteredListings.filter(listing => {
            const ownerData = (listing as any).owner;
            const subscriptionData = ownerData?.user_subscriptions?.[0]?.subscription_packages;
            const tier = subscriptionData?.tier || 'free';
            return tier !== 'free' && tier !== 'basic';
          });
        }

        // Filter out already-swiped listings (both likes and dislikes)
        filteredListings = filteredListings.filter(listing =>
          !swipedListingIds.has(listing.id)
        );

        if (!preferences) {
          return filteredListings.map(listing => ({
            ...listing,
            matchPercentage: 50,
            matchReasons: ['No preferences set'],
            incompatibleReasons: []
          }));
        }

        // Calculate match percentage for each listing
        const matchedListings: MatchedListing[] = filteredListings.map(listing => {
          const match = calculateListingMatch(preferences, listing as Listing);

          // Extract owner's subscription tier for premium boost
          const ownerData = (listing as any).owner;
          const subscriptionData = ownerData?.user_subscriptions?.[0]?.subscription_packages;
          const tier = subscriptionData?.tier || 'free';
          const visibilityBoost = subscriptionData?.visibility_boost || 0;
          const priorityMatching = subscriptionData?.priority_matching || false;

          // Apply premium boost to match percentage
          let boostedPercentage = match.percentage;
          if (priorityMatching && visibilityBoost > 0) {
            // Premium boost: add up to 20 points based on visibility boost (0.25-1.0 -> 5-20 points)
            const boostPoints = Math.min(20, visibilityBoost * 20);
            boostedPercentage = Math.min(100, match.percentage + boostPoints);

            if (boostPoints > 0) {
              match.reasons.push(`Premium listing boost: +${boostPoints}%`);
            }
          }

          return {
            ...listing as Listing,
            matchPercentage: boostedPercentage,
            matchReasons: match.reasons,
            incompatibleReasons: match.incompatible,
            _premiumTier: tier, // Store for sorting
            _visibilityBoost: visibilityBoost
          };
        });

        // Sort by premium tier first, then match percentage
        const sortedListings = matchedListings
          .filter(listing => listing.matchPercentage >= 0)
          .sort((a, b) => {
            // Premium tiers get priority
            const tierOrder: Record<string, number> = {
              unlimited: 1,
              premium_plus: 2,
              premium: 3,
              basic: 4,
              free: 5
            };

            const tierA = tierOrder[(a as any)._premiumTier] || 5;
            const tierB = tierOrder[(b as any)._premiumTier] || 5;

            // If different tiers, prioritize better tier
            if (tierA !== tierB) {
              return tierA - tierB;
            }

            // Same tier: sort by match percentage
            return b.matchPercentage - a.matchPercentage;
          });
        
        // Fallback: if no matches found but we have listings, show them all with default score
        if (sortedListings.length === 0 && filteredListings.length > 0) {
          return filteredListings.map(listing => ({
            ...listing as Listing,
            matchPercentage: 20,
            matchReasons: ['General listing'],
            incompatibleReasons: []
          }));
        }

        return sortedListings;
      } catch (error) {
        console.error('Error in smart listing matching:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false, // Disabled to prevent flickering on tab switch
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}

// Calculate match between owner preferences and client profile
function calculateClientMatch(ownerPrefs: any, clientProfile: any): {
  percentage: number;
  reasons: string[];
  incompatible: string[];
} {
  const criteria = [];
  const matchedReasons = [];
  const incompatibleReasons = [];

  // Budget compatibility
  if (ownerPrefs.min_budget || ownerPrefs.max_budget) {
    const budgetMax = clientProfile.budget_max ? Number(clientProfile.budget_max) : null;
    const monthlyIncome = clientProfile.monthly_income ? Number(clientProfile.monthly_income) : null;
    const clientBudget = budgetMax || monthlyIncome;

    if (clientBudget) {
      const budgetInRange = (!ownerPrefs.min_budget || clientBudget >= ownerPrefs.min_budget) &&
                           (!ownerPrefs.max_budget || clientBudget <= ownerPrefs.max_budget);
      criteria.push({
        weight: 20,
        matches: budgetInRange,
        reason: `Budget $${clientBudget} in range`,
        incompatibleReason: `Budget $${clientBudget} outside range`
      });
    }
  }

  // Gender matching
  if (ownerPrefs.selected_genders?.length && !ownerPrefs.selected_genders.includes('Any Gender')) {
    const genderMatch = clientProfile.gender && ownerPrefs.selected_genders.includes(clientProfile.gender);
    criteria.push({
      weight: 10,
      matches: genderMatch,
      reason: `Gender ${clientProfile.gender} matches preferences`,
      incompatibleReason: `Gender ${clientProfile.gender} not in preferred list`
    });
  }

  // Nationality matching
  if (ownerPrefs.selected_nationalities?.length && !ownerPrefs.selected_nationalities.includes('Any Nationality')) {
    const nationalityMatch = clientProfile.nationality && ownerPrefs.selected_nationalities.includes(clientProfile.nationality);
    criteria.push({
      weight: 8,
      matches: nationalityMatch,
      reason: `Nationality ${clientProfile.nationality} matches`,
      incompatibleReason: `Nationality ${clientProfile.nationality} not preferred`
    });
  }

  // Languages matching - client speaks at least one preferred language
  if (ownerPrefs.selected_languages?.length && clientProfile.languages?.length) {
    const sharedLanguages = clientProfile.languages.filter((lang: string) =>
      ownerPrefs.selected_languages.includes(lang)
    );
    const hasLanguageMatch = sharedLanguages.length > 0;
    criteria.push({
      weight: 5,
      matches: hasLanguageMatch,
      reason: `Speaks ${sharedLanguages.join(', ')}`,
      incompatibleReason: 'No shared languages'
    });
  }

  // Relationship status matching
  if (ownerPrefs.selected_relationship_status?.length && !ownerPrefs.selected_relationship_status.includes('Any Status')) {
    const statusMatch = clientProfile.relationship_status &&
                       ownerPrefs.selected_relationship_status.includes(clientProfile.relationship_status);
    criteria.push({
      weight: 10,
      matches: statusMatch,
      reason: `${clientProfile.relationship_status} matches preference`,
      incompatibleReason: `${clientProfile.relationship_status} not preferred`
    });
  }

  // Children compatibility
  if (ownerPrefs.allows_children !== undefined && ownerPrefs.allows_children !== null) {
    const childrenMatch = !clientProfile.has_children || ownerPrefs.allows_children;
    criteria.push({
      weight: 12,
      matches: childrenMatch,
      reason: ownerPrefs.allows_children ? 'Children welcome' : 'No children, no restrictions',
      incompatibleReason: 'Has children but not allowed'
    });
  }

  // Smoking habit matching
  if (ownerPrefs.smoking_habit && ownerPrefs.smoking_habit !== 'Any') {
    const smokingMatch = !clientProfile.smoking_habit ||
                        clientProfile.smoking_habit === 'Non-Smoker' ||
                        ownerPrefs.smoking_habit === clientProfile.smoking_habit;
    criteria.push({
      weight: 15,
      matches: smokingMatch,
      reason: `Smoking: ${clientProfile.smoking_habit || 'Non-Smoker'}`,
      incompatibleReason: `Smoking habits incompatible`
    });
  }

  // Drinking habit matching
  if (ownerPrefs.drinking_habit && ownerPrefs.drinking_habit !== 'Any') {
    const drinkingMatch = !clientProfile.drinking_habit ||
                         clientProfile.drinking_habit === 'Non-Drinker' ||
                         ownerPrefs.drinking_habit === clientProfile.drinking_habit;
    criteria.push({
      weight: 10,
      matches: drinkingMatch,
      reason: `Drinking: ${clientProfile.drinking_habit || 'Non-Drinker'}`,
      incompatibleReason: `Drinking habits incompatible`
    });
  }

  // Cleanliness level matching
  if (ownerPrefs.cleanliness_level && ownerPrefs.cleanliness_level !== 'Any') {
    const cleanlinessMatch = !clientProfile.cleanliness_level ||
                            ownerPrefs.cleanliness_level === clientProfile.cleanliness_level;
    criteria.push({
      weight: 12,
      matches: cleanlinessMatch,
      reason: `Cleanliness: ${clientProfile.cleanliness_level || 'Standard'}`,
      incompatibleReason: `Cleanliness standards don't match`
    });
  }

  // Noise tolerance matching
  if (ownerPrefs.noise_tolerance && ownerPrefs.noise_tolerance !== 'Any') {
    const noiseMatch = !clientProfile.noise_tolerance ||
                      ownerPrefs.noise_tolerance === clientProfile.noise_tolerance;
    criteria.push({
      weight: 8,
      matches: noiseMatch,
      reason: `Noise tolerance compatible`,
      incompatibleReason: `Noise tolerance incompatible`
    });
  }

  // Work schedule matching
  if (ownerPrefs.work_schedule && ownerPrefs.work_schedule !== 'Any') {
    const scheduleMatch = !clientProfile.work_schedule ||
                         ownerPrefs.work_schedule === clientProfile.work_schedule;
    criteria.push({
      weight: 10,
      matches: scheduleMatch,
      reason: `Work schedule: ${clientProfile.work_schedule || 'Flexible'}`,
      incompatibleReason: `Work schedules incompatible`
    });
  }

  // Dietary preferences matching
  if (ownerPrefs.selected_dietary_preferences?.length && clientProfile.dietary_preferences?.length) {
    const sharedDiets = clientProfile.dietary_preferences.filter((diet: string) =>
      ownerPrefs.selected_dietary_preferences.includes(diet)
    );
    const hasDietMatch = sharedDiets.length > 0;
    criteria.push({
      weight: 5,
      matches: hasDietMatch,
      reason: `Shared diets: ${sharedDiets.join(', ')}`,
      incompatibleReason: 'No dietary compatibility'
    });
  }

  // Personality traits matching
  if (ownerPrefs.selected_personality_traits?.length && clientProfile.personality_traits?.length) {
    const sharedTraits = clientProfile.personality_traits.filter((trait: string) =>
      ownerPrefs.selected_personality_traits.includes(trait)
    );
    const matchRate = sharedTraits.length / ownerPrefs.selected_personality_traits.length;
    criteria.push({
      weight: 8,
      matches: matchRate >= 0.3, // At least 30% trait overlap
      reason: `${sharedTraits.length} shared personality traits`,
      incompatibleReason: 'Personality traits don\'t align'
    });
  }

  // Interests matching
  if (ownerPrefs.selected_interests?.length && clientProfile.interest_categories?.length) {
    const sharedInterests = clientProfile.interest_categories.filter((interest: string) =>
      ownerPrefs.selected_interests.includes(interest)
    );
    const matchRate = sharedInterests.length / ownerPrefs.selected_interests.length;
    criteria.push({
      weight: 10,
      matches: matchRate >= 0.2, // At least 20% interest overlap
      reason: `${sharedInterests.length} shared interests`,
      incompatibleReason: 'Few shared interests'
    });
  }

  // Age range matching
  if (ownerPrefs.min_age && ownerPrefs.max_age && clientProfile.age) {
    const ageInRange = clientProfile.age >= ownerPrefs.min_age &&
                      clientProfile.age <= ownerPrefs.max_age;
    criteria.push({
      weight: 10,
      matches: ageInRange,
      reason: `Age ${clientProfile.age} in range (${ownerPrefs.min_age}-${ownerPrefs.max_age})`,
      incompatibleReason: `Age ${clientProfile.age} outside range`
    });
  }

  // Pet compatibility
  if (ownerPrefs.allows_pets !== undefined && ownerPrefs.allows_pets !== null) {
    const petMatch = !clientProfile.has_pets || ownerPrefs.allows_pets;
    criteria.push({
      weight: 12,
      matches: petMatch,
      reason: ownerPrefs.allows_pets ? 'Pets allowed' : 'No pets, no issue',
      incompatibleReason: 'Has pets but not allowed'
    });
  }

  // Lifestyle compatibility
  if (ownerPrefs.compatible_lifestyle_tags?.length && clientProfile.lifestyle_tags?.length) {
    const matchingLifestyle = clientProfile.lifestyle_tags.filter((tag: string) =>
      ownerPrefs.compatible_lifestyle_tags.includes(tag)
    );
    const matchRate = matchingLifestyle.length / ownerPrefs.compatible_lifestyle_tags.length;
    criteria.push({
      weight: 15,
      matches: matchRate >= 0.3,
      reason: `${matchingLifestyle.length} shared lifestyle interests`,
      incompatibleReason: 'Limited lifestyle compatibility'
    });
  }

  // Verification status boost
  if (clientProfile.verified || clientProfile.income_verification) {
    criteria.push({
      weight: 10,
      matches: true,
      reason: 'Verified profile',
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

export function useSmartClientMatching(
  category?: 'property' | 'moto' | 'bicycle' | 'yacht',
  page: number = 0,
  pageSize: number = 10,
  includeRecentLikes: boolean = false
) {
  return useQuery<MatchedClientProfile[]>({
    queryKey: ['smart-clients', category, page, includeRecentLikes],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          return [] as MatchedClientProfile[];
        }

        // When not explicitly including recent likes, temporarily hide
        // profiles liked in the last 7 days using profile_views table
        const likedProfileIds = new Set<string>();

        if (!includeRecentLikes) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { data: recentLikes, error: likesError } = await supabase
            .from('profile_views')
            .select('viewed_profile_id, created_at')
            .eq('user_id', user.user.id)
            .eq('view_type', 'profile')
            .eq('action', 'like')
            .gte('created_at', sevenDaysAgo.toISOString());

          if (!likesError && recentLikes) {
            for (const row of recentLikes as any[]) {
              if (row.viewed_profile_id) {
                likedProfileIds.add(row.viewed_profile_id as string);
              }
            }
          }
        }

        // CRITICAL: Only show CLIENT profiles to owners, exclude admins and other owners
        // Fetch client profiles with pagination AND subscription data for premium prioritization
        const start = page * pageSize;
        const end = start + pageSize - 1;
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select(
            `
            id, full_name, age, gender, interests, preferred_activities, city, lifestyle_tags, images, avatar_url, verified, budget_min, budget_max, monthly_income, has_pets, smoking, party_friendly,
            user_roles!inner(role),
            user_subscriptions(
              subscription_packages(tier, visibility_boost, priority_matching)
            )
          ` as any
          )
          .neq('id', user.user.id)
          .eq('user_roles.role', 'client')
          .range(start, end);

        if (profileError) {
          throw profileError;
        }

        if (!profiles?.length) {
          return [] as MatchedClientProfile[];
        }

        // Map profiles with placeholder images - filter out excluded profiles
        const filteredProfiles = (profiles as any[])
          .filter(profile => !likedProfileIds.has(profile.id))
          .map(profile => ({
            ...profile,
            images: profile.images && profile.images.length > 0
              ? profile.images
              : ['/placeholder-avatar.svg']
          }));

        // Calculate match scores - SIMPLIFIED: Give everyone 70% match for now
        const matchedClients: MatchedClientProfile[] = filteredProfiles.map(profile => {
          const match = { percentage: 70, reasons: ['Showing all profiles'], incompatible: [] as string[] };

          // Extract client's subscription tier for premium prioritization
          const subscriptionData = profile.user_subscriptions?.[0]?.subscription_packages;
          const tier = subscriptionData?.tier || 'free';
          const visibilityBoost = subscriptionData?.visibility_boost || 0;
          const priorityMatching = subscriptionData?.priority_matching || false;

          // Apply premium boost to match percentage for premium clients
          let boostedPercentage = match.percentage;
          if (priorityMatching && visibilityBoost > 0) {
            // Premium boost: add up to 20 points based on visibility boost (0.25-1.0 -> 5-20 points)
            const boostPoints = Math.min(20, visibilityBoost * 20);
            boostedPercentage = Math.min(100, match.percentage + boostPoints);

            if (boostPoints > 0) {
              match.reasons.push(`Premium client boost: +${boostPoints}%`);
            }
          }

          return {
            id: Math.floor(Math.random() * 1000000),
            user_id: profile.id,
            name: profile.full_name || 'Anonymous',
            age: profile.age || 0,
            gender: profile.gender || '',
            interests: profile.interests || [],
            preferred_activities: profile.preferred_activities || [],
            location: profile.city ? { city: profile.city } : {},
            lifestyle_tags: profile.lifestyle_tags || [],
            profile_images: profile.images || [],
            preferred_listing_types: ['rent'],
            budget_min: profile.budget_min || 0,
            budget_max: profile.budget_max || 100000,
            matchPercentage: boostedPercentage,
            matchReasons: match.reasons,
            incompatibleReasons: match.incompatible,
            city: profile.city || undefined,
            avatar_url: profile.avatar_url || undefined,
            verified: profile.verified || false,
            _premiumTier: tier, // Store for sorting
            _visibilityBoost: visibilityBoost
          } as any;
        });

        // Sort by premium tier first, then match percentage (same as listing matching)
        const sortedClients = matchedClients.sort((a, b) => {
          // Premium tiers get priority
          const tierOrder: Record<string, number> = {
            unlimited: 1,
            premium_plus: 2,
            premium: 3,
            basic: 4,
            free: 5
          };

          const tierA = tierOrder[(a as any)._premiumTier] || 5;
          const tierB = tierOrder[(b as any)._premiumTier] || 5;

          // If different tiers, prioritize better tier
          if (tierA !== tierB) {
            return tierA - tierB;
          }

          // Same tier: sort by match percentage
          return b.matchPercentage - a.matchPercentage;
        });

        return sortedClients;
      } catch (error) {
        console.error('[useSmartClientMatching] Error loading client profiles', error);
        return [] as MatchedClientProfile[];
      }
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds - shorter to reflect filter changes faster
    refetchOnWindowFocus: false, // Disabled to prevent flickering on tab switch
    retry: 3,
    retryDelay: 1000,
  });
}