import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClientProfile {
  id: number;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  gender: string;
  interests: string[];
  preferred_activities: string[];
  profile_images: string[];
  location: any;
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
        // Get real client profiles from database
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .eq('is_active', true)
          .eq('onboarding_completed', true)
          .neq('id', user.id)
          .limit(50);

        if (error) {
          console.error('Error fetching client profiles:', error);
          return [];
        }

        if (!profiles || profiles.length === 0) {
          console.log('No client profiles found');
          return [];
        }

        // Transform profiles to match interface
        const transformedProfiles: ClientProfile[] = profiles.map((profile, index) => ({
          id: index + 1,
          user_id: profile.id,
          name: profile.full_name || 'User',
          age: profile.age || 25,
          bio: profile.bio || 'No bio available',
          gender: profile.gender || '',
          interests: profile.interests || [],
          preferred_activities: profile.preferred_activities || [],
          profile_images: profile.images || [],
          location: profile.location || null
        }));

        return transformedProfiles.filter(p => !excludeSwipedIds.includes(p.user_id));

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