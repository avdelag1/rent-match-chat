import React, { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Default loading fallback component for lazy-loaded modules
 */
export const LazyLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
    <div className="space-y-4 text-center">
      <div className="text-white text-2xl font-bold mb-4">TindeRent</div>
      <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
      <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
      <p className="text-white/60 text-sm mt-4">Loading...</p>
    </div>
  </div>
);

/**
 * Compact loading fallback for smaller components
 */
export const CompactLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="space-y-2 text-center">
      <Skeleton className="h-6 w-32 mx-auto bg-gray-200 dark:bg-white/10" />
      <Skeleton className="h-4 w-24 mx-auto bg-gray-200 dark:bg-white/10" />
    </div>
  </div>
);

/**
 * Props for the LazyLoad wrapper component
 */
interface LazyLoadProps<T extends ComponentType<object>> {
  component: React.LazyExoticComponent<T>;
  fallback?: React.ReactNode;
}

/**
 * Utility component for wrapping lazy-loaded components with consistent
 * loading states and error boundaries.
 * 
 * Usage:
 * ```tsx
 * const MyLazyComponent = lazy(() => import('./MyComponent'));
 * 
 * <LazyLoad component={MyLazyComponent} />
 * ```
 */
export function LazyLoad<T extends ComponentType<object>>({ 
  component: Component, 
  fallback = <LazyLoadingFallback />
}: LazyLoadProps<T>) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}

/**
 * Helper function to create a lazy component with webpackChunkName hint
 * Note: Vite uses rollup internally, but chunk names can still be influenced
 * via the dynamic import comment syntax for debugging purposes.
 * 
 * Usage:
 * ```tsx
 * const Maps = createLazyComponent(() => import('./Maps'), 'maps');
 * const Analytics = createLazyComponent(() => import('./Analytics'), 'analytics');
 * ```
 */
export function createLazyComponent<T extends ComponentType<object>>(
  importFn: () => Promise<{ default: T }>,
  _chunkName?: string
): React.LazyExoticComponent<T> {
  // The chunkName parameter is for documentation purposes
  // Vite handles chunk naming through vite.config.ts manualChunks
  return React.lazy(importFn);
}

/**
 * Candidate modules for code splitting (for reference):
 * 
 * Heavy/Secondary modules that are good candidates for lazy loading:
 * - Maps: Google Maps integration (large external dependency)
 * - Profile/Settings: User profile and settings pages
 * - Premium/Upsell: Subscription packages and payment flows
 * - Analytics: Recharts and analytics components
 * - Contracts: Contract signing and digital signature components
 * - Messaging: Full messaging dashboard
 * 
 * These are already lazy-loaded in App.tsx. Additional candidates:
 * - RentalAnalytics (uses recharts)
 * - ContractSigningDialog (uses digital signature pad)
 * - SubscriptionPackages (premium features)
 */

export default LazyLoad;
