/**
 * Speed of Light Route Prefetcher
 * Optimized for instant navigation WITHOUT blocking first render
 *
 * Key optimizations:
 * - Only preload 2-3 most likely routes initially
 * - Use requestIdleCallback to never compete with first paint
 * - Defer secondary routes until browser is truly idle
 */

type RouteImport = () => Promise<{ default: React.ComponentType }>;

// Route mapping for prefetching - ALL app routes
const routeImports: Record<string, RouteImport> = {
  // Client routes
  '/client/dashboard': () => import('@/pages/ClientDashboard'),
  '/client/profile': () => import('@/pages/ClientProfileNew'),
  '/client/settings': () => import('@/pages/ClientSettingsNew'),
  '/client/liked-properties': () => import('@/pages/ClientLikedProperties'),
  '/client/contracts': () => import('@/pages/ClientContracts'),
  '/client/services': () => import('@/pages/ClientWorkerDiscovery'),
  '/client/saved-searches': () => import('@/pages/ClientSavedSearches'),
  '/client/security': () => import('@/pages/ClientSecurity'),
  // Owner routes
  '/owner/dashboard': () => import('@/components/EnhancedOwnerDashboard'),
  '/owner/profile': () => import('@/pages/OwnerProfileNew'),
  '/owner/settings': () => import('@/pages/OwnerSettingsNew'),
  '/owner/properties': () => import('@/pages/OwnerProperties'),
  '/owner/listings/new': () => import('@/pages/OwnerNewListing'),
  '/owner/liked-clients': () => import('@/pages/OwnerLikedClients'),
  '/owner/contracts': () => import('@/pages/OwnerContracts'),
  '/owner/saved-searches': () => import('@/pages/OwnerSavedSearches'),
  '/owner/security': () => import('@/pages/OwnerSecurity'),
  '/owner/clients/property': () => import('@/pages/OwnerPropertyClientDiscovery'),
  '/owner/clients/vehicle': () => import('@/pages/OwnerVehicleClientDiscovery'),
  '/owner/clients/moto': () => import('@/pages/OwnerMotoClientDiscovery'),
  '/owner/clients/bicycle': () => import('@/pages/OwnerBicycleClientDiscovery'),
  '/owner/clients/yacht': () => import('@/pages/OwnerYachtClientDiscovery'),
  // Shared routes
  '/messages': () => import('@/pages/MessagingDashboard').then(m => ({ default: m.MessagingDashboard })),
  '/notifications': () => import('@/pages/NotificationsPage'),
  '/subscription-packages': () => import('@/pages/SubscriptionPackagesPage'),
};

// Cache for prefetched routes
const prefetchedRoutes = new Set<string>();

/**
 * Safe requestIdleCallback with fallback
 */
const scheduleIdle = (callback: () => void, timeout = 2000): void => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for Safari - use setTimeout with longer delay
    setTimeout(callback, 100);
  }
};

/**
 * Prefetch a single route - always non-blocking
 */
export function prefetchRoute(path: string): Promise<void> {
  if (prefetchedRoutes.has(path)) return Promise.resolve();

  const routeImport = routeImports[path];
  if (!routeImport) return Promise.resolve();

  prefetchedRoutes.add(path);

  return routeImport()
    .then(() => {})
    .catch(() => {
      prefetchedRoutes.delete(path);
    });
}

/**
 * Prefetch multiple routes in parallel
 */
function prefetchRoutesParallel(routes: string[]): void {
  Promise.all(routes.map(route => prefetchRoute(route))).catch(() => {});
}

/**
 * SPEED OF LIGHT: Prefetch routes based on user role
 * Only prefetch 2-3 most critical routes, use requestIdleCallback
 */
export function prefetchRoleRoutes(role: 'client' | 'owner'): void {
  // Only start preloading when browser is idle - never compete with first paint
  scheduleIdle(() => {
    if (role === 'client') {
      // Critical: Only the 2-3 most likely next routes
      prefetchRoutesParallel([
        '/messages',
        '/client/liked-properties',
      ]);

      // Secondary routes - defer even more (3 seconds after idle)
      scheduleIdle(() => {
        prefetchRoutesParallel([
          '/client/profile',
          '/notifications',
        ]);
      }, 3000);
    } else {
      // Critical: Only the 2-3 most likely next routes
      prefetchRoutesParallel([
        '/messages',
        '/owner/properties',
      ]);

      // Secondary routes - defer even more (3 seconds after idle)
      scheduleIdle(() => {
        prefetchRoutesParallel([
          '/owner/profile',
          '/notifications',
        ]);
      }, 3000);
    }
  }, 1000); // 1 second timeout to ensure first paint completes
}

/**
 * Create hover prefetch handler - INSTANT, no debounce
 */
export function createHoverPrefetch(path: string): {
  onMouseEnter: () => void;
  onFocus: () => void;
  onTouchStart: () => void;
} {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}

/**
 * Prefetch critical routes - use requestIdleCallback
 * This is called on app load, but defers work to idle time
 */
export function prefetchCriticalRoutes(): void {
  // Don't preload anything immediately - wait for idle
  scheduleIdle(() => {
    // Only preload the two dashboards as absolute essentials
    prefetchRoutesParallel([
      '/client/dashboard',
      '/owner/dashboard',
    ]);
  }, 2000); // 2 second timeout ensures first paint is complete
}

/**
 * Link prefetch observer - prefetches routes when links enter viewport
 */
export function createLinkObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          if (href && href.startsWith('/')) {
            prefetchRoute(href);
          }
        }
      });
    },
    {
      rootMargin: '200px', // Prefetch when link is 200px from viewport
      threshold: 0,
    }
  );
}

/**
 * Prefetch next likely route based on current location
 * Uses requestIdleCallback to never block
 */
export function prefetchNextLikelyRoute(currentPath: string): void {
  scheduleIdle(() => {
    const nextRouteMap: Record<string, string[]> = {
      '/client/dashboard': ['/messages', '/client/liked-properties'],
      '/owner/dashboard': ['/messages', '/owner/properties'],
      '/owner/properties': ['/owner/listings/new'],
      '/': ['/client/dashboard', '/owner/dashboard'],
    };

    const nextRoutes = nextRouteMap[currentPath];
    if (nextRoutes) {
      prefetchRoutesParallel(nextRoutes);
    }
  }, 500);
}

/**
 * Check if a route is already prefetched
 */
export function isRoutePrefetched(path: string): boolean {
  return prefetchedRoutes.has(path);
}
