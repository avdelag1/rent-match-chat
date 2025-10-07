import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 10;

export interface MatchedClientProfile {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  gender?: string;
  interests?: string[];
  preferred_activities?: string[];
  profile_images?: string[];
  location?: any;
  bio?: string;
  images?: string[];
  occupation?: string;
  income?: number | string;
  matchPercentage: number;
  matchReasons: string[];
  incompatibleReasons: string[];
  [key: string]: any;
}

function calculateClientMatch(ownerPreferences: any, clientProfile: any) {
  let score = 0;
  let maxScore = 0;
  const reasons: string[] = [];
  const incompatible: string[] = [];

  // Budget compatibility (weight: 30)
  maxScore += 30;
  if (ownerPreferences.min_budget && ownerPreferences.max_budget) {
    const clientBudget = clientProfile.budget || 0;
    if (clientBudget >= ownerPreferences.min_budget && clientBudget <= ownerPreferences.max_budget) {
      score += 30;
      reasons.push('Budget matches your requirements');
    } else {
      incompatible.push('Budget mismatch');
    }
  }

  // Lifestyle compatibility (weight: 25)
  maxScore += 25;
  if (ownerPreferences.compatible_lifestyle_tags?.length > 0 && clientProfile.lifestyle_tags?.length > 0) {
    const matchedTags = clientProfile.lifestyle_tags.filter((tag: string) =>
      ownerPreferences.compatible_lifestyle_tags.includes(tag)
    );
    const lifestyleScore = (matchedTags.length / ownerPreferences.compatible_lifestyle_tags.length) * 25;
    score += lifestyleScore;
    if (lifestyleScore > 12) {
      reasons.push('Compatible lifestyle');
    }
  }

  // Pet policy (weight: 15)
  maxScore += 15;
  if (ownerPreferences.allows_pets !== undefined && clientProfile.has_pets !== undefined) {
    if (ownerPreferences.allows_pets || !clientProfile.has_pets) {
      score += 15;
      reasons.push('Pet policy compatible');
    } else {
      incompatible.push('Pet policy incompatible');
    }
  }

  // Smoking policy (weight: 15)
  maxScore += 15;
  if (ownerPreferences.allows_smoking !== undefined && clientProfile.smokes !== undefined) {
    if (ownerPreferences.allows_smoking || !clientProfile.smokes) {
      score += 15;
      reasons.push('Smoking policy compatible');
    } else {
      incompatible.push('Smoking policy incompatible');
    }
  }

  // Skip verification status check

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  return { percentage, reasons, incompatible };
}

export function useInfiniteClientMatching() {
  return useInfiniteQuery({
    queryKey: ['infinite-clients'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { clients: [], nextPage: null };

      const { data: ownerPreferences } = await supabase
        .from('owner_client_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      const profilesResult = await supabase
        .from('profiles')
        .select('id, full_name, age, gender, interests, avatar_url, bio, occupation, monthly_income, lifestyle_tags, has_pets, smokes, budget')
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      if (profilesResult.error) throw profilesResult.error;
      if (!profilesResult.data?.length) return { clients: [], nextPage: null };

      const profiles = profilesResult.data as any[];

      const matchedClients: any[] = profiles.map(profile => {
        const match = ownerPreferences
          ? calculateClientMatch(ownerPreferences, profile)
          : { percentage: 50, reasons: ['No preferences set'], incompatible: [] };

        return {
          id: profile.id,
          user_id: profile.id,
          name: profile.full_name || 'Anonymous',
          age: profile.age,
          gender: profile.gender,
          interests: profile.interests || [],
          preferred_activities: [],
          profile_images: profile.avatar_url ? [profile.avatar_url] : [],
          location: null,
          bio: profile.bio,
          images: profile.avatar_url ? [profile.avatar_url] : [],
          occupation: profile.occupation,
          income: profile.monthly_income,
          matchPercentage: match.percentage,
          matchReasons: match.reasons,
          incompatibleReasons: match.incompatible
        };
      });

      const filteredClients = matchedClients
        .filter(client => client.matchPercentage >= 10)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      return {
        clients: filteredClients,
        nextPage: filteredClients.length === ITEMS_PER_PAGE ? pageParam + 1 : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    retry: 3,
    retryDelay: 1000,
  });
}
