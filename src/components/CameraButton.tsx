import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraButtonProps {
  type: 'client-selfie' | 'owner-profile' | 'owner-listing';
  returnPath?: string;
  listingId?: string;
  existingPhotos?: string[];
  maxPhotos?: number;
  variant?: 'default' | 'floating' | 'icon' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function CameraButton({
  type,
  returnPath,
  listingId,
  existingPhotos = [],
  maxPhotos,
  variant = 'default',
  size = 'md',
  className,
  label,
}: CameraButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const state: Record<string, unknown> = {};

    if (returnPath) {
      state.returnPath = returnPath;
    }

    if (type === 'owner-listing') {
      if (listingId) state.listingId = listingId;
      if (existingPhotos.length > 0) state.existingPhotos = existingPhotos;
      if (maxPhotos) state.maxPhotos = maxPhotos;
    }

    const routes = {
      'client-selfie': '/client/camera',
      'owner-profile': '/owner/camera',
      'owner-listing': '/owner/camera/listing',
    };

    navigate(routes[type], { state });
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  if (variant === 'floating') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          'fixed bottom-24 right-6 z-40 rounded-full shadow-lg flex items-center justify-center',
          type === 'client-selfie'
            ? 'bg-gradient-to-br from-pink-500 to-red-500'
            : 'bg-gradient-to-br from-red-500 to-orange-500',
          sizeClasses[size],
          className
        )}
      >
        <Camera className={cn('text-white', iconSizes[size])} />
      </motion.button>
    );
  }

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          'rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors',
          sizeClasses[size],
          className
        )}
      >
        <Camera className={cn('text-white', iconSizes[size])} />
      </motion.button>
    );
  }

  if (variant === 'outline') {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        className={cn(
          'border-dashed border-2',
          type === 'client-selfie'
            ? 'border-pink-500/50 text-pink-500 hover:bg-pink-500/10'
            : 'border-orange-500/50 text-orange-500 hover:bg-orange-500/10',
          className
        )}
      >
        <Camera className="w-4 h-4 mr-2" />
        {label || 'Take Photo'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(
        type === 'client-selfie'
          ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
          : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
        'text-white',
        className
      )}
    >
      <Camera className="w-4 h-4 mr-2" />
      {label || (type === 'owner-listing' ? 'Take Listing Photos' : 'Take Photo')}
    </Button>
  );
}

export default CameraButton;
