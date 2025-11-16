import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleClearCache = async () => {
    // Clear service worker cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // Hard reload
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-500">
          404
        </div>
        <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
        <p className="text-gray-300 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm text-gray-400">
          Tried to access: <code className="bg-white/10 px-2 py-1 rounded">{location.pathname}</code>
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Button>
          <Button
            onClick={handleClearCache}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            size="lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Clear Cache & Reload
          </Button>
        </div>
        <p className="text-xs text-gray-500 pt-4">
          If you keep seeing this page, try clearing your browser cache or the button above.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
