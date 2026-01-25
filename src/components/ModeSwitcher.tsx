import { memo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, ArrowLeftRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveMode, ActiveMode } from '@/hooks/useActiveMode';
import { triggerHaptic } from '@/utils/haptics';

interface ModeSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'toggle' | 'pill' | 'icon';
}

/**
 * ModeSwitcher - Premium mode toggle for switching between "Client" and "Owner" modes
 *
 * Features:
 * - Instant visual feedback with optimistic updates
 * - Smooth animations without layout thrashing
 * - Haptic feedback on mobile
 * - GPU-accelerated transforms only
 * - Micro-animations on mode switch (scale/rotate)
 */
function ModeSwitcherComponent({ className, size = 'sm', variant = 'pill' }: ModeSwitcherProps) {
  const { activeMode, isSwitching, switchMode, canSwitchMode } = useActiveMode();
  const lastClickTime = useRef(0);

  // Debounce rapid clicks (prevent accidental double-taps)
  const handleModeSwitch = useCallback(async (newMode: ActiveMode) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return; // 300ms debounce
    lastClickTime.current = now;

    if (isSwitching || newMode === activeMode || !canSwitchMode) return;
    triggerHaptic('medium');
    await switchMode(newMode);
  }, [isSwitching, activeMode, canSwitchMode, switchMode]);

  const handleToggle = useCallback((event: React.MouseEvent) => {
    // Prevent event propagation to avoid accidental triggers
    event.stopPropagation();
    event.preventDefault();

    const newMode = activeMode === 'client' ? 'owner' : 'client';
    handleModeSwitch(newMode);
  }, [activeMode, handleModeSwitch]);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  // Icon-only variant - minimal footprint
  if (variant === 'icon') {
    return (
      <motion.button
        onClick={(e) => handleToggle(e)}
        disabled={isSwitching || !canSwitchMode}
        className={cn(
          'relative flex items-center justify-center rounded-xl transition-all duration-200',
          'hover:bg-white/10 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-9 w-9' : 'h-10 w-10',
          className
        )}
        whileTap={{ scale: 0.92 }}
        aria-label={`Switch to ${activeMode === 'client' ? 'Owner' : 'Client'} mode`}
      >
        <AnimatePresence mode="wait">
          {isSwitching ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {activeMode === 'client' ? (
                <Search className="h-4 w-4 text-primary" />
              ) : (
                <Briefcase className="h-4 w-4 text-emerald-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Toggle variant - iOS-style switch
  if (variant === 'toggle') {
    return (
      <motion.button
        onClick={(e) => handleToggle(e)}
        disabled={isSwitching || !canSwitchMode}
        className={cn(
          'relative flex items-center gap-2 rounded-full px-3 py-1.5',
          'bg-white/5',
          'hover:bg-white/10 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        whileTap={{ scale: 0.97 }}
        aria-label={`Switch to ${activeMode === 'client' ? 'Owner' : 'Client'} mode`}
      >
        {/* Sliding indicator */}
        <motion.div
          className="absolute inset-y-1 rounded-full bg-gradient-to-r from-primary/30 to-primary/20"
          initial={false}
          animate={{
            left: activeMode === 'client' ? '4px' : '50%',
            right: activeMode === 'client' ? '50%' : '4px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ willChange: 'left, right' }}
        />

        {/* Client option - BRIGHTER text */}
        <div className={cn(
          'relative z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors duration-200',
          activeMode === 'client' ? 'text-white drop-shadow-sm' : 'text-white/60'
        )}>
          <Search className="h-3.5 w-3.5" />
          <span className="font-medium">Client</span>
        </div>

        {/* Owner option - BRIGHTER text */}
        <div className={cn(
          'relative z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors duration-200',
          activeMode === 'owner' ? 'text-emerald-400 drop-shadow-sm' : 'text-white/60'
        )}>
          <Briefcase className="h-3.5 w-3.5" />
          <span className="font-medium">Owner</span>
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isSwitching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Pill variant (default) - Compact with mode indicator + micro-animations
  return (
    <motion.button
      onClick={(e) => handleToggle(e)}
      disabled={isSwitching || !canSwitchMode}
      className={cn(
        'relative flex items-center gap-1.5 rounded-xl px-2.5',
        'bg-white/5',
        'hover:bg-white/10',
        'active:scale-[0.97] transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
      aria-label={`Switch to ${activeMode === 'client' ? 'Owner' : 'Client'} mode`}
    >
      {/* Mode icon with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex items-center gap-1.5"
        >
          {isSwitching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : activeMode === 'client' ? (
            <>
              <Search className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-primary">Client</span>
            </>
          ) : (
            <>
              <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-semibold text-emerald-500">Owner</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Switch icon */}
      <ArrowLeftRight className="h-3 w-3 text-muted-foreground opacity-60" />
    </motion.button>
  );
}

// Memoize with shallow props comparison for better performance
export const ModeSwitcher = memo(ModeSwitcherComponent, (prevProps, nextProps) => {
  return (
    prevProps.className === nextProps.className &&
    prevProps.size === nextProps.size &&
    prevProps.variant === nextProps.variant
  );
});

// Compact version for tight spaces
export const ModeSwitcherCompact = memo(function ModeSwitcherCompact({ className }: { className?: string }) {
  return <ModeSwitcher variant="icon" size="sm" className={className} />;
});

// Full toggle version
export const ModeSwitcherToggle = memo(function ModeSwitcherToggle({ className }: { className?: string }) {
  return <ModeSwitcher variant="toggle" size="sm" className={className} />;
});
