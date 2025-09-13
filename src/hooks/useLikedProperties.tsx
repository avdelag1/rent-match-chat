
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from './useListings';

export function useLikedProperties() {
  return useQuery({
    queryKey: ['liked-properties'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      console.log('🔍 Fetching liked properties for user:', user.user.id);

      // First check if there are ANY likes in the table
      const { data: allLikes, error: allLikesError } = await supabase
        .from('likes')
        .select('*')
        .limit(10);

      console.log('📊 Sample of all likes in database:', allLikes, 'Error:', allLikesError);

      // Get liked listing IDs from likes table
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id, created_at, direction')
        .eq('user_id', user.user.id)
        .eq('direction', 'right')
        .order('created_at', { ascending: false });

      console.log('💕 User likes found:', likes, 'Error:', likesError);

      if (likesError) {
        console.error('❌ Error fetching likes:', likesError);
        throw likesError;
      }

      // If no likes found, check swipes table as backup
      if (!likes || likes.length === 0) {
        console.log('📝 No likes found, checking swipes table...');
        
        const { data: swipes, error: swipesError } = await supabase
          .from('swipes')
          .select('target_id, created_at')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false });

        console.log('🔄 Swipes found:', swipes, 'Error:', swipesError);

        if (swipes && swipes.length > 0) {
          const likedIds = swipes.map(s => s.target_id);
          console.log('🏠 Fetching listings from swipes:', likedIds);

          const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('*')
            .in('id', likedIds)
            .eq('is_active', true);

          console.log('🏡 Listings from swipes result:', listings, 'Error:', listingsError);
          return (listings || []) as Listing[];
        }

        console.log('📭 No liked properties found in either table');
        return [];
      }

      const likedIds = likes.map(l => l.target_id);
      console.log('🏠 Fetching listings for liked IDs:', likedIds);

      // Get the actual listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('id', likedIds)
        .eq('is_active', true);

      if (listingsError) {
        console.error('❌ Error fetching listings:', listingsError);
        throw listingsError;
      }
      
      console.log('🏡 Final listings result:', listings);
      return (listings || []) as Listing[];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch every 10 seconds for debugging
    staleTime: 0, // Always refetch
  });
}
