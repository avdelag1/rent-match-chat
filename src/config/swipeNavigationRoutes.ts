import { PageRoute } from '@/hooks/useSwipeNavigation';

/**
 * Configuration for swipeable page groups
 * Each group defines pages that can be navigated between using horizontal swipes
 */

// ==================== CLIENT ROUTES ====================

/**
 * Client main navigation group
 * Dashboard -> Liked Properties -> Profile -> Services
 */
export const clientMainRoutes: PageRoute[] = [
  { path: '/client/dashboard', label: 'Browse' },
  { path: '/client/liked-properties', label: 'Liked' },
  { path: '/client/profile', label: 'Profile' },
  { path: '/client/services', label: 'Services' },
];

/**
 * Client settings group
 * Settings -> Security -> Notifications -> Saved Searches -> Contracts
 */
export const clientSettingsRoutes: PageRoute[] = [
  { path: '/client/settings', label: 'Settings' },
  { path: '/client/security', label: 'Security' },
  { path: '/notifications', label: 'Notifications' },
  { path: '/client/saved-searches', label: 'Saved Searches' },
  { path: '/client/contracts', label: 'Contracts' },
];

// ==================== OWNER ROUTES ====================

/**
 * Owner main navigation group
 * Dashboard -> Liked Clients -> Profile -> Properties
 */
export const ownerMainRoutes: PageRoute[] = [
  { path: '/owner/dashboard', label: 'Browse' },
  { path: '/owner/liked-clients', label: 'Liked' },
  { path: '/owner/profile', label: 'Profile' },
  { path: '/owner/properties', label: 'Properties' },
];

/**
 * Owner settings group
 * Settings -> Security -> Notifications -> Saved Searches -> Contracts
 */
export const ownerSettingsRoutes: PageRoute[] = [
  { path: '/owner/settings', label: 'Settings' },
  { path: '/owner/security', label: 'Security' },
  { path: '/notifications', label: 'Notifications' },
  { path: '/owner/saved-searches', label: 'Saved Searches' },
  { path: '/owner/contracts', label: 'Contracts' },
];

/**
 * Owner client discovery group
 * Different types of client discovery pages
 */
export const ownerClientDiscoveryRoutes: PageRoute[] = [
  { path: '/owner/clients/property', label: 'Property' },
  { path: '/owner/clients/vehicle', label: 'Vehicle' },
  { path: '/owner/clients/moto', label: 'Motorcycle' },
  { path: '/owner/clients/bicycle', label: 'Bicycle' },
  { path: '/owner/clients/yacht', label: 'Yacht' },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get swipe routes based on current path and user role
 */
export const getSwipeRoutesForPath = (
  pathname: string,
  userRole: 'client' | 'owner' | null
): PageRoute[] | null => {
  if (!userRole) return null;

  // Client routes
  if (userRole === 'client') {
    // Settings group
    if (
      pathname === '/client/settings' ||
      pathname === '/client/security' ||
      pathname === '/notifications' ||
      pathname === '/client/saved-searches' ||
      pathname === '/client/contracts'
    ) {
      return clientSettingsRoutes;
    }

    // Main navigation group
    if (
      pathname === '/client/dashboard' ||
      pathname === '/client/liked-properties' ||
      pathname === '/client/profile' ||
      pathname === '/client/services'
    ) {
      return clientMainRoutes;
    }
  }

  // Owner routes
  if (userRole === 'owner') {
    // Settings group
    if (
      pathname === '/owner/settings' ||
      pathname === '/owner/security' ||
      pathname === '/notifications' ||
      pathname === '/owner/saved-searches' ||
      pathname === '/owner/contracts'
    ) {
      return ownerSettingsRoutes;
    }

    // Main navigation group
    if (
      pathname === '/owner/dashboard' ||
      pathname === '/owner/liked-clients' ||
      pathname === '/owner/profile' ||
      pathname === '/owner/properties'
    ) {
      return ownerMainRoutes;
    }

    // Client discovery group
    if (pathname.startsWith('/owner/clients/')) {
      return ownerClientDiscoveryRoutes;
    }
  }

  return null;
};

/**
 * Check if a path supports swipe navigation
 */
export const isSwipeablePath = (
  pathname: string,
  userRole: 'client' | 'owner' | null
): boolean => {
  return getSwipeRoutesForPath(pathname, userRole) !== null;
};
