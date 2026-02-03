
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/prodLogger';

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
  // Location fields
  country?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  // Intentions
  intentions?: string[] | null;
};

// Type for database operations (excluding id)
type ClientProfileUpdate = Omit<ClientProfileLite, 'id' | 'user_id'>;

async function fetchOwnProfile() {
  // Use getSession for faster auth check (cached locally)
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching profile:', error);
    throw error;
  }

  return data as ClientProfileLite | null;
}

export function useClientProfile() {
  return useQuery({
    queryKey: ['client-profile-own'],
    queryFn: fetchOwnProfile,
    // INSTANT NAVIGATION: Keep previous data during refetch to prevent UI blanking
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

export function useSaveClientProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ClientProfileUpdate) => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) {
        logger.error('Error fetching authenticated user:', authError);
        throw authError;
      }
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      const { data: existing, error: existingError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();
      
      if (existingError && existingError.code !== 'PGRST116') {
        logger.error('Error checking existing profile:', existingError);
        throw existingError;
      }

      let profileData: ClientProfileLite;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('client_profiles')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) {
          logger.error('Error updating profile:', error);
          throw error;
        }
        profileData = data as ClientProfileLite;
      } else {
        const { data, error } = await supabase
          .from('client_profiles')
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) {
          logger.error('Error creating profile:', error);
          throw error;
        }
        profileData = data as ClientProfileLite;
      }

      // SYNC to profiles table - so owner sees updated data!
      const syncPayload: any = {};

      // Sync images
      if (updates.profile_images !== undefined) {
        syncPayload.images = updates.profile_images;
      }

      // Sync name → full_name
      if (updates.name !== undefined) {
        syncPayload.full_name = updates.name;
      }

      // Sync age
      if (updates.age !== undefined) {
        syncPayload.age = updates.age;
      }

      // Sync interests
      if (updates.interests !== undefined) {
        syncPayload.interests = updates.interests;
      }

      // Sync preferred activities
      if (updates.preferred_activities !== undefined) {
        syncPayload.preferred_activities = updates.preferred_activities;
      }

      // Sync location fields
      if (updates.country !== undefined) {
        syncPayload.country = updates.country;
      }
      if (updates.city !== undefined) {
        syncPayload.city = updates.city;
      }
      if (updates.neighborhood !== undefined) {
        syncPayload.neighborhood = updates.neighborhood;
      }
      if (updates.latitude !== undefined) {
        syncPayload.latitude = updates.latitude;
      }
      if (updates.longitude !== undefined) {
        syncPayload.longitude = updates.longitude;
      }

      // CRITICAL: Always set updated_at to NOW() to ensure profile appears first in swipe cards
      // This ensures that any profile update (even minor changes) pushes the profile to the top
      syncPayload.updated_at = new Date().toISOString();

      // Always update profiles table to ensure updated_at is refreshed
      const { data: syncData, error: syncError } = await supabase
        .from('profiles')
        .update(syncPayload)
        .eq('id', uid)
        .select();

      if (syncError) {
        logger.error('[PROFILE SYNC] Error:', syncError);
      } else {
        // Invalidate profiles_public cache immediately after sync
        qc.invalidateQueries({ queryKey: ['profiles_public'] });
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
