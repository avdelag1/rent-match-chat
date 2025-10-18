import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const pendingPurchase = localStorage.getItem('pending_purchase');
      if (!pendingPurchase) {
        toast.error('No pending purchase found');
        navigate('/subscription-packages');
        return;
      }

      const purchase = JSON.parse(pendingPurchase);
      
      try {
        const { data: pkg } = await supabase
          .from('subscription_packages')
          .select('*')
          .eq('id', purchase.package_id)
          .single();

        if (!pkg) throw new Error('Package not found');

        if (pkg.package_category?.includes('pay_per_use')) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + (pkg.duration_days || 30));

          await supabase.from('message_activations').insert({
            user_id: user?.id,
            activation_type: 'pay_per_use',
            total_activations: pkg.message_activations,
            remaining_activations: pkg.message_activations,
            used_activations: 0,
            expires_at: expiresAt.toISOString(),
          });

          toast.success(`${pkg.message_activations} message activations added!`);
        }

        localStorage.removeItem('pending_purchase');
        setProcessing(false);
        
        setTimeout(() => {
          const role = pkg.package_category?.includes('client') ? 'client' : 'owner';
          navigate(`/${role}/dashboard`);
        }, 2000);
      } catch (error) {
        console.error('Payment processing error:', error);
        toast.error('Failed to process payment');
        setProcessing(false);
      }
    };

    if (user) {
      processPayment();
    }
  }, [searchParams, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {processing ? (
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground">Processing your payment...</p>
        </div>
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
