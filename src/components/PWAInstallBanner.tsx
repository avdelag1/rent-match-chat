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
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
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
    // If we have a native install prompt (Chrome/Android), use it
    if (deferredPrompt) {
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
      return;
    }

    // Otherwise show manual install instructions
    setShowInstallInstructions(true);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowInstallInstructions(false);
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-md"
        >
          {showInstallInstructions ? (
            // Install Instructions Card - works for iOS, Android, tablets
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 p-4 shadow-2xl backdrop-blur-xl max-w-xs">
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
                  {isIOS ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Share className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                        <span>Tap <strong className="text-white">Share</strong> button below</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plus className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                        <span>Select <strong className="text-white">"Add to Home Screen"</strong></span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">⋮</span>
                        <span>Tap browser menu <strong className="text-white">(3 dots)</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plus className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                        <span>Select <strong className="text-white">"Add to Home Screen"</strong> or <strong className="text-white">"Install App"</strong></span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setShowInstallInstructions(false)}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Main banner - Compact pill with flame icon and share
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 shadow-lg shadow-orange-500/30 border border-orange-500/30 backdrop-blur-xl hover:shadow-xl hover:shadow-orange-500/50 hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
              >
                {/* Minimalistic Flame App Icon */}
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 overflow-hidden flex items-center justify-center shadow-lg">
                  {/* Simple animated flame SVG */}
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <defs>
                      <linearGradient id="flameGrad" x1="12" y1="20" x2="12" y2="3" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fbbf24"/>
                        <stop offset="50%" stopColor="#f59e0b"/>
                        <stop offset="100%" stopColor="#fef3c7"/>
                      </linearGradient>
                    </defs>
                    {/* Single smooth flame shape */}
                    <path
                      d="M12 3C11 5 8 8 7 11C6 14 7 17 9 18.5C10 19.5 11 20 12 20C13 20 14 19.5 15 18.5C17 17 18 14 17 11C16 8 13 5 12 3Z"
                      fill="url(#flameGrad)"
                      className="drop-shadow-lg"
                    />
                    {/* Bright center */}
                    <ellipse cx="12" cy="14" rx="1.5" ry="3" fill="#fef3c7" opacity="0.9"/>
                  </motion.svg>
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
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-gray-900/95 to-gray-800/95 shadow-lg border border-white/20 backdrop-blur-xl hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
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
