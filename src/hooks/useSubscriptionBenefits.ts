import { useUserSubscription } from './useSubscription';
import { useMessagingQuota } from './useMessagingQuota';
import { usePropertyLimits } from './usePropertyLimits';

/**
 * Central hook to check all subscription benefits
 */
export function useSubscriptionBenefits() {
  const { data: subscription } = useUserSubscription();
  const messagingQuota = useMessagingQuota();
  const propertyLimits = usePropertyLimits();
  
  const planName = subscription?.subscription_packages?.name || 'free';
  const tier = subscription?.subscription_packages?.tier || 'free';
  const isActive = subscription?.is_active || false;
  
  // Define benefits based on plan
  const benefits = {
    // Messaging benefits
    canSendMessages: messagingQuota.canSendMessage,
    remainingMessages: messagingQuota.remainingMessages,
    unlimitedMessages: messagingQuota.isUnlimited,
    
    // Property listing benefits (for owners)
    canCreateProperties: propertyLimits.canCreateMore,
    remainingProperties: propertyLimits.remainingListings,
    unlimitedProperties: propertyLimits.isUnlimited,
    activeProperties: propertyLimits.activePropertyCount,
    maxProperties: propertyLimits.maxListings,
    
    // Visibility benefits
    visibility: getVisibility(planName),
    isPriority: planName.includes('UNLIMITED'),
    
    // Premium features
    canSeeLikes: !planName.includes('free'),
    canSuperLike: !planName.includes('free'),
    hasAdvancedFilters: planName.includes('PREMIUM') || planName.includes('UNLIMITED'),
    hasPremiumBadge: planName.includes('PREMIUM') || planName.includes('UNLIMITED'),
    hasAnalytics: planName.includes('MAX') || planName.includes('UNLIMITED'),
    
    // Plan info
    planName,
    tier,
    isActive,
    isFree: tier === 'free',
  };
  
  return benefits;
}

function getVisibility(planName: string): number {
  if (planName.includes('UNLIMITED')) return 100;
  if (planName.includes('MAX')) return 80;
  if (planName.includes('++')) return 50;
  if (planName.includes('+')) return 25;
  return 10; // Free tier
}
