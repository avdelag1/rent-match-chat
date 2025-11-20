import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionPackagesProps {
  isOpen?: boolean;
  onClose?: () => void;
  reason?: string;
  userRole?: 'client' | 'owner';
  showAsPage?: boolean;
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

export function SubscriptionPackages({ isOpen = true, onClose, reason, userRole = 'client', showAsPage = false }: SubscriptionPackagesProps) {
  if (!showAsPage && !isOpen) return null;

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
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-background">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-3xl font-bold text-center text-foreground font-brand">
            Upgrade to Premium
          </DialogTitle>
          {reason && (
            <p className="text-center text-muted-foreground text-sm mt-2">
              {reason}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${pkg.highlight ? 'ring-2 ring-primary shadow-lg' : 'border-border'}`}
            >
              {pkg.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAR
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getPackageColor(pkg.name)} text-white shadow-md`}>
                    {getPackageIcon(pkg.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-foreground mb-1">{pkg.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{pkg.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 mb-6">
                  {pkg.benefits.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground leading-tight">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full bg-gradient-to-r ${getPackageColor(pkg.name)} hover:opacity-90 text-white font-semibold`}
                  onClick={() => handleSubscribe(pkg)}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8 space-y-1 pb-4">
          <p>✓ Cancel anytime · Secure payments powered by PayPal</p>
          <p>Questions? Contact support at <span className="text-primary">help@tinderent.com</span></p>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
