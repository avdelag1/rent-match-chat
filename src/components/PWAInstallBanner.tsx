import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

    if (standalone) return;

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

    // For iOS, show banner after a short delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Chrome, listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

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
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  // Don't render if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/95 via-background/98 to-background/95 p-4 shadow-2xl backdrop-blur-xl">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-red-500" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            {showIOSInstructions ? (
              // iOS Instructions
              <div className="pr-6">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Install SWIPESS</h3>
                    <p className="text-xs text-muted-foreground">Add to Home Screen</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                      <Share className="h-4 w-4 text-blue-400" />
                    </div>
                    <span>Tap the <strong className="text-foreground">Share</strong> button</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                      <Plus className="h-4 w-4 text-orange-400" />
                    </div>
                    <span>Select <strong className="text-foreground">"Add to Home Screen"</strong></span>
                  </div>
                </div>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-muted-foreground hover:text-foreground"
                >
                  Got it
                </Button>
              </div>
            ) : (
              // Main banner content
              <div className="flex items-start gap-3 pr-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
                  <Download className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="mb-0.5 font-semibold text-foreground">
                    Get the SWIPESS App
                  </h3>
                  <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                    Install for faster access, offline support & a better experience
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstall}
                      size="sm"
                      className="h-8 bg-gradient-to-r from-orange-500 to-red-500 px-4 text-xs font-medium text-white hover:from-orange-600 hover:to-red-600"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Install
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Not now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
