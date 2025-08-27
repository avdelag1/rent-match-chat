
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClientFilterPreferences = {
  id?: string;
  user_id: string;
  min_price?: number | null;
  max_price?: number | null;
  min_bedrooms?: number | null;
  max_bedrooms?: number | null;
  pet_friendly_required?: boolean | null;
  furnished_required?: boolean | null;
  rental_duration?: string | null;
  location_zones?: string[] | null;
  amenities_required?: string[] | null;
};

async function fetchPreferences() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('client_filter_preferences' as any)
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error && (error as any).code !== 'PGRST116') throw error;
  return (data as ClientFilterPreferences) ?? null;
}

export function useClientFilterPreferences() {
  return useQuery({
    queryKey: ['client-filter-preferences'],
    queryFn: fetchPreferences,
  });
}

export function useSaveClientFilterPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Omit<ClientFilterPreferences, 'user_id'>) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Not authenticated');

      // Get existing row
      const { data: existing } = await supabase
        .from('client_filter_preferences' as any)
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('client_filter_preferences' as any)
          .update({ ...updates })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as ClientFilterPreferences;
      } else {
        const { data, error } = await supabase
          .from('client_filter_preferences' as any)
          .insert([{ ...updates, user_id: uid }])
          .select()
          .single();
        if (error) throw error;
        return data as ClientFilterPreferences;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-filter-preferences'] });
    },
  });
}
