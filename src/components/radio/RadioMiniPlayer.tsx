import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { MiniVisualizer, GlowEffect, SpectrumBars } from './AudioVisualizer';

const PLAYER_WIDTH = 320;
const PLAYER_HEIGHT = 72;
const MARGIN = 16;

// Get saved position from localStorage
const getSavedPosition = (): { left: number; top: number } => {
  if (typeof window === 'undefined') {
    return { left: MARGIN, top: 100 };
  }

  try {
    const saved = localStorage.getItem('radioMiniPlayerPositionV1');
    if (saved) {
      const pos = JSON.parse(saved);
      const maxLeft = window.innerWidth - PLAYER_WIDTH - MARGIN;
      const maxTop = window.innerHeight - PLAYER_HEIGHT - 120;
      const minTop = MARGIN + 80;
      return {
        left: Math.min(Math.max(pos.left ?? MARGIN, MARGIN), maxLeft),
        top: Math.min(Math.max(pos.top ?? maxTop, minTop), maxTop),
      };
    }
  } catch (e) {
    // Ignore errors
  }
  
  // Default: bottom left, above bottom nav
  return {
    left: MARGIN,
    top: typeof window !== 'undefined' ? window.innerHeight - PLAYER_HEIGHT - 140 : 500,
  };
};

const savePosition = (left: number, top: number) => {
  try {
    localStorage.setItem('radioMiniPlayerPositionV1', JSON.stringify({ left, top }));
  } catch (e) {
    // Ignore errors
  }
};

export const RadioMiniPlayer: React.FC = () => {
  const [position, setPosition] = useState(getSavedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const hasDraggedRef = useRef(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    currentStation,
    isPlaying,
    isLoading,
    togglePlayPause,
    expandPlayer
  } = useRadioPlayer();

  // Handle viewport resize
  useEffect(() => {
    const ensureVisible = () => {
      setPosition(prev => {
        const maxLeft = window.innerWidth - PLAYER_WIDTH - MARGIN;
        const maxTop = window.innerHeight - PLAYER_HEIGHT - 120;
        const minTop = MARGIN + 80;

        const clampedLeft = Math.min(Math.max(prev.left, MARGIN), maxLeft);
        const clampedTop = Math.min(Math.max(prev.top, minTop), maxTop);

        if (Math.abs(clampedLeft - prev.left) > 1 || Math.abs(clampedTop - prev.top) > 1) {
          return { left: clampedLeft, top: clampedTop };
        }
        return prev;
      });
    };

    ensureVisible();
    window.addEventListener('resize', ensureVisible);
    return () => window.removeEventListener('resize', ensureVisible);
  }, []);

  const clampPosition = useCallback((left: number, top: number) => {
    const maxLeft = window.innerWidth - PLAYER_WIDTH - MARGIN;
    const maxTop = window.innerHeight - PLAYER_HEIGHT - 120;
    const minTop = MARGIN + 80;
    return {
      left: Math.min(Math.max(left, MARGIN), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop),
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      left: position.left,
      top: position.top,
    };
    hasDraggedRef.current = false;
    setIsDragging(true);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
    }
    
    const newPos = clampPosition(
      dragStartRef.current.left + deltaX,
      dragStartRef.current.top + deltaY
    );
    setPosition(newPos);
  }, [clampPosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    savePosition(position.left, position.top);
    dragStartRef.current = null;
    setIsDragging(false);
  }, [position]);

  const handleExpandClick = useCallback(() => {
    // If on radio page, expand the player. Otherwise navigate to radio
    if (location.pathname === '/radio') {
      expandPlayer();
    } else {
      navigate('/radio');
    }
  }, [location.pathname, expandPlayer, navigate]);

  if (!currentStation) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed z-[55] touch-none",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        left: position.left,
        top: position.top,
        width: PLAYER_WIDTH,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden">
        {/* Glow effect on beat */}
        <GlowEffect
          isPlaying={isPlaying}
          className="rounded-2xl"
          color="rgba(139, 92, 246, 0.3)"
        />

        {/* Spectrum bars at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden opacity-60">
          <SpectrumBars
            isPlaying={isPlaying}
            barCount={40}
            height={8}
            color="rgba(139, 92, 246, 0.6)"
          />
        </div>

        <div className="px-4 py-3 relative z-10">
          <div className="flex items-center gap-3">
            {/* Artwork */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                if (!hasDraggedRef.current) {
                  e.stopPropagation();
                  handleExpandClick();
                }
              }}
              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer shrink-0 shadow-lg"
            >
              <img
                src={currentStation.artwork}
                alt={currentStation.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <MiniVisualizer
                    isPlaying={isPlaying}
                    variant="bars"
                    color="white"
                    className="h-4"
                  />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={(e) => {
                if (!hasDraggedRef.current) {
                  e.stopPropagation();
                  handleExpandClick();
                }
              }}
            >
              <div className="flex items-center gap-2">
                {currentStation.isLive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm truncate">{currentStation.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentStation.description}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Play/Pause */}
              <Button
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="w-11 h-11 rounded-full bg-primary text-primary-foreground"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              {/* Expand */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandClick();
                }}
                className="w-9 h-9"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
