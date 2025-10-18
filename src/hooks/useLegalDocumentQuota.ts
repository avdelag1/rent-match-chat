import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserSubscription } from './useSubscription';

export function useLegalDocumentQuota() {
  const { user } = useAuth();
  const { data: subscription } = useUserSubscription();
  const queryClient = useQueryClient();
  
  const { data: quota, isLoading } = useQuery({
    queryKey: ['legal-document-quota', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('legal_document_quota')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;

      // Check if needs reset (new month)
      if (data && new Date(data.reset_date) < new Date()) {
        const { error: updateError } = await supabase
          .from('legal_document_quota')
          .update({
            used_this_month: 0,
            reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
          })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;

        // Refetch after reset
        const { data: refreshedData } = await supabase
          .from('legal_document_quota')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        return refreshedData;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Initialize quota for new users
  const initializeQuota = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const packageLimit = subscription?.subscription_packages?.legal_documents_included || 0;

      const { error } = await supabase
        .from('legal_document_quota')
        .insert({
          user_id: user.id,
          monthly_limit: packageLimit,
          used_this_month: 0,
          reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-document-quota'] });
    },
  });

  // Use a legal document quota
  const useDocumentQuota = useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!quota) throw new Error('Quota not initialized');

      const { error } = await supabase
        .from('legal_document_quota')
        .update({ used_this_month: quota.used_this_month + 1 })
        .eq('user_id', user.id);
      
      if (error) throw error;

      return { documentId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-document-quota'] });
    },
  });
  
  const packageLimit = subscription?.subscription_packages?.legal_documents_included || 0;
  const isUnlimited = packageLimit === 0 && subscription?.is_active;
  const remaining = isUnlimited ? 999 : Math.max(0, packageLimit - (quota?.used_this_month || 0));
  
  return {
    limit: packageLimit,
    used: quota?.used_this_month || 0,
    remaining,
    isUnlimited,
    needsToPay: !isUnlimited && remaining === 0, // 500 MXN per document
    isLoading,
    quota,
    initializeQuota,
    useDocumentQuota,
  };
}
