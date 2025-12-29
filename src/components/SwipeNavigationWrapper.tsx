import React, { ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeNavigation, PageRoute } from '@/hooks/useSwipeNavigation';
import { cn } from '@/lib/utils';

interface SwipeNavigationWrapperProps {
  children: ReactNode;
  routes: PageRoute[];
  enabled?: boolean;
  showIndicators?: boolean;
  className?: string;
}

/**
 * Wrapper component that adds swipe navigation to any page content
 *
 * @example
 * <SwipeNavigationWrapper routes={settingsRoutes}>
 *   <YourPageContent />
 * </SwipeNavigationWrapper>
 */
export const SwipeNavigationWrapper: React.FC<SwipeNavigationWrapperProps> = ({
  children,
  routes,
  enabled = true,
  showIndicators = true,
  className,
}) => {
  const {
    dragProps,
    canSwipeLeft,
    canSwipeRight,
    previousRoute,
    nextRoute,
    x,
  } = useSwipeNavigation({ routes, enabled });

  // Transform opacity based on drag distance
  const leftIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);
  const rightIndicatorOpacity = useTransform(x, [0, -100], [0, 1]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Left swipe indicator */}
      {showIndicators && canSwipeLeft && previousRoute && (
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{previousRoute.label || 'Previous'}</span>
          </div>
        </motion.div>
      )}

      {/* Right swipe indicator */}
      {showIndicators && canSwipeRight && nextRoute && (
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <span className="text-sm font-medium">{nextRoute.label || 'Next'}</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </motion.div>
      )}

      {/* Page content with drag handlers - allow vertical scrolling */}
      <motion.div
        {...dragProps}
        className="w-full h-full overflow-y-auto overflow-x-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
};
