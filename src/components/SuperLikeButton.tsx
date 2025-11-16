
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useHasPremiumFeature } from '@/hooks/useSubscription';

interface SuperLikeButtonProps {
  targetId: string;
  targetType: 'listing' | 'profile';
  onSuperLike: (targetId: string, targetType: string) => void;
  disabled?: boolean;
}

export function SuperLikeButton({ targetId, targetType, onSuperLike, disabled }: SuperLikeButtonProps) {
  const [isUsing, setIsUsing] = useState(false);
  const hasPremium = useHasPremiumFeature('super_likes');

  const handleSuperLike = async () => {
    if (!hasPremium) {
      toast({
        title: "Premium Feature",
        description: "Super Likes are available with premium subscription!",
        variant: "destructive"
      });
      return;
    }

    setIsUsing(true);
    try {
      await onSuperLike(targetId, targetType);
      toast({
        title: "Super Like Sent! ⭐",
        description: "Your Super Like gives you priority visibility!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send Super Like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUsing(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white border-none"
      onClick={handleSuperLike}
      disabled={disabled || isUsing}
    >
      <Star className="w-4 h-4 mr-1 fill-current" />
      {hasPremium ? 'Super Like' : 'Premium'}
      {hasPremium && (
        <Badge variant="secondary" className="ml-1 bg-white/20">
          <Zap className="w-3 h-3" />
        </Badge>
      )}
    </Button>
  );
}
