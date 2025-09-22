import { useState } from 'react';
import { Star, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewCard } from './ReviewCard';
import { ReviewDialog } from './ReviewDialog';
import { useReviews, useUserReviewStats, usePropertyReviewStats } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';

interface ReviewsListProps {
  targetType: 'user' | 'property';
  targetId: string;
  targetName: string;
  canCreateReview?: boolean;
  reviewType?: 'property' | 'user_as_tenant' | 'user_as_owner';
}

export function ReviewsList({
  targetType,
  targetId,
  targetName,
  canCreateReview = false,
  reviewType = 'property',
}: ReviewsListProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const { user } = useAuth();
  
  const { data: reviews = [], isLoading } = useReviews(targetType, targetId);
  const { data: userStats } = useUserReviewStats(targetType === 'user' ? targetId : '');
  const { data: propertyStats } = usePropertyReviewStats(targetType === 'property' ? targetId : '');
  
  const stats = targetType === 'user' ? userStats : propertyStats;

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Reviews & Ratings</CardTitle>
            {canCreateReview && user && (
              <Button
                onClick={() => setShowReviewDialog(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Rating Summary */}
          {stats && stats.totalReviews > 0 ? (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {formatRating(stats.averageRating)}
                  </div>
                  <div className="flex items-center justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(stats.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="flex-1">
                  {stats.ratingDistribution.map((count, index) => {
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground w-8">
                          {5 - index}★
                        </span>
                        <div className="flex-1 bg-muted rounded h-2">
                          <div
                            className="bg-yellow-400 h-full rounded"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {targetType === 'user' && userStats && (
                <div className="flex gap-2">
                  {userStats.asOwner > 0 && (
                    <Badge variant="secondary">
                      {userStats.asOwner} as Owner
                    </Badge>
                  )}
                  {userStats.asTenant > 0 && (
                    <Badge variant="secondary">
                      {userStats.asTenant} as Tenant
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reviews yet</p>
              <p className="text-sm">Be the first to leave a review!</p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Recent Reviews</h3>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
        reviewType={reviewType}
      />
    </>
  );
}