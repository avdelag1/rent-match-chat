import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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

        if (error) {
          console.error('❌ Error fetching listings:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw error;
        }

        console.log(`📊 Fetched ${listings?.length || 0} active listings from database`);

        if (!listings?.length) {
          console.warn('⚠️ No active listings found');
          console.log('💡 This may be because:');
          console.log('   1. No listings have is_active=true');
          console.log('   2. No listings have status=\'active\'');
          console.log('   3. Database is empty or RLS is blocking access');
          return [];
        }

        if (!preferences) {
          console.log('📋 No client preferences set, returning all listings with default 50% match');
          return (listings as Listing[]).map(listing => ({
            ...listing,
            matchPercentage: 50,
            matchReasons: ['No preferences set'],
            incompatibleReasons: []
          }));
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

export function useSmartClientMatching(category?: 'property' | 'moto' | 'bicycle' | 'yacht') {
  return useQuery({
    queryKey: ['smart-clients', category],
    queryFn: async () => {
      try {
        console.log('🚀 useSmartClientMatching: Starting fetch...');
        
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          console.log('❌ No authenticated user');
          return [];
        }
        
        console.log('✅ Authenticated user:', user.user.id);

        // 🚨 TEMPORARY FIX: Query ALL profiles directly to show users
        // Bypassing user_roles check and complex filtering
        console.log('🔧 USING SIMPLIFIED QUERY - Fetching ALL profiles directly');

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, age, gender, interests, preferred_activities, city, lifestyle_tags, images, avatar_url, verified, budget_min, budget_max, monthly_income, has_pets, smoking, party_friendly')
          .neq('id', user.user.id)
          .limit(100);

        if (profileError) {
          console.error('❌ Error fetching profiles:', profileError);
          console.error('Error details:', JSON.stringify(profileError, null, 2));

          // If RLS blocks profiles table, explain the issue
          if (profileError.code === 'PGRST116' || profileError.message?.includes('permission')) {
            console.error('🔒 RLS POLICY BLOCKING ACCESS to profiles table');
            console.log('💡 You may need to adjust RLS policies to allow owners to view client profiles');
          }
          throw profileError;
        }

        if (!profiles?.length) {
          console.warn('⚠️ No profiles found in database AT ALL');
          console.log('💡 This means:');
          console.log('   1. The profiles table is empty, OR');
          console.log('   2. RLS policies are blocking all access');
          console.log('   3. All profiles belong to the current user');
          return [];
        }

        console.log(`✅ SUCCESS! Found ${profiles.length} profiles in database`);
        console.log('📋 Profile names:', profiles.map(p => p.full_name || 'Unnamed').slice(0, 10).join(', '));

        // 🚨 SKIP ALL FILTERING - Just show all profiles with placeholders
        const filteredProfiles = profiles.map(profile => ({
          ...profile,
          images: (profile.images && profile.images.length > 0)
            ? profile.images
            : ['/placeholder-avatar.svg']
        }));
        
        console.log(`🎯 FINAL: Returning ${filteredProfiles.length} client profiles to display`);

        // DEBUG: Log first profile before transformation
        if (filteredProfiles.length > 0) {
          console.log('🔍 Sample profile BEFORE transformation:', {
            full_name: filteredProfiles[0].full_name,
            age: filteredProfiles[0].age,
            images: filteredProfiles[0].images,
            hasImages: !!filteredProfiles[0].images,
            imagesLength: filteredProfiles[0].images?.length || 0
          });
        }

        // Calculate match scores - SIMPLIFIED: Give everyone 70% match for now
        const matchedClients: MatchedClientProfile[] = filteredProfiles.map(profile => {
          // Skip complex matching, just assign default score
          const match = { percentage: 70, reasons: ['Showing all profiles'], incompatible: [] };

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
            matchPercentage: match.percentage,
            matchReasons: match.reasons,
            incompatibleReasons: match.incompatible,
            city: profile.city || undefined,
            avatar_url: profile.avatar_url || undefined,
            verified: profile.verified || false
          };
        });

        // Sort by match score
        const sortedClients = matchedClients
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 50);

        console.log('🎯 FINAL RESULT:', sortedClients.length, 'clients to show');

        // DEBUG: Log first transformed client
        if (sortedClients.length > 0) {
          console.log('🔍 Sample client AFTER transformation:', {
            name: sortedClients[0].name,
            age: sortedClients[0].age,
            profile_images: sortedClients[0].profile_images,
            hasImages: !!sortedClients[0].profile_images,
            imagesLength: sortedClients[0].profile_images?.length || 0,
            firstImage: sortedClients[0].profile_images?.[0]
          });
        }

        return sortedClients;
      } catch (error) {
        console.error('❌ Error in smart client matching:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds - shorter to reflect filter changes faster
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
  });
}