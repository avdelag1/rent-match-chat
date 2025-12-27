import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { RadioPlayerSkinned } from '@/components/radio/RadioPlayerSkinned';

/**
 * Global radio overlays - mounted at app level for persistence across routes
 * Full skinned player ONLY on /radio page when expanded
 * RadioBubble handles all mini player UI across the app
 */
export const RadioOverlays: React.FC = () => {
  const { isPlayerExpanded } = useRadioPlayer();
  const location = useLocation();

  // Full player only shows on /radio page
  const isRadioPage = location.pathname === '/radio';
  const shouldShowPlayer = isRadioPage && isPlayerExpanded;

  return (
    <AnimatePresence mode="wait">
      {shouldShowPlayer && (
        <motion.div
          key="radio-player-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100]"
        >
          <RadioPlayerSkinned />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RadioOverlays;
