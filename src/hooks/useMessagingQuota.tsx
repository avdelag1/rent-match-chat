import { useState, useEffect } from 'react';
import { useUserSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type PlanLimits = {
  messages_per_month: number;
  unlimited_messages: boolean;
};

// This tracks CONVERSATIONS STARTED per month, not individual messages
// Once a conversation is started, users can send unlimited messages within it
const PLAN_LIMITS: Record<string, PlanLimits> = {
  'free': { messages_per_month: 5, unlimited_messages: false }, // 5 conversations can be started
  'PREMIUM CLIENT': { messages_per_month: 10, unlimited_messages: false },
  'PREMIUM ++ CLIENT': { messages_per_month: 25, unlimited_messages: false },
  'UNLIMITED CLIENT': { messages_per_month: 0, unlimited_messages: true },
  'PREMIUM + OWNER': { messages_per_month: 10, unlimited_messages: false },
  'PREMIUM ++ OWNER': { messages_per_month: 25, unlimited_messages: false },
  'PREMIUM MAX OWNER': { messages_per_month: 50, unlimited_messages: false },
  'UNLIMITED OWNER': { messages_per_month: 0, unlimited_messages: true },
};

export function useMessagingQuota() {
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription();
  const queryClient = useQueryClient();
  
  // Get the current plan name
  const planName = subscription?.subscription_packages?.name || 'free';
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS['free'];
  
  // Query to get CONVERSATIONS STARTED this month (not individual messages)
  const { data: conversationsStarted = 0 } = useQuery({
    queryKey: ['conversations-started-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Count conversations where the user sent the FIRST message this month
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, created_at')
        .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
        .gte('created_at', startOfMonth.toISOString());
      
      if (error) {
        console.error('Error fetching conversations count:', error);
        return 0;
      }
      
      if (!conversations || conversations.length === 0) return 0;
      
      // For each conversation, check if THIS user sent the first message
      let count = 0;
      for (const conv of conversations) {
        const { data: firstMessage } = await supabase
          .from('conversation_messages')
          .select('sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        if (firstMessage?.sender_id === user.id) {
          count++;
        }
      }
      
      return count;
    },
    enabled: !!user,
  });
  
  const isUnlimited = limits.unlimited_messages;
  const totalAllowed = limits.messages_per_month;
  const remainingConversations = isUnlimited ? 999999 : Math.max(0, totalAllowed - conversationsStarted);
  const canStartNewConversation = isUnlimited || remainingConversations > 0;
  
  const decrementConversationCount = () => {
    // Invalidate the query to refetch the count
    queryClient.invalidateQueries({ queryKey: ['conversations-started-count', user?.id] });
  };
  
  const refreshQuota = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations-started-count', user?.id] });
  };
  
  return {
    remainingConversations,
    conversationsStartedThisMonth: conversationsStarted,
    totalAllowed,
    canStartNewConversation,
    canSendMessage: true, // Always true - messages are unlimited within existing conversations
    isUnlimited,
    currentPlan: planName,
    decrementConversationCount,
    refreshQuota
  };
}