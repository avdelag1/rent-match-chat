import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  X,
  ChevronUp,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const BUBBLE_SIZE = 64;
const MARGIN = 16;

// Get safe area insets from CSS variables
const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  const parseInset = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  return {
    top: parseInset(style.getPropertyValue('--safe-top')),
    bottom: parseInset(style.getPropertyValue('--safe-bottom')),
    left: parseInset(style.getPropertyValue('--safe-left')),
    right: parseInset(style.getPropertyValue('--safe-right')),
  };
};

// Safe default that works before window is ready
const getDefaultPosition = (): { left: number; top: number } => {
  // Use a safe default - bottom right area, will be adjusted on mount
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const safeArea = getSafeAreaInsets();

  // Position in bottom-right, accounting for safe areas
  const availableWidth = windowWidth - safeArea.left - safeArea.right;
  const availableHeight = windowHeight - safeArea.top - safeArea.bottom;

  return {
    left: Math.max(safeArea.left + availableWidth - BUBBLE_SIZE - MARGIN, safeArea.left + MARGIN),
    top: Math.max(safeArea.top + availableHeight - 180 - BUBBLE_SIZE, safeArea.top + 100),
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
      const safeArea = getSafeAreaInsets();

      // Validate position is within viewport, accounting for safe areas
      // Leave space for bottom nav (~120px) and header (~80px)
      const maxLeft = window.innerWidth - safeArea.right - BUBBLE_SIZE - MARGIN;
      const maxTop = window.innerHeight - safeArea.bottom - BUBBLE_SIZE - 120; // Leave room for bottom nav
      const minLeft = safeArea.left + MARGIN;
      const minTop = safeArea.top + MARGIN + 80; // Leave room for header

      return {
        left: Math.min(Math.max(pos.left ?? maxLeft, minLeft), maxLeft),
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

// Close zone dimensions - at bottom of screen
const CLOSE_ZONE_WIDTH = 120;
const CLOSE_ZONE_HEIGHT = 80;

// Get bubble visibility state from localStorage
const getBubbleVisibility = (): boolean => {
  try {
    const saved = localStorage.getItem('radioBubbleVisible');
    return saved === null ? true : JSON.parse(saved);
  } catch {
    return true;
  }
};

// Save bubble visibility state to localStorage
const saveBubbleVisibility = (visible: boolean) => {
  try {
    localStorage.setItem('radioBubbleVisible', JSON.stringify(visible));
  } catch {
    // Ignore errors
  }
};

export const RadioBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(getSavedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverCloseZone, setIsOverCloseZone] = useState(false);
  const [showCloseZone, setShowCloseZone] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(getBubbleVisibility);
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
    expandPlayer,
  } = useRadioPlayer();

  // Check if bubble is over the close zone (at bottom center of screen)
  const checkCloseZone = useCallback((left: number, top: number) => {
    const bubbleCenterX = left + BUBBLE_SIZE / 2;
    const bubbleCenterY = top + BUBBLE_SIZE / 2;
    const safeArea = getSafeAreaInsets();

    // Close zone is at bottom center of screen, accounting for safe areas
    const availableWidth = window.innerWidth - safeArea.left - safeArea.right;
    const zoneLeft = safeArea.left + (availableWidth - CLOSE_ZONE_WIDTH) / 2;
    const zoneRight = zoneLeft + CLOSE_ZONE_WIDTH;
    const zoneTop = window.innerHeight - safeArea.bottom - CLOSE_ZONE_HEIGHT - 20; // 20px from safe area bottom
    const zoneBottom = window.innerHeight - safeArea.bottom - 20;

    return (
      bubbleCenterX >= zoneLeft &&
      bubbleCenterX <= zoneRight &&
      bubbleCenterY >= zoneTop &&
      bubbleCenterY <= zoneBottom
    );
  }, []);

  // Handle viewport resize and ensure visible on mount
  useEffect(() => {
    const ensureVisible = () => {
      setPosition(prev => {
        const safeArea = getSafeAreaInsets();
        const maxLeft = window.innerWidth - safeArea.right - BUBBLE_SIZE - MARGIN;
        const maxTop = window.innerHeight - safeArea.bottom - BUBBLE_SIZE - 120; // Leave room for bottom nav
        const minLeft = safeArea.left + MARGIN;
        const minTop = safeArea.top + MARGIN + 80; // Leave room for header

        // Calculate clamped position
        const clampedLeft = Math.min(Math.max(prev.left, minLeft), maxLeft);
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
  // When dragging, allow bubble to reach the close zone at the bottom
  const clampPosition = useCallback((left: number, top: number, isDraggingToClose = false) => {
    const safeArea = getSafeAreaInsets();
    const maxLeft = window.innerWidth - safeArea.right - BUBBLE_SIZE - MARGIN;
    // When dragging, allow bubble to go lower to reach the close zone
    const maxTop = isDraggingToClose
      ? window.innerHeight - safeArea.bottom - BUBBLE_SIZE - 20  // Allow reaching close zone (20px from bottom)
      : window.innerHeight - safeArea.bottom - BUBBLE_SIZE - 120; // Leave room for bottom nav normally
    const minLeft = safeArea.left + MARGIN;
    const minTop = safeArea.top + MARGIN + 80; // Leave room for header
    return {
      left: Math.min(Math.max(left, minLeft), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop),
    };
  }, []);

  // Unified pointer handlers for both mouse and touch
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
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
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Only count as drag if moved more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
      if (!showCloseZone) setShowCloseZone(true);
    }

    // Allow reaching close zone during drag (isDraggingToClose = true)
    const newPos = clampPosition(
      dragStartRef.current.left + deltaX,
      dragStartRef.current.top + deltaY,
      true // Allow bubble to reach close zone while dragging
    );
    setPosition(newPos);

    // Check if over close zone
    if (hasDraggedRef.current) {
      setIsOverCloseZone(checkCloseZone(newPos.left, newPos.top));
    }
  }, [clampPosition, checkCloseZone, showCloseZone]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    e.currentTarget.releasePointerCapture(e.pointerId);

    const dragDuration = Date.now() - dragStartTimeRef.current;
    const wasDragged = hasDraggedRef.current;

    // Check if dropped on close zone
    if (wasDragged && isOverCloseZone) {
      // Stop playback, hide bubble, and reset position
      stopPlayback();
      setIsBubbleVisible(false);
      saveBubbleVisibility(false);
      setPosition(getSavedPosition());
      setIsOverCloseZone(false);
      setShowCloseZone(false);
      setIsExpanded(false);
      dragStartRef.current = null;
      setIsDragging(false);
      return;
    }

    // Snap back to valid position (above bottom nav) if not on close zone
    // Use isDraggingToClose = false to enforce normal bounds
    const finalPos = clampPosition(position.left, position.top, false);
    setPosition(finalPos);
    savePosition(finalPos.left, finalPos.top);

    // If it was a tap (short duration, no significant movement) and not expanded, expand
    if (!wasDragged && dragDuration < 300 && !isExpanded) {
      setIsExpanded(true);
    }

    dragStartRef.current = null;
    setIsDragging(false);
    setIsOverCloseZone(false);
    setShowCloseZone(false);
  }, [position, isOverCloseZone, stopPlayback, isExpanded, clampPosition]);

  const handleGoToRadio = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(false);
    // If on radio page, expand the player. Otherwise navigate to radio
    if (location.pathname === '/radio') {
      expandPlayer();
    } else {
      navigate('/radio');
    }
  }, [location.pathname, expandPlayer, navigate]);

  // Show bubble when a station starts playing
  useEffect(() => {
    if (currentStation && !isBubbleVisible) {
      setIsBubbleVisible(true);
      saveBubbleVisibility(true);
    }
  }, [currentStation, isBubbleVisible]);

  // Pages where the bubble should NOT appear (only landing page)
  const hiddenPaths = ['/'];
  const shouldHide = hiddenPaths.includes(location.pathname);

  // Hide bubble if on landing page or if explicitly closed
  if (shouldHide || !isBubbleVisible) return null;

  return (
    <>
      {/* Close zone - shown at bottom when dragging */}
      <AnimatePresence>
        {isDragging && showCloseZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-[65] pointer-events-none"
            style={{
              left: '50%',
              bottom: 20,
              transform: 'translateX(-50%)',
            }}
          >
            <motion.div
              animate={{
                scale: isOverCloseZone ? 1.15 : 1,
                backgroundColor: isOverCloseZone ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 0, 0, 0.15)',
              }}
              className={cn(
                "flex items-center justify-center rounded-2xl backdrop-blur-sm",
                "border-2 border-dashed",
                isOverCloseZone ? "border-red-500" : "border-white/40"
              )}
              style={{
                width: CLOSE_ZONE_WIDTH,
                height: CLOSE_ZONE_HEIGHT,
              }}
            >
              <X
                className={cn(
                  "w-10 h-10 transition-colors",
                  isOverCloseZone ? "text-red-500" : "text-white/60"
                )}
                strokeWidth={2.5}
              />
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

      {/* Floating Bubble - Uses absolute left/top positioning when collapsed, centered when expanded */}
      <motion.div
        className={cn(
          "fixed z-[70]",
          !isExpanded && "touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          left: isExpanded ? '50%' : position.left,
          top: isExpanded ? '50%' : position.top,
          transform: isExpanded ? 'translate(-50%, -50%)' : undefined,
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
                {/* Drag handle - grab to move */}
                <div
                  className="h-6 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                {/* Header with artwork - tap to navigate to radio page for full player */}
                <div
                  className="relative h-20 overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (!hasDraggedRef.current) {
                      setIsExpanded(false);
                      if (location.pathname === '/radio') {
                        expandPlayer();
                      } else {
                        navigate('/radio');
                      }
                    }
                  }}
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
                className="w-full bg-background/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-border overflow-hidden"
              >
                {/* Drag handle - grab to move */}
                <div
                  className="h-6 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Quick Radio</h3>
                    <button onClick={() => setIsExpanded(false)} className="p-1 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => { shufflePlay(); setIsExpanded(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                      <Shuffle className="w-5 h-5 text-primary" /><span className="text-sm font-medium">Shuffle Play</span>
                    </button>
                    <button onClick={(e) => handleGoToRadio(e)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                      <Headphones className="w-5 h-5" /><span className="text-sm font-medium">Open Radio</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          ) : (
            // Collapsed Bubble View - Modern Glassmorphism Design
            <motion.div
              key="collapsed"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                "relative w-16 h-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br from-primary/90 via-primary to-primary/80",
                "backdrop-blur-2xl",
                "border border-white/20",
                "shadow-2xl shadow-primary/40",
                "select-none",
                "overflow-hidden"
              )}
            >
              {/* Animated background glow - only when playing */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/10"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Album art background when playing */}
              {currentStation && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url(${currentStation.artwork})` }}
                />
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/70 to-primary/90" />

              {/* Icon/Animation */}
              <div className="relative z-10">
                {isLoading ? (
                  <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-[3px]">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-[4px] bg-white rounded-full"
                        animate={{ height: [6, 20, 10, 16, 6] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.12,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Headphones className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
                )}
              </div>

              {/* Subtle inner shadow */}
              <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none" />

              {/* Live indicator */}
              {currentStation?.isLive && isPlaying && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-primary flex items-center justify-center"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default RadioBubble;
