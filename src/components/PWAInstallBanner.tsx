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
      title: 'Swipes',
      text: 'Check out Swipes - Find your perfect match for properties, vehicles & more!',
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
          className="fixed bottom-6 inset-x-0 z-[9999] flex justify-center px-4"
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
                <h3 className="font-semibold text-white text-sm">Install <span className="swipess-text">Swipes</span></h3>
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
                className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 shadow-lg shadow-orange-500/30 border border-orange-500/30 backdrop-blur-xl hover:shadow-xl hover:shadow-orange-500/50 hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
              >
                {/* Flame App Icon */}
                <div className="relative w-10 h-10 rounded-xl bg-gradient-radial from-[#1a0a00] via-[#0d0502] to-black overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Animated flame SVG */}
                  <motion.svg
                    viewBox="0 0 64 64"
                    className="w-8 h-8"
                    animate={{ scale: [1, 1.08, 1], y: [0, -1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <defs>
                      <linearGradient id="bannerOuterFlame" x1="32" y1="58" x2="32" y2="6" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#7f1d1d"/>
                        <stop offset="30%" stopColor="#b91c1c"/>
                        <stop offset="60%" stopColor="#dc2626"/>
                        <stop offset="100%" stopColor="#ef4444"/>
                      </linearGradient>
                      <linearGradient id="bannerMidFlame" x1="32" y1="54" x2="32" y2="12" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#c2410c"/>
                        <stop offset="35%" stopColor="#ea580c"/>
                        <stop offset="70%" stopColor="#f97316"/>
                        <stop offset="100%" stopColor="#fb923c"/>
                      </linearGradient>
                      <linearGradient id="bannerInnerFlame" x1="32" y1="48" x2="32" y2="18" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#d97706"/>
                        <stop offset="40%" stopColor="#f59e0b"/>
                        <stop offset="70%" stopColor="#fbbf24"/>
                        <stop offset="100%" stopColor="#fde047"/>
                      </linearGradient>
                      <linearGradient id="bannerCoreFlame" x1="32" y1="44" x2="32" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fcd34d"/>
                        <stop offset="50%" stopColor="#fef3c7"/>
                        <stop offset="100%" stopColor="#fffbeb"/>
                      </linearGradient>
                      <filter id="bannerGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Outer flame */}
                    <path
                      filter="url(#bannerGlow)"
                      d="M32 5C28 12, 20 22, 17 30C14 38, 13 44, 16 51C19 57, 26 60, 32 60C38 60, 45 57, 48 51C51 44, 50 38, 47 30C44 22, 36 12, 32 5Z M24 14C22 18, 19 24, 21 27C23 30, 26 28, 27 24C28 20, 26 16, 24 14Z M40 14C42 18, 45 24, 43 27C41 30, 38 28, 37 24C36 20, 38 16, 40 14Z"
                      fill="url(#bannerOuterFlame)"
                    />
                    {/* Mid flame */}
                    <path
                      d="M32 10C29 16, 24 24, 22 32C20 40, 20 46, 24 52C27 56, 32 58, 37 56C44 52, 44 40, 42 32C40 24, 35 16, 32 10Z"
                      fill="url(#bannerMidFlame)"
                    />
                    {/* Inner flame */}
                    <path
                      d="M32 16C30 22, 26 30, 25 38C24 44, 26 50, 32 52C38 50, 40 44, 39 38C38 30, 34 22, 32 16Z"
                      fill="url(#bannerInnerFlame)"
                    />
                    {/* Core flame */}
                    <path
                      d="M32 24C30 30, 28 36, 28 42C28 46, 30 49, 32 50C34 49, 36 46, 36 42C36 36, 34 30, 32 24Z"
                      fill="url(#bannerCoreFlame)"
                    />
                    {/* White hot center */}
                    <ellipse cx="32" cy="40" rx="2.5" ry="8" fill="#fffbeb" opacity="0.95"/>
                    <ellipse cx="32" cy="38" rx="1.5" ry="5" fill="#ffffff"/>
                    {/* Ember particles */}
                    <circle cx="26" cy="20" r="1" fill="#fbbf24"/>
                    <circle cx="38" cy="18" r="0.8" fill="#f97316"/>
                    <circle cx="22" cy="30" r="0.9" fill="#fcd34d"/>
                    <circle cx="42" cy="28" r="0.7" fill="#fb923c"/>
                  </motion.svg>
                  {/* Ambient glow effect */}
                  <div className="absolute inset-0 bg-gradient-radial from-orange-500/30 via-orange-600/10 to-transparent pointer-events-none" />
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
