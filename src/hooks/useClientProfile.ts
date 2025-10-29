
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

// Type for database operations (excluding id)
type ClientProfileUpdate = Omit<ClientProfileLite, 'id' | 'user_id'>;

async function fetchOwnProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  console.log('Fetching profile for user:', uid);

  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    throw error;
  }
  
  console.log('Fetched profile data:', data);
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
    mutationFn: async (updates: ClientProfileUpdate) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();

      let profileData: ClientProfileLite;

      if (existing?.id) {
        console.log('Updating existing profile with:', updates);
        const { data, error } = await supabase
          .from('client_profiles')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
        console.log('Updated profile data:', data);
        profileData = data as ClientProfileLite;
      } else {
        console.log('Creating new profile with:', updates);
        const { data, error } = await supabase
          .from('client_profiles')
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) {
          console.error('Error creating profile:', error);
          throw error;
        }
        console.log('Created profile data:', data);
        profileData = data as ClientProfileLite;
      }

      // SYNC to profiles table - so owner sees updated photos!
      // Update the profiles.images field to match client_profiles.profile_images
      if (updates.profile_images) {
        console.log('🔄 [PHOTO SYNC] Starting sync to profiles table...');
        console.log('🔄 [PHOTO SYNC] User ID:', uid);
        console.log('🔄 [PHOTO SYNC] Images to sync:', updates.profile_images);

        const { data: syncData, error: syncError } = await supabase
          .from('profiles')
          .update({ images: updates.profile_images })
          .eq('id', uid)
          .select();

        if (syncError) {
          console.error('❌ [PHOTO SYNC] Error syncing to profiles table:', syncError);
          // Don't throw - profile update succeeded, sync is secondary
        } else {
          console.log('✅ [PHOTO SYNC] Successfully synced images to profiles table');
          console.log('✅ [PHOTO SYNC] Updated profile:', syncData);
        }
      }

      return profileData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-profile-own'] });
      // Also invalidate owner's view of client profiles
      qc.invalidateQueries({ queryKey: ['client-profiles'] });
      qc.invalidateQueries({ queryKey: ['client-profile'] });
    },
  });
}
