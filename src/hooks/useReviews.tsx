import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id?: string;
  listing_id?: string;
  rating: number;
  review_text?: string;
  review_type: 'property' | 'user_as_tenant' | 'user_as_owner';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  reviewer_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateReviewData {
  reviewed_user_id?: string;
  listing_id?: string;
  rating: number;
  review_text?: string;
  review_type: 'property' | 'user_as_tenant' | 'user_as_owner';
}

export const useReviews = (targetType: 'user' | 'property', targetId: string) => {
  return useQuery({
    queryKey: ['reviews', targetType, targetId],
    queryFn: async () => {
      // Return empty array until database migration is complete
      return [] as Review[];
    },
    enabled: false, // Disable until database is ready
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      throw new Error('Reviews feature is pending database migration');
    },
    onSuccess: () => {
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Reviews feature is pending database migration.',
        variant: 'destructive',
      });
    },
  });
};

export const useUserReviewStats = (userId: string) => {
  return useQuery({
    queryKey: ['user-review-stats', userId],
    queryFn: async () => {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        asOwner: 0,
        asTenant: 0,
      };
    },
    enabled: false, // Disable until database is ready
  });
};

export const usePropertyReviewStats = (listingId: string) => {
  return useQuery({
    queryKey: ['property-review-stats', listingId],
    queryFn: async () => {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
      };
    },
    enabled: false, // Disable until database is ready
  });
};