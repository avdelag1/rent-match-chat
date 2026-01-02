import { useUserSubscription, useHasPremiumFeature } from './useSubscription';

/**
 * Hook to check if the user has premium access to see who liked them.
 *
 * Premium visibility rules:
 * - All users can see that they received a like (count)
 * - Only premium users can see WHO liked them (name, photo, profile preview)
 * - This applies to both clients and owners
 */
export function usePremiumLikesVisibility() {
  const { data: subscription, isLoading } = useUserSubscription();

  // Check for specific premium feature
  const hasSeeWhoLikedFeature = useHasPremiumFeature('see_who_liked');
  const hasAllFeatures = useHasPremiumFeature('all_features');

  // User has premium access if they have an active subscription with the feature
  const hasActiveSub = subscription?.is_active && subscription?.payment_status === 'active';
  const canSeeWhoLiked = hasActiveSub && (hasSeeWhoLikedFeature || hasAllFeatures);

  // For free users, check if they have any active subscription (any tier gives access for now)
  // This can be made more restrictive by checking specific tiers
  const hasPremiumAccess = hasActiveSub;

  return {
    isLoading,
    hasPremiumAccess,
    canSeeWhoLiked: canSeeWhoLiked || hasPremiumAccess, // Allow any premium user to see who liked
    subscriptionTier: subscription?.subscription_packages?.tier || 'free',
  };
}

/**
 * Component props for blurred/hidden content based on premium status
 */
export interface PremiumGateProps {
  canAccess: boolean;
  isLoading: boolean;
}
