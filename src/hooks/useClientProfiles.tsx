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
    // The original type expects a numeric id from client_profiles (bigint).
    // For RPC rows (which return user uuid), we set a placeholder number.
    id: 0,
    user_id: row.id, // uuid of the user from RPC
    name: row.full_name ?? row.name ?? '',
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

        // Attempt to fetch owner-visible clients via security-definer RPC.
        // This bypasses RLS appropriately and returns client users the owner can view.
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_clients_for_owner', {
          owner_user_id: uid,
        });

        if (rpcError) {
          console.warn('get_clients_for_owner RPC failed, falling back:', rpcError.message);
        }

        if (Array.isArray(rpcData) && rpcData.length > 0) {
          const mapped = rpcData
            .map(mapRpcRowToClientProfile)
            .filter(p => !excludeSwipedIds.includes(p.user_id));
          console.log('Fetched client profiles via RPC:', mapped.length);
          return mapped as ClientProfile[];
        }

        // Fallback: try reading from client_profiles (RLS may restrict to own only)
        let query = supabase
          .from('client_profiles')
          .select('*')
          .limit(20);

        if (excludeSwipedIds.length > 0) {
          // Filter client_profiles by user_id not in swiped list
          const quoted = excludeSwipedIds.map(id => `'${id}'`).join(',');
          query = query.not('user_id', 'in', `(${quoted})`);
        }

        const { data: profiles, error } = await query;

        if (error) {
          console.error('Error fetching client profiles (fallback):', error);
          // Graceful empty fallback to keep UI functional
          return [];
        }

        const validProfiles = (profiles || []).filter((profile) => profile.name && profile.user_id);
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
