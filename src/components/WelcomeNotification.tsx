import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WelcomeNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
  side: 'left' | 'right';
  velocityX: number;
  velocityY: number;
}

const CONFETTI_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B500', // Orange
  '#FF69B4', // Pink
];

const generateConfetti = (count: number): ConfettiPiece[] => {
  const pieces: ConfettiPiece[] = [];

  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 'left' : 'right';
    // Start from bottom corners
    const startX = side === 'left' ? -10 : 110;
    // Velocity aims toward center of screen
    const velocityX = side === 'left'
      ? 30 + Math.random() * 40 // Shoot right from left corner
      : -(30 + Math.random() * 40); // Shoot left from right corner

    pieces.push({
      id: i,
      x: startX + (Math.random() * 10 - 5),
      y: 100 + Math.random() * 10, // Start from bottom
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 8,
      delay: Math.random() * 0.3,
      side,
      velocityX,
      velocityY: -(60 + Math.random() * 40), // Shoot upward
    });
  }

  return pieces;
};

const ConfettiPieceComponent = ({ piece }: { piece: ConfettiPiece }) => {
  const shapes = ['rectangle', 'circle', 'triangle'];
  const shape = shapes[piece.id % 3];

  // Calculate the trajectory - starts from corner, arcs toward center, then falls
  const midX = piece.x + piece.velocityX;
  const midY = piece.y + piece.velocityY;
  const endX = midX + (Math.random() * 20 - 10);
  const endY = 120; // Fall below viewport

  return (
    <motion.div
      key={piece.id}
      className="absolute pointer-events-none"
      style={{
        left: `${piece.x}%`,
        top: `${piece.y}%`,
        width: piece.size,
        height: shape === 'rectangle' ? piece.size * 0.6 : piece.size,
        backgroundColor: shape !== 'triangle' ? piece.color : 'transparent',
        borderRadius: shape === 'circle' ? '50%' : shape === 'rectangle' ? '2px' : '0',
        borderLeft: shape === 'triangle' ? `${piece.size / 2}px solid transparent` : undefined,
        borderRight: shape === 'triangle' ? `${piece.size / 2}px solid transparent` : undefined,
        borderBottom: shape === 'triangle' ? `${piece.size}px solid ${piece.color}` : undefined,
      }}
      initial={{
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        scale: 0,
      }}
      animate={{
        x: [0, `${piece.velocityX}vw`, `${piece.velocityX + (Math.random() * 10 - 5)}vw`],
        y: [0, `${piece.velocityY}vh`, '100vh'],
        rotate: [0, piece.rotation * 2, piece.rotation * 4],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 1],
      }}
      transition={{
        duration: 2.5 + Math.random() * 1,
        delay: piece.delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.4, 1],
      }}
    />
  );
};

export function WelcomeNotification({ isOpen, onClose }: WelcomeNotificationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti when modal opens
      setConfetti(generateConfetti(60));
      setShowConfetti(true);

      // Regenerate confetti for continuous effect
      const interval = setInterval(() => {
        setConfetti(generateConfetti(40));
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowConfetti(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti Layer */}
          <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
            {showConfetti && confetti.map((piece) => (
              <ConfettiPieceComponent key={`${piece.id}-${piece.delay}`} piece={piece} />
            ))}
          </div>

          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative pointer-events-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-white/10"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: 0.1
              }}
            >
              {/* Decorative glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30 z-10"
                aria-label="Close welcome notification"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative text-center space-y-6">
                {/* Celebration icon */}
                <motion.div
                  className="text-6xl sm:text-7xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3
                  }}
                >
                  🎉
                </motion.div>

                {/* Main message */}
                <div className="space-y-3">
                  <motion.h2
                    className="text-2xl sm:text-3xl font-bold text-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Congratulations!
                  </motion.h2>

                  <motion.p
                    className="text-xl sm:text-2xl font-semibold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-white/90">Welcome to </span>
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-extrabold">
                      Swipe<span className="text-amber-300">ss</span>
                    </span>
                  </motion.p>
                </div>

                {/* Subtitle */}
                <motion.p
                  className="text-white/60 text-sm sm:text-base"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Your journey to finding the perfect match starts now!
                </motion.p>

                {/* Get Started button */}
                <motion.button
                  onClick={handleClose}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Let's Go!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WelcomeNotification;
