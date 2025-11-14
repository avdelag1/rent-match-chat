
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'owner';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, userRole, roleLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show loading while checking auth/role
    if (loading || roleLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/', { replace: true, state: { from: location } });
      return;
    }

    if (!userRole) {
      // Role not found - this shouldn't happen
      console.error('ProtectedRoute: User authenticated but no role found');
      toast({
        title: "Account setup incomplete",
        description: "Please contact support if this persists.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
      return;
    }

    // Check role-based access for protected routes
    if (requiredRole && userRole !== requiredRole) {
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      console.log('User has wrong role for this route, redirecting to:', targetPath);
      navigate(targetPath, { replace: true });
      return; // Important: return early to prevent rendering children
    }
  }, [user, userRole, loading, roleLoading, navigate, location, requiredRole]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && userRole !== requiredRole)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

