import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [newVersion, setNewVersion] = useState('');

  const handleUpdate = useCallback(() => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        Promise.all(names.map(name => caches.delete(name)))
          .then(() => {
            (window as Window).location.reload();
          });
      });
    } else {
      (window as Window).location.reload();
    }
  }, []);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setNewVersion(event.data.version);
          setShowUpdate(true);
          
          // Store new version in localStorage
          localStorage.setItem('app_version', event.data.version);
        }
      });
    }
  }, []);

  // Auto-refresh countdown
  useEffect(() => {
    if (showUpdate && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleUpdate();
    }
  }, [showUpdate, countdown, handleUpdate]);

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-primary text-white p-6 rounded-2xl shadow-2xl max-w-md mx-4 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <RefreshCw className="w-8 h-8" />
          </div>
          
          <div>
            <div className="font-bold text-xl mb-2">🎉 Update Available!</div>
            <div className="text-sm opacity-90 mb-1">
              A new version is ready with the latest features and improvements.
            </div>
            <div className="text-xs opacity-75">
              Auto-refreshing in {countdown} seconds...
            </div>
          </div>
          
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleUpdate}
              size="lg"
              className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Refresh Now
            </Button>
            <Button
              onClick={handleDismiss}
              size="lg"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
