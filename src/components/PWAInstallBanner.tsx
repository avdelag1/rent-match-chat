import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Always show banner after a delay on main page
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2000);

    // For Android/Chrome, listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'SWIPESS',
      text: 'Check out SWIPESS - Find your perfect match for properties, vehicles & more!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      // User cancelled or error
      console.log('Share cancelled or failed:', error);
    }
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // No install prompt available, just share instead
      handleShare();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  }, [deferredPrompt, isIOS, handleShare]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]"
        >
          {showIOSInstructions ? (
            // iOS Instructions - Compact Card
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 p-4 shadow-2xl backdrop-blur-xl">
              <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-6 space-y-3">
                <h3 className="font-semibold text-white text-sm">Install SWIPESS</h3>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <Share className="h-3.5 w-3.5 text-blue-400" />
                    <span>Tap <strong className="text-white">Share</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 text-orange-400" />
                    <span>Select <strong className="text-white">"Add to Home Screen"</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors"
                  >
                    Got it
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Main banner - Compact pill with flame icon and share
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 shadow-lg shadow-orange-500/30 border border-orange-500/30 backdrop-blur-xl hover:shadow-xl hover:shadow-orange-500/50 hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
              >
                {/* Flame App Icon */}
                <div className="relative w-9 h-9 rounded-xl bg-black overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Animated flame SVG */}
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <defs>
                      <linearGradient id="flameGrad" x1="12" y1="22" x2="12" y2="2" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="40%" stopColor="#ea580c" />
                        <stop offset="70%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>
                      <linearGradient id="innerFlameGrad" x1="12" y1="18" x2="12" y2="8" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#fde047" />
                      </linearGradient>
                    </defs>
                    {/* Main flame */}
                    <path
                      d="M12 2C12 2 6 9 6 14C6 17.866 8.686 21 12 21C15.314 21 18 17.866 18 14C18 9 12 2 12 2Z"
                      fill="url(#flameGrad)"
                    />
                    {/* Inner flame */}
                    <path
                      d="M12 8C12 8 9 12 9 14.5C9 16.433 10.343 18 12 18C13.657 18 15 16.433 15 14.5C15 12 12 8 12 8Z"
                      fill="url(#innerFlameGrad)"
                    />
                  </motion.svg>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent pointer-events-none" />
                </div>

                {/* Text */}
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  {isStandalone ? 'Share App' : 'Download App'}
                </span>

                {/* Close button */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="ml-1 rounded-full p-1 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Separate Share button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-900/95 to-gray-800/95 shadow-lg border border-white/20 backdrop-blur-xl hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
                aria-label="Share app"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
