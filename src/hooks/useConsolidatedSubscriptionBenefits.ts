import { useUserSubscription } from './useSubscription';
import { useMessageActivations } from './useMessageActivations';
import { useLegalDocumentQuota } from './useLegalDocumentQuota';
import { usePropertyLimits } from './usePropertyLimits';

/**
 * Consolidated subscription benefits hook
 * Combines all subscription-related features in one place
 */
export function useConsolidatedSubscriptionBenefits() {
  const { data: subscription } = useUserSubscription();
  const messageActivations = useMessageActivations();
  const legalDocQuota = useLegalDocumentQuota();
  const propertyLimits = usePropertyLimits();
  
  const tier = subscription?.subscription_packages?.tier || 'free';
  
  // Visibility ranking (for profile sorting in swipe)
  const getVisibilityRank = (tier: string) => {
    if (tier === 'unlimited') return 1;
    if (tier === 'premium_plus') return 2;
    if (tier === 'premium') return 3;
    if (tier === 'basic') return 4;
    return 999; // Free users at bottom
  };

  const getVisibilityPercentage = (tier: string) => {
    if (tier === 'unlimited') return 100;
    if (tier === 'premium_plus') return 80;
    if (tier === 'premium') return 60;
    if (tier === 'basic') return 40;
    return 20; // Free users get 20% visibility
  };

  const getMonthlyMessageLimit = (tier: string) => {
    if (tier === 'unlimited') return 999;
    if (tier === 'premium_plus') return 100;
    if (tier === 'premium') return 50;
    if (tier === 'basic') return 20;
    return 5; // Free users get 5 messages
  };

  return {
    // Visibility (for profile ranking in swipe)
    visibilityRank: getVisibilityRank(tier),
    visibilityPercentage: getVisibilityPercentage(tier),
    
    // Messages
    canSendMessage: messageActivations.canSendMessage,
    remainingMessages: messageActivations.totalActivations,
    monthlyMessageLimit: getMonthlyMessageLimit(tier),
    
    // Properties (owners only)
    canCreateProperty: propertyLimits.canCreateMore,
    remainingProperties: propertyLimits.remainingListings,
    maxProperties: propertyLimits.maxListings,
    
    // Legal documents
    canUploadLegalDoc: legalDocQuota.remaining > 0,
    remainingLegalDocs: legalDocQuota.remaining,
    maxLegalDocs: legalDocQuota.limit,
    
    // Features
    canSeeLikes: tier !== 'free',
    hasAdvancedFilters: ['premium', 'premium_plus', 'unlimited'].includes(tier),
    hasSuperLikes: ['premium', 'premium_plus', 'unlimited'].includes(tier),
    hasUnlimitedSwipes: ['premium_plus', 'unlimited'].includes(tier),
    hasPrioritySupport: ['premium_plus', 'unlimited'].includes(tier),
    hasVerifiedBadge: ['premium', 'premium_plus', 'unlimited'].includes(tier),
    
    // Plan info
    tier,
    planName: subscription?.subscription_packages?.name || 'Free',
    isActive: subscription?.is_active || false,
    isPremium: ['premium', 'premium_plus', 'unlimited'].includes(tier),
  };
}
