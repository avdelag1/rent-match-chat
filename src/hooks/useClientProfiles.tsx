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
        // Query client profiles from client_profiles table
        const { data: clientProfiles, error } = await supabase
          .from('client_profiles')
          .select('*')
          .neq('user_id', user.id) // Exclude own profile
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          logger.error('Error fetching client profiles:', error);
          
          // Fallback to profiles_public view
          const { data: fallbackProfiles, error: fallbackError } = await supabase
            .from('profiles_public')
            .select('*')
            .neq('id', user.id)
            .limit(100);

          if (fallbackError) {
            logger.error('Fallback query also failed:', fallbackError);
            return [];
          }

          // Simple transform for fallback
          const transformed: ClientProfile[] = (fallbackProfiles || []).map((profile: any, index: number) => ({
            id: index + 1,
            user_id: profile.id,
            name: profile.full_name || 'User',
            age: profile.age || 25,
            gender: '',
            interests: profile.interests || [],
            preferred_activities: profile.preferred_activities || [],
            profile_images: profile.images || [],
            location: profile.city ? { city: profile.city } : null,
            city: profile.city || undefined,
            avatar_url: profile.avatar_url || undefined,
            verified: profile.verified || false
          }));

          return transformed.filter(p => !excludeSwipedIds.includes(p.user_id));
        }

        if (!clientProfiles || clientProfiles.length === 0) {
          return [];
        }

        // Transform from client_profiles to interface
        const transformedProfiles: ClientProfile[] = clientProfiles.map((profile: any, index: number) => ({
          id: index + 1,
          user_id: profile.user_id || '',
          name: profile.name || 'User',
          age: profile.age || 25,
          gender: profile.gender || '',
          interests: profile.interests || [],
          preferred_activities: profile.preferred_activities || [],
          profile_images: profile.profile_images || [],
          location: profile.city ? { city: profile.city } : null,
          city: profile.city || undefined,
          avatar_url: profile.profile_images?.[0] || undefined,
          verified: false
        }));

        // Filter out swiped profiles
        const filteredProfiles = transformedProfiles.filter(
          p => !excludeSwipedIds.includes(p.user_id)
        );

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
