import { motion, TargetAndTransition } from 'framer-motion';
import { RotateCcw, X, Eye, Flame } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface SwipeActionButtonsProps {
  onUndo: () => void;
  onPass: () => void;
  onInfo: () => void;
  onLike: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

// Jelly-like spring config - bouncy and playful
const jellySpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 12,
  mass: 0.8,
};

// Staggered entrance animation for each button
const buttonVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    y: 30,
  },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      ...jellySpring,
      delay: delay * 0.12, // Slower stagger between buttons
    },
  }),
};

// Jelly tap animation - squishes and bounces back
const jellyTap: TargetAndTransition = {
  scale: 0.85,
  transition: { 
    type: "spring" as const, 
    stiffness: 400, 
    damping: 10 
  },
};

// Jelly hover animation - gentle bounce
const jellyHover: TargetAndTransition = {
  scale: 1.18,
  transition: { 
    type: "spring" as const, 
    stiffness: 300, 
    damping: 8 
  },
};

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
    <motion.div 
      className="pointer-events-none w-full"
      initial="hidden"
      animate="visible"
    >
      {/* Individual Floating Buttons - Horizontal layout with proper spacing */}
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        {/* 1. Undo Button (Yellow/Gold) */}
        <motion.div
          variants={buttonVariants}
          custom={0}
          whileHover={canUndo && !disabled ? jellyHover : undefined}
          whileTap={canUndo && !disabled ? jellyTap : undefined}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onUndo, 'light')}
            disabled={!canUndo || disabled}
            className={`
              h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-full transition-colors duration-200
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
          variants={buttonVariants}
          custom={1}
          whileHover={!disabled ? jellyHover : undefined}
          whileTap={!disabled ? jellyTap : undefined}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onPass, 'warning')}
            disabled={disabled}
            className={`
              h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full transition-colors duration-200
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
          variants={buttonVariants}
          custom={2}
          whileHover={!disabled ? jellyHover : undefined}
          whileTap={!disabled ? jellyTap : undefined}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onInfo, 'light')}
            disabled={disabled}
            className={`
              h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-full transition-colors duration-200
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
          variants={buttonVariants}
          custom={3}
          whileHover={!disabled ? jellyHover : undefined}
          whileTap={!disabled ? jellyTap : undefined}
          className="pointer-events-auto flex-shrink-0"
        >
          <button
            onClick={() => handleAction(onLike, 'success')}
            disabled={disabled}
            className={`
              h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full transition-colors duration-200
              ${!disabled
                ? 'text-green-500 hover:text-green-600 opacity-100'
                : 'text-gray-400 opacity-40 cursor-not-allowed'
              }
            `}
            title="Like"
          >
            <Flame className="h-7 w-7 sm:h-8 sm:w-8 fill-current" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
