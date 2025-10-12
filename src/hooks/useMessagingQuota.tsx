import { useState, useEffect } from 'react';
import { useUserSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type PlanLimits = {
  messages_per_month: number;
  unlimited_messages: boolean;
};

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'free': { messages_per_month: 5, unlimited_messages: false },
  'PREMIUM CLIENT': { messages_per_month: 6, unlimited_messages: false },
  'PREMIUM ++ CLIENT': { messages_per_month: 12, unlimited_messages: false },
  'UNLIMITED CLIENT': { messages_per_month: 0, unlimited_messages: true },
  'PREMIUM + OWNER': { messages_per_month: 6, unlimited_messages: false },
  'PREMIUM ++ OWNER': { messages_per_month: 12, unlimited_messages: false },
  'PREMIUM MAX OWNER': { messages_per_month: 20, unlimited_messages: false },
  'UNLIMITED OWNER': { messages_per_month: 30, unlimited_messages: false },
};

export function useMessagingQuota() {
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription();
  const queryClient = useQueryClient();
  
  // Get the current plan name
  const planName = subscription?.subscription_packages?.name || 'free';
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS['free'];
  
  // Query to get messages sent this month
  const { data: messageCount = 0 } = useQuery({
    queryKey: ['messages-sent-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('conversation_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      if (error) {
        console.error('Error fetching message count:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user,
  });
  
  const isUnlimited = limits.unlimited_messages;
  const totalAllowed = limits.messages_per_month;
  const remainingMessages = isUnlimited ? 999999 : Math.max(0, totalAllowed - messageCount);
  const canSendMessage = isUnlimited || remainingMessages > 0;
  
  const decrementMessageCount = () => {
    // Invalidate the query to refetch the count
    queryClient.invalidateQueries({ queryKey: ['messages-sent-count', user?.id] });
  };
  
  const refreshQuota = () => {
    queryClient.invalidateQueries({ queryKey: ['messages-sent-count', user?.id] });
  };
  
  return {
    remainingMessages,
    messagesSentThisMonth: messageCount,
    totalAllowed,
    canSendMessage,
    isUnlimited,
    currentPlan: planName,
    decrementMessageCount,
    refreshQuota
  };
}