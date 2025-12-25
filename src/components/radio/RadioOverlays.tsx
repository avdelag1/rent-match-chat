import React from 'react';
import { AnimatePresence } from 'framer-motion';
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

  return (
    <>
      {/* Full Screen Skinned Player - ONLY on /radio page */}
      <AnimatePresence mode="wait">
        {isRadioPage && isPlayerExpanded && <RadioPlayerSkinned key="global-skinned-player" />}
      </AnimatePresence>
    </>
  );
};

export default RadioOverlays;
