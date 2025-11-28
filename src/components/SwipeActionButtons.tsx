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
  const handleAction = (
    action: () => void,
    hapticType: 'light' | 'medium' | 'heavy' | 'success' | 'warning'
  ) => {
    if (disabled) return;
    triggerHaptic(hapticType);
    action();
  };

  return (
    <div className="pointer-events-none w-full">
      {/* Individual Floating Buttons - Horizontal layout with proper spacing */}
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        {/* 1. Undo Button (Yellow/Gold) */}
        <motion.div
          whileHover={{ scale: canUndo && !disabled ? 1.15 : 1 }}
          whileTap={{ scale: canUndo && !disabled ? 0.9 : 1 }}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onUndo, 'light')}
            disabled={!canUndo || disabled}
            className={`
              h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-full transition-all duration-200
              ${canUndo && !disabled
                ? 'text-yellow-500 hover:text-yellow-600 opacity-100'
                : 'text-gray-400 opacity-40 cursor-not-allowed'
              }
            `}
            title="Undo last swipe"
          >
            <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </motion.div>

        {/* 2. Pass Button (Red) */}
        <motion.div
          whileHover={{ scale: !disabled ? 1.15 : 1 }}
          whileTap={{ scale: !disabled ? 0.9 : 1 }}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onPass, 'warning')}
            disabled={disabled}
            className={`
              h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full transition-all duration-200
              ${!disabled
                ? 'text-red-500 hover:text-red-600 opacity-100'
                : 'text-gray-400 opacity-40 cursor-not-allowed'
              }
            `}
            title="Pass"
          >
            <X className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5]" />
          </button>
        </motion.div>

        {/* 3. Info Button (Blue) */}
        <motion.div
          whileHover={{ scale: !disabled ? 1.15 : 1 }}
          whileTap={{ scale: !disabled ? 0.9 : 1 }}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onInfo, 'light')}
            disabled={disabled}
            className={`
              h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-full transition-all duration-200
              ${!disabled
                ? 'text-blue-500 hover:text-blue-600 opacity-100'
                : 'text-gray-400 opacity-40 cursor-not-allowed'
              }
            `}
            title="View profile"
          >
            <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </motion.div>

        {/* 4. Like Button (Green) */}
        <motion.div
          whileHover={{ scale: !disabled ? 1.15 : 1 }}
          whileTap={{ scale: !disabled ? 0.9 : 1 }}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onLike, 'success')}
            disabled={disabled}
            className={`
              h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full transition-all duration-200
              ${!disabled
                ? 'text-green-500 hover:text-green-600 opacity-100'
                : 'text-gray-400 opacity-40 cursor-not-allowed'
              }
            `}
            title="Like"
          >
            <Heart className="h-7 w-7 sm:h-8 sm:w-8 fill-currentColor" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
