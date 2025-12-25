import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';

const BUBBLE_SIZE = 64;
const MARGIN = 16;

// Safe default that works before window is ready
const getDefaultPosition = (): { left: number; top: number } => {
  // Use a safe default - bottom right area, will be adjusted on mount
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  return {
    left: Math.max(windowWidth - BUBBLE_SIZE - MARGIN, MARGIN),
    top: Math.min(windowHeight - 200, 100),
  };
};

// Get saved position from localStorage (absolute left/top values)
const getSavedPosition = (): { left: number; top: number } => {
  if (typeof window === 'undefined') {
    return getDefaultPosition();
  }

  try {
    const saved = localStorage.getItem('radioBubblePositionV2');
    if (saved) {
      const pos = JSON.parse(saved);
      // Validate position is within viewport
      const maxLeft = window.innerWidth - BUBBLE_SIZE - MARGIN;
      const maxTop = window.innerHeight - BUBBLE_SIZE - MARGIN;
      return {
        left: Math.min(Math.max(pos.left ?? maxLeft, MARGIN), maxLeft),
        top: Math.min(Math.max(pos.top ?? 100, MARGIN + 60), maxTop),
      };
    }
  } catch (e) {
    // Ignore errors
  }
  // Default position: bottom-right corner (more visible on mobile)
  return {
    left: window.innerWidth - BUBBLE_SIZE - MARGIN,
    top: window.innerHeight - 200,
  };
};

// Save position to localStorage
const savePosition = (left: number, top: number) => {
  try {
    localStorage.setItem('radioBubblePositionV2', JSON.stringify({ left, top }));
  } catch (e) {
    // Ignore errors
  }
};

export const RadioBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(getSavedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const dragStartTimeRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  
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

  // Handle viewport resize and ensure visible on mount
  useEffect(() => {
    const ensureVisible = () => {
      setPosition(prev => {
        const maxLeft = window.innerWidth - BUBBLE_SIZE - MARGIN;
        const maxTop = window.innerHeight - BUBBLE_SIZE - MARGIN;
        const minTop = MARGIN + 60;

        // Calculate clamped position
        const clampedLeft = Math.min(Math.max(prev.left, MARGIN), maxLeft);
        const clampedTop = Math.min(Math.max(prev.top, minTop), maxTop);

        // Only update if position changed significantly (avoid unnecessary re-renders)
        if (Math.abs(clampedLeft - prev.left) > 1 || Math.abs(clampedTop - prev.top) > 1) {
          return { left: clampedLeft, top: clampedTop };
        }
        return prev;
      });
    };

    // Run on mount to ensure position is valid
    ensureVisible();

    window.addEventListener('resize', ensureVisible);
    return () => window.removeEventListener('resize', ensureVisible);
  }, []);

  // Clamp position within viewport
  const clampPosition = useCallback((left: number, top: number) => {
    const maxLeft = window.innerWidth - BUBBLE_SIZE - MARGIN;
    const maxTop = window.innerHeight - BUBBLE_SIZE - MARGIN;
    return {
      left: Math.min(Math.max(left, MARGIN), maxLeft),
      top: Math.min(Math.max(top, MARGIN + 60), maxTop),
    };
  }, []);

  // Unified pointer handlers for both mouse and touch
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isExpanded) return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      left: position.left,
      top: position.top,
    };
    dragStartTimeRef.current = Date.now();
    hasDraggedRef.current = false;
    setIsDragging(true);
  }, [isExpanded, position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current || isExpanded) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Only count as drag if moved more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
    }
    
    const newPos = clampPosition(
      dragStartRef.current.left + deltaX,
      dragStartRef.current.top + deltaY
    );
    setPosition(newPos);
  }, [isExpanded, clampPosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const dragDuration = Date.now() - dragStartTimeRef.current;
    const wasDragged = hasDraggedRef.current;
    
    // Save final position
    savePosition(position.left, position.top);
    
    // If it was a tap (short duration, no significant movement), expand
    if (!wasDragged && dragDuration < 300) {
      setIsExpanded(true);
    }
    
    dragStartRef.current = null;
    setIsDragging(false);
  }, [position]);

  const handleGoToRadio = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(false);
    navigate('/radio');
  }, [navigate]);

  // Pages where the bubble should NOT appear
  const hiddenPaths = [
    '/client/dashboard',
    '/owner/dashboard',
    '/',
    '/radio',
  ];

  const shouldHide = hiddenPaths.some(path => location.pathname === path);

  if (!currentStation || shouldHide) return null;

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

      {/* Floating Bubble - Uses absolute left/top positioning */}
      <motion.div
        className={cn(
          "fixed z-[70]",
          !isExpanded && "touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          left: isExpanded ? position.left - 104 : position.left, // Center expanded card on bubble
          top: isExpanded ? position.top + BUBBLE_SIZE + 8 : position.top,
          width: isExpanded ? 272 : BUBBLE_SIZE,
          height: isExpanded ? 'auto' : BUBBLE_SIZE,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isDragging ? 1.1 : 1, 
          opacity: 1,
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
              className="w-full bg-background/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-border overflow-hidden"
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
            // Collapsed Bubble View - Draggable with pointer events
            <motion.div
              key="collapsed"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                "relative w-16 h-16 rounded-full flex items-center justify-center",
                "bg-black/50 backdrop-blur-xl",
                "border-2 border-white/30",
                "shadow-xl shadow-black/30",
                "select-none"
              )}
            >
              {/* Album art background */}
              <div
                className="absolute inset-2 rounded-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${currentStation.artwork})` }}
              />

              {/* Glass overlay */}
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

              {/* Live indicator */}
              {currentStation.isLive && isPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white/50 animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default RadioBubble;
