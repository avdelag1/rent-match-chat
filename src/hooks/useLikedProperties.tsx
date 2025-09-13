
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';

export function useLikedProperties() {
  return useQuery({
    queryKey: ['liked-properties'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      console.log('Fetching liked properties for user:', user.user.id);

      // Get liked listing IDs
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', user.user.id)
        .eq('direction', 'right');

      if (likesError) {
        console.error('Error fetching likes:', likesError);
        throw likesError;
      }
      
      console.log('Found likes:', likes);
      
      if (!likes || likes.length === 0) {
        console.log('No likes found');
        return [];
      }

      const likedIds = likes.map(l => l.target_id);
      console.log('Liked IDs:', likedIds);

      // Get the actual listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('id', likedIds)
        .eq('status', 'active')
        .eq('is_active', true);

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        throw listingsError;
      }
      
      console.log('Found listings:', listings);
      return listings as Listing[];
    },
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch
  });
}
