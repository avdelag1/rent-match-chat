
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
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('is_active', true)
        .limit(20);

      if (excludeSwipedIds.length > 0) {
        query = query.not('id', 'in', `(${excludeSwipedIds.join(',')})`);
      }

      const { data: listings, error } = await query;
      if (error) throw error;
      return listings as Listing[];
    },
  });
}

export function useSwipedListings() {
  return useQuery({
    queryKey: ['swipes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data: likes, error } = await supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', user.user.id);

      if (error) throw error;
      return likes.map(l => l.target_id);
    },
  });
}
