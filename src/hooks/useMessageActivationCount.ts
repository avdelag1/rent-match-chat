import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useMessageActivationCount() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['message-activation-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      // Get active pay-per-use credits (not expired)
      const { data: payPerUse, error: payPerUseError } = await supabase
        .from('message_activations')
        .select('remaining_activations')
        .eq('user_id', user.id)
        .eq('activation_type', 'pay_per_use')
        .gt('expires_at', now)
        .gt('remaining_activations', 0);

      if (payPerUseError) {
        console.error('Error fetching pay-per-use activations:', payPerUseError);
        return 0;
      }

      // Get monthly subscription activations
      const { data: monthly, error: monthlyError } = await supabase
        .from('message_activations')
        .select('remaining_activations')
        .eq('user_id', user.id)
        .eq('activation_type', 'monthly_subscription')
        .gte('reset_date', today)
        .gt('remaining_activations', 0);

      if (monthlyError) {
        console.error('Error fetching monthly activations:', monthlyError);
        return 0;
      }

      const payPerUseTotal = (payPerUse || []).reduce((sum, act) => sum + (act.remaining_activations || 0), 0);
      const monthlyTotal = (monthly || []).reduce((sum, act) => sum + (act.remaining_activations || 0), 0);

      return payPerUseTotal + monthlyTotal;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  return {
    count: data ?? 0,
    isLoading,
  };
}
