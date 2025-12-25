import { Link, LinkProps } from 'react-router-dom';
import { useRef, useCallback } from 'react';

/**
 * Predictive Prefetching Link Component
 * Preloads route components on hover/touch for instant navigation
 * Uses intersection observer for viewport-based prefetching
 */

// Track prefetched routes to avoid duplicate requests
const prefetchedRoutes = new Set<string>();

// Route to dynamic import mapping
const routeImports: Record<string, () => Promise<any>> = {
  '/client/dashboard': () => import('../pages/ClientDashboard'),
  '/client/profile': () => import('../pages/ClientProfile'),
  '/client/settings': () => import('../pages/ClientSettings'),
  '/client/liked-properties': () => import('../pages/ClientLikedProperties'),
  '/client/saved-searches': () => import('../pages/ClientSavedSearches'),
  '/client/security': () => import('../pages/ClientSecurity'),
  '/client/camera': () => import('../pages/ClientSelfieCamera'),
  '/client/services': () => import('../pages/ClientWorkerDiscovery'),
  '/client/contracts': () => import('../pages/ClientContracts'),

  '/owner/dashboard': () => import('../components/EnhancedOwnerDashboard'),
  '/owner/profile': () => import('../pages/OwnerProfile'),
  '/owner/settings': () => import('../pages/OwnerSettings'),
  '/owner/properties': () => import('../pages/OwnerProperties'),
  '/owner/listings/new': () => import('../pages/OwnerNewListing'),
  '/owner/liked-clients': () => import('../pages/OwnerLikedClients'),
  '/owner/saved-searches': () => import('../pages/OwnerSavedSearches'),
  '/owner/security': () => import('../pages/OwnerSecurity'),
  '/owner/camera': () => import('../pages/OwnerProfileCamera'),
  '/owner/camera/listing': () => import('../pages/OwnerListingCamera'),
  '/owner/contracts': () => import('../pages/OwnerContracts'),
  '/owner/filters-explore': () => import('../pages/OwnerFiltersExplore'),

  '/owner/clients/property': () => import('../pages/OwnerPropertyClientDiscovery'),
  '/owner/clients/moto': () => import('../pages/OwnerMotoClientDiscovery'),
  '/owner/clients/bicycle': () => import('../pages/OwnerBicycleClientDiscovery'),
  '/owner/clients/yacht': () => import('../pages/OwnerYachtClientDiscovery'),
  '/owner/clients/vehicle': () => import('../pages/OwnerVehicleClientDiscovery'),

  '/messages': () => import('../pages/MessagingDashboard'),
  '/notifications': () => import('../pages/NotificationsPage'),
  '/radio': () => import('../pages/RadioPage'),
  '/subscription-packages': () => import('../pages/SubscriptionPackagesPage'),
};

interface PrefetchLinkProps extends LinkProps {
  prefetch?: 'hover' | 'viewport' | 'intent' | false;
  prefetchDelay?: number;
}

export function PrefetchLink({
  to,
  children,
  prefetch = 'intent',
  prefetchDelay = 50,
  onMouseEnter,
  onTouchStart,
  ...props
}: PrefetchLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<IntersectionObserver>();

  const prefetchRoute = useCallback((path: string) => {
    // Skip if already prefetched
    if (prefetchedRoutes.has(path)) return;

    // Find matching route import
    const importFn = routeImports[path];
    if (!importFn) return;

    // Mark as prefetched
    prefetchedRoutes.add(path);

    // Trigger the dynamic import
    importFn().catch(() => {
      // Remove from cache if failed
      prefetchedRoutes.delete(path);
    });
  }, []);

  const handlePrefetch = useCallback(() => {
    const path = typeof to === 'string' ? to : to.pathname;
    if (!path) return;

    if (prefetchDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        prefetchRoute(path);
      }, prefetchDelay);
    } else {
      prefetchRoute(path);
    }
  }, [to, prefetchRoute, prefetchDelay]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch === 'hover' || prefetch === 'intent') {
      handlePrefetch();
    }
    onMouseEnter?.(e);
  }, [prefetch, handlePrefetch, onMouseEnter]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLAnchorElement>) => {
    if (prefetch === 'intent') {
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Immediate prefetch on touch
      const path = typeof to === 'string' ? to : to.pathname;
      if (path) prefetchRoute(path);
    }
    onTouchStart?.(e);
  }, [prefetch, to, prefetchRoute, onTouchStart]);

  const handleMouseLeave = useCallback(() => {
    // Cancel prefetch if mouse leaves quickly
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Viewport-based prefetching
  useRef(() => {
    if (prefetch !== 'viewport' || !linkRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const path = typeof to === 'string' ? to : to.pathname;
            if (path) prefetchRoute(path);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(linkRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  });

  return (
    <Link
      ref={linkRef}
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Prefetch a route imperatively
 */
export function prefetchRoute(path: string) {
  if (prefetchedRoutes.has(path)) return;

  const importFn = routeImports[path];
  if (!importFn) return;

  prefetchedRoutes.add(path);
  importFn().catch(() => {
    prefetchedRoutes.delete(path);
  });
}

/**
 * Check if a route has been prefetched
 */
export function isRoutePrefetched(path: string): boolean {
  return prefetchedRoutes.has(path);
}
