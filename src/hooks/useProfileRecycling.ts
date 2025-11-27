import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfileView {
  id: string;
  user_id: string;
  viewed_profile_id: string;
  view_type: 'profile' | 'listing';
  action: 'like' | 'pass' | 'view';
  created_at: string;
}

// Record a profile view for smart recycling
export function useRecordProfileView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      profileId, 
      viewType, 
      action 
    }: { 
      profileId: string; 
      viewType: 'profile' | 'listing'; 
      action: 'like' | 'pass' | 'view';
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profile_views')
        .upsert({
          user_id: user.user.id,
          viewed_profile_id: profileId,
          view_type: viewType,
          action,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,viewed_profile_id,view_type'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-views'] });
      queryClient.invalidateQueries({ queryKey: ['excluded-profiles'] });
    }
  });
}

// Get permanently excluded profiles (disliked/passed) - unless listing was updated after swipe
export function usePermanentlyExcludedProfiles(viewType: 'profile' | 'listing' = 'profile') {
  return useQuery({
    queryKey: ['permanently-excluded', viewType],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Get ALL passed/disliked cards (no time limit)
      const { data: passedCards, error } = await supabase
        .from('profile_views')
        .select('viewed_profile_id, created_at')
        .eq('user_id', user.user.id)
        .eq('view_type', viewType)
        .eq('action', 'pass');

      if (error) {
        console.error('Error fetching permanently excluded profiles:', error);
        return [];
      }

      if (!passedCards?.length) return [];

      // For listings: check if they were updated AFTER the swipe
      if (viewType === 'listing') {
        const listingIds = passedCards.map(p => p.viewed_profile_id);
        const { data: listings } = await supabase
          .from('listings')
          .select('id, updated_at')
          .in('id', listingIds);

        // Filter out listings that were updated after swipe (show them again)
        const stillExcluded = passedCards.filter(card => {
          const listing = listings?.find(l => l.id === card.viewed_profile_id);
          if (!listing?.updated_at) return true; // No update info, stay excluded
          return new Date(listing.updated_at) <= new Date(card.created_at);
        });

        return stillExcluded.map(v => v.viewed_profile_id);
      }

      // For client profiles: check if they were updated AFTER the swipe
      if (viewType === 'profile') {
        const profileIds = passedCards.map(p => p.viewed_profile_id);
        const { data: profiles } = await supabase
          .from('client_profiles')
          .select('user_id, updated_at')
          .in('user_id', profileIds);

        const stillExcluded = passedCards.filter(card => {
          const profile = profiles?.find(p => p.user_id === card.viewed_profile_id);
          if (!profile?.updated_at) return true;
          return new Date(profile.updated_at) <= new Date(card.created_at);
        });

        return stillExcluded.map(v => v.viewed_profile_id);
      }

      return passedCards.map(v => v.viewed_profile_id);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Get temporarily excluded profiles (liked in last 7 days)
export function useTemporarilyExcludedProfiles(viewType: 'profile' | 'listing' = 'profile') {
  return useQuery({
    queryKey: ['temp-excluded-likes', viewType],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_profile_id')
        .eq('user_id', user.user.id)
        .eq('view_type', viewType)
        .eq('action', 'like')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching temporarily excluded profiles:', error);
        return [];
      }

      return data?.map(v => v.viewed_profile_id) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Combined exclusion hook for convenience
export function useExcludedProfiles(viewType: 'profile' | 'listing' = 'profile') {
  const { data: permanent = [] } = usePermanentlyExcludedProfiles(viewType);
  const { data: temporary = [] } = useTemporarilyExcludedProfiles(viewType);
  
  return {
    data: [...permanent, ...temporary],
    isLoading: false,
  };
}

// Get user's like/dislike patterns for smart matching
export function useUserSwipePatterns(viewType: 'profile' | 'listing' = 'profile') {
  return useQuery({
    queryKey: ['swipe-patterns', viewType],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { liked: [], disliked: [] };

      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_profile_id, action')
        .eq('user_id', user.user.id)
        .eq('view_type', viewType)
        .in('action', ['like', 'pass']);

      if (error) {
        console.error('Error fetching swipe patterns:', error);
        return { liked: [], disliked: [] };
      }

      const liked = data?.filter(v => v.action === 'like').map(v => v.viewed_profile_id) || [];
      const disliked = data?.filter(v => v.action === 'pass').map(v => v.viewed_profile_id) || [];

      return { liked, disliked };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get recycled profiles (seen more than 7 days ago)
export function useRecycledProfiles(viewType: 'profile' | 'listing' = 'profile') {
  return useQuery({
    queryKey: ['recycled-profiles', viewType],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_profile_id, action, created_at')
        .eq('user_id', user.user.id)
        .eq('view_type', viewType)
        .lt('created_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching recycled profiles:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
