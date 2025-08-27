
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClientProfileLite = {
  id?: number;
  user_id: string;
  name?: string | null;
  age?: number | null;
  bio?: string | null;
  gender?: string | null;
  interests?: string[] | null;
  preferred_activities?: string[] | null;
  profile_images?: string[] | null;
};

async function fetchOwnProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ClientProfileLite | null;
}

export function useClientProfile() {
  return useQuery({
    queryKey: ['client-profile-own'],
    queryFn: fetchOwnProfile,
  });
}

export function useSaveClientProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Omit<ClientProfileLite, 'user_id'>) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('client_profiles')
          .update({ ...updates })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as ClientProfileLite;
      } else {
        const { data, error } = await supabase
          .from('client_profiles')
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) throw error;
        return data as ClientProfileLite;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-profile-own'] });
    },
  });
}
