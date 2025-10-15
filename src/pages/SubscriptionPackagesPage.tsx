import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type Plan = {
  id: string;
  name: string;
  price: string;
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
      'Unlimited messages per month',
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
      '500 messages per month',
      'High visibility (80%)',
      'Advanced client filters',
      '"Premium Profile" badge',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/4LG62YGVETM4L',
  },
  {
    id: 'owner-premium-plus-plus',
    name: 'PREMIUM ++ OWNER',
    price: '$149 MXN',
    benefits: [
      'Up to 5 properties',
      '250 messages per month',
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
      '100 messages per month',
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
      'Unlimited messages per month',
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
      '150 messages per month',
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
      '50 messages per month',
      'See who liked you',
      'More visibility (25%)',
      'Access to additional filters',
      'Highlighted profile in regular search',
    ],
    paypalUrl: 'https://www.paypal.com/ncp/payment/QSRXCJYYQ2UGY',
  },
];

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

export default function SubscriptionPackagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'client' | 'owner'>('client');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (data?.role) {
        setUserRole(data.role as 'client' | 'owner');
      }
    };
    
    fetchUserRole();
  }, [user]);

  const plans = userRole === 'owner' ? ownerPlans : clientPlans;

  const handleSubscribe = (plan: Plan) => {
    const selection = { 
      role: userRole, 
      planId: plan.id, 
      name: plan.name, 
      price: plan.price, 
      at: new Date().toISOString() 
    };
    localStorage.setItem('tinderent_selected_plan', JSON.stringify(selection));

    window.open(plan.paypalUrl, '_blank');

    toast({
      title: 'Redirecting to PayPal',
      description: `Selected: ${plan.name} (${plan.price})`,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the perfect plan for your {userRole} needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden ${pkg.highlight ? 'ring-2 ring-primary shadow-xl' : ''}`}
            >
              {pkg.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAR
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getPackageColor(pkg.name)} text-white`}>
                    {getPackageIcon(pkg.name)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{pkg.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {pkg.benefits.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full h-12 bg-gradient-to-r ${getPackageColor(pkg.name)} hover:opacity-90 text-white font-semibold`}
                  onClick={() => handleSubscribe(pkg)}
                  size="lg"
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground mt-12 space-y-2">
          <p>Cancel anytime. Secure payments powered by PayPal.</p>
          <p>Questions? Contact support at help@tinderent.com</p>
        </div>
      </div>
    </div>
  );
}