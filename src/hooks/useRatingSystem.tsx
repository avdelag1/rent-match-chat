/**
 * Comprehensive Rating System Hooks
 *
 * NOTE: The rating tables (ratings, rating_categories, rating_aggregates) 
 * do not exist yet. These hooks return sensible defaults until the schema is created.
 * 
 * Implements a fair, forgiving rating system with:
 * - Temporal decay (12-month half-life)
 * - Confidence-weighted displayed ratings (prevents sudden drops)
 * - Trust levels (New, Trusted, Needs Attention)
 * - Category-specific rating questions
 * - Verification requirements (match + chat + completion)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Default categories when tables don't exist
const defaultCategories: RatingCategory[] = [
  {
    id: 'property',
    name: 'Property',
    description: 'Rate a property listing',
    target_type: 'listing',
    questions: [
      { id: 'accuracy', question: 'How accurate was the listing?', weight: 1 },
      { id: 'cleanliness', question: 'How clean was the property?', weight: 1 },
      { id: 'communication', question: 'How was the communication?', weight: 1 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Rate a client profile',
    target_type: 'user',
    questions: [
      { id: 'reliability', question: 'How reliable was the client?', weight: 1 },
      { id: 'communication', question: 'How was the communication?', weight: 1 },
    ],
    created_at: new Date().toISOString(),
  },
];

// ============================================================================
// RATING CATEGORIES (Stubbed - tables not yet created)
// ============================================================================

/**
 * Fetch all rating categories
 * NOTE: Returns default categories since tables don't exist yet
 */
export function useRatingCategories() {
  return useQuery({
    queryKey: ['rating-categories'],
    queryFn: async (): Promise<RatingCategory[]> => {
      // Tables don't exist yet - return defaults
      return defaultCategories;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get category by ID
 * NOTE: Returns from defaults since tables don't exist yet
 */
export function useRatingCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['rating-category', categoryId],
    queryFn: async (): Promise<RatingCategory | null> => {
      if (!categoryId) return null;
      return defaultCategories.find(c => c.id === categoryId) || null;
    },
    enabled: !!categoryId,
    staleTime: 30 * 60 * 1000,
  });
}

// ============================================================================
// RATING AGGREGATES (For Swipe Cards)
// ============================================================================

/**
 * Get rating aggregate for a listing
 * NOTE: Returns default aggregate since tables don't exist yet
 */
export function useListingRatingAggregate(listingId: string | undefined, categoryId: string = 'property') {
  return useQuery({
    queryKey: ['rating-aggregate', 'listing', listingId, categoryId],
    queryFn: async (): Promise<RatingAggregate | null> => {
      if (!listingId) return null;
      // Tables don't exist yet - return default 5.0 rating
      return createDefaultAggregate(listingId, 'listing', categoryId);
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev,
  });
}

/**
 * Get rating aggregate for a user
 * NOTE: Returns default aggregate since tables don't exist yet
 */
export function useUserRatingAggregate(userId: string | undefined, categoryId: string = 'client') {
  return useQuery({
    queryKey: ['rating-aggregate', 'user', userId, categoryId],
    queryFn: async (): Promise<RatingAggregate | null> => {
      if (!userId) return null;
      // Tables don't exist yet - return default 5.0 rating
      return createDefaultAggregate(userId, 'user', categoryId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ============================================================================
// INDIVIDUAL RATINGS (Stubbed)
// ============================================================================

/**
 * Get all ratings for a listing
 * NOTE: Returns empty array since tables don't exist yet
 */
export function useListingRatings(listingId: string | undefined, options: { limit?: number } = {}) {
  return useQuery({
    queryKey: ['ratings', 'listing', listingId, options.limit],
    queryFn: async (): Promise<Rating[]> => {
      if (!listingId) return [];
      // Tables don't exist yet
      return [];
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get all ratings for a user
 * NOTE: Returns empty array since tables don't exist yet
 */
export function useUserRatings(userId: string | undefined, options: { limit?: number } = {}) {
  return useQuery({
    queryKey: ['ratings', 'user', userId, options.limit],
    queryFn: async (): Promise<Rating[]> => {
      if (!userId) return [];
      // Tables don't exist yet
      return [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check if current user has already rated a target
 * NOTE: Returns false since tables don't exist yet
 */
export function useHasRated(targetId: string | undefined, targetType: 'listing' | 'user') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-rated', user?.id, targetType, targetId],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id || !targetId) return false;
      // Tables don't exist yet
      return false;
    },
    enabled: !!user?.id && !!targetId,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// MUTATIONS (Stubbed)
// ============================================================================

/**
 * Create a new rating
 * NOTE: No-op since tables don't exist yet
 */
export function useCreateRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRatingInput): Promise<Rating | null> => {
      if (!user?.id) {
        throw new Error('Must be logged in to submit a rating');
      }

      // Tables don't exist yet - show warning and return null
      logger.warn('Rating tables do not exist yet. Rating not saved.');
      
      return null;
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: 'Rating submitted',
          description: 'Thank you for your feedback!',
        });
      } else {
        toast({
          title: 'Rating feature coming soon',
          description: 'Rating functionality is not yet available.',
          variant: 'default',
        });
      }
    },
    onError: (error: any) => {
      logger.error('Error creating rating:', error);

      toast({
        title: 'Failed to submit rating',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Mark rating as helpful
 * NOTE: No-op since tables don't exist yet
 */
export function useMarkRatingHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ratingId: string) => {
      // Tables don't exist yet
      logger.warn('Rating tables do not exist yet. Helpful count not updated.');
    },
    onSuccess: () => {
      toast({
        title: 'Thank you',
        description: 'Your feedback helps improve our community.',
      });
    },
    onError: (error: any) => {
      logger.error('Error marking rating as helpful:', error);
    },
  });
}

// ============================================================================
// VERIFICATION CHECK (Stubbed)
// ============================================================================

/**
 * Check if user can rate a target
 * NOTE: Returns canRate: false since tables don't exist yet
 */
export function useCanRate(targetId: string | undefined, targetType: 'listing' | 'user') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-rate', user?.id, targetType, targetId],
    queryFn: async (): Promise<{ canRate: boolean; reason?: string; conversationId?: string }> => {
      if (!user?.id || !targetId) {
        return { canRate: false, reason: 'Not authenticated' };
      }

      // Tables don't exist yet
      return { canRate: false, reason: 'Rating feature coming soon' };
    },
    enabled: !!user?.id && !!targetId,
    staleTime: 60 * 1000, // 1 minute
  });
}
