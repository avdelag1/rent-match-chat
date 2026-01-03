import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Gift, Zap, Crown, MessageCircle, FileText, Home, Star, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STORAGE } from '@/constants/app';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomDuration = 2 + Math.random() * 2;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${randomX}%`,
        top: '-20px',
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: '100vh',
        rotate: randomRotation + 360,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        delay,
        ease: 'easeIn',
      }}
    />
  );
};

// Confetti container
const Confetti = ({ isActive }: { isActive: boolean }) => {
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} delay={particle.delay} color={particle.color} />
      ))}
    </div>
  );
};

interface PurchaseDetails {
  packageName: string;
  tier: string;
  messageActivations: number;
  legalDocuments: number;
  maxListings: number;
  isMonthly: boolean;
  role: 'client' | 'owner';
  price?: number;
  durationDays?: number;
  visibilityBoost?: number;
  priorityMatching?: boolean;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const goToDashboard = useCallback(() => {
    const role = purchaseDetails?.role || 'client';
    navigate(`/${role}/dashboard`);
  }, [navigate, purchaseDetails]);

  useEffect(() => {
    let isMounted = true;
    let confettiTimeout: NodeJS.Timeout | null = null;

    const processPayment = async () => {
      const pendingPurchase = localStorage.getItem(STORAGE.SELECTED_PLAN_KEY) || localStorage.getItem(STORAGE.PENDING_ACTIVATION_KEY);

      if (!pendingPurchase) {
        if (isMounted) {
          setError('No pending purchase found. If you completed a payment, please contact support.');
          setProcessing(false);
        }
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

        if (!isMounted) return;

        if (!pkg) {
          setError('Package not found. Please contact support.');
          setProcessing(false);
          return;
        }

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
        }

        if (!isMounted) return;

        setPurchaseDetails({
          packageName: pkg.name,
          tier: pkg.tier,
          messageActivations: pkg.message_activations || 0,
          legalDocuments: pkg.legal_documents_included || 0,
          maxListings: pkg.max_listings || 0,
          isMonthly,
          role: role as 'client' | 'owner',
          price: pkg.price,
          durationDays: pkg.duration_days,
          visibilityBoost: pkg.visibility_boost,
          priorityMatching: pkg.priority_matching,
        });

        // Clear storage
        localStorage.removeItem(STORAGE.SELECTED_PLAN_KEY);
        localStorage.removeItem(STORAGE.PENDING_ACTIVATION_KEY);
        setProcessing(false);
        setShowConfetti(true);

        // Stop confetti after 4 seconds
        confettiTimeout = setTimeout(() => {
          if (isMounted) {
            setShowConfetti(false);
          }
        }, 4000);

      } catch (error) {
        if (import.meta.env.DEV) console.error('Payment processing error:', error);
        if (isMounted) {
          setError('Failed to process payment. Please contact support with your PayPal receipt.');
          setProcessing(false);
        }
      }
    };

    if (user) {
      processPayment();
    }

    return () => {
      isMounted = false;
      if (confettiTimeout) {
        clearTimeout(confettiTimeout);
      }
    };
  }, [searchParams, user]);

  // Countdown timer
  useEffect(() => {
    if (!processing && purchaseDetails && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && purchaseDetails) {
      goToDashboard();
    }
  }, [countdown, processing, purchaseDetails, goToDashboard]);

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

  // Get tier-specific styling
  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'unlimited':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-teal-500',
          glow: 'shadow-2xl shadow-blue-500/30',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          icon: Crown,
        };
      case 'premium-max':
      case 'premium_plus':
        return {
          gradient: 'from-purple-500 via-pink-500 to-rose-500',
          glow: 'shadow-2xl shadow-purple-500/30',
          badge: 'bg-gradient-to-r from-purple-500 to-pink-500',
          icon: Star,
        };
      default:
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          glow: 'shadow-2xl shadow-green-500/30',
          badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: Zap,
        };
    }
  };

  // Processing state
  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-16 h-16 mx-auto text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Processing Your Payment</h2>
            <p className="text-muted-foreground">Please wait while we activate your benefits...</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secure payment verified by PayPal</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">Payment Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/subscription-packages')} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate('/client/dashboard')} variant="ghost">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state with congratulations
  if (purchaseDetails) {
    const styles = getTierStyles(purchaseDetails.tier);
    const TierIcon = styles.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4 overflow-hidden">
        <Confetti isActive={showConfetti} />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <Card className={`relative overflow-hidden border-2 border-green-500/50 ${styles.glow}`}>
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-5`} />

            <CardHeader className="text-center relative z-10 pb-2">
              {/* Success icon with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                className="mx-auto mb-4"
              >
                <div className={`p-4 rounded-full bg-gradient-to-br ${styles.gradient}`}>
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  Congratulations!
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">Your payment was successful</p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Package details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${styles.badge}`}>
                    <TierIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{purchaseDetails.packageName}</h3>
                    <Badge variant="outline" className="mt-1">
                      {purchaseDetails.isMonthly ? 'Monthly Subscription' : 'Pay-Per-Use'}
                    </Badge>
                  </div>
                </div>
              </motion.div>

              {/* Benefits list */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Your Benefits Are Now Active
                </h4>

                <div className="grid gap-2">
                  {purchaseDetails.messageActivations > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="text-foreground font-medium">
                        {purchaseDetails.messageActivations} Message Activations
                        {purchaseDetails.isMonthly && ' per month'}
                      </span>
                    </motion.div>
                  )}

                  {purchaseDetails.legalDocuments > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-foreground font-medium">
                        {purchaseDetails.legalDocuments} Legal Documents included
                      </span>
                    </motion.div>
                  )}

                  {purchaseDetails.maxListings > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                    >
                      <Home className="w-5 h-5 text-purple-500" />
                      <span className="text-foreground font-medium">
                        Up to {purchaseDetails.maxListings} Property Listings
                      </span>
                    </motion.div>
                  )}

                  {purchaseDetails.visibilityBoost && purchaseDetails.visibilityBoost > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <Star className="w-5 h-5 text-amber-500" />
                      <span className="text-foreground font-medium">
                        {Math.round(purchaseDetails.visibilityBoost * 100)}% Visibility Boost
                      </span>
                    </motion.div>
                  )}

                  {purchaseDetails.priorityMatching && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                    >
                      <Crown className="w-5 h-5 text-cyan-500" />
                      <span className="text-foreground font-medium">
                        Priority Matching Enabled
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Call to action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="space-y-3 pt-2"
              >
                <Button
                  onClick={goToDashboard}
                  className={`w-full h-12 font-semibold text-base bg-gradient-to-r ${styles.gradient} hover:opacity-90 transition-opacity`}
                >
                  Start Using Your Benefits
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Redirecting to dashboard in {countdown} seconds...
                </p>
              </motion.div>

              {/* Receipt note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center text-xs text-muted-foreground pt-2 border-t border-border"
              >
                <p>A receipt has been sent to your PayPal email address.</p>
                <p className="mt-1">Need help? Contact support@rentmatch.com</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-4">Redirecting to dashboard...</p>
        <Button onClick={() => navigate('/client/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
