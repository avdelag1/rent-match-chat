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
      <div className="bg-gradient-primary text-white p-4 rounded-lg shadow-theme-lg max-w-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="font-semibold text-sm mb-1">🎉 App Updated!</div>
            <div className="text-xs opacity-90 mb-3">
              A new version is available with the latest features and improvements.
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                variant="secondary"
                className="flex-1 text-xs bg-white/20 hover:bg-white/30 border-white/30"
              >
                Refresh Now
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="px-2 text-white/80 hover:text-white hover:bg-white/20"
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