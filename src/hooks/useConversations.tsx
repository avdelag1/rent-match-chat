import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  client_id: string;
  owner_id: string;
  listing_id?: string;
  last_message_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined data
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  last_message?: {
    message_text: string;
    created_at: string;
    sender_id: string;
  };
}

export function useConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_messages!inner (
            message_text,
            created_at,
            sender_id
          )
        `)
        .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get other user profiles
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conversation) => {
          const otherUserId = conversation.client_id === user.id 
            ? conversation.owner_id 
            : conversation.client_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('conversation_messages')
            .select('message_text, created_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conversation,
            other_user: profile,
            last_message: lastMessage
          };
        })
      );

      return conversationsWithProfiles;
    },
    enabled: !!user?.id,
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select(`
          *,
          sender:profiles!conversation_messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      otherUserId, 
      listingId, 
      initialMessage 
    }: { 
      otherUserId: string; 
      listingId?: string; 
      initialMessage: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if user can start conversation
      const { data: canStart, error: canStartError } = await supabase
        .rpc('can_start_conversation', {
          p_user_id: user.id,
          p_other_user_id: otherUserId
        });

      if (canStartError) throw canStartError;
      if (!canStart) {
        throw new Error('You have reached your weekly conversation limit');
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${user.id},owner_id.eq.${otherUserId}),and(client_id.eq.${otherUserId},owner_id.eq.${user.id})`)
        .maybeSingle();

      let conversationId = existingConversation?.id;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        // Determine roles
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', otherUserId)
          .single();

        const clientId = myProfile?.role === 'client' ? user.id : otherUserId;
        const ownerId = myProfile?.role === 'owner' ? user.id : otherUserId;

        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            client_id: clientId,
            owner_id: ownerId,
            listing_id: listingId,
            match_id: crypto.randomUUID(), // Create a match ID for compatibility
            status: 'active'
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;

        // Increment conversation starter count
        await supabase.rpc('increment_conversation_count', {
          p_user_id: user.id
        });
      }

      // Send initial message
      const { data: message, error: messageError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_text: initialMessage,
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { conversationId, message };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: '💬 Conversation Started',
        description: 'Your message has been sent successfully!'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      message 
    }: { 
      conversationId: string; 
      message: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_text: message,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['conversation-messages', variables.conversationId] 
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useConversationStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { conversationsUsed: 0, conversationsLeft: 5 };

      const { data, error } = await supabase
        .rpc('get_weekly_conversation_count', {
          p_user_id: user.id
        });

      if (error) throw error;

      const conversationsUsed = data || 0;
      
      // Check if user has premium
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_packages (tier)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isPremium = subscription?.subscription_packages?.tier !== 'free';
      const conversationsLeft = isPremium ? 999 : Math.max(0, 5 - conversationsUsed);

      return {
        conversationsUsed,
        conversationsLeft,
        isPremium
      };
    },
    enabled: !!user?.id
  });
}