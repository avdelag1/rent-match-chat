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
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to avoid recreating functions on every render
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<any>(null);

  const startTyping = useCallback(() => {
    if (!conversationId || !user?.id || !typingChannelRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;

      typingChannelRef.current.track({
        userId: user.id,
        userName: user.user_metadata?.full_name || 'User',
        isTyping: true,
        timestamp: Date.now()
      }).catch((err: any) => {
        console.error('[useRealtimeChat] Failed to send typing indicator:', err);
      });
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [conversationId, user?.id]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !user?.id || !typingChannelRef.current) return;

    isTypingRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    typingChannelRef.current.track({
      userId: user.id,
      userName: user.user_metadata?.full_name || 'User',
      isTyping: false,
      timestamp: Date.now()
    }).catch((err: any) => {
      console.error('[useRealtimeChat] Failed to stop typing indicator:', err);
    });
  }, [conversationId, user?.id]);

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
          try {
            const newMessage = payload.new;

            // Get sender details
            const { data: senderProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            if (profileError) {
              console.error('[useRealtimeChat] Failed to fetch sender profile:', profileError);
            }

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

              // Enhanced duplicate detection:
              // 1. Check for exact ID match (handles duplicate real-time events)
              // 2. Check for temporary optimistic IDs that match content and sender
              // 3. Check for near-duplicate messages (same sender, text, within 2 seconds)
              const newMessageTime = new Date(newMessage.created_at).getTime();

              const exists = oldData.some((msg: any) => {
                if (msg.id === newMessage.id) return true;

                // Check for optimistic message replacement
                if (msg.id.toString().startsWith('temp-') &&
                    msg.message_text === newMessage.message_text &&
                    msg.sender_id === newMessage.sender_id) {
                  return true;
                }

                // Check for near-duplicates (within 2 seconds, same content and sender)
                const msgTime = new Date(msg.created_at).getTime();
                if (Math.abs(msgTime - newMessageTime) < 2000 &&
                    msg.message_text === newMessage.message_text &&
                    msg.sender_id === newMessage.sender_id) {
                  return true;
                }

                return false;
              });

              if (exists) {
                // Replace optimistic message with real message if it exists
                return oldData.map((msg: any) =>
                  msg.id.toString().startsWith('temp-') &&
                  msg.message_text === newMessage.message_text &&
                  msg.sender_id === newMessage.sender_id
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
          } catch (error) {
            console.error('[useRealtimeChat] Error processing new message:', error);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // Presence sync event - do nothing, connection already set in subscribe callback
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Set connected immediately when subscribed
          setIsConnected(true);

          // Track presence
          try {
            await messagesChannel.track({
              userId: user.id,
              userName: user.user_metadata?.full_name || 'User',
              avatarUrl: user.user_metadata?.avatar_url,
              status: 'online',
              lastSeen: new Date().toISOString()
            });
          } catch (error) {
            console.error('[useRealtimeChat] Failed to track presence on messages channel:', error);
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useRealtimeChat] Messages channel error');
          setIsConnected(false);
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

        // Only update if typing users actually changed to avoid unnecessary re-renders
        setTypingUsers(prev => {
          // If lengths differ, definitely changed
          if (prev.length !== currentTyping.length) return currentTyping;

          // If same length, check if user IDs are different
          const prevIds = prev.map(u => u.userId).sort().join(',');
          const currentIds = currentTyping.map(u => u.userId).sort().join(',');

          if (prevIds !== currentIds) return currentTyping;

          // No changes, keep previous state
          return prev;
        });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // New typing presence
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Left typing presence
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Store channel reference for startTyping/stopTyping
          typingChannelRef.current = typingChannel;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useRealtimeChat] Typing channel error');
          typingChannelRef.current = null;
        }
      });

    return () => {
      // Stop typing before cleanup
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }

      // Remove channels
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);

      // Clear state
      setTypingUsers([]);
      setIsConnected(false);
      typingChannelRef.current = null;
    };
  }, [conversationId, user?.id, queryClient]);

  return {
    startTyping,
    stopTyping,
    typingUsers,
    onlineUsers,
    isConnected
  };
}