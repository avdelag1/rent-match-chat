
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['client-profiles', excludeSwipedIds],
    queryFn: async () => {
      // First get all profiles, then filter client ones
      let query = supabase
        .from('client_profiles')
        .select('*')
        .limit(20);

      if (excludeSwipedIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeSwipedIds.join(',')})`);
      }

      const { data: profiles, error } = await query;
      if (error) {
        console.error('Error fetching client profiles:', error);
        // Return empty array instead of throwing to prevent blocking the UI
        return [];
      }
      
      // Filter out profiles that don't have essential data
      const validProfiles = (profiles || []).filter(profile => 
        profile.name && profile.user_id
      );
      
      return validProfiles as ClientProfile[];
    },
  });
}

export function useSwipedClientProfiles() {
  return useQuery({
    queryKey: ['owner-swipes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data: likes, error } = await supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching owner swipes:', error);
        return [];
      }
      return likes.map(l => l.target_id);
    },
  });
}
