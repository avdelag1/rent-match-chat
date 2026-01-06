import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, Share2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/prodLogger';

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
  const location = useLocation();

  // Hide banner on landing page
  const isLandingPage = location.pathname === '/';

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
      title: 'Swipess',
      text: 'Check out Swipess - Find your perfect match for properties, vehicles & more!',
      url: import.meta.env.VITE_APP_URL || 'https://swipess.com',
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
      // User cancelled or error - silently ignore
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
        if (import.meta.env.DEV) logger.error('Install prompt error:', error);
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

  // Don't show on landing page
  if (isLandingPage) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none"
        >
          {showInstallInstructions ? (
            // Install Instructions Card - works for iOS, Android, tablets
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 p-4 shadow-2xl backdrop-blur-xl max-w-xs pointer-events-auto">
              <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-6 space-y-3">
                <h3 className="font-semibold text-white text-sm">Install <span className="swipess-text">Swipess</span></h3>
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
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleInstall}
                className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 shadow-lg shadow-orange-500/30 border border-orange-500/30 backdrop-blur-xl hover:shadow-xl hover:shadow-orange-500/50 hover:border-orange-500/50 hover:scale-105 transition-all duration-300"
              >
                {/* S Logo App Icon */}
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
                  {/* App icon with S logo */}
                  <motion.svg
                    viewBox="0 0 64 64"
                    className="w-full h-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <defs>
                      <linearGradient id="bannerBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF1493"/>
                        <stop offset="30%" stopColor="#FF6B6B"/>
                        <stop offset="50%" stopColor="#FF8E53"/>
                        <stop offset="70%" stopColor="#FF6B9D"/>
                        <stop offset="100%" stopColor="#E040FB"/>
                      </linearGradient>
                      <linearGradient id="bannerSGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700"/>
                        <stop offset="20%" stopColor="#FFC947"/>
                        <stop offset="40%" stopColor="#FF8E53"/>
                        <stop offset="60%" stopColor="#FF6B9D"/>
                        <stop offset="80%" stopColor="#9C7CF4"/>
                        <stop offset="100%" stopColor="#7B68EE"/>
                      </linearGradient>
                      <filter id="bannerShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    {/* Background */}
                    <rect width="64" height="64" rx="14" fill="url(#bannerBgGradient)"/>
                    {/* S letter */}
                    <g filter="url(#bannerShadow)">
                      <path
                        d="M42 18
                           C42 18, 38 14, 30 14
                           C22 14, 16 18, 16 24
                           C16 30, 20 33, 27 35
                           L36 38
                           C42 40, 47 44, 47 50
                           C47 57, 40 61, 32 61
                           C24 61, 18 57, 14 52

                           L14 52
                           C18 59, 25 64, 33 64
                           C44 64, 52 58, 52 49
                           C52 42, 46 38, 38 35
                           L29 32
                           C23 30, 20 27, 20 23
                           C20 19, 24 16, 30 16
                           C37 16, 42 19, 44 22"
                        fill="none"
                        stroke="url(#bannerSGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        transform="translate(2, -5)"
                      />
                    </g>
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
