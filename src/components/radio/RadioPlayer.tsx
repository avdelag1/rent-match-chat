import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Moon,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

export const RadioPlayer: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    sleepTimer,
    togglePlayPause,
    setVolume,
    toggleMute,
    toggleFavorite,
    isFavorite,
    collapsePlayer,
    getRemainingTime,
  } = useRadioPlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentStation) return null;

  const isFav = isFavorite(currentStation.id);
  const remainingTime = getRemainingTime();
  const remainingMinutes = Math.ceil(remainingTime / 60000);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
        style={{ backgroundImage: `url(${currentStation.artwork})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-[calc(var(--safe-top)+12px)] pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={collapsePlayer}
          className="w-10 h-10"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Now Playing
          </p>
          {sleepTimer && (
            <p className="text-xs text-primary flex items-center justify-center gap-1">
              <Moon className="w-3 h-3" />
              Sleep in {remainingMinutes}m
            </p>
          )}
        </div>

        <div className="w-10" /> {/* Spacer for balanced header */}
      </header>

      {/* Main Content - Album Art */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-[280px] flex flex-col items-center">
          {/* Album Art */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={currentStation.artwork}
              alt={currentStation.name}
              className="w-full h-full object-cover"
            />

            {/* Playing Animation Overlay */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white/80 rounded-full"
                      animate={{ height: [20, 40, 20] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>

          {/* Vinyl effect decoration */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute w-72 h-72 rounded-full border border-white/5 -z-10"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="relative z-10 px-6 pb-[calc(var(--safe-bottom)+16px)]">
        {/* Station Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            {currentStation.isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full text-[10px] font-bold text-red-500">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {currentStation.country}
            </span>
          </div>
          <h2 className="text-xl font-bold truncate">{currentStation.name}</h2>
          <p className="text-sm text-muted-foreground truncate">
            {currentStation.description}
          </p>
        </div>

        {/* Volume Slider */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 px-2">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-12 h-12"
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-all",
                isFav && "text-red-500 fill-red-500"
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 opacity-50"
            disabled
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 opacity-50"
            disabled
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className={cn("w-12 h-12", showVolumeSlider && "text-primary")}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* External Link */}
        {currentStation.website && (
          <div className="mt-4 text-center">
            <a
              href={currentStation.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Visit Station Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </footer>
    </motion.div>
  );
};
