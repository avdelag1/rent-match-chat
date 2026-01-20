import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/prodLogger';

export interface ClientProfile {
  id: number;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  interests: string[];
  preferred_activities: string[];
  profile_images: string[];
  location: any;
  city?: string;
  avatar_url?: string;
  verified?: boolean;
}

export function useClientProfiles(excludeSwipedIds: string[] = [], options: { enabled?: boolean } = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-profiles', user?.id, excludeSwipedIds],
    enabled: options.enabled !== false,
    queryFn: async (): Promise<ClientProfile[]> => {
      if (!user) {
        return [];
      }

      try {
        // OPTIMIZED: Get client profiles with role in ONE query using JOIN
        // CRITICAL: Only get client users (excludes admins and owners automatically)
        // CRITICAL: Exclude own profile - user shouldn't see themselves when browsing clients
        const { data: clientProfiles, error } = await supabase
          .from('profiles_public')
          .select(`
            *,
            user_roles!inner(role)
          `)
          .eq('user_roles.role', 'client')
          .neq('id', user.id) // Exclude own profile - user shouldn't see themselves
          .limit(100);

        if (error) {
          throw error; // Don't silently fail
        }

        if (clientProfiles.length === 0) {
          return [];
        }

        // Fetch from client_profiles table to get latest photos
        const userIds = clientProfiles.map(p => p.id);
        const { data: detailedProfiles } = await supabase
          .from('client_profiles')
          .select('user_id, profile_images, name, age')
          .in('user_id', userIds);

        // Create a map for quick lookup
        const detailedMap = new Map(
          (detailedProfiles || []).map(p => [p.user_id, p])
        );

        // Transform profiles to match interface (no bio field)
        const transformedProfiles: ClientProfile[] = clientProfiles.map((profile, index) => {
          const detailedProfile = detailedMap.get(profile.id);

          // Prefer data from client_profiles if available (newer source)
          return {
            id: index + 1,
            user_id: profile.id,
            name: detailedProfile?.name || profile.full_name || 'User',
            age: detailedProfile?.age || profile.age || 25,
            gender: '',
            interests: profile.interests || [],
            preferred_activities: profile.preferred_activities || [],
            // PREFER profile_images from client_profiles (newer), fallback to profiles.images
            profile_images: detailedProfile?.profile_images || profile.images || [],
            location: profile.city ? { city: profile.city } : null,
            city: profile.city || undefined,
            avatar_url: profile.avatar_url || undefined,
            verified: profile.verified || false
          };
        });

        const filteredProfiles = transformedProfiles.filter(p => !excludeSwipedIds.includes(p.user_id));

        return filteredProfiles;

      } catch (error) {
        logger.error('Error fetching client profiles:', error);
        return [];
      }
    },
    // PERF: Longer stale time for profiles since they don't change frequently
    staleTime: 10 * 60 * 1000, // 10 minutes - profiles are stable
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
    // PERF: Keep previous data while fetching new data to prevent UI flash
    placeholderData: (prev) => prev,
    retry: 2
  });
}

export function useSwipedClientProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-swipes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Only exclude profiles swiped within the last 1 day (reset after next day)
        const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

        const { data: likes, error } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.id)
          .gte('created_at', oneDayAgo);

        if (error) {
          logger.error('Error fetching owner swipes:', error);
          return [];
        }
        return likes?.map(l => l.target_id) || [];
      } catch (error) {
        logger.error('Failed to fetch swiped client profiles:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: 2
  });
}