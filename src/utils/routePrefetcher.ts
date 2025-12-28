/**
 * Ultra-Fast Route Prefetcher
 * Preloads routes on hover/focus for instant navigation
 * Uses Intersection Observer for viewport-based prefetching
 */

type RouteImport = () => Promise<{ default: React.ComponentType }>;

// Route mapping for prefetching
const routeImports: Record<string, RouteImport> = {
  '/client/dashboard': () => import('@/pages/ClientDashboard'),
  '/client/profile': () => import('@/pages/ClientProfileNew'),
  '/client/settings': () => import('@/pages/ClientSettingsNew'),
  '/client/liked-properties': () => import('@/pages/ClientLikedProperties'),
  '/client/contracts': () => import('@/pages/ClientContracts'),
  '/client/services': () => import('@/pages/ClientWorkerDiscovery'),
  '/owner/dashboard': () => import('@/components/EnhancedOwnerDashboard'),
  '/owner/profile': () => import('@/pages/OwnerProfileNew'),
  '/owner/settings': () => import('@/pages/OwnerSettingsNew'),
  '/owner/properties': () => import('@/pages/OwnerProperties'),
  '/owner/listings/new': () => import('@/pages/OwnerNewListing'),
  '/owner/liked-clients': () => import('@/pages/OwnerLikedClients'),
  '/owner/contracts': () => import('@/pages/OwnerContracts'),
  '/messages': () => import('@/pages/MessagingDashboard').then(m => ({ default: m.MessagingDashboard })),
  '/notifications': () => import('@/pages/NotificationsPage'),
  '/radio': () => import('@/pages/RadioPage'),
  '/subscription-packages': () => import('@/pages/SubscriptionPackagesPage'),
};

// Cache for prefetched routes
const prefetchedRoutes = new Set<string>();
const prefetchQueue: string[] = [];
let isPrefetching = false;

/**
 * Prefetch a route's JavaScript chunk
 */
export function prefetchRoute(path: string): void {
  // Skip if already prefetched or no import defined
  if (prefetchedRoutes.has(path)) return;

  const routeImport = routeImports[path];
  if (!routeImport) return;

  // Add to queue and process
  if (!prefetchQueue.includes(path)) {
    prefetchQueue.push(path);
    processPrefetchQueue();
  }
}

/**
 * Process prefetch queue with idle callback
 */
function processPrefetchQueue(): void {
  if (isPrefetching || prefetchQueue.length === 0) return;
  isPrefetching = true;

  const prefetchNext = () => {
    const path = prefetchQueue.shift();
    if (!path) {
      isPrefetching = false;
      return;
    }

    const routeImport = routeImports[path];
    if (routeImport && !prefetchedRoutes.has(path)) {
      prefetchedRoutes.add(path);

      // Use requestIdleCallback for non-blocking prefetch
      const doPrefetch = () => {
        routeImport()
          .then(() => {
            // Small delay before next prefetch to avoid network congestion
            setTimeout(prefetchNext, 50);
          })
          .catch(() => {
            // Remove from cache on error so we can retry
            prefetchedRoutes.delete(path);
            prefetchNext();
          });
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(doPrefetch, { timeout: 2000 });
      } else {
        setTimeout(doPrefetch, 100);
      }
    } else {
      prefetchNext();
    }
  };

  prefetchNext();
}

/**
 * Prefetch routes based on user role
 */
export function prefetchRoleRoutes(role: 'client' | 'owner'): void {
  const routes = role === 'client'
    ? ['/client/dashboard', '/client/profile', '/messages', '/notifications']
    : ['/owner/dashboard', '/owner/profile', '/owner/properties', '/messages'];

  routes.forEach(prefetchRoute);
}

/**
 * Create hover prefetch handler for links
 */
export function createHoverPrefetch(path: string): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    onMouseEnter: () => {
      // Debounce to avoid prefetching on quick mouse movements
      timeoutId = setTimeout(() => prefetchRoute(path), 50);
    },
    onFocus: () => {
      prefetchRoute(path);
    },
  };
}

/**
 * Prefetch critical routes on app load
 */
export function prefetchCriticalRoutes(): void {
  // Use idle callback to not block initial render
  const doPrefetch = () => {
    // Prefetch messaging first (most common navigation)
    prefetchRoute('/messages');

    // Then notifications
    setTimeout(() => prefetchRoute('/notifications'), 200);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(doPrefetch, { timeout: 5000 });
  } else {
    setTimeout(doPrefetch, 2000);
  }
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
      rootMargin: '100px', // Prefetch when link is 100px from viewport
      threshold: 0,
    }
  );
}

/**
 * Prefetch next likely route based on current location
 */
export function prefetchNextLikelyRoute(currentPath: string): void {
  const nextRouteMap: Record<string, string[]> = {
    '/client/dashboard': ['/messages', '/client/liked-properties'],
    '/owner/dashboard': ['/messages', '/owner/properties', '/owner/liked-clients'],
    '/owner/properties': ['/owner/listings/new'],
    '/': ['/client/dashboard', '/owner/dashboard'],
  };

  const nextRoutes = nextRouteMap[currentPath];
  if (nextRoutes) {
    nextRoutes.forEach((route, index) => {
      setTimeout(() => prefetchRoute(route), index * 100);
    });
  }
}
