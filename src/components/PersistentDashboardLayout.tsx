import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * SPEED OF LIGHT: Persistent Dashboard Layout
 *
 * This component wraps DashboardLayout and is mounted ONCE at the route level.
 * Child pages render inside via <Outlet>, so DashboardLayout never remounts
 * during navigation. This eliminates flicker and repeated effect execution.
 *
 * Benefits:
 * - No flicker when navigating between dashboard pages
 * - TopBar and BottomNavigation stay mounted
 * - Dialogs/modals maintain state across navigation
 * - Effects (welcome, onboarding, prefetch) run only once
 */

// Lightweight skeleton for role resolution
function RoleLoadingSkeleton() {
  return (
    <div
      className="min-h-screen min-h-dvh w-full bg-background flex flex-col"
      style={{
        paddingTop: 'calc(52px + var(--safe-top, 0px))',
        paddingBottom: 'calc(68px + var(--safe-bottom, 0px))',
      }}
    >
      {/* Top bar skeleton */}
      <div className="fixed top-0 left-0 right-0 h-[52px] bg-background border-b border-border/50 flex items-center justify-between px-4 z-50" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
        <Skeleton className="h-8 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <Skeleton className="w-full max-w-lg aspect-[3/4] rounded-3xl" />
      </div>

      {/* Bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-background border-t border-border/50 flex items-center justify-around px-4" style={{ paddingBottom: 'var(--safe-bottom, 0px)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface PersistentDashboardLayoutProps {
  requiredRole?: 'client' | 'owner';
}

export function PersistentDashboardLayout({ requiredRole }: PersistentDashboardLayoutProps) {
  const { user } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole(user?.id);

  // Determine the role to use
  // If requiredRole is specified, use it (for role-specific routes)
  // Otherwise, use the fetched role
  const effectiveRole = requiredRole || userRole || 'client';

  // Show skeleton briefly while role loads (only on first mount)
  if (roleLoading && !userRole) {
    return <RoleLoadingSkeleton />;
  }

  return (
    <DashboardLayout userRole={effectiveRole as 'client' | 'owner' | 'admin'}>
      <Outlet />
    </DashboardLayout>
  );
}

export default PersistentDashboardLayout;
