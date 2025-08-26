
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  address: string;
  city: string;
  neighborhood: string;
  property_type: string;
  beds: number;
  baths: number;
  square_footage: number;
  furnished: boolean;
  owner_id: string;
  description: string;
  amenities: string[];
  status: string;
}

export function useListings(excludeSwipedIds: string[] = []) {
  return useQuery({
    queryKey: ['listings', excludeSwipedIds],
    queryFn: async () => {
      const { data: listings, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('is_active', true)
        .not('id', 'in', `(${excludeSwipedIds.join(',') || 'null'})`)
        .limit(20);

      if (error) throw error;
      return listings as Listing[];
    },
  });
}

export function useSwipedListings() {
  return useQuery({
    queryKey: ['swipes'],
    queryFn: async () => {
      const { data: swipes, error } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('target_type', 'listing');

      if (error) throw error;
      return swipes.map(s => s.target_id);
    },
  });
}
