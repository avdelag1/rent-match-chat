import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { SkipToMainContent, useFocusManagement } from './AccessibilityHelpers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useErrorReporting } from '@/hooks/useErrorReporting';
import { useViewTransitions } from '@/hooks/useViewTransitions';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { useResponsiveContext } from '@/contexts/ResponsiveContext';
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

/**
 * iOS-style navigation transitions
 * - Forward: New page slides in from right, current fades out slightly
 * - Back: Current page slides out to right, previous fades in from left
 * - Same level: Cross-fade
 */
function getTransitionVariant(fromPath: string, toPath: string) {
  const fromDepth = getRouteDepth(fromPath);
  const toDepth = getRouteDepth(toPath);

  // iOS-style slide amount (subtle to avoid layout shift feel)
  const slideAmount = 30; // 30px slide - enough to feel directional

  if (toDepth > fromDepth) {
    // Going deeper (forward navigation) - iOS push style
    return {
      initial: { opacity: 0, x: slideAmount },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -slideAmount / 2 },
    };
  }

  if (toDepth < fromDepth) {
    // Going back (backward navigation) - iOS pop style
    return {
      initial: { opacity: 0, x: -slideAmount / 2 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: slideAmount },
    };
  }

  // Same level navigation - simple cross-fade
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get responsive state for adaptive behavior
  const responsive = useResponsiveContext();

  // Initialize app features
  useKeyboardShortcuts();
  useFocusManagement();
  useOfflineDetection();
  useErrorReporting();

  // Enable View Transitions API
  useViewTransitions();

  // Enable swipe back gesture - adjust edge width based on screen size
  // Note: We only use swipeOpacity to prevent horizontal page shifts
  // swipeX was removed as it caused the page to move left/right unexpectedly
  const { opacity: swipeOpacity } = useSwipeBack({
    enabled: responsive.isTouchDevice,
    edgeWidth: responsive.isMobile ? 30 : 50,
    threshold: responsive.isMobile ? 80 : 100,
  });

  // Get dynamic transition variant based on navigation direction
  // Use ref to get prev location synchronously before it updates
  const transitionVariant = useMemo(() => {
    const variant = getTransitionVariant(prevLocationRef.current, location.pathname);
    return variant;
  }, [location.pathname]);

  // Update previous location synchronously using useLayoutEffect
  // This ensures the ref is updated before the next render calculation
  useLayoutEffect(() => {
    // Mark as transitioning to prevent glitches
    setIsTransitioning(true);

    // Update ref immediately for next calculation
    prevLocationRef.current = location.pathname;

    // End transition quickly - match animation duration (120ms mobile, 150ms desktop)
    // Using RAF ensures smooth frame timing
    const timer = requestAnimationFrame(() => {
      setTimeout(() => setIsTransitioning(false), responsive.isMobile ? 120 : 150);
    });

    return () => cancelAnimationFrame(timer);
  }, [location.pathname, responsive.isMobile]);

  // Combine swipe opacity with transition - only apply swipe during active swipe
  // This prevents flash when swipe completes and page transitions
  const combinedOpacity = isTransitioning ? 1 : swipeOpacity;

  // iOS-style spring timing for natural feel
  const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 0.8,
  };

  // Faster timing for quick navigations
  const fastTransition = {
    duration: responsive.isMobile ? 0.15 : 0.18,
    ease: [0.32, 0.72, 0, 1], // iOS-like snappy easing
  };

  return (
    <div className="min-h-screen min-h-dvh w-full bg-background overflow-x-hidden">
      <SkipToMainContent />
      <main
        id="main-content"
        tabIndex={-1}
        className="outline-none w-full min-h-screen min-h-dvh overflow-x-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={transitionVariant.initial}
            animate={transitionVariant.animate}
            exit={transitionVariant.exit}
            transition={fastTransition}
            className="w-full min-h-screen min-h-dvh overflow-x-hidden"
            style={{
              opacity: combinedOpacity,
              willChange: 'opacity, transform',
              transformOrigin: 'center center',
              // GPU acceleration for smooth slide
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            layout={false}
            onAnimationComplete={() => {
              // Ensure transform is reset after animation completes
              if (isTransitioning) {
                setIsTransitioning(false);
              }
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
