import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Gift, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      const pendingPurchase = localStorage.getItem('tinderent_selected_plan') || localStorage.getItem('pendingActivationPurchase');
      if (!pendingPurchase) {
        toast.error('No pending purchase found');
        navigate('/subscription-packages');
        return;
      }

      try {
        const purchase = JSON.parse(pendingPurchase);
        let pkg;

        // Fetch package based on what info we have
        if (purchase.packageId) {
          // Pay-per-use package
          const { data } = await supabase
            .from('subscription_packages')
            .select('*')
            .eq('id', purchase.packageId)
            .single();
          pkg = data;
        } else if (purchase.planId) {
          // Monthly subscription - need to map from old format
          pkg = await mapMonthlyPlanToPackage(purchase.planId);
        }

        if (!pkg) throw new Error('Package not found');

        const role = pkg.package_category?.includes('client') ? 'client' : 'owner';
        const isMonthly = pkg.package_category?.includes('monthly');
        const isPayPerUse = pkg.package_category?.includes('pay_per_use');

        // Create subscription record
        if (isMonthly) {
          // Create monthly subscription
          const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user?.id)
            .eq('subscription_packages.package_category', pkg.package_category)
            .maybeSingle();

          // Deactivate any previous subscriptions of same type
          if (existingSub) {
            await supabase
              .from('user_subscriptions')
              .update({ is_active: false })
              .eq('id', existingSub.id);
          }

          // Create new subscription
          const { error: subError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user?.id,
              subscription_package_id: pkg.id,
              payment_status: 'paid',
              is_active: true,
            });

          if (subError) throw subError;

          // Create message activations for monthly
          const resetDate = new Date();
          resetDate.setMonth(resetDate.getMonth() + 1);
          resetDate.setDate(1);

          const { error: activError } = await supabase
            .from('message_activations')
            .insert({
              user_id: user?.id,
              activation_type: 'monthly_subscription',
              total_activations: pkg.message_activations || 30,
              remaining_activations: pkg.message_activations || 30,
              used_activations: 0,
              reset_date: resetDate.toISOString().split('T')[0],
            });

          if (activError) throw activError;

          // Create legal document quota if needed
          if (pkg.legal_documents_included && pkg.legal_documents_included > 0) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(1);

            await supabase
              .from('legal_document_quota')
              .upsert({
                user_id: user?.id,
                monthly_limit: pkg.legal_documents_included,
                used_this_month: 0,
                reset_date: nextMonth.toISOString().split('T')[0],
              });
          }

          toast.success(`Welcome to ${pkg.name}! 🎉`, {
            description: 'Your premium benefits are now active! You can now enjoy all the features of your plan.'
          });
        } else if (isPayPerUse) {
          // Create pay-per-use activations
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + (pkg.duration_days || 30));

          const { error: activError } = await supabase
            .from('message_activations')
            .insert({
              user_id: user?.id,
              activation_type: 'pay_per_use',
              total_activations: pkg.message_activations,
              remaining_activations: pkg.message_activations,
              used_activations: 0,
              expires_at: expiresAt.toISOString(),
            });

          if (activError) throw activError;

          toast.success(`${pkg.message_activations} Message Activations Added! 🎉`, {
            description: `Valid for ${pkg.duration_days || 30} days. Start conversations with your matches now!`
          });
        }

        setPurchaseDetails({
          packageName: pkg.name,
          tier: pkg.tier,
          messageActivations: pkg.message_activations || 0,
          legalDocuments: pkg.legal_documents_included || 0,
          maxListings: pkg.max_listings || 0,
          isMonthly,
          role,
        });

        // Clear storage
        localStorage.removeItem('tinderent_selected_plan');
        localStorage.removeItem('pendingActivationPurchase');
        setProcessing(false);

        setTimeout(() => {
          navigate(`/${role}/dashboard`);
        }, 3000);
      } catch (error) {
        console.error('Payment processing error:', error);
        toast.error('Failed to process payment. Please contact support.');
        setProcessing(false);
      }
    };

    if (user) {
      processPayment();
    }
  }, [searchParams, navigate, user]);

  const mapMonthlyPlanToPackage = async (planId: string) => {
    // Map old plan IDs to new package names
    const planMap: Record<string, string> = {
      'client-unlimited': 'Ultimate Seeker',
      'client-premium-plus-plus': 'Multi-Matcher',
      'client-premium': 'Basic Explorer',
      'owner-unlimited': 'Empire Builder',
      'owner-premium-max': 'Multi-Asset Manager',
      'owner-premium-plus-plus': 'Category Pro',
      'owner-premium-plus': 'Starter Lister',
    };

    const packageName = planMap[planId];
    if (!packageName) return null;

    const { data } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('name', packageName)
      .maybeSingle();

    return data;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {processing ? (
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground">Processing your payment...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we activate your benefits</p>
        </div>
      ) : purchaseDetails ? (
        <Card className="max-w-md w-full border-green-500/50 bg-green-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-500/20">
              <Gift className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-background rounded-lg border border-green-500/20">
                <h3 className="font-semibold text-lg">{purchaseDetails.packageName}</h3>
                <Badge variant="outline" className="mt-2">
                  {purchaseDetails.isMonthly ? '📅 Monthly' : '⏰ Pay-Per-Use'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                {purchaseDetails.messageActivations > 0 && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span>{purchaseDetails.messageActivations} message activations {purchaseDetails.isMonthly ? 'per month' : ''}</span>
                  </div>
                )}
                {purchaseDetails.legalDocuments > 0 && (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-accent" />
                    <span>{purchaseDetails.legalDocuments} legal documents included</span>
                  </div>
                )}
                {purchaseDetails.maxListings > 0 && (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-accent" />
                    <span>Up to {purchaseDetails.maxListings} property listings</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-1 text-sm text-muted-foreground">
              <p>✓ Your benefits are now active!</p>
              <p>✓ Redirecting to dashboard...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
}
