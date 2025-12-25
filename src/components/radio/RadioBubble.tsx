import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  X,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const RadioBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const {
    currentStation,
    isPlaying,
    isLoading,
    isMuted,
    togglePlayPause,
    toggleMute,
    skipToNext,
    skipToPrevious,
    shufflePlay,
    expandPlayer,
  } = useRadioPlayer();

  // Don't show bubble if no station is selected
  if (!currentStation) return null;

  const handleBubbleClick = () => {
    if (isExpanded) {
      expandPlayer();
    } else {
      setIsExpanded(true);
    }
  };

  const handleGoToRadio = () => {
    navigate('/radio');
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Bubble */}
      <motion.div
        className={cn(
          "fixed z-[70] transition-all duration-300",
          isExpanded
            ? "bottom-24 right-4"
            : "bottom-24 right-4"
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        drag={!isExpanded}
        dragConstraints={{
          top: 100,
          left: 20,
          right: window.innerWidth - 80,
          bottom: window.innerHeight - 180,
        }}
        dragElastic={0.1}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            // Expanded Card View
            <motion.div
              key="expanded"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-72 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            >
              {/* Header with artwork */}
              <div className="relative h-24 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentStation.artwork})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Station info */}
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    {currentStation.isLive && (
                      <span className="px-1.5 py-0.5 bg-red-500 rounded text-[10px] font-semibold text-white flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {currentStation.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentStation.description}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="p-3 space-y-3">
                {/* Playback controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={skipToPrevious}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className={cn(
                      "p-3 rounded-full transition-all",
                      isPlaying
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={skipToNext}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Secondary controls */}
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={shufflePlay}
                    className="p-2 rounded-full hover:bg-secondary transition-colors flex items-center gap-1.5"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span className="text-xs">Shuffle</span>
                  </button>

                  <button
                    onClick={handleGoToRadio}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Collapsed Bubble View
            <motion.button
              key="collapsed"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBubbleClick}
              className={cn(
                "relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
                "bg-gradient-to-br from-primary to-primary/80",
                "border-2 border-white/20"
              )}
            >
              {/* Album art background */}
              <div
                className="absolute inset-1 rounded-full bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url(${currentStation.artwork})` }}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-1 rounded-full bg-black/30" />

              {/* Icon overlay */}
              <div className="relative z-10">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        animate={{
                          height: [8, 16, 8],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Radio className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Live indicator */}
              {currentStation.isLive && isPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default RadioBubble;
