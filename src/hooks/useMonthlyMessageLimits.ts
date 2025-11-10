import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMonthlySubscriptionBenefits } from './useMonthlySubscriptionBenefits';

/**
 * Hook to enforce monthly message limits for subscription users
 * Returns whether user can send a message based on their subscription
 */
export function useMonthlyMessageLimits() {
  const { user } = useAuth();
  const benefits = useMonthlySubscriptionBenefits();

  // Fetch monthly message usage
  const { data: monthlyUsage, isLoading } = useQuery({
    queryKey: ['monthly-message-usage', user?.id, new Date().getMonth()],
    queryFn: async () => {
      if (!user?.id || !benefits.isMonthly) {
        return { used: 0, limit: 0, remaining: 0, canSend: false };
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Count messages sent this month
      const { count, error } = await supabase
        .from('conversation_messages')
        .select('id', { count: 'exact', head: 0 })
        .eq('sender_id', user.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (error) {
        console.error('Error fetching message count:', error);
        return {
          used: 0,
          limit: benefits.messageLimit,
          remaining: benefits.messageLimit,
          canSend: true,
        };
      }

      const used = count || 0;
      const remaining = Math.max(0, benefits.messageLimit - used);

      return {
        used,
        limit: benefits.messageLimit,
        remaining,
        canSend: remaining > 0,
      };
    },
    enabled: !!user?.id && benefits.isMonthly && benefits.isActive,
    staleTime: 30000, // 30 seconds
  });

  return {
    // Usage info
    messagesUsed: monthlyUsage?.used || 0,
    messagesRemaining: monthlyUsage?.remaining || benefits.messageLimit,
    messageLimit: benefits.messageLimit,

    // Permissions
    canSendMessage: monthlyUsage?.canSend && benefits.isActive,
    isAtLimit: (monthlyUsage?.remaining || 0) <= 0,
    limitPercentage: benefits.messageLimit > 0
      ? ((monthlyUsage?.used || 0) / benefits.messageLimit) * 100
      : 0,

    // Status
    hasMonthlyLimit: benefits.isMonthly,
    isLoading,
    isActive: benefits.isActive,
    tier: benefits.tier,
  };
}
