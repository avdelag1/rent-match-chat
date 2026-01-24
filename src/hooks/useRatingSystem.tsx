/**
 * Comprehensive Rating System Hooks
 *
 * Implements a fair, forgiving rating system with:
 * - Temporal decay (12-month half-life)
 * - Confidence-weighted displayed ratings (prevents sudden drops)
 * - Trust levels (New, Trusted, Needs Attention)
 * - Category-specific rating questions
 * - Verification requirements (match + chat + completion)
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

// ============================================================================
// RATING CATEGORIES
// ============================================================================

/**
 * Fetch all rating categories
 */
export function useRatingCategories() {
  return useQuery({
    queryKey: ['rating-categories'],
    queryFn: async (): Promise<RatingCategory[]> => {
      const { data, error } = await supabase
        .from('rating_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get category by ID
 */
export function useRatingCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['rating-category', categoryId],
    queryFn: async (): Promise<RatingCategory | null> => {
      if (!categoryId) return null;

      const { data, error } = await supabase
        .from('rating_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      return data;
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
 * Used on swipe cards to show rating, count, and trust level
 */
export function useListingRatingAggregate(listingId: string | undefined) {
  return useQuery({
    queryKey: ['rating-aggregate', 'listing', listingId],
    queryFn: async (): Promise<RatingAggregate | null> => {
      if (!listingId) return null;

      const { data, error } = await supabase
        .from('rating_aggregates')
        .select(`
          *,
          best_review:ratings!rating_aggregates_best_review_id_fkey(*),
          worst_review:ratings!rating_aggregates_worst_review_id_fkey(*)
        `)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching listing rating aggregate:', error);
        return null;
      }

      return data || {
        id: '',
        listing_id: listingId,
        category_id: 'property',
        total_ratings: 0,
        verified_ratings: 0,
        displayed_rating: 5.0,
        rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        trust_level: 'new',
        trust_score: 100,
        last_calculated_at: new Date().toISOString(),
      };
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

      const { data, error } = await supabase
        .from('rating_aggregates')
        .select(`
          *,
          best_review:ratings!rating_aggregates_best_review_id_fkey(*),
          worst_review:ratings!rating_aggregates_worst_review_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching user rating aggregate:', error);
        return null;
      }

      return data || {
        id: '',
        user_id: userId,
        category_id,
        total_ratings: 0,
        verified_ratings: 0,
        displayed_rating: 5.0,
        rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        trust_level: 'new',
        trust_score: 100,
        last_calculated_at: new Date().toISOString(),
      };
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
      if (!listingId) return [];

      let query = supabase
        .from('ratings')
        .select('*')
        .eq('listing_id', listingId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching listing ratings:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!listingId,
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
      if (!userId) return [];

      let query = supabase
        .from('ratings')
        .select('*')
        .eq('rated_user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching user ratings:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userId,
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
      if (!user?.id || !targetId) return false;

      const column = targetType === 'listing' ? 'listing_id' : 'rated_user_id';

      const { data, error } = await supabase
        .from('ratings')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq(column, targetId)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error checking if user has rated:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id && !!targetId,
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
      if (!user?.id) {
        throw new Error('Must be authenticated to create a rating');
      }

      // Validate that exactly one target is specified
      if (!input.listing_id && !input.rated_user_id) {
        throw new Error('Must specify either listing_id or rated_user_id');
      }

      if (input.listing_id && input.rated_user_id) {
        throw new Error('Cannot rate both listing and user in same rating');
      }

      // Validate rating range
      if (input.overall_rating < 1 || input.overall_rating > 5) {
        throw new Error('Overall rating must be between 1 and 5');
      }

      // Auto-determine sentiment from overall rating
      const sentiment =
        input.overall_rating >= 4 ? 'positive' :
        input.overall_rating === 3 ? 'neutral' :
        'negative';

      const { data, error } = await supabase
        .from('ratings')
        .insert({
          reviewer_id: user.id,
          listing_id: input.listing_id,
          rated_user_id: input.rated_user_id,
          category_id: input.category_id,
          conversation_id: input.conversation_id,
          overall_rating: input.overall_rating,
          category_ratings: input.category_ratings,
          review_title: input.review_title,
          review_text: input.review_text,
          sentiment,
          is_verified: !!input.conversation_id, // Verified if conversation exists
          verified_at: input.conversation_id ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
        title: 'Failed to submit rating',
        description: error.message || 'Please try again later',
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
      // Increment helpful_count
      const { error } = await supabase.rpc('increment_rating_helpful', {
        rating_id: ratingId,
      });

      if (error) throw error;
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

      // Check if already rated
      const column = targetType === 'listing' ? 'listing_id' : (targetType === 'user' ? 'client_id' : 'owner_id');

      // Check for conversation with completion
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, status')
        .eq(column, targetId)
        .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
        .eq('status', 'completed'); // Only allow rating after completion

      if (error) {
        logger.error('Error checking if can rate:', error);
        return { canRate: false, reason: 'Error checking eligibility' };
      }

      if (!conversations || conversations.length === 0) {
        return {
          canRate: false,
          reason: 'You must complete a transaction before rating',
        };
      }

      // Has completed conversation - can rate
      return {
        canRate: true,
        conversationId: conversations[0].id,
      };
    },
    enabled: !!user?.id && !!targetId,
    staleTime: 60 * 1000, // 1 minute
  });
}
