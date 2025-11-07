import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Crown, Lock } from 'lucide-react';
import { useHasPremiumFeature } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface LikeNotificationCardProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: {
      liker_id?: string;
      target_id?: string;
      target_type?: string;
    };
    created_at: string;
    read: boolean;
  };
  onDismiss: (id: string) => void;
}

export function LikeNotificationCard({ notification, onDismiss }: LikeNotificationCardProps) {
  const hasPremium = useHasPremiumFeature('early_profile_access');
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (!hasPremium) {
      navigate('/subscription-packages');
      return;
    }
    
    // Navigate to the appropriate page to view who liked them
    if (notification.data?.target_type === 'listing') {
      navigate('/owner/liked-clients');
    } else {
      navigate('/client/liked-properties');
    }
  };

  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{notification.title}</h4>
            {!notification.read && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {notification.message}
          </p>
          
          {hasPremium ? (
            <Button 
              size="sm" 
              onClick={handleViewProfile}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Crown className="w-3 h-3 mr-1" />
              View Who Liked You
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Lock className="w-4 h-4" />
                <span>Upgrade to see who liked you</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleViewProfile}
                className="border-purple-500 text-purple-500 hover:bg-purple-50"
              >
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(notification.id)}
          className="shrink-0"
        >
          ✕
        </Button>
      </div>
      
      {!hasPremium && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
      )}
    </Card>
  );
}
