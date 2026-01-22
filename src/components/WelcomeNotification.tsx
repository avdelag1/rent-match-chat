import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper } from 'lucide-react';

interface WelcomeNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Simple welcome banner notification that appears at the top of the screen.
 * Replaces the confetti modal with a clean, standard notification style.
 */
export function WelcomeNotification({ isOpen, onClose }: WelcomeNotificationProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
          <div className="pointer-events-auto max-w-md w-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 rounded-xl shadow-2xl shadow-primary/30 border border-white/20 overflow-hidden">
            {/* Banner Content */}
            <div className="relative p-4 sm:p-5">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-3 top-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/90 hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Close welcome notification"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <PartyPopper className="w-6 h-6 text-white" />
                </div>

                {/* Text Content */}
                <div className="space-y-1">
                  <h3 className="text-white font-bold text-lg leading-tight">
                    Welcome to Swipess! 🎉
                  </h3>
                  <p className="text-white/90 text-sm">
                    Your journey to finding the perfect match starts now!
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar animation for auto-dismiss hint */}
            <motion.div
              className="h-1 bg-white/30"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              onAnimationComplete={handleClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WelcomeNotification;