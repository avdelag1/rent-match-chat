import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionPackagesProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  userRole?: 'client' | 'owner';
}

type Plan = {
  id: string;
  name: string;
  price: string; // e.g., "$299 MXN"
  benefits: string[];
  paypalUrl: string;
  highlight?: boolean;
};

const ownerPlans: Plan[] = [
  {
    id: 'owner-unlimited',
    name: 'UNLIMITED OWNER',
    price: '$299 MXN',
    benefits: [
      'Unlimited properties',
      '30 messages per month',
      'Top visibility (100%)',
      'Always listed first in search',
      'Full access to tools, filters, and stats',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/P2YZA6FWZAACQ',
    highlight: true,
  },
  {
    id: 'owner-premium-max',
    name: 'PREMIUM MAX OWNER',
    price: '$199 MXN',
    benefits: [
      'Up to 10 properties',
      '20 messages per month',
      'High visibility (80%)',
      'Advanced client filters',
      '“Premium Profile” badge',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/4LG62YGVETM4L',
  },
  {
    id: 'owner-premium-plus-plus',
    name: 'PREMIUM ++ OWNER',
    price: '$149 MXN',
    benefits: [
      'Up to 5 properties',
      '12 messages per month',
      'Medium-high visibility (50%)',
      'Filters to choose ideal clients',
      'Highlighted profile',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/J5NKCX6KQRCYW',
  },
  {
    id: 'owner-premium-plus',
    name: 'PREMIUM + OWNER',
    price: '$99 MXN',
    benefits: [
      'Up to 2 active properties',
      '6 direct messages per month',
      'See who liked you',
      'Unlimited likes',
      'Medium visibility (25%)',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/GSA6TBVY9PFDU',
  },
];

const clientPlans: Plan[] = [
  {
    id: 'client-unlimited',
    name: 'UNLIMITED CLIENT',
    price: '$199 MXN',
    benefits: [
      '30 direct messages per month',
      'Unlimited superlikes',
      'Full visibility (100%)',
      'Priority in search results',
      'Access to all premium features',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/7E6R38L33LYUJ',
    highlight: true,
  },
  {
    id: 'client-premium-plus-plus',
    name: 'PREMIUM ++ CLIENT',
    price: '$149 MXN',
    benefits: [
      '12 direct messages per month',
      'See who visited your profile',
      'Highlighted profile',
      'Medium visibility (50%)',
      'Unlimited superlikes',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/HUESWJ68BRUSY',
  },
  {
    id: 'client-premium',
    name: 'PREMIUM CLIENT',
    price: '$99 MXN',
    benefits: [
      '6 direct messages per month',
      'See who liked you',
      'More visibility (25%)',
      'Access to additional filters',
      'Highlighted profile in regular search',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/QSRXCJYYQ2UGY',
  },
];

// Icons and colors reused
const getPackageIcon = (packageName: string) => {
  if (packageName.includes('UNLIMITED')) return <Zap className="w-5 h-5" />;
  if (packageName.includes('VIP')) return <Crown className="w-5 h-5" />;
  if (packageName.includes('PREMIUM')) return <Star className="w-5 h-5" />;
  return <Check className="w-5 h-5" />;
};

const getPackageColor = (packageName: string) => {
  if (packageName.includes('UNLIMITED')) return 'from-blue-500 to-cyan-500';
  if (packageName.includes('VIP')) return 'from-purple-500 to-pink-500';
  if (packageName.includes('PREMIUM')) return 'from-green-500 to-emerald-500';
  return 'from-gray-500 to-slate-500';
};

export function SubscriptionPackages({ isOpen, onClose, reason, userRole = 'client' }: SubscriptionPackagesProps) {
  if (!isOpen) return null;

  const plans = userRole === 'owner' ? ownerPlans : clientPlans;

  const handleSubscribe = (plan: Plan) => {
    // Store selected plan locally (can persist to Supabase upon your approval)
    const selection = { role: userRole, planId: plan.id, name: plan.name, price: plan.price, at: new Date().toISOString() };
    localStorage.setItem('tinderent_selected_plan', JSON.stringify(selection));

    // Open PayPal in a new tab
    window.open(plan.paypalUrl, '_blank');

    // Feedback
    toast({
      title: 'Redirecting to PayPal',
      description: `Selected: ${plan.name} (${plan.price})`,
    });
  };

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden ${pkg.highlight ? 'ring-2 ring-primary' : ''}`}
            >
              {pkg.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded-bl-lg">
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
                      <span className="text-2xl font-bold">{pkg.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {pkg.benefits.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm capitalize">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full bg-gradient-to-r ${getPackageColor(pkg.name)} hover:opacity-90`}
                  onClick={() => handleSubscribe(pkg)}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Cancel anytime. Secure payments powered by PayPal.</p>
          <p>Questions? Contact support at help@tinderent.com</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
