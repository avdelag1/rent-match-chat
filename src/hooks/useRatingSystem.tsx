/**
 * Comprehensive Rating System Hooks
 *
 * Implements a fair, forgiving rating system with:
 * - Temporal decay (12-month half-life)
 * - Confidence-weighted displayed ratings (prevents sudden drops)
 * - Trust levels (New, Trusted, Needs Attention)
 * - Category-specific rating questions
 * - Verification requirements (match + chat + completion)
 * 
 * NOTE: This is a placeholder implementation. The rating tables 
 * (rating_categories, ratings, rating_aggregates) need to be created
 * via database migration before this functionality is fully available.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { logger } from '@/utils/prodLogger';

// ============================================================================
// TYPES
// ============================================================================

export interface RatingCategory {
  id: string;
  name: string;
  description: string | null;
  target_type: 'listing' | 'user' | 'worker';
  questions: RatingQuestion[];
  created_at: string;
}

export interface RatingQuestion {
  id: string;
  question: string;
  weight: number;
}

export interface Rating {
  id: string;
  reviewer_id: string;
  listing_id?: string;
  rated_user_id?: string;
  category_id: string;
  conversation_id?: string;
  is_verified: boolean;
  verified_at?: string;
  overall_rating: number;
  category_ratings: Record<string, number>;
  review_title?: string;
  review_text?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  helpful_count: number;
  created_at: string;
  decayed_weight: number;
}

export interface RatingAggregate {
  id: string;
  listing_id?: string;
  user_id?: string;
  category_id: string;
  total_ratings: number;
  verified_ratings: number;
  displayed_rating: number;
  rating_distribution: Record<string, number>;
  trust_level: 'new' | 'trusted' | 'needs_attention';
  trust_score: number;
  best_review?: Rating;
  worst_review?: Rating;
  last_calculated_at: string;
}

export interface CreateRatingInput {
  listing_id?: string;
  rated_user_id?: string;
  category_id: string;
  conversation_id?: string;
  overall_rating: number;
  category_ratings: Record<string, number>;
  review_title?: string;
  review_text?: string;
}

// Default empty aggregate for new items
const createDefaultAggregate = (id: string, type: 'listing' | 'user', categoryId: string): RatingAggregate => ({
  id: '',
  ...(type === 'listing' ? { listing_id: id } : { user_id: id }),
  category_id: categoryId,
  total_ratings: 0,
  verified_ratings: 0,
  displayed_rating: 5.0,
  rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  trust_level: 'new',
  trust_score: 100,
  last_calculated_at: new Date().toISOString(),
});

// ============================================================================
// RATING CATEGORIES (Placeholder - tables not yet created)
// ============================================================================

/**
 * Fetch all rating categories
 */
export function useRatingCategories() {
  return useQuery({
    queryKey: ['rating-categories'],
    queryFn: async (): Promise<RatingCategory[]> => {
      // Tables not yet created - return empty array
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: false, // Disabled until tables exist
  });
}

/**
 * Get category by ID
 */
export function useRatingCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['rating-category', categoryId],
    queryFn: async (): Promise<RatingCategory | null> => {
      // Tables not yet created - return null
      return null;
    },
    enabled: false, // Disabled until tables exist
    staleTime: 30 * 60 * 1000,
  });
}

// ============================================================================
// RATING AGGREGATES (For Swipe Cards)
// ============================================================================

/**
 * Get rating aggregate for a listing
 * Used on swipe cards to show rating, count, and trust level
 */
