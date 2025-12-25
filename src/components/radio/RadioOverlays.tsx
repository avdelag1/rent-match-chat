import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { RadioPlayerSkinned } from '@/components/radio/RadioPlayerSkinned';
import { RadioMiniPlayer } from '@/components/radio/RadioMiniPlayer';

/**
 * Global radio overlays - mounted at app level for persistence across routes
 * Renders expanded player and mini player globally
 */
export const RadioOverlays: React.FC = () => {
  const { currentStation, isPlayerExpanded } = useRadioPlayer();

  return (
    <>
      {/* Full Screen Skinned Player - Global */}
      <AnimatePresence mode="wait">
        {isPlayerExpanded && <RadioPlayerSkinned key="global-skinned-player" />}
      </AnimatePresence>

      {/* Mini Player - Global (when station exists but player not expanded) */}
      <AnimatePresence>
        {currentStation && !isPlayerExpanded && <RadioMiniPlayer key="global-mini-player" />}
      </AnimatePresence>
    </>
  );
};

export default RadioOverlays;
