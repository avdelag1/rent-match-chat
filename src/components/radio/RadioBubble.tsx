import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
import { useNavigate, useLocation } from 'react-router-dom';

// Get saved position from localStorage
const getSavedPosition = () => {
  try {
    const saved = localStorage.getItem('radioBubblePosition');
    if (saved) {
      const pos = JSON.parse(saved);
      // Validate position is within viewport
      const maxX = window.innerWidth - 70;
      const maxY = window.innerHeight - 150;
      return {
        x: Math.min(Math.max(pos.x || 0, 0), maxX),
        y: Math.min(Math.max(pos.y || 0, 0), maxY),
      };
    }
  } catch (e) {
    // Ignore errors
  }
  return { x: 0, y: 0 };
};

// Save position to localStorage
const savePosition = (x: number, y: number) => {
  try {
    localStorage.setItem('radioBubblePosition', JSON.stringify({ x, y }));
  } catch (e) {
    // Ignore errors
  }
};

export const RadioBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(getSavedPosition);
  const dragStartTime = useRef<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
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

  // Pages where the bubble should NOT appear
  const hiddenPaths = [
    '/client/dashboard',
    '/owner/dashboard',
    '/', // Main landing page
    '/radio', // Radio page - has its own players
  ];

  // Check if current path should hide the bubble
  const shouldHide = hiddenPaths.some(path => location.pathname === path);

  // Don't show bubble if no station is selected or on hidden pages
  if (!currentStation || shouldHide) return null;

  const handleBubbleClick = () => {
    // Only expand if not dragging (check if drag lasted less than 200ms)
    const dragDuration = Date.now() - dragStartTime.current;
    if (!isDragging && dragDuration < 200) {
      if (isExpanded) {
        expandPlayer();
      } else {
        setIsExpanded(true);
      }
    }
  };

  const handleGoToRadio = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(false);
    setTimeout(() => {
      navigate('/radio');
    }, 0);
  };

  const handleDragStart = () => {
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setPosition(prev => ({
      x: prev.x + info.delta.x,
      y: prev.y + info.delta.y,
    }));
  };

  const handleDragEnd = () => {
    // Save the new position
    savePosition(position.x, position.y);
    // Small delay to prevent click from firing
    setTimeout(() => setIsDragging(false), 150);
  };

  // Calculate bounds
  const bounds = {
    left: -position.x,
    right: window.innerWidth - 70 - position.x,
    top: -position.y + 60,
    bottom: window.innerHeight - 150 - position.y,
  };

  return (
    <>
      {/* Backdrop when expanded - subtle blur */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[60]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Bubble */}
      <motion.div
        className={cn(
          "fixed z-[70]",
          isExpanded ? "" : "cursor-grab active:cursor-grabbing",
          isDragging && "cursor-grabbing"
        )}
        style={{
          bottom: isExpanded ? 96 : undefined,
          right: isExpanded ? 16 : undefined,
          top: isExpanded ? undefined : 'auto',
          left: isExpanded ? undefined : 'auto',
          x: isExpanded ? 0 : position.x,
          y: isExpanded ? 0 : position.y,
          position: 'fixed',
          ...(isExpanded ? {} : { bottom: 96, right: 16 }),
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        drag={!isExpanded}
        dragConstraints={bounds}
        dragElastic={0.05}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.1, zIndex: 100 }}
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
              className="w-72 bg-background/70 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/10 overflow-hidden"
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
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                >
                  <X className="w-4 h-4 text-white/90" />
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
                    onClick={(e) => handleGoToRadio(e)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Collapsed Bubble View - Touch-friendly draggable
            <motion.div
              key="collapsed"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBubbleClick}
              onTouchEnd={(e) => {
                // Handle tap on touch devices
                if (!isDragging) {
                  const dragDuration = Date.now() - dragStartTime.current;
                  if (dragDuration < 200) {
                    e.preventDefault();
                    setIsExpanded(true);
                  }
                }
              }}
              className={cn(
                "relative w-16 h-16 rounded-full flex items-center justify-center",
                "bg-black/40 backdrop-blur-xl",
                "border-2 border-white/30",
                "shadow-xl shadow-black/30",
                "select-none"
              )}
              style={{ touchAction: 'none' }}
            >
              {/* Album art background with more transparency */}
              <div
                className="absolute inset-2 rounded-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${currentStation.artwork})` }}
              />

              {/* Subtle glass overlay */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-black/30" />

              {/* Icon overlay */}
              <div className="relative z-10">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/90 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-white/95 rounded-full"
                        animate={{
                          height: [8, 18, 8],
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
                  <Radio className="w-6 h-6 text-white/95" />
                )}
              </div>

              {/* Live indicator - more visible */}
              {currentStation.isLive && isPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white/50 animate-pulse" />
              )}

              {/* Drag hint ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/0 transition-all duration-200 group-active:border-white/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default RadioBubble;