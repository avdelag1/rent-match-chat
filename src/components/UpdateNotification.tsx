import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setShowUpdate(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-smooth">
      <div className="bg-gradient-primary text-white p-3 rounded-lg shadow-theme-lg max-w-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-semibold text-xs mb-1">🎉 Updated!</div>
            <div className="text-[10px] opacity-90 mb-2">
              New version available with latest features.
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={handleUpdate}
                size="sm"
                variant="secondary"
                className="flex-1 text-[10px] h-7 bg-white/20 hover:bg-white/30 border-white/30"
              >
                Refresh
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="px-1.5 h-7 text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}