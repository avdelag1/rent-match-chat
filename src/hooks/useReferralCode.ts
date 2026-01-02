import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReferralCode {
  code: string;
  totalReferrals: number;
}

interface ReferralStats {
  code: string;
  totalReferrals: number;
  referrals: {
    id: string;
    referredId: string;
    referredName: string;
    referredAvatar: string | null;
    createdAt: string;
    rewardClaimed: boolean;
  }[];
}

interface ProcessReferralResult {
  success: boolean;
  error?: string;
  message?: string;
  referral_id?: string;
}

export function useReferralCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get or create user's referral code
  const { data: referralCode, isLoading: isLoadingCode } = useQuery<ReferralCode | null>({
    queryKey: ['referral-code', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc('get_or_create_referral_code', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error getting referral code:', error);
        throw error;
      }

      if (data && data.length > 0) {
        return {
          code: data[0].code,
          totalReferrals: data[0].total_referrals || 0,
        };
      }

      return null;
    },
    enabled: !!user?.id,
  });

  // Get referral stats with detailed info
  const { data: referralStats, isLoading: isLoadingStats } = useQuery<ReferralStats | null>({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (codeError || !codeData) {
        return null;
      }

      // Get all referrals made with this code
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals' as any)
        .select(`
          id,
          referred_id,
          created_at,
          referrer_reward_claimed,
          profiles:referred_id (
            full_name,
            avatar_url
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      const referrals = (referralsData || []).map((ref: any) => ({
        id: ref.id,
        referredId: ref.referred_id,
        referredName: ref.profiles?.full_name || 'Unknown User',
        referredAvatar: ref.profiles?.avatar_url || null,
        createdAt: ref.created_at,
        rewardClaimed: ref.referrer_reward_claimed,
      }));

      return {
        code: codeData.code,
        totalReferrals: codeData.total_referrals || 0,
        referrals,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000, // Cache for 1 minute
  });

  // Process a referral code (used during signup)
  const processReferral = useMutation<ProcessReferralResult, Error, string>({
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

      return data as ProcessReferralResult;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
      queryClient.invalidateQueries({ queryKey: ['message-activations'] });
    },
  });

  // Generate the full referral URL
  const getReferralUrl = (): string => {
    if (!referralCode?.code) return '';
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://swipess.com';
    return `${baseUrl}/signup?ref=${referralCode.code}`;
  };

  return {
    referralCode: referralCode?.code || null,
    totalReferrals: referralCode?.totalReferrals || 0,
    referralStats,
    referralUrl: getReferralUrl(),
    isLoading: isLoadingCode || isLoadingStats,
    processReferral,
  };
}

// Hook to check if there's a referral code in URL
export function useReferralFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');

  // Store in sessionStorage so it persists through signup flow
  if (refCode) {
    sessionStorage.setItem('referral_code', refCode.toUpperCase().trim());
  }

  const getStoredReferralCode = (): string | null => {
    return sessionStorage.getItem('referral_code');
  };

  const clearStoredReferralCode = () => {
    sessionStorage.removeItem('referral_code');
  };

  return {
    referralCodeFromUrl: refCode?.toUpperCase().trim() || null,
    getStoredReferralCode,
    clearStoredReferralCode,
  };
}
