import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Crown, Rocket, Star, MessageCircle, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserSubscription } from '@/hooks/useSubscription';
import { formatPriceMXN } from '@/utils/subscriptionPricing';
import { toast } from 'sonner';

type PackageCategory = 'client_monthly' | 'owner_monthly' | 'client_pay_per_use' | 'owner_pay_per_use';

interface SubscriptionPackage {
  id: number;
  name: string;
  tier: string;
  package_category: PackageCategory;
  price: number;
  message_activations: number;
  legal_documents_included: number;
  max_listings?: number;
  duration_days?: number;
  features: string[];
}

export default function SubscriptionPackagesPage() {
  const { user } = useAuth();
  const { data: currentSubscription } = useUserSubscription();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'client' | 'owner' | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'monthly' | 'pay_per_use'>('monthly');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData) setUserRole(roleData.role as 'client' | 'owner');

        const { data: packagesData, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        setPackages(packagesData as any || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubscribe = (pkg: SubscriptionPackage) => {
    localStorage.setItem('selected_package', JSON.stringify({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      category: pkg.package_category,
    }));
    toast.success(`Selected ${pkg.name}. Payment integration coming soon!`);
  };

  const getPackageIcon = (tier: string) => {
    switch (tier) {
      case 'unlimited': return Crown;
      case 'premium': case 'premium_plus': return Rocket;
      case 'basic': return Star;
      default: return Zap;
    }
  };

  const getPackageGradient = (tier: string) => {
    switch (tier) {
      case 'unlimited': return 'from-amber-500 to-yellow-600';
      case 'premium': case 'premium_plus': return 'from-purple-500 to-pink-600';
      case 'basic': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const filteredPackages = packages.filter(pkg => {
    if (!userRole) return false;
    const isRoleMatch = pkg.package_category.includes(userRole);
    const isTypeMatch = selectedCategory === 'monthly' 
      ? pkg.package_category.includes('monthly')
      : pkg.package_category.includes('pay_per_use');
    return isRoleMatch && isTypeMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple pricing focused on message activations and legal documents
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="monthly">Monthly Plans</TabsTrigger>
            <TabsTrigger value="pay_per_use">Pay-Per-Use</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => {
                const Icon = getPackageIcon(pkg.tier);
                const isPopular = pkg.tier === 'premium';

                return (
                  <Card key={pkg.id} className={`relative p-6 hover:shadow-2xl transition-all ${isPopular ? 'border-2 border-primary shadow-xl scale-105' : ''}`}>
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                        MOST POPULAR
                      </Badge>
                    )}

                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getPackageGradient(pkg.tier)} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-center mb-2">{pkg.name}</h3>
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold">{formatPriceMXN(pkg.price)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button onClick={() => handleSubscribe(pkg)} className="w-full" variant={isPopular ? 'default' : 'outline'} size="lg">
                      {currentSubscription?.subscription_packages?.id === pkg.id ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pay_per_use" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-center mb-2">{pkg.name}</h3>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold">{formatPriceMXN(pkg.price)}</span>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mb-6">
                    Valid for {pkg.duration_days} days
                  </p>

                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button onClick={() => handleSubscribe(pkg)} className="w-full" variant="outline">
                    Buy Now
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            All payments processed securely through PayPal
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? <a href="/support" className="text-primary hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