export function useListingRatingAggregate(listingId: string | undefined) {
  return useQuery({
    queryKey: ['rating-aggregate', 'listing', listingId],
    queryFn: async (): Promise<RatingAggregate | null> => {
      if (!listingId) return null;
      // Return default aggregate since tables not yet created
      return createDefaultAggregate(listingId, 'listing', 'property');
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev,
  });
}

/**
 * Get rating aggregate for a user
 * Used to show user ratings on profile cards
 */
export function useUserRatingAggregate(userId: string | undefined, categoryId: string = 'client') {
  return useQuery({
    queryKey: ['rating-aggregate', 'user', userId, categoryId],
    queryFn: async (): Promise<RatingAggregate | null> => {
      if (!userId) return null;
      // Return default aggregate since tables not yet created
      return createDefaultAggregate(userId, 'user', categoryId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ============================================================================
// INDIVIDUAL RATINGS
// ============================================================================

/**
 * Get all ratings for a listing
 */
export function useListingRatings(listingId: string | undefined, options: { limit?: number } = {}) {
  return useQuery({
    queryKey: ['ratings', 'listing', listingId, options.limit],
    queryFn: async (): Promise<Rating[]> => {
      // Tables not yet created - return empty array
      return [];
    },
    enabled: false, // Disabled until tables exist
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get all ratings for a user
 */
export function useUserRatings(userId: string | undefined, options: { limit?: number } = {}) {
  return useQuery({
    queryKey: ['ratings', 'user', userId, options.limit],
    queryFn: async (): Promise<Rating[]> => {
      // Tables not yet created - return empty array
      return [];
    },
    enabled: false, // Disabled until tables exist
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check if current user has already rated a target
 */
export function useHasRated(targetId: string | undefined, targetType: 'listing' | 'user') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-rated', user?.id, targetType, targetId],
    queryFn: async (): Promise<boolean> => {
      // Tables not yet created - always return false
      return false;
    },
    enabled: false, // Disabled until tables exist
    staleTime: 60 * 1000, // 1 minute
  });
}

// ============================================================================
// CREATE/UPDATE RATING
// ============================================================================

/**
 * Create a new rating
 */
export function useCreateRating() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateRatingInput): Promise<Rating> => {
      // Tables not yet created - throw helpful error
      throw new Error('Rating system is pending database migration');
    },
    onSuccess: (data) => {
      toast({
        title: 'Rating submitted',
        description: 'Thank you for your feedback!',
      });

      // Invalidate related queries
      if (data.listing_id) {
        queryClient.invalidateQueries({ queryKey: ['rating-aggregate', 'listing', data.listing_id] });
        queryClient.invalidateQueries({ queryKey: ['ratings', 'listing', data.listing_id] });
      }

      if (data.rated_user_id) {
        queryClient.invalidateQueries({ queryKey: ['rating-aggregate', 'user', data.rated_user_id] });
        queryClient.invalidateQueries({ queryKey: ['ratings', 'user', data.rated_user_id] });
      }

      queryClient.invalidateQueries({ queryKey: ['has-rated'] });
    },
    onError: (error: any) => {
      logger.error('Error creating rating:', error);

      toast({
        title: 'Rating system unavailable',
        description: 'This feature is coming soon.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mark rating as helpful
 */
export function useMarkRatingHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ratingId: string) => {
      // Tables not yet created - do nothing
      throw new Error('Rating system is pending database migration');
    },
    onSuccess: () => {
      // Invalidate all ratings queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-aggregate'] });
    },
    onError: (error) => {
      logger.error('Error marking rating as helpful:', error);
    },
  });
}

// ============================================================================
// VERIFICATION HELPERS
// ============================================================================

/**
 * Check if user can rate a listing/user based on conversation history
 */
export function useCanRate(targetId: string | undefined, targetType: 'listing' | 'user') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-rate', user?.id, targetType, targetId],
    queryFn: async (): Promise<{ canRate: boolean; reason?: string; conversationId?: string }> => {
      if (!user?.id || !targetId) {
        return { canRate: false, reason: 'Not authenticated' };
      }

      // Tables not yet created - rating not available
      return {
        canRate: false,
        reason: 'Rating system is coming soon',
      };
    },
    enabled: !!user?.id && !!targetId,
    staleTime: 60 * 1000, // 1 minute
  });
}
