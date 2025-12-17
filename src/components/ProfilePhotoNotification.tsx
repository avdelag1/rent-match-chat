import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ProfilePhotoNotificationProps {
  hasPhotos: boolean;
  userRole: 'client' | 'owner';
}

export function ProfilePhotoNotification({ hasPhotos, userRole }: ProfilePhotoNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  // Reset dismissed state when photos are added
  useEffect(() => {
    if (hasPhotos) {
      setIsDismissed(false);
    }
  }, [hasPhotos]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!hasPhotos && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasPhotos, isDismissed]);

  // Auto-hide when user has photos
  const shouldShow = !hasPhotos && !isDismissed;

  const handleUploadClick = () => {
    if (userRole === 'client') {
      navigate('/client/profile');
    } else {
      navigate('/owner/profile');
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        >
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800 shadow-lg">
            <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Complete Your Profile
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Upload at least one photo to increase your visibility and get better matches!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUploadClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  Upload Photo
                </Button>
                <Button
                  onClick={() => setIsDismissed(true)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
