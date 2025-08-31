
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClientFilterPreferences = {
  id?: string;
  user_id: string;
  min_price?: number | null;
  max_price?: number | null;
  min_bedrooms?: number | null;
  max_bedrooms?: number | null;
  min_bathrooms?: number | null;
  max_bathrooms?: number | null;
  pet_friendly_required?: boolean;
  furnished_required?: boolean;
  rental_duration?: string | null;
  location_zones?: string[] | null;
  property_types?: string[] | null;
  amenities_required?: string[] | null;
  requires_gym?: boolean;
  requires_balcony?: boolean;
  requires_elevator?: boolean;
  requires_jacuzzi?: boolean;
  requires_coworking_space?: boolean;
  requires_solar_panels?: boolean;
};

// Type for database operations (excluding id)
type ClientFilterPreferencesUpdate = Omit<ClientFilterPreferences, 'id' | 'user_id'>;

async function fetchOwnFilterPreferences() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('client_filter_preferences')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ClientFilterPreferences | null;
}

export function useClientFilterPreferences() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['client-filter-preferences-own'],
    queryFn: fetchOwnFilterPreferences,
  });

  const mutation = useMutation({
    mutationFn: async (updates: ClientFilterPreferencesUpdate) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      // Get existing row
      const { data: existing } = await supabase
        .from('client_filter_preferences')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('client_filter_preferences')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as ClientFilterPreferences;
      } else {
        const { data, error } = await supabase
          .from('client_filter_preferences')
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) throw error;
        return data as ClientFilterPreferences;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-filter-preferences-own'] });
    },
  });

  return {
    ...query,
    updatePreferences: mutation.mutateAsync,
    isLoading: query.isLoading || mutation.isPending,
  };
}

export function useSaveClientFilterPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ClientFilterPreferencesUpdate) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      // Get existing row
      const { data: existing } = await supabase
        .from('client_filter_preferences')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('client_filter_preferences')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as ClientFilterPreferences;
      } else {
        const { data, error } = await supabase
          .from('client_filter_preferences')
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) throw error;
        return data as ClientFilterPreferences;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-filter-preferences-own'] });
    },
  });
}
