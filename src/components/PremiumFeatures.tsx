
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Eye, MessageCircle, Filter, TrendingUp } from 'lucide-react';
import { useHasPremiumFeature } from '@/hooks/useSubscription';

interface PremiumFeaturesProps {
  userRole: 'client' | 'owner';
  onUpgrade: () => void;
}

const clientFeatures = [
  {
    icon: Star,
    title: 'Super Likes',
    description: 'Send Super Likes to get priority visibility with property owners',
    premium: true
  },
  {
    icon: Eye,
    title: 'See Who Liked You',
    description: 'View all the properties and owners who have liked your profile',
    premium: true
  },
  {
    icon: Filter,
    title: 'Advanced Filters',
    description: 'Access detailed filters for amenities, lifestyle match, and more',
    premium: true
  },
  {
    icon: TrendingUp,
    title: 'Priority Visibility',
    description: 'Your profile appears first in owner searches',
    premium: true
  },
  {
    icon: MessageCircle,
    title: 'Unlimited Messages',
    description: 'Send unlimited messages to matched properties',
    premium: true
  },
  {
    icon: Zap,
    title: 'Profile Boost',
    description: 'Boost your profile to get 10x more views for 30 minutes',
    premium: true
  }
];

const ownerFeatures = [
  {
    icon: Star,
    title: 'Super Likes to Clients',
    description: 'Send Super Likes to highlight your interest in potential tenants',
    premium: true
  },
  {
    icon: TrendingUp,
    title: 'Property Boost',
    description: 'Boost your properties to the top of client searches',
    premium: true
  },
  {
    icon: Eye,
    title: 'See Who Viewed Properties',
    description: 'Track which clients have viewed your property listings',
    premium: true
  },
  {
    icon: Filter,
    title: 'Advanced Client Filters',
    description: 'Filter clients by budget, lifestyle, duration, and verification status',
    premium: true
  },
  {
    icon: Crown,
    title: 'Unlimited Properties',
    description: 'Upload unlimited property listings (free users limited to 3)',
    premium: true
  },
  {
    icon: MessageCircle,
    title: 'Priority Messaging',
    description: 'Your messages appear first in client inboxes',
    premium: true
  }
];

export function PremiumFeatures({ userRole, onUpgrade }: PremiumFeaturesProps) {
  const hasPremium = useHasPremiumFeature('unlimited_swipes');
  const features = userRole === 'client' ? clientFeatures : ownerFeatures;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {hasPremium ? 'Your Premium Features' : 'Unlock Premium Features'}
        </h2>
        <p className="text-muted-foreground">
          {hasPremium 
            ? 'You have access to all premium features!' 
            : `Get the most out of Tinderent with premium ${userRole} features`
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className={`relative ${hasPremium ? 'border-primary/50' : 'opacity-75'}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <feature.icon className={`w-6 h-6 ${hasPremium ? 'text-primary' : 'text-muted-foreground'}`} />
                {feature.premium && !hasPremium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
                {hasPremium && (
                  <Badge variant="default" className="bg-primary">
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              
              {!hasPremium && (
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                  onClick={onUpgrade}
                >
                  Upgrade to Use
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasPremium && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Ready to Go Premium?</h3>
            <p className="text-muted-foreground mb-4">
              Unlock all features and get 10x better results on Tinderent
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={onUpgrade}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
