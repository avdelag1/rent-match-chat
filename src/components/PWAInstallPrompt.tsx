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
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if app is already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) return;
      
      // Show notification-style prompt periodically
      const dismissCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0');
      
      // Show after 5 seconds initially, then every session if dismissed less than 3 times
      if (dismissCount < 3) {
        setTimeout(() => setShowPrompt(true), 5000);
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
      localStorage.setItem('pwa-install-dismiss-count', '999'); // Don't show again
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const dismissCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0');
    localStorage.setItem('pwa-install-dismiss-count', String(dismissCount + 1));
  };

  // Check if app is already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (!deferredPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 z-50 w-auto max-w-[280px]"
        >
          <Card className="bg-gradient-primary text-white shadow-2xl border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    Install App
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="h-7 px-3 text-xs bg-white text-primary hover:bg-white/90 font-semibold"
                  >
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}