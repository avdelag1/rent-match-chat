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

// Get profile IDs that should be excluded (seen in last 7 days)
export function useExcludedProfiles(viewType: 'profile' | 'listing' = 'profile') {
  return useQuery({
    queryKey: ['excluded-profiles', viewType],
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
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching excluded profiles:', error);
        return [];
      }

      return data?.map(v => v.viewed_profile_id) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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
