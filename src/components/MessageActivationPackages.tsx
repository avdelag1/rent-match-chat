import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatPriceMXN } from "@/utils/subscriptionPricing";

type MessagePackage = {
  id: string;
  name: string;
  activations: number;
  price: number;
  pricePerActivation: number;
  savings?: string;
  highlight?: boolean;
  icon: typeof MessageCircle;
};

const MESSAGE_PACKAGES: MessagePackage[] = [
  {
    id: "msg_10",
    name: "Starter Pack",
    activations: 10,
    price: 199,
    pricePerActivation: 19.9,
    icon: MessageCircle,
  },
  {
    id: "msg_25",
    name: "Popular Choice",
    activations: 25,
    price: 449,
    pricePerActivation: 17.96,
    savings: "10% OFF",
    highlight: true,
    icon: Zap,
  },
  {
    id: "msg_50",
    name: "Best Value",
    activations: 50,
    price: 799,
    pricePerActivation: 15.98,
    savings: "20% OFF",
    icon: Sparkles,
  },
  {
    id: "msg_100",
    name: "Ultimate Pack",
    activations: 100,
    price: 1399,
    pricePerActivation: 13.99,
    savings: "30% OFF",
    icon: Sparkles,
  },
];

interface MessageActivationPackagesProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsPage?: boolean;
}

export function MessageActivationPackages({ 
  isOpen = true, 
  onClose,
  showAsPage = false 
}: MessageActivationPackagesProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePurchase = (pkg: MessagePackage) => {
    // TODO: Integrate with actual payment system (PayPal/Stripe)
    toast({
      title: "Redirecting to Payment",
      description: `Processing purchase of ${pkg.activations} message activations...`,
    });
    
    // Store selection for post-payment processing
    localStorage.setItem('pendingActivationPurchase', JSON.stringify({
      packageId: pkg.id,
      activations: pkg.activations,
      price: pkg.price,
    }));
    
    // Placeholder: In production, redirect to payment gateway
    console.log('Payment integration needed:', pkg);
  };

  const content = (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Message Activation Packages</h2>
        <p className="text-muted-foreground">
          Start conversations with property owners or clients. Each activation lets you begin a new conversation.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">New users get 5 FREE activations!</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {MESSAGE_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card 
              key={pkg.id}
              className={`relative transition-all hover:shadow-lg ${
                pkg.highlight 
                  ? 'border-accent shadow-accent/20 ring-2 ring-accent/50' 
                  : 'hover:border-accent/50'
              }`}
            >
              {pkg.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                  {pkg.savings}
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 rounded-full bg-accent/10 w-fit">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground mt-2">
                  {formatPriceMXN(pkg.price)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent">{pkg.activations}</div>
                  <div className="text-sm text-muted-foreground">Message Activations</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatPriceMXN(pkg.pricePerActivation)} per activation
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    <span>Start {pkg.activations} new conversations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Unlimited messages per conversation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span>90-day validity</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  onClick={() => handlePurchase(pkg)}
                  className="w-full"
                  variant={pkg.highlight ? "default" : "outline"}
                >
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>✓ Activations never expire within the 90-day period</p>
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