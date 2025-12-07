import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type OwnerProfile = {
  id?: string;
  user_id: string;
  business_name?: string | null;
  business_description?: string | null;
  business_location?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  profile_images?: string[] | null;
  verified_owner?: boolean;
};

type OwnerProfileUpdate = Omit<OwnerProfile, 'id' | 'user_id'>;

async function fetchOwnProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('owner_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching owner profile:', error);
    throw error;
  }

  return data as OwnerProfile | null;
}

export function useOwnerProfile() {
  return useQuery({
    queryKey: ['owner-profile-own'],
    queryFn: fetchOwnProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

export function useSaveOwnerProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: OwnerProfileUpdate) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('owner_profiles')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();

      let profileData: OwnerProfile;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('owner_profiles')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) {
          console.error('Error updating owner profile:', error);
          throw error;
        }
        profileData = data as OwnerProfile;
      } else {
        const { data, error } = await supabase
          .from('owner_profiles')
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) {
          console.error('Error creating owner profile:', error);
          throw error;
        }
        profileData = data as OwnerProfile;
      }

      return profileData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-profile-own'] });
      qc.invalidateQueries({ queryKey: ['owner-profiles'] });
    },
  });
}
