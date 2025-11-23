import { motion } from 'framer-motion';
import { RotateCcw, X, Eye, Heart } from 'lucide-react';
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
    <div className="fixed bottom-20 left-0 right-0 z-40 pb-safe pointer-events-none">
      {/* Floating Button Container - Positioned above bottom nav (64px) */}
      <div className="flex items-center justify-center gap-4 px-6 py-6 pointer-events-auto">
          {/* 1. Undo Button (Yellow/Gold) */}
          <motion.div
            whileHover={{ scale: canUndo && !disabled ? 1.15 : 1 }}
            whileTap={{ scale: canUndo && !disabled ? 0.9 : 1 }}
          >
            <button
              onClick={() => handleAction(onUndo, 'light')}
              disabled={!canUndo || disabled}
              className={`
                relative p-2 transition-all duration-200
                ${canUndo && !disabled
                  ? 'text-yellow-500 hover:text-yellow-600 opacity-100'
                  : 'text-gray-400 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </motion.div>

          {/* 2. Pass Button (Red) */}
          <motion.div
            whileHover={{ scale: !disabled ? 1.15 : 1 }}
            whileTap={{ scale: !disabled ? 0.9 : 1 }}
          >
            <button
              onClick={() => handleAction(onPass, 'warning')}
              disabled={disabled}
              className={`
                relative p-2 transition-all duration-200
                ${!disabled
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-400 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <X className="h-7 w-7 stroke-[2.5]" />
            </button>
          </motion.div>

          {/* 3. Info Button (Blue) */}
          <motion.div
            whileHover={{ scale: !disabled ? 1.15 : 1 }}
            whileTap={{ scale: !disabled ? 0.9 : 1 }}
          >
            <button
              onClick={() => handleAction(onInfo, 'light')}
              disabled={disabled}
              className={`
                relative p-2 transition-all duration-200
                ${!disabled
                  ? 'text-blue-500 hover:text-blue-600'
                  : 'text-gray-400 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <Eye className="h-5 w-5" />
            </button>
          </motion.div>

          {/* 4. Like Button (Green) */}
          <motion.div
            whileHover={{ scale: !disabled ? 1.15 : 1 }}
            whileTap={{ scale: !disabled ? 0.9 : 1 }}
          >
            <button
              onClick={() => handleAction(onLike, 'success')}
              disabled={disabled}
              className={`
                relative p-2 transition-all duration-200
                ${!disabled
                  ? 'text-green-500 hover:text-green-600'
                  : 'text-gray-400 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <Heart className="h-7 w-7 fill-currentColor" />
            </button>
          </motion.div>

        </div>
    </div>
  );
}
