import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'like' | 'message' | 'super_like' | 'match' | 'new_user';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  relatedUserId?: string;
  conversationId?: string;
}

interface DBNotification {
  id: string;
  type: string;
  message: string | null;
  created_at: string;
  read: boolean | null;
  link_url?: string;
  related_user_id?: string;
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch existing notifications from database on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedNotifications: Notification[] = data.map((notif: DBNotification) => ({
          id: notif.id,
          type: (notif.type as NotificationType) || 'like',
          title: notif.type === 'like' ? 'New Like' :
                 notif.type === 'match' ? 'New Match' :
                 notif.type === 'message' ? 'New Message' : 'Notification',
          message: notif.message || '',
          timestamp: new Date(notif.created_at),
          read: notif.read || false,
          actionUrl: notif.link_url,
          relatedUserId: notif.related_user_id || undefined,
        }));
        setNotifications(formattedNotifications);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to swipes (likes/super likes)
    const swipesChannel = supabase
      .channel('user-swipes-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `target_id=eq.${user.id}`,
        },
        async (payload) => {
          const swipe = payload.new;
          
          // Get swiper profile
          const { data: swiperProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', swipe.user_id)
            .maybeSingle();

          const { data: swiperRoleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', swipe.user_id)
            .maybeSingle();

          if (swiperProfile) {
            const notification: Notification = {
              id: `swipe-${swipe.id}`,
              type: swipe.swipe_type === 'super_like' ? 'super_like' : 'like',
              title: swiperProfile.full_name || 'Someone',
              message: swipe.swipe_type === 'super_like' 
                ? 'gave you a Super Like! ⭐' 
                : 'liked your profile! 🔥',
              avatar: swiperProfile.avatar_url,
              timestamp: new Date(),
              read: false,
              relatedUserId: swipe.user_id,
              actionUrl: swiperRoleData?.role === 'client' ? '/owner/liked-clients' : '/client/liked-properties'
            };
            
            setNotifications(prev => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    // Subscribe to new conversation messages
    const messagesChannel = supabase
      .channel('user-message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
        },
        async (payload) => {
          const message = payload.new;
          
          // Only show notifications for messages not sent by current user
          if (message.sender_id === user.id) return;
          
          // Check if current user is involved in the conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', message.conversation_id)
            .maybeSingle();

          if (conversation && 
              (conversation.client_id === user.id || conversation.owner_id === user.id)) {
            
            // Get sender info
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', message.sender_id)
              .maybeSingle();

            if (senderProfile) {
              const notification: Notification = {
                id: `message-${message.id}`,
                type: 'message',
                title: senderProfile.full_name || 'Someone',
                message: `sent you a message: "${message.message_text.slice(0, 50)}${message.message_text.length > 50 ? '...' : ''}"`,
                avatar: senderProfile.avatar_url,
                timestamp: new Date(),
                read: false,
                relatedUserId: message.sender_id,
                conversationId: message.conversation_id,
                actionUrl: '/messages'
              };

              setNotifications(prev => [notification, ...prev]);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to matches
    const matchesChannel = supabase
      .channel('user-match-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `or(client_id.eq.${user.id},owner_id.eq.${user.id})`,
        },
        async (payload) => {
          const match = payload.new;
          
          // Only notify when match becomes mutual
          if (match.is_mutual && !payload.old.is_mutual) {
            const otherUserId = match.client_id === user.id ? match.owner_id : match.client_id;
            
            // Get other user's profile
            const { data: otherProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', otherUserId)
              .maybeSingle();

            if (otherProfile) {
              const notification: Notification = {
                id: `match-${match.id}`,
                type: 'match',
                title: 'It\'s a Match! 🎉',
                message: `You and ${otherProfile.full_name} liked each other!`,
                avatar: otherProfile.avatar_url,
                timestamp: new Date(),
                read: false,
                relatedUserId: otherUserId,
                actionUrl: '/messages'
              };

              setNotifications(prev => [notification, ...prev]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe before removing channels to prevent memory leaks
      swipesChannel.unsubscribe();
      messagesChannel.unsubscribe();
      matchesChannel.unsubscribe();
    };
  }, [user?.id]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate to appropriate page
    if (notification.actionUrl) {
      if (notification.type === 'message' && notification.conversationId) {
        navigate(`/messages?conversationId=${notification.conversationId}`);
      } else {
        navigate(notification.actionUrl);
      }
    }
  };

  return {
    notifications,
    dismissNotification,
    markAllAsRead,
    handleNotificationClick,
    unreadCount: notifications.filter(n => !n.read).length
  };
}