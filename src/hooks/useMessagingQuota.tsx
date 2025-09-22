import { useState, useEffect } from 'react';
import { useUserSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type PlanLimits = {
  messages_per_month: number;
  unlimited_messages: boolean;
};

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'free': { messages_per_month: 5, unlimited_messages: false },
  'PREMIUM CLIENT': { messages_per_month: 50, unlimited_messages: false },
  'PREMIUM ++ CLIENT': { messages_per_month: 150, unlimited_messages: false },
  'UNLIMITED CLIENT': { messages_per_month: 0, unlimited_messages: true },
  'PREMIUM + OWNER': { messages_per_month: 100, unlimited_messages: false },
  'PREMIUM ++ OWNER': { messages_per_month: 250, unlimited_messages: false },
  'PREMIUM MAX OWNER': { messages_per_month: 500, unlimited_messages: false },
  'UNLIMITED OWNER': { messages_per_month: 0, unlimited_messages: true },
};

export function useMessagingQuota() {
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription();
  const [remainingMessages, setRemainingMessages] = useState<number>(0);
  const [messagesSentThisMonth, setMessagesSentThisMonth] = useState<number>(0);
  
  const currentPlan = subscription?.subscription_packages?.name || 'free';
  const planLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS['free'];
  
  useEffect(() => {
    if (!user) return;
    
    fetchMessageCount();
  }, [user, currentPlan]);

  const fetchMessageCount = async () => {
    if (!user) return;
    
    try {
      // Get messages sent this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('id')
        .eq('sender_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      if (error) throw error;
      
      const sentCount = data?.length || 0;
      setMessagesSentThisMonth(sentCount);
      
      if (planLimits.unlimited_messages) {
        setRemainingMessages(999999); // Unlimited
      } else {
        setRemainingMessages(Math.max(0, planLimits.messages_per_month - sentCount));
      }
    } catch (error) {
      console.error('Error fetching message count:', error);
      setRemainingMessages(0);
    }
  };

  const canSendMessage = () => {
    return planLimits.unlimited_messages || remainingMessages > 0;
  };

  const decrementMessageCount = () => {
    if (!planLimits.unlimited_messages && remainingMessages > 0) {
      setRemainingMessages(prev => prev - 1);
      setMessagesSentThisMonth(prev => prev + 1);
    }
  };

  return {
    remainingMessages,
    messagesSentThisMonth,
    totalAllowed: planLimits.messages_per_month,
    canSendMessage: canSendMessage(),
    isUnlimited: planLimits.unlimited_messages,
    currentPlan,
    decrementMessageCount,
    refreshQuota: fetchMessageCount
  };
}