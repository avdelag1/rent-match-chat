import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Moon,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useRadioPlayer, AVAILABLE_SKINS, RadioSkin } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

export const RadioCompactPlayer: React.FC = () => {
  const {
    currentStation,
    currentSkin,
    setSkin,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    sleepTimer,
    error,
    togglePlayPause,
    setVolume,
    toggleMute,
    toggleFavorite,
    isFavorite,
    collapsePlayer,
    getRemainingTime,
    skipToNext,
    skipToPrevious,
  } = useRadioPlayer();

  const [showVolume, setShowVolume] = useState(false);

  if (!currentStation) return null;

  const isFav = isFavorite(currentStation.id);
  const remainingTime = getRemainingTime();
  const remainingMinutes = Math.ceil(remainingTime / 60000);
  const skinConfig = AVAILABLE_SKINS.find(s => s.id === currentSkin) || AVAILABLE_SKINS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-[calc(var(--safe-top)+8px)] pb-3 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={collapsePlayer}>
          <ChevronDown className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold">Now Playing</h1>
        <div className="w-10" />
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Player Card with Skin Gradient */}
          <motion.div
            className={cn(
              "relative rounded-3xl p-6 overflow-hidden",
              `bg-gradient-to-br ${skinConfig.gradient}`
            )}
          >
            {/* Artwork */}
            <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden shadow-2xl mb-6">
              <img
                src={currentStation.artwork}
                alt={currentStation.name}
                className="w-full h-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {isPlaying && !isLoading && (
                <div className="absolute bottom-2 right-2 flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      animate={{ height: [8, 16, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Station Info */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground truncate">{currentStation.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{currentStation.description}</p>
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              {sleepTimer && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Moon className="w-3 h-3" />
                  <span>Sleep in {remainingMinutes}m</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(currentStation.id)}
                className="w-10 h-10"
              >
                <Heart className={cn("w-5 h-5", isFav && "text-red-500 fill-red-500")} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipToPrevious}
                className="w-12 h-12"
              >
                <SkipBack className="w-6 h-6" />
              </Button>

              <Button
                onClick={togglePlayPause}
                size="icon"
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipToNext}
                className="w-12 h-12"
              >
                <SkipForward className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVolume(!showVolume)}
                className="w-10 h-10"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Volume Slider */}
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 mt-4 px-4">
                    <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={([val]) => setVolume(val / 100)}
                      max={100}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Skin Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground px-1">Player Skins</h3>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_SKINS.map((skin) => {
                const isSelected = currentSkin === skin.id;
                return (
                  <motion.button
                    key={skin.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSkin(skin.id)}
                    className={cn(
                      "relative p-3 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    {/* Gradient Preview */}
                    <div
                      className={cn(
                        "w-full h-12 rounded-lg mb-2 flex items-center justify-center text-xl",
                        `bg-gradient-to-br ${skin.gradient}`
                      )}
                    >
                      {skin.emoji}
                    </div>

                    {/* Info */}
                    <h4 className="font-semibold text-xs">{skin.name}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{skin.description}</p>

                    {/* Selected Check */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Safe bottom padding */}
      <div className="h-[var(--safe-bottom)]" />
    </motion.div>
  );
};
