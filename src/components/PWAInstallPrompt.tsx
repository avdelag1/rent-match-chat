import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
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
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if dismissed in this session
    const dismissedThisSession = sessionStorage.getItem('pwa-prompt-dismissed');
    if (dismissedThisSession) return;

    // Show banner on every visit
    setTimeout(() => setShowPrompt(true), 500);

    // Listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Native install available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setDeferredPrompt(null);
    } else {
      // Show manual install instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        instructions = 'Tap the Share button and select "Add to Home Screen"';
      } else if (userAgent.includes('android')) {
        instructions = 'Tap the menu button and select "Add to Home Screen" or "Install App"';
      } else {
        instructions = 'Use your browser menu to install this app';
      }
      
      alert(instructions);
    }
    
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Check if app is already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-[300px]"
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white text-sm font-bold">📱</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 leading-tight">
                    Get the app
                  </p>
                  <p className="text-[10px] text-gray-500">Install for quick access</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="h-7 px-3 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 font-medium shadow-sm"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-3.5 h-3.5" />
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