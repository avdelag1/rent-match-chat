import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showMiniBadge, setShowMiniBadge] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if app is already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) return;
      
      // Show full prompt initially, then mini badge
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      if (!hasSeenPrompt) {
        setTimeout(() => setShowFullPrompt(true), 3000);
      } else {
        // Always show mini badge for easy access
        setTimeout(() => setShowMiniBadge(true), 1000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
      setShowMiniBadge(false);
    }
    
    setDeferredPrompt(null);
    setShowFullPrompt(false);
  };

  const handleDismiss = () => {
    setShowFullPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    // Show mini badge after dismissing full prompt
    setTimeout(() => setShowMiniBadge(true), 500);
  };

  const handleMiniBadgeClick = () => {
    setShowFullPrompt(true);
    setShowMiniBadge(false);
  };

  // Check if app is already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (!deferredPrompt || isStandalone) return null;

  return (
    <>
      {/* Mini Badge - Always accessible */}
      <AnimatePresence>
        {showMiniBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-4 right-4 z-40"
          >
            <Button
              onClick={handleMiniBadgeClick}
              size="sm"
              className="bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-12 h-12 p-0 animate-pulse hover:animate-none"
              title="Install Tinderent App"
            >
              <Download className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Install Prompt */}
      <AnimatePresence>
        {showFullPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
          >
            <Card className="bg-white/95 backdrop-blur-lg border border-white/20 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Download className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">Install Tinderent</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="w-6 h-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get the full experience with our mobile app. Install for faster access and offline features.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="flex-1 bg-gradient-primary text-white"
                  >
                    Install App
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}