import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { RadioPlayerSkinned } from '@/components/radio/RadioPlayerSkinned';
import { RadioMiniPlayer } from '@/components/radio/RadioMiniPlayer';

/**
 * Global radio overlays - mounted at app level for persistence across routes
 * Full player ONLY on /radio page, mini player everywhere else
 */
export const RadioOverlays: React.FC = () => {
  const { currentStation, isPlayerExpanded } = useRadioPlayer();
  const location = useLocation();
  
  // Full player only shows on /radio page
  const isRadioPage = location.pathname === '/radio';

  return (
    <>
      {/* Full Screen Skinned Player - ONLY on /radio page */}
      <AnimatePresence mode="wait">
        {isRadioPage && isPlayerExpanded && <RadioPlayerSkinned key="global-skinned-player" />}
      </AnimatePresence>

      {/* Mini Player - Only on /radio page (when station exists but player not expanded) */}
      {/* On other pages, the RadioBubble handles the mini player UI */}
      <AnimatePresence>
        {isRadioPage && currentStation && !isPlayerExpanded && <RadioMiniPlayer key="global-mini-player" />}
      </AnimatePresence>
    </>
  );
};

export default RadioOverlays;
