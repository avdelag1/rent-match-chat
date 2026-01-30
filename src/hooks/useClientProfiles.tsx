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
        // CRITICAL: Query profiles_public directly to ensure all profiles exist in auth system
        // IMPORTANT: Filter by role='client' to only show clients, not owners
        // FIXED: Add is_active filter to exclude suspended/blocked/inactive profiles
        // NOTE: Using 'as any' because profiles_public view is not in auto-generated types
        const { data: profiles, error } = await (supabase as any)
          .from('profiles_public')
          .select('*')
          .neq('id', user.id)
          .eq('role', 'client') // ✅ Only show clients in owner swipe deck
          .or('is_active.is.null,is_active.eq.true') // ✅ Only show active profiles (null = true by default)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          logger.error('Error fetching client profiles:', error);
          return [];
        }

        if (!profiles || profiles.length === 0) {
          return [];
        }

        // Transform profiles to ClientProfile interface
        const transformed: ClientProfile[] = profiles.map((profile: any, index: number) => ({
          id: index + 1,
          user_id: profile.id,
          name: profile.full_name || 'User',
          age: profile.age || 25,
          gender: profile.gender || '',
          interests: profile.interests || [],
          preferred_activities: profile.preferred_activities || [],
          profile_images: profile.images || [],
          location: profile.city ? { city: profile.city } : null,
          city: profile.city || undefined,
          avatar_url: profile.avatar_url || profile.images?.[0] || undefined,
          verified: profile.verified || false
        }));

        // Filter out swiped profiles
        return transformed.filter(p => !excludeSwipedIds.includes(p.user_id));

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
        // Query likes table for owner swipes on profiles (clients)
        const { data: ownerLikes, error } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.id)
          .eq('target_type', 'profile');

        if (error) {
          logger.error('Error fetching owner swipes:', error);
          return [];
        }
        return ownerLikes?.map((l: any) => l.target_id) || [];
      } catch (error) {
        logger.error('Failed to fetch swiped client profiles:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: 2
  });
}
