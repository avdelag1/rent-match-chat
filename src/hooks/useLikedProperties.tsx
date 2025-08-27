
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';

export function useLikedProperties() {
  return useQuery({
    queryKey: ['liked-properties'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Get liked listing IDs
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', user.user.id)
        .eq('direction', 'right');

      if (likesError) throw likesError;
      
      if (!likes || likes.length === 0) return [];

      const likedIds = likes.map(l => l.target_id);

      // Get the actual listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('id', likedIds)
        .eq('status', 'active')
        .eq('is_active', true);

      if (listingsError) throw listingsError;
      return listings as Listing[];
    },
  });
}
