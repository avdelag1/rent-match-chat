
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

function mapRpcRowToClientProfile(row: any): ClientProfile {
  return {
    id: 0,
    user_id: row.id || row.user_id || '',
    name: row.full_name ?? row.name ?? row.profile_name ?? '',
    age: row.age ?? 0,
    bio: row.bio ?? '',
    gender: row.gender ?? '',
    interests: Array.isArray(row.interests) ? row.interests : [],
    preferred_activities: Array.isArray(row.preferences) ? row.preferences : (Array.isArray(row.preferred_activities) ? row.preferred_activities : []),
    profile_images: Array.isArray(row.images) ? row.images : (Array.isArray(row.profile_images) ? row.profile_images : []),
    location: row.location ?? null,
  };
}

export function useClientProfiles(excludeSwipedIds: string[] = []) {
  return useQuery({
    queryKey: ['client-profiles', excludeSwipedIds],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) {
          console.log('No authenticated user');
          return [];
        }

        // Try the security-definer RPC with several likely param names.
        let rpcData: any[] | null = null;
        let lastRpcError: string | null = null;

        const attempts = [
          { owner_user_id: uid },
          { owner_id: uid },
          { uid },
        ];

        for (const params of attempts) {
          const { data, error } = await supabase.rpc('get_clients_for_owner', params as any);
          if (error) {
            lastRpcError = error.message;
            console.warn('get_clients_for_owner RPC attempt failed with params', params, error.message);
            continue;
          }
          if (Array.isArray(data)) {
            rpcData = data;
            break;
          }
        }

        if (rpcData && rpcData.length > 0) {
          const mapped = rpcData
            .map(mapRpcRowToClientProfile)
            .filter(p => p.user_id && !excludeSwipedIds.includes(p.user_id));
          console.log('Fetched client profiles via RPC:', mapped.length);
          return mapped as ClientProfile[];
        }

        if (lastRpcError) {
          console.warn('All RPC attempts failed, falling back to client_profiles. Last error:', lastRpcError);
        } else {
          console.log('RPC returned no data, falling back to client_profiles.');
        }

        // Fallback: read from client_profiles (RLS may restrict to own only)
        let query = supabase
          .from('client_profiles')
          .select('*')
          .limit(20);

        if (excludeSwipedIds.length > 0) {
          const quoted = excludeSwipedIds.map(id => `'${id}'`).join(',');
          query = query.not('user_id', 'in', `(${quoted})`);
        }

        const { data: profiles, error } = await query;

        if (error) {
          console.error('Error fetching client profiles (fallback):', error);
          return [];
        }

        const validProfiles = (profiles || []).filter((profile: any) => profile.name && profile.user_id);
        console.log('Fetched client profiles via fallback:', validProfiles.length);
        return validProfiles as ClientProfile[];
      } catch (error) {
        console.error('Failed to fetch client profiles:', error);
        return [];
      }
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
