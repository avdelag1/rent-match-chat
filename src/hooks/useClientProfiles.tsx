
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientProfile {
  id: string;
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
      let query = supabase
        .from('client_profiles')
        .select('*')
        .limit(20);

      if (excludeSwipedIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeSwipedIds.join(',')})`);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;
      return profiles as ClientProfile[];
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

      if (error) throw error;
      return likes.map(l => l.target_id);
    },
  });
}
