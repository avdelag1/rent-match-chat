import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('pending_purchase');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-8">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <Button onClick={() => navigate('/subscription-packages')} size="lg">
          Try Again
        </Button>
      </div>
    </div>
  );
}
