import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatPriceMXN } from "@/utils/subscriptionPricing";
import { useSubscriptionPackages } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type MessagePackage = {
  id: number;
  name: string;
  activations: number;
  price: number;
  pricePerActivation: number;
  savings?: string;
  highlight?: boolean;
  icon: typeof MessageCircle;
  duration_days?: number;
  package_category: string;
  paypalUrl?: string;
};

interface MessageActivationPackagesProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsPage?: boolean;
  userRole?: 'client' | 'owner';
}

export function MessageActivationPackages({ 
  isOpen = true, 
  onClose,
  showAsPage = false,
  userRole
}: MessageActivationPackagesProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user's role from profile if not provided
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !userRole,
  });

  const currentUserRole = userRole || userProfile?.role || 'client';

  // Fetch ONLY packages for current user role
  const packageCategory = currentUserRole === 'owner' ? 'owner_pay_per_use' : 'client_pay_per_use';
  
  const { data: packages, isLoading } = useQuery({
    queryKey: ['activation-packages', packageCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('package_category', packageCategory)
        .eq('is_active', true)
        .order('message_activations', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // PayPal URLs mapping with NCP payment links
  const getPayPalUrl = (packageCategory: string, activations: number, price: number): string => {
    // Client packages
    if (packageCategory === 'client_pay_per_use') {
      // Basic: 3 messages @ 50 MXN
      if (activations === 3 && price === 50) {
        return 'https://www.paypal.com/ncp/payment/VNM2QVBFG6TA4';
      }
      // Standard: 10 messages @ 99 MXN
      if (activations === 10 && price === 99) {
        return 'https://www.paypal.com/ncp/payment/VG2C7QMAC8N6A';
      }
      // Premium: 15 messages @ 149 MXN
      if (activations === 15 && price === 149) {
        return 'https://www.paypal.com/ncp/payment/9NBGA9X3BJ5UA';
      }
    }

    // Owner packages
    if (packageCategory === 'owner_pay_per_use') {
      // Basic: 3 messages @ 35 MXN
      if (activations === 3 && price === 35) {
        return 'https://www.paypal.com/ncp/payment/JDDDXHS82XKCC';
      }
      // Standard: 10 messages @ 85 MXN
      if (activations === 10 && price === 85) {
        return 'https://www.paypal.com/ncp/payment/HHDPG2RK7WVXQ';
      }
      // Premium: 15 messages @ 129 MXN
      if (activations === 15 && price === 129) {
        return 'https://www.paypal.com/ncp/payment/PELAQDVWVFPBL';
      }
    }

    return ''; // Return empty if no match
  };

  // Convert database packages to UI format
  const convertPackages = (dbPackages: any[] | undefined): MessagePackage[] => {
    if (!dbPackages) return [];

    return dbPackages.map((pkg, index) => {
      const pricePerActivation = pkg.message_activations > 0
        ? pkg.price / pkg.message_activations
        : 0;

      // Highlight the middle option (usually best value)
      const highlight = dbPackages.length === 3 && index === 1;

      // Calculate savings vs first package
      let savings: string | undefined;
      if (index > 0 && dbPackages[0]) {
        const firstPricePerActivation = dbPackages[0].price / dbPackages[0].message_activations;
        const savingsPercent = Math.round(((firstPricePerActivation - pricePerActivation) / firstPricePerActivation) * 100);
        if (savingsPercent > 0) {
          savings = `${savingsPercent}% OFF`;
        }
      }

      return {
        id: pkg.id,
        name: pkg.name,
        activations: pkg.message_activations,
        price: pkg.price,
        pricePerActivation,
        savings,
        highlight,
        icon: highlight ? Zap : (index === 0 ? MessageCircle : Sparkles),
        duration_days: pkg.duration_days,
        package_category: pkg.package_category,
        paypalUrl: getPayPalUrl(pkg.package_category, pkg.message_activations, pkg.price),
      };
    });
  };

  const handlePurchase = (pkg: MessagePackage) => {
    // Store selection for post-payment processing
    localStorage.setItem('pendingActivationPurchase', JSON.stringify({
      packageId: pkg.id,
      activations: pkg.activations,
      price: pkg.price,
      package_category: pkg.package_category,
    }));

    // Open PayPal in new tab
    if (pkg.paypalUrl && pkg.paypalUrl !== '') {
      window.open(pkg.paypalUrl, '_blank');

      toast({
        title: "Redirecting to PayPal",
        description: `Selected: ${pkg.name} (${formatPriceMXN(pkg.price)})`,
      });
    } else {
      toast({
        title: "PayPal link not configured",
        description: "Please contact support to complete this purchase.",
        variant: "destructive",
      });
    }
  };

  const renderPackages = (packages: MessagePackage[], roleLabel: string) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => {
        const Icon = pkg.icon;
        return (
          <Card 
            key={pkg.id}
            className={`relative transition-all hover:shadow-lg border ${
              pkg.highlight 
                ? 'border-primary shadow-lg ring-2 ring-primary/30' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            {pkg.savings && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-md">
                {pkg.savings}
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit shadow-sm">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">{pkg.name}</CardTitle>
              <CardDescription className="text-3xl font-bold text-foreground mt-2">
                {formatPriceMXN(pkg.price)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="text-center py-4 bg-muted/30 rounded-lg">
                <div className="text-5xl font-bold text-primary">{pkg.activations}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Message Activations</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatPriceMXN(pkg.pricePerActivation)} per activation
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Start {pkg.activations} new conversations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Unlimited messages per conversation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{pkg.duration_days || 90}-day validity</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button 
                onClick={() => handlePurchase(pkg)}
                className={`w-full font-semibold ${pkg.highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={pkg.highlight ? "default" : "outline"}
              >
                Buy Now
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  const packagesUI = convertPackages(packages);
  
  const roleLabel = currentUserRole === 'owner' ? 'Owner' : 'Client';
  const roleDescription = currentUserRole === 'owner' 
    ? 'Start conversations with potential clients. Each activation lets you reach out to a new client.'
    : 'Connect with property owners. Each activation lets you start a conversation about a listing.';

  const content = (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-foreground font-brand">Message Activation Packages</h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          {roleDescription}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">New users get 3 FREE activations!</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <Badge variant="outline" className="text-base px-4 py-2 border-primary text-primary">
              {roleLabel} Packages
            </Badge>
          </div>
          {renderPackages(packagesUI, roleLabel)}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground space-y-1 mt-8">
        <p>✓ Activations never expire within the validity period</p>
        <p>✓ Once a conversation starts, message unlimited within it</p>
        <p>✓ Secure payment processing via PayPal</p>
      </div>
    </div>
  );

  if (showAsPage) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 overflow-auto">
        <div className="relative bg-background rounded-lg border shadow-lg">
          {onClose && (
            <Button
              variant="ghost"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              ✕
            </Button>
          )}
          {content}
        </div>
      </div>
    </div>
  );
}