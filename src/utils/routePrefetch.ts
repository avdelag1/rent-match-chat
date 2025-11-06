/**
 * Utility to prefetch lazy-loaded routes for better performance
 * This preloads commonly accessed pages in the background
 */

// Define prefetch functions for commonly accessed pages
export const prefetchClientRoutes = () => {
  // Prefetch commonly accessed client pages
  import("../pages/ClientSettings");
  import("../pages/ClientProfile");
  import("../pages/ClientSecurity");
  import("../pages/ClientLikedProperties");
  import("../pages/MessagingDashboard");
};

export const prefetchOwnerRoutes = () => {
  // Prefetch commonly accessed owner pages
  import("../pages/OwnerSettings");
  import("../pages/OwnerProfile");
  import("../pages/OwnerSecurity");
  import("../pages/OwnerProperties");
  import("../pages/MessagingDashboard");
};

/**
 * Prefetch routes on mouse hover or focus
 * This provides instant navigation when user clicks
 */
export const prefetchOnHover = (routeName: string) => {
  const routes: Record<string, () => Promise<any>> = {
    'client-settings': () => import("../pages/ClientSettings"),
    'client-security': () => import("../pages/ClientSecurity"),
    'owner-settings': () => import("../pages/OwnerSettings"),
    'owner-security': () => import("../pages/OwnerSecurity"),
    'messaging': () => import("../pages/MessagingDashboard"),
  };

  const prefetchFn = routes[routeName];
  if (prefetchFn) {
    prefetchFn();
  }
};
