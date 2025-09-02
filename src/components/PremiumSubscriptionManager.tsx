import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Check, Sparkles } from 'lucide-react';
import { useUserSubscription, useSubscriptionPackages } from '@/hooks/useSubscription';
import { SubscriptionPackages } from './SubscriptionPackages';
import { toast } from '@/hooks/use-toast';

interface PremiumSubscriptionManagerProps {
  userRole: 'client' | 'owner';
}

export function PremiumSubscriptionManager({ userRole }: PremiumSubscriptionManagerProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { data: userSubscription } = useUserSubscription();
  const { data: packages = [] } = useSubscriptionPackages();

  const getSubscriptionIcon = (tier?: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-5 h-5 text-purple-400" />;
      case 'gold': return <Sparkles className="w-5 h-5 text-yellow-400" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-400" />;
      default: return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSubscriptionGradient = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-pink-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-600';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const hasActiveSubscription = userSubscription?.is_active;
  const currentTier = userSubscription?.subscription_packages?.tier;

  return (
    <>
      <Card className="bg-gradient-to-br from-background/50 to-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSubscriptionIcon(currentTier)}
            Premium Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasActiveSubscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <Badge className={`bg-gradient-to-r ${getSubscriptionGradient(currentTier)} text-white border-none`}>
                  {userSubscription.subscription_packages?.name || 'Premium'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tier</span>
                  <p className="font-medium capitalize">{currentTier || 'Premium'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium text-green-400">Active</p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-green-400">Premium Active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You have access to all premium features including unlimited swipes, super likes, and priority matching.
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowUpgrade(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="text-center space-y-2">
                  <Crown className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">Unlock Premium</h3>
                  <p className="text-xs text-muted-foreground">
                    Get unlimited access to all features and boost your success rate by 10x
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Unlimited Swipes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Super Likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Priority Matching</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Advanced Filters</span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-200"
                onClick={() => setShowUpgrade(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriptionPackages
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        userRole={userRole}
        reason={hasActiveSubscription ? "Manage your subscription or upgrade to a higher tier" : "Unlock all premium features and boost your success!"}
      />
    </>
  );
}