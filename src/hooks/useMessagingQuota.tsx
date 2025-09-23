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
  
  // For testing: Always allow unlimited messaging
  return {
    remainingMessages: 999999,
    messagesSentThisMonth: 0,
    totalAllowed: 999999,
    canSendMessage: true,
    isUnlimited: true,
    currentPlan: 'unlimited_testing',
    decrementMessageCount: () => {}, // No-op for unlimited
    refreshQuota: () => {} // No-op for unlimited
  };
}