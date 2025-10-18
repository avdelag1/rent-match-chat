import { useUserSubscription } from './useSubscription';
import { useMessageActivations } from './useMessageActivations';
import { useLegalDocumentQuota } from './useLegalDocumentQuota';
import { usePropertyLimits } from './usePropertyLimits';

/**
 * Central hook to check all subscription benefits
 * Simplified to focus on message activations and legal documents
 */
export function useSubscriptionBenefits() {
  const { data: subscription } = useUserSubscription();
  const messageActivations = useMessageActivations();
  const legalDocQuota = useLegalDocumentQuota();
  const propertyLimits = usePropertyLimits();
  
  const planName = subscription?.subscription_packages?.name || 'free';
  const tier = subscription?.subscription_packages?.tier || 'free';
  const packageCategory = subscription?.subscription_packages?.package_category;
  const isActive = subscription?.is_active || false;
  
  // Define benefits based on new simplified plan
  const benefits = {
    // Message activation benefits
    canSendMessage: messageActivations.canSendMessage,
    remainingActivations: messageActivations.totalActivations,
    totalActivations: messageActivations.totalActivations,
    hasPayPerUse: messageActivations.payPerUseCount > 0,
    hasMonthlyActivations: messageActivations.monthlyCount > 0,
    
    // Legal document benefits
    canUseLegalDocument: !legalDocQuota.needsToPay,
    remainingLegalDocuments: legalDocQuota.remaining,
    usedLegalDocuments: legalDocQuota.used,
    unlimitedLegalDocuments: legalDocQuota.isUnlimited,
    legalDocumentCost: legalDocQuota.needsToPay ? 500 : 0,
    
    // Property listing benefits (for owners only)
    canCreateProperties: propertyLimits.canCreateMore,
    remainingProperties: propertyLimits.remainingListings,
    unlimitedProperties: propertyLimits.isUnlimited,
    activeProperties: propertyLimits.activePropertyCount,
    maxProperties: propertyLimits.maxListings,
    
    // Premium features from subscription packages
    hasEarlyProfileAccess: subscription?.subscription_packages?.early_profile_access || false,
    hasAdvancedMatchTips: subscription?.subscription_packages?.advanced_match_tips || false,
    hasSeekerInsights: subscription?.subscription_packages?.seeker_insights || false,
    hasAvailabilitySync: subscription?.subscription_packages?.availability_sync || false,
    hasMarketReports: subscription?.subscription_packages?.market_reports || false,
    
    // Plan info
    planName,
    tier,
    packageCategory,
    isActive,
    isFree: tier === 'free',
    isPayPerUse: packageCategory?.includes('pay_per_use'),
    isMonthly: packageCategory?.includes('monthly'),
    isClient: packageCategory?.includes('client'),
    isOwner: packageCategory?.includes('owner'),
  };
  
  return benefits;
}
