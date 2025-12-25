import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { SkipToMainContent, useFocusManagement } from './AccessibilityHelpers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useErrorReporting } from '@/hooks/useErrorReporting';
import { useViewTransitions } from '@/hooks/useViewTransitions';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { springConfigs } from '@/utils/springConfigs';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Route depth mapping for smart navigation transitions
const routeDepthMap: Record<string, number> = {
  '/': 0,
  '/client/dashboard': 1,
  '/owner/dashboard': 1,
  '/messages': 2,
  '/radio': 2,
  '/notifications': 2,
  '/client/profile': 2,
  '/owner/profile': 2,
  '/client/liked-properties': 2,
  '/owner/liked-clients': 2,
  '/owner/properties': 2,
  '/client/settings': 3,
  '/owner/settings': 3,
  '/client/security': 3,
  '/owner/security': 3,
  '/client/saved-searches': 3,
  '/owner/saved-searches': 3,
  '/subscription-packages': 3,
  '/client/contracts': 3,
  '/owner/contracts': 3,
  '/client/camera': 3,
  '/owner/camera': 3,
  '/owner/camera/listing': 4,
  '/client/services': 2,
  '/owner/clients/property': 2,
  '/owner/clients/moto': 2,
  '/owner/clients/bicycle': 2,
  '/owner/clients/yacht': 2,
  '/owner/clients/vehicle': 2,
  '/owner/filters-explore': 3,
  '/owner/listings/new': 3,
};

function getRouteDepth(path: string): number {
  // Check exact match first
  if (routeDepthMap[path] !== undefined) {
    return routeDepthMap[path];
  }

  // Handle dynamic routes (e.g., /owner/view-client/:id, /profile/:id)
  if (path.startsWith('/owner/view-client/')) return 3;
  if (path.startsWith('/profile/')) return 1;
  if (path.startsWith('/listing/')) return 1;
  if (path.startsWith('/payment/')) return 2;

  // Default depth based on path segments
  return Math.min(path.split('/').filter(Boolean).length, 3);
}

function getTransitionVariant(fromPath: string, toPath: string) {
  const fromDepth = getRouteDepth(fromPath);
  const toDepth = getRouteDepth(toPath);

  // Going deeper (forward navigation) - slide from right
  if (toDepth > fromDepth) {
    return {
      initial: { opacity: 0, x: 100, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -50, scale: 0.98 },
    };
  }

  // Going back (backward navigation) - slide from left
  if (toDepth < fromDepth) {
    return {
      initial: { opacity: 0, x: -100, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 50, scale: 0.98 },
    };
  }

  // Same level navigation - elegant fade with scale
  return {
    initial: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(2px)' },
  };
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState(location.pathname);

  // Initialize app features
  useKeyboardShortcuts();
  useFocusManagement();
  useOfflineDetection();
  useErrorReporting();

  // Enable View Transitions API
  useViewTransitions();

  // Enable swipe back gesture
  const { x: swipeX, opacity: swipeOpacity } = useSwipeBack({
    enabled: true,
    edgeWidth: 50,
    threshold: 100,
  });

  // Get dynamic transition variant based on navigation direction
  const transitionVariant = useMemo(
    () => getTransitionVariant(prevLocation, location.pathname),
    [prevLocation, location.pathname]
  );

  // Update previous location after transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevLocation(location.pathname);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-background">
      <SkipToMainContent />
      <main id="main-content" tabIndex={-1} className="outline-none w-full min-h-screen">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={transitionVariant.initial}
            animate={transitionVariant.animate}
            exit={transitionVariant.exit}
            transition={springConfigs.ultraSmooth}
            className="w-full min-h-screen overflow-x-hidden"
            style={{
              x: swipeX,
              opacity: swipeOpacity,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
