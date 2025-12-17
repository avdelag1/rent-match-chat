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
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
    >
      {/* Brand Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent mb-12"
      >
        SwipeMatch
      </motion.h1>

      {/* Modern spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Clean circular spinner */}
        <div className="relative w-10 h-10">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-muted"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Simple loading text */}
        <span className="text-sm text-muted-foreground">Loading...</span>
      </motion.div>

      {/* Refresh button */}
      {showRefresh && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          className="mt-12 px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        >
          Taking too long? Tap to refresh
        </motion.button>
      )}
    </motion.div>
  );
}
