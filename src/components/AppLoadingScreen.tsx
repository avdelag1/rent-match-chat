import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AppLoadingScreen() {
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRefresh(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center z-50"
    >
      {/* Brand Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-black tracking-tight text-white mb-8"
      >
        SwipeMatch
      </motion.h1>

      {/* Loading Spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Circular spinner */}
        <div className="relative w-12 h-12">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-white"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Loading text with animated dots */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-white/70 font-medium">Loading</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="text-white/70 text-sm"
            >
              .
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Refresh button */}
      {showRefresh && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="mt-10 px-6 py-3 text-sm text-white/80 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          Taking too long? Tap to refresh
        </motion.button>
      )}
    </motion.div>
  );
}
