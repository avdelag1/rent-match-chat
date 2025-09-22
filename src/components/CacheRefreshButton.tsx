import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const CacheRefreshButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Show toast notification
      toast({
        title: "Refreshing app...",
        description: "Getting the latest version for you!",
      });

      // Call the global cache refresh function
      if (typeof window !== 'undefined' && (window as any).forceCacheRefresh) {
        (window as any).forceCacheRefresh();
      } else {
        // Fallback: hard reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Cache refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: "Please try refreshing manually (Ctrl+F5)",
        variant: "destructive",
      });
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Update App'}
    </Button>
  );
};