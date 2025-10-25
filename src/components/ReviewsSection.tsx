import { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  review_text: string;
  cleanliness_rating: number | null;
  communication_rating: number | null;
  accuracy_rating: number | null;
  location_rating: number | null;
  value_rating: number | null;
  response_text: string | null;
  is_verified_stay: boolean;
  helpful_count: number;
  created_at: string;
  reviewer: {
    name: string;
    profile_photo: string | null;
  };
}

interface ReviewsSectionProps {
  profileId: string;
  canLeaveReview?: boolean;
  reviewType?: 'client_to_owner' | 'owner_to_client' | 'property';
}

export function ReviewsSection({ profileId, canLeaveReview = false, reviewType = 'client_to_owner' }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Review form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [detailedRatings, setDetailedRatings] = useState({
    cleanliness: 0,
    communication: 0,
    accuracy: 0,
    location: 0,
    value: 0,
  });

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(name, profile_photo)
      `)
      .eq('reviewed_id', profileId)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data as any);
    }
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user || rating === 0) {
      toast({
        title: 'Error',
        description: 'Please provide a rating',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewed_id: profileId,
      rating,
      review_text: reviewText,
      review_type: reviewType,
      cleanliness_rating: detailedRatings.cleanliness || null,
      communication_rating: detailedRatings.communication || null,
      accuracy_rating: detailedRatings.accuracy || null,
      location_rating: detailedRatings.location || null,
      value_rating: detailedRatings.value || null,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success!',
      description: 'Your review has been submitted',
    });

    setShowReviewDialog(false);
    setRating(0);
    setReviewText('');
    setDetailedRatings({
      cleanliness: 0,
      communication: 0,
      accuracy: 0,
      location: 0,
      value: 0,
    });
    fetchReviews();
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('review_helpful_votes')
      .insert({
        review_id: reviewId,
        user_id: user.id,
      });

    if (!error) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        )
      );
    }
  };

  const StarRating = ({ value, onHover, onClick, readonly = false }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 ${
            star <= (onHover && hoverRating ? hoverRating : value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } ${!readonly && 'cursor-pointer transition-all'}`}
          onMouseEnter={() => !readonly && onHover && setHoverRating(star)}
          onMouseLeave={() => !readonly && onHover && setHoverRating(0)}
          onClick={() => !readonly && onClick && onClick(star)}
        />
      ))}
    </div>
  );

  const DetailedRatingRow = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-all ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    </div>
  );

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Reviews ({reviews.length})
            </CardTitle>
            {reviews.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Average: {averageRating} / 5.0
              </p>
            )}
          </div>

          {canLeaveReview && (
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write Review
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Leave a Review</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Overall Rating
                    </label>
                    <StarRating
                      value={rating}
                      onHover={true}
                      onClick={setRating}
                    />
                  </div>

                  {/* Detailed Ratings */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Detailed Ratings (Optional)
                    </label>
                    <DetailedRatingRow
                      label="Cleanliness"
                      value={detailedRatings.cleanliness}
                      onChange={(v: number) =>
                        setDetailedRatings((prev) => ({ ...prev, cleanliness: v }))
                      }
                    />
                    <DetailedRatingRow
                      label="Communication"
                      value={detailedRatings.communication}
                      onChange={(v: number) =>
                        setDetailedRatings((prev) => ({ ...prev, communication: v }))
                      }
                    />
                    <DetailedRatingRow
                      label="Accuracy"
                      value={detailedRatings.accuracy}
                      onChange={(v: number) =>
                        setDetailedRatings((prev) => ({ ...prev, accuracy: v }))
                      }
                    />
                    <DetailedRatingRow
                      label="Location"
                      value={detailedRatings.location}
                      onChange={(v: number) =>
                        setDetailedRatings((prev) => ({ ...prev, location: v }))
                      }
                    />
                    <DetailedRatingRow
                      label="Value"
                      value={detailedRatings.value}
                      onChange={(v: number) =>
                        setDetailedRatings((prev) => ({ ...prev, value: v }))
                      }
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Review
                    </label>
                    <Textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={submitReview} className="w-full">
                    Submit Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {index > 0 && <Separator className="my-4" />}

                <div className="space-y-3">
                  {/* Reviewer Info */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <img
                        src={review.reviewer.profile_photo || '/default-avatar.png'}
                        alt={review.reviewer.name}
                      />
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{review.reviewer.name}</p>
                        {review.is_verified_stay && (
                          <Badge variant="default" className="text-xs">
                            Verified Stay
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} readonly={true} />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.review_text && (
                    <p className="text-sm text-foreground">{review.review_text}</p>
                  )}

                  {/* Response */}
                  {review.response_text && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-medium mb-1">Response:</p>
                      <p className="text-sm">{review.response_text}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(review.id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Helpful ({review.helpful_count})
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
