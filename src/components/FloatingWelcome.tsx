import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'owner';
}

export function FloatingWelcome({ isOpen, onClose, userRole }: FloatingWelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Auto-dismiss after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const roleText = userRole === 'client' ? 'Client Side' : 'Owner Side';

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Floating particles background */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${30 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -100 - Math.random() * 200],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Main floating text container */}
          <div className="relative flex flex-col items-center gap-2">
            {/* Congratulations text */}
            <motion.div
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <span
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl"
                style={{
                  textShadow: '0 0 40px rgba(251, 146, 60, 0.5), 0 0 80px rgba(251, 146, 60, 0.3)',
                  filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
                }}
              >
                Congratulations!
              </span>
            </motion.div>

            {/* Welcome to Swipess */}
            <motion.div
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.3,
              }}
              style={{
                textShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(251, 146, 60, 0.3)',
              }}
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-extrabold">
                Swipe<span className="text-amber-300">ss</span>
              </span>
            </motion.div>

            {/* Role text */}
            <motion.div
              className="text-xl sm:text-2xl font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.5,
              }}
            >
              <span
                className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 30px rgba(251, 146, 60, 0.4)',
                }}
              >
                {roleText}
              </span>
            </motion.div>

            {/* Animated glow ring */}
            <motion.div
              className="absolute -inset-20 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0.5], scale: [0.5, 1.2, 1] }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>

          {/* Sparkle effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-2xl"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 1.5,
                delay: 0.5 + Math.random() * 1,
                ease: 'easeOut',
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default FloatingWelcome;
