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
  // Position in bottom-right, but above bottom nav (at least 180px from bottom)
  return {
    left: Math.max(windowWidth - BUBBLE_SIZE - MARGIN, MARGIN),
    top: Math.max(windowHeight - 180 - BUBBLE_SIZE, 100),
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
      // Leave space for bottom nav (~120px) and header (~80px)
      const maxLeft = window.innerWidth - BUBBLE_SIZE - MARGIN;
      const maxTop = window.innerHeight - BUBBLE_SIZE - 120; // Leave room for bottom nav
      const minTop = MARGIN + 80; // Leave room for header
      return {
        left: Math.min(Math.max(pos.left ?? maxLeft, MARGIN), maxLeft),
        top: Math.min(Math.max(pos.top ?? maxTop, minTop), maxTop),
      };
    }
  } catch (e) {
    // Ignore errors
  }
  // Default position: bottom-right corner, above bottom nav
  return getDefaultPosition();
};

// Save position to localStorage
const savePosition = (left: number, top: number) => {
  try {
    localStorage.setItem('radioBubblePositionV2', JSON.stringify({ left, top }));
  } catch (e) {
    // Ignore errors
  }
};

// Close zone dimensions
const CLOSE_ZONE_SIZE = 80;

export const RadioBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(getSavedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverCloseZone, setIsOverCloseZone] = useState(false);
  const [showCloseZone, setShowCloseZone] = useState(false);
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
    stopPlayback,
  } = useRadioPlayer();

  // Check if bubble is over the close zone
  const checkCloseZone = useCallback((left: number, top: number) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const bubbleCenterX = left + BUBBLE_SIZE / 2;
    const bubbleCenterY = top + BUBBLE_SIZE / 2;
    const distance = Math.sqrt(
      Math.pow(bubbleCenterX - centerX, 2) + Math.pow(bubbleCenterY - centerY, 2)
    );
    return distance < CLOSE_ZONE_SIZE;
  }, []);

  // Handle viewport resize and ensure visible on mount
  useEffect(() => {
    const ensureVisible = () => {
      setPosition(prev => {
        const maxLeft = window.innerWidth - BUBBLE_SIZE - MARGIN;
        const maxTop = window.innerHeight - BUBBLE_SIZE - 120; // Leave room for bottom nav
        const minTop = MARGIN + 80; // Leave room for header

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
    const maxTop = window.innerHeight - BUBBLE_SIZE - 120; // Leave room for bottom nav
    const minTop = MARGIN + 80; // Leave room for header
    return {
      left: Math.min(Math.max(left, MARGIN), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop),
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
      if (!showCloseZone) setShowCloseZone(true);
    }

    const newPos = clampPosition(
      dragStartRef.current.left + deltaX,
      dragStartRef.current.top + deltaY
    );
    setPosition(newPos);

    // Check if over close zone
    if (hasDraggedRef.current) {
      setIsOverCloseZone(checkCloseZone(newPos.left, newPos.top));
    }
  }, [isExpanded, clampPosition, checkCloseZone, showCloseZone]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    e.currentTarget.releasePointerCapture(e.pointerId);

    const dragDuration = Date.now() - dragStartTimeRef.current;
    const wasDragged = hasDraggedRef.current;

    // Check if dropped on close zone
    if (wasDragged && isOverCloseZone) {
      // Stop playback and reset position
      stopPlayback();
      setPosition(getSavedPosition());
      setIsOverCloseZone(false);
      setShowCloseZone(false);
      dragStartRef.current = null;
      setIsDragging(false);
      return;
    }

    // Save final position
    savePosition(position.left, position.top);

    // If it was a tap (short duration, no significant movement), expand
    if (!wasDragged && dragDuration < 300) {
      setIsExpanded(true);
    }

    dragStartRef.current = null;
    setIsDragging(false);
    setIsOverCloseZone(false);
    setShowCloseZone(false);
  }, [position, isOverCloseZone, stopPlayback]);

  const handleGoToRadio = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(false);
    navigate('/radio');
  }, [navigate]);

  // Pages where the bubble should NOT appear (only landing page)
  const hiddenPaths = ['/'];
  const shouldHide = hiddenPaths.includes(location.pathname);

  // Show bubble on all authenticated pages (even without currentStation)
  if (shouldHide) return null;

  return (
    <>
      {/* Close zone - shown when dragging */}
      <AnimatePresence>
        {isDragging && showCloseZone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[65] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: isOverCloseZone ? 1.2 : 1,
                backgroundColor: isOverCloseZone ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                "border-2 border-dashed",
                isOverCloseZone ? "border-red-500" : "border-white/50"
              )}
            >
              <X className={cn("w-8 h-8", isOverCloseZone ? "text-red-500" : "text-white/70")} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            currentStation ? (
              // Expanded Card View with station playing
              <motion.div
                key="expanded-playing"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full bg-background/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-border overflow-hidden"
              >
                {/* Header with artwork - tap to navigate to radio page for full player */}
                <div
                  className="relative h-24 overflow-hidden cursor-pointer"
                  onClick={() => { setIsExpanded(false); navigate('/radio'); }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentStation.artwork})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/90" />
                  </button>
                  <div className="absolute bottom-2 left-3 right-3">
                    {currentStation.isLive && (
                      <span className="px-1.5 py-0.5 bg-red-500 rounded text-[10px] font-semibold text-white inline-flex items-center gap-1 mb-0.5">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-foreground truncate">{currentStation.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{currentStation.description}</p>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={skipToPrevious} className="p-2 rounded-full hover:bg-secondary transition-colors"><SkipBack className="w-5 h-5" /></button>
                    <button onClick={togglePlayPause} disabled={isLoading} className={cn("p-3 rounded-full transition-all", isPlaying ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80")}>
                      {isLoading ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <button onClick={skipToNext} className="p-2 rounded-full hover:bg-secondary transition-colors"><SkipForward className="w-5 h-5" /></button>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <button onClick={toggleMute} className="p-2 rounded-full hover:bg-secondary transition-colors">{isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4" />}</button>
                    <button onClick={shufflePlay} className="p-2 rounded-full hover:bg-secondary transition-colors flex items-center gap-1.5"><Shuffle className="w-4 h-4" /><span className="text-xs">Shuffle</span></button>
                    <button onClick={(e) => handleGoToRadio(e)} className="p-2 rounded-full hover:bg-secondary transition-colors"><ChevronUp className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Expanded Card View - no station, quick radio options
              <motion.div
                key="expanded-empty"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full bg-background/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-border overflow-hidden p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Quick Radio</h3>
                  <button onClick={() => setIsExpanded(false)} className="p-1 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  <button onClick={() => { shufflePlay(); setIsExpanded(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                    <Shuffle className="w-5 h-5 text-primary" /><span className="text-sm font-medium">Shuffle Play</span>
                  </button>
                  <button onClick={(e) => handleGoToRadio(e)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <Radio className="w-5 h-5" /><span className="text-sm font-medium">Open Radio</span>
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            // Collapsed Bubble View
            <motion.div
              key="collapsed"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn("relative w-16 h-16 rounded-full flex items-center justify-center", "bg-black/50 backdrop-blur-xl", "border-2 border-white/30", "shadow-xl shadow-black/30", "select-none")}
            >
              {currentStation && <div className="absolute inset-2 rounded-full bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${currentStation.artwork})` }} />}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-black/30" />
              <div className="relative z-10">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/90 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-0.5">{[1, 2, 3].map((i) => (<motion.div key={i} className="w-1.5 bg-white/95 rounded-full" animate={{ height: [8, 18, 8] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />))}</div>
                ) : (
                  <Radio className="w-6 h-6 text-white/95" />
                )}
              </div>
              {currentStation?.isLive && isPlaying && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white/50 animate-pulse" />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default RadioBubble;
