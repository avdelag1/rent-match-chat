/**
 * Hook to calculate visibility ranking for users based on their subscription tier
 * Used for profile ordering in search/browse results
 */

export interface VisibilityRankingScore {
  userId: string;
  tier: string;
  rank: number; // Lower = more visible
  visibilityPercentage: number;
  score: number; // Composite score for sorting
}

const TIER_VISIBILITY_MAP: Record<string, { rank: number; percentage: number }> = {
  unlimited: { rank: 1, percentage: 100 },
  premium_plus: { rank: 2, percentage: 80 },
  premium: { rank: 3, percentage: 50 },
  basic: { rank: 4, percentage: 25 },
  free: { rank: 999, percentage: 0 }, // Not visible by default
};

export function useVisibilityRanking() {
  /**
   * Calculate visibility score for a user based on their subscription tier
   */
  const calculateVisibilityScore = (tier?: string): VisibilityRankingScore['score'] => {
    if (!tier) return 999;

    const config = TIER_VISIBILITY_MAP[tier];
    if (!config) return 999;

    // Score: lower number = higher priority
    // Combines rank (1-999) with a boost for premium tiers
    return config.rank + (1 - config.percentage / 100) * 10;
  };

  /**
   * Get visibility config for a tier
   */
  const getVisibilityConfig = (tier?: string) => {
    if (!tier) return TIER_VISIBILITY_MAP.free;
    return TIER_VISIBILITY_MAP[tier] || TIER_VISIBILITY_MAP.free;
  };

  /**
   * Should user with this tier be visible in results?
   */
  const isVisible = (tier?: string): boolean => {
    if (!tier) return false;
    const config = getVisibilityConfig(tier);
    return config.percentage > 0;
  };

  /**
   * Sort users by visibility (for query results)
   */
  const sortByVisibility = (users: Array<{ tier?: string; [key: string]: any }>) => {
    return users.sort((a, b) => {
      const scoreA = calculateVisibilityScore(a.tier);
      const scoreB = calculateVisibilityScore(b.tier);
      return scoreA - scoreB;
    });
  };

  /**
   * Get ordering clause for Supabase query
   * Returns the field and direction to order by visibility
   */
  const getOrderingClause = () => {
    return {
      field: 'subscription_packages.tier',
      direction: 'asc' as const,
      // Custom ordering: unlimited > premium_plus > premium > basic > free
    };
  };

  return {
    calculateVisibilityScore,
    getVisibilityConfig,
    isVisible,
    sortByVisibility,
    getOrderingClause,
    TIER_VISIBILITY_MAP,
  };
}
