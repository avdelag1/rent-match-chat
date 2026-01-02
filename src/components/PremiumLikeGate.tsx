import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePremiumLikesVisibility } from '@/hooks/usePremiumLikesVisibility';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Eye, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumLikeGateProps {
  children: ReactNode;
  likesCount?: number;
  variant?: 'card' | 'inline' | 'overlay';
}

/**
 * Component that gates "see who liked" content behind premium subscription.
 * Shows a blurred/locked state for non-premium users with an upgrade prompt.
 */
export function PremiumLikeGate({
  children,
  likesCount = 0,
  variant = 'card',
}: PremiumLikeGateProps) {
  const { canSeeWhoLiked, isLoading } = usePremiumLikesVisibility();
  const navigate = useNavigate();

  // If premium, show the children directly
  if (canSeeWhoLiked) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-card border-border animate-pulse">
        <CardContent className="py-8">
          <div className="h-24 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Non-premium overlay
  if (variant === 'overlay') {
    return (
      <div className="relative">
        <div className="blur-md pointer-events-none select-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <PremiumUpgradePrompt likesCount={likesCount} />
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return <PremiumUpgradePrompt likesCount={likesCount} />;
  }

  // Card variant (default)
  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 overflow-hidden">
      <CardContent className="py-8">
        <PremiumUpgradePrompt likesCount={likesCount} />
      </CardContent>
    </Card>
  );
}

interface PremiumUpgradePromptProps {
  likesCount?: number;
}

function PremiumUpgradePrompt({ likesCount = 0 }: PremiumUpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center gap-4 p-4"
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        {likesCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white border-0 px-2">
            {likesCount}
          </Badge>
        )}
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 justify-center">
          <Lock className="w-5 h-5" />
          {likesCount > 0 ? `${likesCount} people liked you!` : 'Someone liked you!'}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Upgrade to Premium to see who liked your profile and unlock profile previews.
        </p>
      </div>

      {/* Benefits */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
          <Eye className="w-3 h-3 mr-1" />
          See who liked you
        </Badge>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Sparkles className="w-3 h-3 mr-1" />
          Full profile access
        </Badge>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
          <Heart className="w-3 h-3 mr-1" />
          Priority matching
        </Badge>
      </div>

      {/* CTA Button */}
      <Button
        onClick={() => navigate('/subscription-packages')}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8"
        size="lg"
      >
        <Crown className="w-4 h-4 mr-2" />
        Upgrade to Premium
      </Button>
    </motion.div>
  );
}

/**
 * A blurred profile card placeholder for non-premium users
 */
interface BlurredProfileCardProps {
  onClick?: () => void;
}

export function BlurredProfileCard({ onClick }: BlurredProfileCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="bg-card border-border overflow-hidden cursor-pointer hover:shadow-lg transition-all"
      onClick={onClick || (() => navigate('/subscription-packages'))}
    >
      <div className="relative">
        {/* Blurred placeholder image */}
        <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-xl" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <Badge className="bg-amber-500 text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              Premium Only
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Blurred content placeholders */}
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium text-center">
            Tap to unlock
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Shows the count of likes with premium gate
 */
interface LikesCountBadgeProps {
  count: number;
  showDetails?: boolean;
}

export function LikesCountBadge({ count, showDetails = false }: LikesCountBadgeProps) {
  const { canSeeWhoLiked } = usePremiumLikesVisibility();
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <Badge
      className={`cursor-pointer transition-all ${
        canSeeWhoLiked
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-amber-500 hover:bg-amber-600 text-white'
      }`}
      onClick={() => {
        if (!canSeeWhoLiked) {
          navigate('/subscription-packages');
        }
      }}
    >
      <Heart className="w-3 h-3 mr-1 fill-current" />
      {count} {showDetails ? (count === 1 ? 'like' : 'likes') : ''}
      {!canSeeWhoLiked && <Lock className="w-3 h-3 ml-1" />}
    </Badge>
  );
}
