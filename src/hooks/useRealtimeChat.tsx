import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface UserPresence {
  userId: string;
  userName: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

export function useRealtimeChat(conversationId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Track typing with debounce
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!conversationId || !user?.id) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing status if not already typing
    if (!isTyping) {
      setIsTyping(true);
      
      const channel = supabase.channel(`typing-${conversationId}`);
      channel.track({
        userId: user.id,
        userName: user.user_metadata?.full_name || 'User',
        isTyping: true,
        timestamp: Date.now()
      });
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  }, [conversationId, user?.id, isTyping, typingTimeout]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !user?.id) return;

    setIsTyping(false);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      userId: user.id,
      userName: user.user_metadata?.full_name || 'User',
      isTyping: false,
      timestamp: Date.now()
    });
  }, [conversationId, user?.id, typingTimeout]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    console.log('🚀 Setting up comprehensive real-time chat for:', conversationId);

    // Messages subscription
    const messagesChannel = supabase
      .channel(`messages-${conversationId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('📨 New message received:', payload);
          
          const newMessage = payload.new;
          
          // Get sender details
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const completeMessage = {
            ...newMessage,
            sender: senderProfile || { 
              id: newMessage.sender_id, 
              full_name: 'Unknown', 
              avatar_url: null 
            }
          };
          
          // Update messages immediately
          queryClient.setQueryData(['conversation-messages', conversationId], (oldData: any) => {
            if (!oldData) return [completeMessage];
            
            const exists = oldData.some((msg: any) => msg.id === newMessage.id);
            if (exists) return oldData;
            
            return [...oldData, completeMessage];
          });

          // Clear typing status for sender
          setTypingUsers(prev => prev.filter(u => u.userId !== newMessage.sender_id));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        console.log('👥 Presence sync');
        const newState = messagesChannel.presenceState();
        console.log('Current presence state:', newState);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Messages subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          // Track presence
          await messagesChannel.track({
            userId: user.id,
            userName: user.user_metadata?.full_name || 'User',
            avatarUrl: user.user_metadata?.avatar_url,
            status: 'online',
            lastSeen: new Date().toISOString()
          });
        }
      });

    // Typing indicators subscription
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = typingChannel.presenceState();
        console.log('⌨️ Typing state sync:', newState);
        
        const currentTyping: TypingUser[] = [];
        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.isTyping && presence.userId !== user.id) {
              currentTyping.push({
                userId: presence.userId,
                userName: presence.userName,
                timestamp: presence.timestamp
              });
            }
          });
        });
        
        setTypingUsers(currentTyping);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('⌨️ New typing presence:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('⌨️ Left typing presence:', leftPresences);
      })
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up real-time subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      stopTyping();
    };
  }, [conversationId, user?.id, queryClient, stopTyping]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    startTyping,
    stopTyping,
    isTyping,
    typingUsers,
    onlineUsers,
    isConnected
  };
}