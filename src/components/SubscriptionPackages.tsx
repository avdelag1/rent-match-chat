
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { useSubscriptionPackages } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionPackagesProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function SubscriptionPackages({ isOpen, onClose, reason }: SubscriptionPackagesProps) {
  const { user } = useAuth();
  const { data: packages = [], isLoading } = useSubscriptionPackages();

  const getPackageIcon = (packageName: string) => {
    if (packageName.includes('VIP')) return <Crown className="w-5 h-5" />;
    if (packageName.includes('Unlimited')) return <Zap className="w-5 h-5" />;
    if (packageName.includes('Premium')) return <Star className="w-5 h-5" />;
    return <Check className="w-5 h-5" />;
  };

  const getPackageColor = (packageName: string) => {
    if (packageName.includes('VIP')) return 'from-purple-500 to-pink-500';
    if (packageName.includes('Unlimited')) return 'from-blue-500 to-cyan-500';
    if (packageName.includes('Premium')) return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-slate-500';
  };

  const handleSubscribe = (packageId: string) => {
    // This would integrate with PayPal
    // For now, we'll just show that it would redirect to PayPal
    window.open(`https://www.paypal.com/subscribe?plan_id=${packageId}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          {reason && (
            <p className="text-center text-muted-foreground">
              {reason}
            </p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages
              .filter(pkg => pkg.is_active)
              .map((pkg) => {
                // Safely handle features - ensure it's an array
                const features = Array.isArray(pkg.features) 
                  ? pkg.features 
                  : (typeof pkg.features === 'string' 
                    ? [pkg.features] 
                    : []);

                return (
                  <Card
                    key={pkg.id}
                    className={`relative overflow-hidden ${
                      pkg.name.includes('VIP') ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    {pkg.name.includes('VIP') && (
                      <div className="absolute top-0 right-0 bg-purple-500 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                        POPULAR
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getPackageColor(pkg.name)} text-white`}>
                          {getPackageIcon(pkg.name)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">${pkg.price}</span>
                            <span className="text-sm text-muted-foreground">/month</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">
                            Up to {pkg.max_property_listings || 'unlimited'} property listings
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">
                            {pkg.max_daily_matches || 'unlimited'} daily matches
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">
                            {pkg.max_property_views || 'unlimited'} property views
                          </span>
                        </div>
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm capitalize">
                              {String(feature).replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${getPackageColor(pkg.name)} hover:opacity-90`}
                        onClick={() => handleSubscribe(pkg.id.toString())}
                      >
                        Subscribe Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Cancel anytime. Secure payments powered by PayPal.</p>
          <p>Questions? Contact support at help@tinderent.com</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
