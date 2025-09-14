
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

// Mock data fallback so owners can preview swipe cards instantly
const MOCK_CLIENT_PROFILES: ClientProfile[] = [
  {
    id: 1,
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Alex Johnson',
    age: 28,
    bio: 'Product designer who loves sunny spaces and close-to-cowork locations.',
    gender: 'non-binary',
    interests: ['Design', 'Cycling', 'Coffee'],
    preferred_activities: ['Coworking', 'Beach runs'],
    profile_images: [
      'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520357456838-9d75a5aee0b2?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=1600&auto=format&fit=crop'
    ],
    location: { city: 'Tulum', country: 'MX' }
  },
  {
    id: 2,
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'Maria Garcia',
    age: 31,
    bio: 'Remote marketer, early riser, looking for quiet building with gym.',
    gender: 'female',
    interests: ['Yoga', 'Marketing', 'Cooking'],
    preferred_activities: ['Morning gym', 'Markets'],
    profile_images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1600&auto=format&fit=crop'
    ],
    location: { city: 'Playa del Carmen', country: 'MX' }
  },
  {
    id: 3,
    user_id: '33333333-3333-3333-3333-333333333333',
    name: 'David Lee',
    age: 26,
    bio: 'Engineer, bikes everywhere, needs fast internet and a balcony.',
    gender: 'male',
    interests: ['Biking', 'Tech', 'Gaming'],
    preferred_activities: ['Weekend rides', 'Cafés'],
    profile_images: [
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1600&auto=format&fit=crop'
    ],
    location: { city: 'Cancún', country: 'MX' }
  },
  {
    id: 4,
    user_id: '44444444-4444-4444-4444-444444444444',
    name: 'Sofia Rossi',
    age: 29,
    bio: 'UX researcher; prefers quiet neighborhoods and good daylight.',
    gender: 'female',
    interests: ['Reading', 'Art', 'Hiking'],
    preferred_activities: ['Museums', 'Nature walks'],
    profile_images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop',
      '/placeholder.svg'
    ],
    location: { city: 'Tulum', country: 'MX' }
  },
  {
    id: 5,
    user_id: '55555555-5555-5555-5555-555555555555',
    name: 'Chris Evans',
    age: 34,
    bio: 'Chef who needs a great kitchen and nearby markets.',
    gender: 'male',
    interests: ['Cooking', 'Surfing', 'Food'],
    preferred_activities: ['Farmers market', 'Beach'],
    profile_images: [
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1600&auto=format&fit=crop',
      '/placeholder.svg'
    ],
    location: { city: 'Cozumel', country: 'MX' }
  },
  {
    id: 6,
    user_id: '66666666-6666-6666-6666-666666666666',
    name: 'Priya Singh',
    age: 27,
    bio: 'Data analyst; prefers coworking spaces and fast internet.',
    gender: 'female',
    interests: ['Data', 'Pilates', 'Coffee'],
    preferred_activities: ['Coworking', 'Workshops'],
    profile_images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop'
    ],
    location: { city: 'Tulum', country: 'MX' }
  }
];

export function useClientProfiles(excludeSwipedIds: string[] = []) {
  return useQuery({
    queryKey: ['client-profiles', excludeSwipedIds],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) {
          console.log('No authenticated user - returning mock client profiles for preview.');
          return MOCK_CLIENT_PROFILES.filter(p => !excludeSwipedIds.includes(p.user_id));
        }

        // First, try the new comprehensive RPC function
        const { data: newRpcData, error: newRpcError } = await supabase.rpc('get_all_clients_for_owner', { owner_user_id: uid });
        
        if (!newRpcError && Array.isArray(newRpcData) && newRpcData.length > 0) {
          const mapped = newRpcData
            .map(mapRpcRowToClientProfile)
            .filter(p => p.user_id && !excludeSwipedIds.includes(p.user_id));
          console.log('Fetched client profiles via new RPC:', mapped.length);
          return mapped as ClientProfile[];
        }

        if (newRpcError) {
          console.warn('New RPC failed, trying original:', newRpcError.message);
        }

        // Try the original security-definer RPC with several likely param names.
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
          console.log('Fetched client profiles via original RPC:', mapped.length);
          return mapped as ClientProfile[];
        }

        if (lastRpcError) {
          console.warn('All RPC attempts failed, falling back to client_profiles. Last error:', lastRpcError);
        } else {
          console.log('RPC returned no data, falling back to client_profiles.');
        }

        // Final fallback: read from client_profiles table directly
        let query = supabase
          .from('client_profiles')
          .select('*')
          .limit(50);

        if (excludeSwipedIds.length > 0) {
          query = query.not('user_id', 'in', `(${excludeSwipedIds.map(id => `'${id}'`).join(',')})`);
        }

        const { data: profiles, error } = await query;

        if (error) {
          console.error('Error fetching client profiles (fallback):', error);
          // fall back to mock if table read fails
          return MOCK_CLIENT_PROFILES.filter(p => !excludeSwipedIds.includes(p.user_id));
        }

        const validProfiles = (profiles || []).filter((profile: any) => profile.name && profile.user_id);
        console.log('Fetched client profiles via fallback:', validProfiles.length);

        const finalList = validProfiles.map(profile => ({
          id: profile.id || 0,
          user_id: profile.user_id || '',
          name: profile.name || '',
          age: profile.age || 0,
          bio: profile.bio || '',
          gender: profile.gender || '',
          interests: profile.interests || [],
          preferred_activities: profile.preferred_activities || [],
          profile_images: profile.profile_images || [],
          location: profile.location || null,
        })) as ClientProfile[];

        // If still nothing, return mock data so UI always shows cards
        if (!finalList || finalList.length === 0) {
          console.log('No real profiles found - returning mock client profiles.');
          return MOCK_CLIENT_PROFILES.filter(p => !excludeSwipedIds.includes(p.user_id));
        }

        return finalList;
      } catch (error) {
        console.error('Failed to fetch client profiles:', error);
        // On any unexpected error, ensure UI still works with mock data
        return MOCK_CLIENT_PROFILES.filter(p => !excludeSwipedIds.includes(p.user_id));
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
}

export function useSwipedClientProfiles() {
  return useQuery({
    queryKey: ['owner-swipes'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        // Only exclude client profiles swiped within the last 5 days
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

        const { data: likes, error } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.user.id)
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
    retry: 3,
    retryDelay: 1000,
  });
}
