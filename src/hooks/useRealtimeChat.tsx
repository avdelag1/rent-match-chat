import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Track typing with debounce - use ref to avoid circular dependencies
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [typingChannelRef, setTypingChannelRef] = useState<any>(null);

  const startTyping = useCallback(() => {
    if (!conversationId || !user?.id || !typingChannelRef) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status if not already typing
    if (!isTyping) {
      setIsTyping(true);

      // Use existing channel reference
      typingChannelRef.track({
        userId: user.id,
        userName: user.user_metadata?.full_name || 'User',
        isTyping: true,
        timestamp: Date.now()
      }).catch((error: any) => {
        console.error('[Typing] Error tracking presence:', error);
      });
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      typingChannelRef?.track({
        userId: user.id,
        userName: user.user_metadata?.full_name || 'User',
        isTyping: false,
        timestamp: Date.now()
      }).catch((error: any) => {
        console.error('[Typing] Error stopping presence:', error);
      });
    }, 3000);
  }, [conversationId, user?.id, isTyping, typingChannelRef]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !user?.id || !typingChannelRef) return;

    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    typingChannelRef.track({
      userId: user.id,
      userName: user.user_metadata?.full_name || 'User',
      isTyping: false,
      timestamp: Date.now()
    }).catch((error: any) => {
      console.error('[Typing] Error stopping presence:', error);
    });
  }, [conversationId, user?.id, typingChannelRef]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId || !user?.id) return;

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
            
            // Check for both real IDs and temporary optimistic IDs
            const exists = oldData.some((msg: any) => 
              msg.id === newMessage.id || 
              (msg.id.toString().startsWith('temp-') && msg.message_text === newMessage.message_text && msg.sender_id === newMessage.sender_id)
            );
            
            if (exists) {
              // Replace optimistic message with real message if it exists
              return oldData.map((msg: any) => 
                msg.id.toString().startsWith('temp-') && msg.message_text === newMessage.message_text && msg.sender_id === newMessage.sender_id
                  ? completeMessage
                  : msg
              );
            }
            
            return [...oldData, completeMessage];
          });

          // Clear typing status for sender
          setTypingUsers(prev => prev.filter(u => u.userId !== newMessage.sender_id));
          
          // Dispatch custom event for notifications
          window.dispatchEvent(new CustomEvent('new-message', { detail: newMessage }));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const newState = messagesChannel.presenceState();
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
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
        // New typing presence
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Left typing presence
      })
      .subscribe(async (status) => {
        console.log('[Typing] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          // Store channel reference for startTyping/stopTyping
          setTypingChannelRef(typingChannel);
        }
      });

    return () => {
      console.log('[Realtime] Cleaning up channels for conversation:', conversationId);
      
      // Stop typing before cleanup
      if (isTyping) {
        stopTyping();
      }
      
      // Remove channels
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Clear state
      setTypingUsers([]);
      setIsConnected(false);
      setTypingChannelRef(null);
    };
  }, [conversationId, user?.id, queryClient, stopTyping]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    startTyping,
    stopTyping,
    isTyping,
    typingUsers,
    onlineUsers,
    isConnected
  };
}