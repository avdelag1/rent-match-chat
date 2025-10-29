import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

export function useClientProfiles(excludeSwipedIds: string[] = []) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-profiles', user?.id, excludeSwipedIds],
    queryFn: async (): Promise<ClientProfile[]> => {
      if (!user) {
        console.log('No authenticated user');
        return [];
      }

      try {
        console.log('useClientProfiles: Fetching client profiles for owner:', user.id, {
          timestamp: new Date().toISOString(),
          excludedCount: excludeSwipedIds.length
        });

        // OPTIMIZED: Get client profiles with role in ONE query using JOIN
        const { data: clientProfiles, error } = await supabase
          .from('profiles_public')
          .select(`
            *,
            user_roles!inner(role)
          `)
          .eq('user_roles.role', 'client')
          .limit(100);

        if (error) {
          console.error('useClientProfiles: Supabase error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error; // Don't silently fail
        }

        console.log('useClientProfiles: Successfully fetched', clientProfiles?.length || 0, 'client profiles');

        if (clientProfiles.length === 0) {
          console.log('No client profiles found');
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

        console.log('Transformed profiles with latest photos:', transformedProfiles);
        const filteredProfiles = transformedProfiles.filter(p => !excludeSwipedIds.includes(p.user_id));
        console.log('Final filtered profiles:', filteredProfiles);

        return filteredProfiles;

      } catch (error) {
        console.error('Error fetching client profiles:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

        const { data: likes, error } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.id)
          .gte('created_at', fiveDaysAgo);

        if (error) {
          console.error('Error fetching owner swipes:', error);
          return [];
        }
        return likes?.map(l => l.target_id) || [];
      } catch (error) {
        console.error('Failed to fetch swiped client profiles:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: 2
  });
}