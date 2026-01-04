/**
 * Ultra-Fast Route Prefetcher - Instagram/Tinder Speed
 * Aggressively preloads ALL routes for instant navigation
 * No delays, no waiting - everything loads immediately
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
 * Immediately prefetch a route - no waiting
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
 * Prefetch multiple routes in parallel - instant loading
 */
function prefetchRoutesParallel(routes: string[]): void {
  Promise.all(routes.map(route => prefetchRoute(route))).catch(() => {});
}

/**
 * Prefetch routes based on user role - AGGRESSIVE
 */
export function prefetchRoleRoutes(role: 'client' | 'owner'): void {
  if (role === 'client') {
    prefetchRoutesParallel([
      '/client/dashboard',
      '/client/profile',
      '/client/settings',
      '/client/liked-properties',
      '/client/services',
      '/messages',
      '/notifications',
    ]);
  } else {
    prefetchRoutesParallel([
      '/owner/dashboard',
      '/owner/profile',
      '/owner/settings',
      '/owner/properties',
      '/owner/liked-clients',
      '/owner/clients/property',
      '/messages',
      '/notifications',
    ]);
  }
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
 * Prefetch ALL critical routes immediately on app load
 * This is the key for instant navigation - preload everything
 */
export function prefetchCriticalRoutes(): void {
  // Batch 1: Most critical routes - load immediately
  const criticalRoutes = [
    '/client/dashboard',
    '/owner/dashboard',
    '/messages',
    '/notifications',
  ];
  prefetchRoutesParallel(criticalRoutes);

  // Batch 2: Secondary routes - load after 100ms
  setTimeout(() => {
    const secondaryRoutes = [
      '/client/profile',
      '/client/settings',
      '/client/liked-properties',
      '/owner/profile',
      '/owner/settings',
      '/owner/properties',
    ];
    prefetchRoutesParallel(secondaryRoutes);
  }, 100);

  // Batch 3: All remaining routes - load after 300ms
  setTimeout(() => {
    const remainingRoutes = Object.keys(routeImports).filter(
      route => !prefetchedRoutes.has(route)
    );
    prefetchRoutesParallel(remainingRoutes);
  }, 300);
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
 * Prefetch next likely route based on current location - INSTANT
 */
export function prefetchNextLikelyRoute(currentPath: string): void {
  const nextRouteMap: Record<string, string[]> = {
    '/client/dashboard': ['/messages', '/client/liked-properties', '/client/profile', '/client/services'],
    '/owner/dashboard': ['/messages', '/owner/properties', '/owner/liked-clients', '/owner/profile'],
    '/owner/properties': ['/owner/listings/new'],
    '/': ['/client/dashboard', '/owner/dashboard'],
  };

  const nextRoutes = nextRouteMap[currentPath];
  if (nextRoutes) {
    prefetchRoutesParallel(nextRoutes);
  }
}

/**
 * Check if a route is already prefetched
 */
export function isRoutePrefetched(path: string): boolean {
  return prefetchedRoutes.has(path);
}
