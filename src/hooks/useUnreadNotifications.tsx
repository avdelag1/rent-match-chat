import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Fetch unread count from notifications table
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) {
          console.error('Error fetching unread notifications:', error);
          return;
        }

        setUnreadCount(count || 0);
      } catch (err) {
        console.error('Error in fetchUnreadCount:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('unread-notifications-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch count on any change
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe before removing channel
      channel.unsubscribe();
    };
  }, [user?.id]);

  return {
    unreadCount,
    isLoading
  };
}
