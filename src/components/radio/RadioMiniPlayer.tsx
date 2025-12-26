import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

export const RadioMiniPlayer: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    togglePlayPause,
    expandPlayer
  } = useRadioPlayer();

  if (!currentStation) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-xl border-t border-border/50",
        "pb-[calc(var(--safe-bottom)+8px)]"
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Artwork */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={expandPlayer}
            className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer shrink-0 shadow-lg"
          >
            <img
              src={currentStation.artwork}
              alt={currentStation.name}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-white rounded-full"
                      animate={{ height: [6, 12, 6] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={expandPlayer}
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
              onClick={togglePlayPause}
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
              onClick={expandPlayer}
              className="w-9 h-9"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
