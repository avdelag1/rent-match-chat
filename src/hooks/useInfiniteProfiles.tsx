/**
 * Infinite Scroll Hook for Client Profiles (Owner View)
 * Cursor-based pagination for owners swiping on potential tenants
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClientProfile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  bio: string | null;
  profile_images: string[] | null;
  occupation: string | null;
  income_range: string | null;
  pets: boolean | null;
  smoking_habit: string | null;
  drinking_habit: string | null;
  interests: string[] | null;
  created_at: string;
}

interface UseInfiniteProfilesOptions {
  pageSize?: number;
  excludeSwipedIds?: string[];
  filters?: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
    hasPets?: boolean;
    smokingHabit?: string;
  };
  enabled?: boolean;
}

interface ProfilesPage {
  data: ClientProfile[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Fetch client profiles with cursor-based pagination
 */
async function fetchClientProfiles(
  cursor: string | null,
  pageSize: number,
  excludeIds: string[],
  filters: UseInfiniteProfilesOptions['filters']
): Promise<ProfilesPage> {
  let query = supabase
    .from('client_profiles')
    .select(`
      user_id,
      age,
      gender,
      bio,
      profile_images,
      occupation,
      income_range,
      pets,
      smoking_habit,
      drinking_habit,
      interests,
      created_at,
      profiles!inner(id, full_name, avatar_url, is_active)
    `)
    .eq('profiles.is_active', true)
    .order('created_at', { ascending: false });

  // Apply cursor pagination
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  // Exclude already swiped profiles
  if (excludeIds.length > 0) {
    query = query.not('user_id', 'in', `(${excludeIds.join(',')})`);
  }

  // Apply filters
  if (filters) {
    if (filters.minAge !== undefined) {
      query = query.gte('age', filters.minAge);
    }
    if (filters.maxAge !== undefined) {
      query = query.lte('age', filters.maxAge);
    }
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }
    if (filters.hasPets !== undefined) {
      query = query.eq('pets', filters.hasPets);
    }
    if (filters.smokingHabit) {
      query = query.eq('smoking_habit', filters.smokingHabit);
    }
  }

  // Fetch one extra to check if there's more
  query = query.limit(pageSize + 1);

  const { data, error } = await query;

  if (error) throw error;

  // Transform data
  const transformed = (data || []).map((item: any) => ({
    user_id: item.user_id,
    full_name: item.profiles.full_name,
    avatar_url: item.profiles.avatar_url,
    age: item.age,
    gender: item.gender,
    bio: item.bio,
    profile_images: item.profile_images,
    occupation: item.occupation,
    income_range: item.income_range,
    pets: item.pets,
    smoking_habit: item.smoking_habit,
    drinking_habit: item.drinking_habit,
    interests: item.interests,
    created_at: item.created_at
  }));

  const hasMore = transformed.length > pageSize;
  const items = hasMore ? transformed.slice(0, pageSize) : transformed;
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1].created_at
    : null;

  return {
    data: items,
    nextCursor,
    hasMore
  };
}

/**
 * Hook for infinite scrolling client profiles (owner view)
 */
export function useInfiniteProfiles({
  pageSize = 10,
  excludeSwipedIds = [],
  filters,
  enabled = true
}: UseInfiniteProfilesOptions = {}) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['infinite-profiles', pageSize, excludeSwipedIds, filters],
    queryFn: ({ pageParam }) =>
      fetchClientProfiles(pageParam, pageSize, excludeSwipedIds, filters),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    enabled: enabled && !!user?.id,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Get flattened array of all profiles from infinite query
 */
export function flattenProfiles(pages: ProfilesPage[] | undefined): ClientProfile[] {
  if (!pages) return [];
  return pages.flatMap(page => page.data);
}
