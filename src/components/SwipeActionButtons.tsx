import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, X, Eye, Heart, Star } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface SwipeActionButtonsProps {
  onUndo: () => void;
  onPass: () => void;
  onInfo: () => void;
  onLike: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function SwipeActionButtons({
  onUndo,
  onPass,
  onInfo,
  onLike,
  canUndo,
  disabled = false
}: SwipeActionButtonsProps) {
  
  const handleAction = (action: () => void, hapticType: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => {
    if (disabled) return;
    triggerHaptic(hapticType);
    action();
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 pb-safe">
      {/* Floating Button Container - Positioned above bottom nav (64px) */}
      <div className="flex items-center justify-center gap-4 px-6 py-6">
          {/* 1. Undo Button (Yellow/Gold) */}
          <motion.div
            whileHover={{ scale: canUndo && !disabled ? 1.05 : 1 }}
            whileTap={{ scale: canUndo && !disabled ? 0.95 : 1 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction(onUndo, 'light')}
              disabled={!canUndo || disabled}
              className={`
                relative h-14 w-14 rounded-full border-2 p-0
                ${canUndo && !disabled
                  ? 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white text-yellow-600'
                  : 'border-muted bg-muted/20 text-muted-foreground cursor-not-allowed'
                }
                transition-all duration-200 shadow-md
              `}
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* 2. Pass Button (Red) */}
          <motion.div
            whileHover={{ scale: !disabled ? 1.05 : 1 }}
            whileTap={{ scale: !disabled ? 0.9 : 1 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction(onPass, 'warning')}
              disabled={disabled}
              className="
                h-16 w-16 rounded-full border-2 border-red-500 
                bg-red-500/10 hover:bg-red-500 hover:text-white 
                text-red-600 p-0
                shadow-lg hover:shadow-red-500/30
                transition-all duration-200
              "
            >
              <X className="h-7 w-7 stroke-[2.5]" />
            </Button>
          </motion.div>

          {/* 3. Info Button (Blue) */}
          <motion.div
            whileHover={{ scale: !disabled ? 1.05 : 1 }}
            whileTap={{ scale: !disabled ? 0.95 : 1 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction(onInfo, 'light')}
              disabled={disabled}
              className="
                h-12 w-12 rounded-full border-2 border-blue-500 
                bg-blue-500/10 hover:bg-blue-500 hover:text-white 
                text-blue-600 p-0
                shadow-md hover:shadow-blue-500/30
                transition-all duration-200
              "
            >
              <Eye className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* 4. Like Button (Green) - with particle effect */}
          <motion.div
            whileHover={{ scale: !disabled ? 1.05 : 1 }}
            whileTap={{ scale: !disabled ? 0.9 : 1 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAction(onLike, 'success')}
              disabled={disabled}
              className="
                relative h-16 w-16 rounded-full border-2 
                bg-gradient-to-br from-green-500 to-emerald-600 
                border-green-400 text-white p-0
                shadow-lg hover:shadow-green-500/40 hover:scale-105
                transition-all duration-200
              "
            >
              <Heart className="h-7 w-7 fill-white" />
              {/* Particle burst effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                whileHover={{
                  boxShadow: [
                    '0 0 0 0 rgba(34, 197, 94, 0.7)',
                    '0 0 0 15px rgba(34, 197, 94, 0)',
                  ]
                }}
                transition={{ duration: 0.4 }}
              />
            </Button>
          </motion.div>

        </div>
    </div>
  );
}
