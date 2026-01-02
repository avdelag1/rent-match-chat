import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

/**
 * Hook that automatically processes stored referral codes after user signup.
 * Should be called in a component that renders after authentication (e.g., Index or a layout component).
 */
export function useReferralProcessor() {
  const { user } = useAuth();
  const processedRef = useRef(false);

  const processReferralMutation = useMutation({
    mutationFn: async (referralCode: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('process_referral', {
        p_referral_code: referralCode.toUpperCase().trim(),
        p_referred_user_id: user.id,
      });

      if (error) {
        console.error('Error processing referral:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        toast.success('Welcome bonus applied!', {
          description: 'You received 1 free message activation from your referral.',
          duration: 5000,
        });
      } else if (data?.error) {
        // Don't show error for "already has referrer" - just silently skip
        if (!data.error.includes('already has a referrer')) {
          console.log('Referral processing skipped:', data.error);
        }
      }
    },
    onError: (error: Error) => {
      console.error('Failed to process referral:', error);
      // Don't show error to user - referral processing is a background operation
    },
  });

  useEffect(() => {
    // Only process once per session and only if user is authenticated
    if (!user?.id || processedRef.current) return;

    const storedReferralCode = sessionStorage.getItem('referral_code');

    if (storedReferralCode) {
      processedRef.current = true;

      // Clear the stored code immediately to prevent double processing
      sessionStorage.removeItem('referral_code');

      // Small delay to ensure user profile is created in database
      const timeoutId = setTimeout(() => {
        processReferralMutation.mutate(storedReferralCode);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [user?.id]);

  return {
    isProcessing: processReferralMutation.isPending,
  };
}
