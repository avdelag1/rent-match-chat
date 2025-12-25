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
  Palette,
  Radio,
  Disc3,
  Waves,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useRadioPlayer, RadioSkin, AVAILABLE_SKINS } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';
import { RadioSkinSelector } from './RadioSkinSelector';

interface SkinProps {
  currentStation: NonNullable<ReturnType<typeof useRadioPlayer>['currentStation']>;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  sleepTimer: number | null;
  error: string | null;
  isFav: boolean;
  remainingMinutes: number;
  showVolumeSlider: boolean;
  setShowVolumeSlider: (show: boolean) => void;
  togglePlayPause: () => void;
  setVolume: (v: number) => void;
  toggleFavorite: (id: string) => void;
  collapsePlayer: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  onOpenSkinSelector: () => void;
}

// ========================================
// Default/Minimal Skin - Compact & Always Fits
// ========================================
const DefaultSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[calc(var(--safe-top)+12px)] pb-2">
        <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-10 h-10 text-white/80">
          <ChevronDown className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          {sleepTimer && (
            <span className="text-xs text-white/60 flex items-center gap-1">
              <Moon className="w-3 h-3" /> {remainingMinutes}m
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-10 h-10 text-white/80">
            <Palette className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        {/* Album Art */}
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl mb-6">
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
          {currentStation.isLive && (
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 rounded text-[10px] font-semibold text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Station Info */}
        <h2 className="text-xl font-bold text-white text-center truncate w-full">{currentStation.name}</h2>
        <p className="text-sm text-white/60 text-center truncate w-full mb-2">{currentStation.description}</p>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 my-6">
          <button 
            onClick={skipToPrevious}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400 transition-colors"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>
          
          <button 
            onClick={skipToNext}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 w-full max-w-xs mb-4">
          <button onClick={() => setVolume(0)} className="text-white/60">
            <VolumeX className="w-4 h-4" />
          </button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={([val]) => setVolume(val / 100)}
            max={100}
            className="flex-1"
          />
          <button onClick={() => setVolume(1)} className="text-white/60">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(currentStation.id)}
          className="p-3 text-white/70 hover:text-red-400 transition-colors"
        >
          <Heart className={cn("w-6 h-6", isFav && "text-red-500 fill-red-500")} />
        </button>
      </div>
    </motion.div>
  );
};

// ========================================
// iPod Classic Skin
// ========================================
const IpodClassicSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 overflow-y-auto">
      {/* iPod Body */}
      <div className="relative w-full max-w-[320px] bg-gradient-to-b from-gray-100 via-white to-gray-200 rounded-[40px] shadow-2xl border-4 border-gray-300 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-8 h-8 text-gray-600">
            <ChevronDown className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {sleepTimer && (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Moon className="w-3 h-3" /> {remainingMinutes}m
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-8 h-8 text-gray-600">
              <Palette className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Screen */}
        <div className="mx-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 shadow-inner border border-gray-700">
          {/* Album Art */}
          <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-black">
            <img src={currentStation.artwork} alt={currentStation.name} className="w-full h-full object-cover" />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="text-center">
            <h3 className="text-white font-bold text-sm truncate">{currentStation.name}</h3>
            <p className="text-gray-400 text-xs truncate">{currentStation.description}</p>
            {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
          </div>

          {/* Progress bar (decorative) */}
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              animate={{ width: isPlaying ? ['0%', '100%'] : '0%' }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Click Wheel */}
        <div className="relative mx-auto my-6 w-48 h-48">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg border border-gray-400">
            {/* Menu Button */}
            <button
              onClick={collapsePlayer}
              className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-gray-800"
            >
              Menu
            </button>

            {/* Previous Button */}
            <button
              onClick={skipToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              onClick={skipToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Play/Pause indicator */}
            <button
              onClick={togglePlayPause}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-gray-600 hover:text-gray-800"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Button */}
          <button
            onClick={togglePlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 shadow-inner border border-gray-300 hover:from-gray-50 hover:to-gray-100 transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-gray-700" />
            ) : (
              <Play className="w-6 h-6 text-gray-700 ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-6 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-10 h-10 text-gray-600"
          >
            <Heart className={cn("w-5 h-5", isFav && "text-red-500 fill-red-500")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-10 h-10 text-gray-600"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        {/* Volume Slider Popup */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 rounded-lg p-3 shadow-xl"
            >
              <div className="flex items-center gap-2 w-40">
                <VolumeX className="w-3 h-3 text-gray-400" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-3 h-3 text-gray-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ========================================
// Game Boy Skin
// ========================================
const GameBoySkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-950 p-4 overflow-y-auto">
      {/* Game Boy Body */}
      <div className="relative w-full max-w-[300px] bg-[#c4c4c4] rounded-[20px] rounded-br-[60px] shadow-2xl border-4 border-[#8b8b8b] overflow-hidden">
        {/* Top Section */}
        <div className="bg-[#8b8b8b] h-6 flex items-center px-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
          <span className="mx-auto text-[8px] font-bold text-gray-600 tracking-widest">RADIO BOY</span>
          <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-6 h-6 text-gray-600">
            <Palette className="w-3 h-3" />
          </Button>
        </div>

        {/* Screen Bezel */}
        <div className="mx-4 mt-4 p-3 bg-[#5a5a5a] rounded-lg shadow-inner">
          {/* Power LED */}
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-2 h-2 rounded-full", isPlaying ? "bg-red-500 animate-pulse" : "bg-red-900")} />
            <span className="text-[8px] text-gray-400 uppercase">Power</span>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-6 h-6 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Green Screen */}
          <div className="bg-[#9bbc0f] rounded p-3 shadow-inner border-4 border-[#306230]">
            {/* Pixel Art Style Display */}
            <div className="font-mono text-[#0f380f]">
              {/* Station Icon (8-bit style) */}
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-[#8bac0f] rounded border-2 border-[#0f380f] p-1 overflow-hidden">
                  <img
                    src={currentStation.artwork}
                    alt=""
                    className="w-full h-full object-cover pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              {/* Station Name */}
              <div className="text-center text-xs font-bold uppercase tracking-tight truncate">
                {currentStation.name}
              </div>

              {/* Status */}
              <div className="text-center text-[10px] mt-1 flex items-center justify-center gap-1">
                {isLoading ? (
                  <>LOADING<span className="animate-pulse">...</span></>
                ) : isPlaying ? (
                  <>
                    <span className="inline-block animate-bounce">♪</span>
                    NOW PLAYING
                    <span className="inline-block animate-bounce delay-100">♫</span>
                  </>
                ) : (
                  'PAUSED'
                )}
              </div>

              {/* Error */}
              {error && <div className="text-[8px] text-center mt-1 text-[#0f380f]">{error}</div>}

              {/* Sleep Timer */}
              {sleepTimer && (
                <div className="text-[8px] text-center mt-1">SLEEP: {remainingMinutes}M</div>
              )}
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center my-2">
          <span className="text-[10px] font-bold italic text-[#4a4a4a]">RadioTendo</span>
        </div>

        {/* Controls Section */}
        <div className="flex justify-between items-start px-6 py-4">
          {/* D-Pad */}
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#3a3a3a] rounded-t flex items-center justify-center">
              <button onClick={skipToPrevious} className="text-gray-600 hover:text-gray-400">
                <SkipBack className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#3a3a3a] rounded-b flex items-center justify-center">
              <button onClick={skipToNext} className="text-gray-600 hover:text-gray-400">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#3a3a3a] rounded-l flex items-center justify-center">
              <button onClick={() => setVolume(Math.max(0, volume - 0.1))} className="text-gray-600 hover:text-gray-400">
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#3a3a3a] rounded-r flex items-center justify-center">
              <button onClick={() => setVolume(Math.min(1, volume + 0.1))} className="text-gray-600 hover:text-gray-400">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#3a3a3a] rounded" />
          </div>

          {/* A/B Buttons */}
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-4 -rotate-12">
              <button
                onClick={() => toggleFavorite(currentStation.id)}
                className="w-12 h-12 rounded-full bg-[#9b2257] shadow-lg border-2 border-[#7a1a45] flex items-center justify-center text-white font-bold text-xs hover:bg-[#b52a67] transition-colors"
              >
                {isFav ? '♥' : 'B'}
              </button>
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-[#9b2257] shadow-lg border-2 border-[#7a1a45] flex items-center justify-center text-white font-bold text-xs hover:bg-[#b52a67] transition-colors"
              >
                {isPlaying ? '||' : 'A'}
              </button>
            </div>
            <div className="text-[8px] text-gray-500 mr-4">
              <span className="mr-6">B</span>
              <span>A</span>
            </div>
          </div>
        </div>

        {/* Select/Start */}
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={collapsePlayer}
            className="w-12 h-4 bg-[#5a5a5a] rounded-full shadow-inner text-[6px] text-gray-400 uppercase"
          >
            Select
          </button>
          <button
            onClick={togglePlayPause}
            className="w-12 h-4 bg-[#5a5a5a] rounded-full shadow-inner text-[6px] text-gray-400 uppercase"
          >
            Start
          </button>
        </div>

        {/* Speaker Grille */}
        <div className="absolute bottom-2 right-4 w-16">
          <div className="flex flex-col gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-0.5 bg-[#8b8b8b] rounded-full" style={{ width: `${100 - i * 10}%`, marginLeft: 'auto' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// Vintage Radio Skin
// ========================================
const VintageRadioSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-amber-950 to-stone-950 p-4 overflow-y-auto">
      {/* Radio Cabinet */}
      <div className="relative w-full max-w-[360px] bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900 rounded-3xl shadow-2xl border-8 border-amber-950 overflow-hidden"
        style={{ boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.3), 0 10px 40px rgba(0,0,0,0.5)' }}
      >
        {/* Wood Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
          }}
        />

        {/* Top Bar */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
          <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-8 h-8 text-amber-200/70">
            <ChevronDown className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {sleepTimer && (
              <span className="text-[10px] text-amber-200/70 flex items-center gap-1">
                <Moon className="w-3 h-3" /> {remainingMinutes}m
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-8 h-8 text-amber-200/70">
              <Palette className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dial Display */}
        <div className="relative mx-4 mb-4 bg-gradient-to-b from-amber-100 to-amber-50 rounded-xl p-4 shadow-inner border-2 border-amber-900/30">
          {/* Glass reflection */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

          {/* Frequency Display */}
          <div className="flex items-center justify-between text-amber-900/60 text-[8px] font-bold mb-2">
            <span>AM</span>
            <span>530</span>
            <span>800</span>
            <span>1200</span>
            <span>1600</span>
            <span>FM</span>
          </div>

          {/* Dial Needle */}
          <div className="relative h-2 bg-amber-200 rounded-full mb-3">
            <motion.div
              className="absolute top-0 w-1 h-4 bg-red-600 rounded-full -translate-y-1"
              animate={{ left: isPlaying ? ['20%', '80%', '50%'] : '50%' }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Station Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-amber-800" />
              {currentStation.isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-[8px] font-bold text-white">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  ON AIR
                </span>
              )}
            </div>
            <h3 className="text-amber-900 font-bold text-lg">{currentStation.name}</h3>
            <p className="text-amber-700 text-xs">{currentStation.description}</p>
            {error && <p className="text-red-600 text-[10px] mt-1">{error}</p>}
          </div>
        </div>

        {/* Fabric Speaker Grille */}
        <div className="mx-4 mb-4 h-32 rounded-xl overflow-hidden"
          style={{
            background: 'repeating-linear-gradient(45deg, #3d2817, #3d2817 2px, #4a3222 2px, #4a3222 4px)',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          {/* Sound Waves Animation */}
          {isPlaying && (
            <div className="h-full flex items-center justify-center gap-1">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-amber-500/30 rounded-full"
                  animate={{ height: [10, 40, 10] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Control Knobs */}
        <div className="flex justify-around items-center px-4 pb-6">
          {/* Volume Knob */}
          <div className="text-center">
            <motion.button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border-4 border-amber-900/50 shadow-lg flex items-center justify-center"
              style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.3)' }}
            >
              <div className="w-1 h-6 bg-amber-900/50 rounded-full"
                style={{ transform: `rotate(${(volume * 270) - 135}deg)` }}
              />
            </motion.button>
            <span className="text-[10px] text-amber-200/70 mt-1 block uppercase">Volume</span>
          </div>

          {/* Play Button */}
          <motion.button
            onClick={togglePlayPause}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gradient-to-b from-red-700 to-red-900 border-4 border-amber-900/50 shadow-lg flex items-center justify-center"
            style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.2)' }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-amber-100 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 text-amber-100" />
            ) : (
              <Play className="w-8 h-8 text-amber-100 ml-1" />
            )}
          </motion.button>

          {/* Tuning Knob */}
          <div className="text-center">
            <div className="flex gap-2">
              <motion.button
                onClick={skipToPrevious}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border-4 border-amber-900/50 shadow-lg flex items-center justify-center"
              >
                <SkipBack className="w-4 h-4 text-amber-900" />
              </motion.button>
              <motion.button
                onClick={skipToNext}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border-4 border-amber-900/50 shadow-lg flex items-center justify-center"
              >
                <SkipForward className="w-4 h-4 text-amber-900" />
              </motion.button>
            </div>
            <span className="text-[10px] text-amber-200/70 mt-1 block uppercase">Tuning</span>
          </div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-8 h-8 text-amber-200/70"
          >
            <Heart className={cn("w-4 h-4", isFav && "text-red-500 fill-red-500")} />
          </Button>
        </div>

        {/* Volume Slider Popup */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-amber-900 rounded-lg p-3 shadow-xl border border-amber-700"
            >
              <div className="flex items-center gap-2 w-40">
                <VolumeX className="w-3 h-3 text-amber-300" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-3 h-3 text-amber-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ========================================
// Walkman Skin
// ========================================
const WalkmanSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-4 overflow-y-auto">
      {/* Walkman Body */}
      <div className="relative w-full max-w-[300px] bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700 rounded-2xl shadow-2xl border-4 border-blue-800 overflow-hidden">
        {/* Metallic Texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%)', backgroundSize: '4px 4px' }}
        />

        {/* Top Controls */}
        <div className="relative flex items-center justify-between px-3 pt-3 pb-2">
          <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-7 h-7 text-blue-200">
            <ChevronDown className="w-4 h-4" />
          </Button>
          <span className="text-yellow-400 font-bold text-xs tracking-wider">WALKMAN</span>
          <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-7 h-7 text-blue-200">
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Cassette Window */}
        <div className="mx-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-2 shadow-inner border border-slate-700">
          {/* Cassette Tape */}
          <div className="relative bg-gradient-to-b from-slate-700 to-slate-800 rounded p-3 border border-slate-600">
            {/* Label Area */}
            <div className="bg-amber-100 rounded p-2 mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={currentStation.artwork}
                  alt=""
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-bold text-xs truncate">{currentStation.name}</h3>
                  <p className="text-slate-600 text-[10px] truncate">{currentStation.description}</p>
                </div>
              </div>
            </div>

            {/* Tape Reels */}
            <div className="flex justify-around items-center py-2">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-500" />
              </motion.div>

              {/* Tape Window */}
              <div className="w-16 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded border border-amber-600">
                {isPlaying && (
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-800"
                    animate={{ x: [-10, 10, -10] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>

              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-500" />
              </motion.div>
            </div>

            {/* Status */}
            {error && <p className="text-red-400 text-[10px] text-center">{error}</p>}
            {sleepTimer && (
              <p className="text-blue-300 text-[10px] text-center flex items-center justify-center gap-1">
                <Moon className="w-3 h-3" /> {remainingMinutes}m
              </p>
            )}
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex justify-center items-center gap-2 my-4 px-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={skipToPrevious}
            className="w-12 h-10 bg-gradient-to-b from-slate-300 to-slate-400 rounded border-2 border-slate-500 shadow-lg flex items-center justify-center"
          >
            <SkipBack className="w-5 h-5 text-slate-700" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="w-16 h-12 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded border-2 border-yellow-600 shadow-lg flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-slate-800" />
            ) : (
              <Play className="w-6 h-6 text-slate-800 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={skipToNext}
            className="w-12 h-10 bg-gradient-to-b from-slate-300 to-slate-400 rounded border-2 border-slate-500 shadow-lg flex items-center justify-center"
          >
            <SkipForward className="w-5 h-5 text-slate-700" />
          </motion.button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Volume Slider */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] text-blue-200 uppercase">Vol</span>
            <div className="relative h-3 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Favorite */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-8 h-8 text-blue-200 ml-2"
          >
            <Heart className={cn("w-4 h-4", isFav && "text-red-500 fill-red-500")} />
          </Button>
        </div>

        {/* Belt Clip Holes */}
        <div className="absolute top-1/2 -right-1 w-2 h-8 bg-blue-800 rounded-l" />
      </div>
    </div>
  );
};

// ========================================
// Beach Vibes Skin
// ========================================
const BeachSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-orange-400 via-pink-500 to-purple-600 overflow-y-auto">
      {/* Animated Waves Background */}
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.3))',
          }}
        />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{
              background: `rgba(59, 130, 246, ${0.2 + i * 0.1})`,
              borderRadius: '50% 50% 0 0',
            }}
            animate={{
              x: [-20, 20, -20],
              scaleY: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Sun */}
      <motion.div
        className="absolute top-20 right-8 w-24 h-24 rounded-full bg-gradient-to-b from-yellow-300 to-orange-400"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ boxShadow: '0 0 60px rgba(251, 191, 36, 0.5)' }}
      />

      {/* Palm Trees Silhouette */}
      <div className="absolute bottom-32 left-4 text-6xl opacity-30">🌴</div>
      <div className="absolute bottom-28 right-8 text-5xl opacity-20">🌴</div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-[calc(var(--safe-top)+12px)] pb-4">
        <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-10 h-10 text-white/80">
          <ChevronDown className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <p className="text-xs text-white/60 uppercase tracking-wider flex items-center gap-2">
            <Waves className="w-4 h-4" /> Beach Radio
          </p>
          {sleepTimer && (
            <p className="text-xs text-yellow-300 flex items-center justify-center gap-1">
              <Moon className="w-3 h-3" /> Sleep in {remainingMinutes}m
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-10 h-10 text-white/80">
          <Palette className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Album Art with Coconut/Shell Frame */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl border-8 border-yellow-200/30"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
        >
          <img
            src={currentStation.artwork}
            alt={currentStation.name}
            className="w-full h-full object-cover"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 border-4 border-yellow-300/50 rounded-full"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Station Info */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{currentStation.name}</h2>
          <p className="text-white/70">{currentStation.description}</p>
          {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
        </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 px-6 pb-[calc(var(--safe-bottom)+16px)]">
        {/* Action Buttons */}
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-12 h-12 text-white/80"
          >
            <Heart className={cn("w-6 h-6", isFav && "text-red-400 fill-red-400")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToPrevious}
            className="w-12 h-12 text-white/80"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="w-18 h-18 rounded-full bg-gradient-to-b from-yellow-300 to-orange-400 shadow-lg flex items-center justify-center"
            style={{ width: 72, height: 72, boxShadow: '0 4px 20px rgba(251, 191, 36, 0.5)' }}
          >
            {isLoading ? (
              <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToNext}
            className="w-12 h-12 text-white/80"
          >
            <SkipForward className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-12 h-12 text-white/80"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>

        {/* Volume Slider */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-3 px-2 max-w-xs mx-auto">
                <VolumeX className="w-4 h-4 text-white/60" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-white/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};

// ========================================
// UFO Alien Skin
// ========================================
const UfoSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-violet-950 to-slate-950 overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* UFO Beam */}
      {isPlaying && (
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-96"
          style={{
            background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0) 100%)',
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-[calc(var(--safe-top)+12px)] pb-4">
        <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-10 h-10 text-cyan-400">
          <ChevronDown className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <p className="text-xs text-cyan-300/60 uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> TRANSMISSION
          </p>
          {sleepTimer && (
            <p className="text-xs text-emerald-400 flex items-center justify-center gap-1">
              <Moon className="w-3 h-3" /> {remainingMinutes}m
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-10 h-10 text-cyan-400">
          <Palette className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Holographic Display */}
        <motion.div
          className="relative w-64 h-64 rounded-full"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ perspective: 1000 }}
        >
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border border-emerald-400/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center Display */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-b from-cyan-900/50 to-violet-900/50 backdrop-blur-lg border border-cyan-400/30 overflow-hidden flex items-center justify-center">
            <img
              src={currentStation.artwork}
              alt={currentStation.name}
              className="w-full h-full object-cover opacity-80"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Scanning Line */}
          {isPlaying && (
            <motion.div
              className="absolute inset-8 rounded-full overflow-hidden"
              style={{ pointerEvents: 'none' }}
            >
              <motion.div
                className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                animate={{ y: [-100, 200, -100] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Station Info */}
        <div className="text-center mt-6">
          <motion.h2
            className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentStation.name}
          </motion.h2>
          <p className="text-cyan-300/60 text-sm font-mono">{currentStation.country}</p>
          <p className="text-violet-300/40 text-xs mt-1">{currentStation.description}</p>
          {error && <p className="text-red-400 text-xs mt-2 font-mono">ERROR: {error}</p>}
        </div>

        {/* Frequency Display */}
        <div className="mt-4 flex items-center gap-2">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-cyan-400 rounded-full"
              animate={{ height: isPlaying ? [8, 24, 8] : 8 }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 px-6 pb-[calc(var(--safe-bottom)+16px)]">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-12 h-12 text-cyan-400/60 hover:text-cyan-400"
          >
            <Heart className={cn("w-6 h-6", isFav && "text-pink-500 fill-pink-500")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToPrevious}
            className="w-12 h-12 text-cyan-400/60 hover:text-cyan-400"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-cyan-500 to-emerald-600 shadow-lg flex items-center justify-center border-2 border-cyan-400/50"
            style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" />
            )}
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToNext}
            className="w-12 h-12 text-cyan-400/60 hover:text-cyan-400"
          >
            <SkipForward className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-12 h-12 text-cyan-400/60 hover:text-cyan-400"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>

        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-3 px-2 max-w-xs mx-auto bg-cyan-900/30 rounded-full p-2">
                <VolumeX className="w-4 h-4 text-cyan-400/60" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-cyan-400/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};

// ========================================
// Boombox 90s Skin
// ========================================
const BoomboxSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 p-2 overflow-y-auto">
      {/* Boombox Body */}
      <div className="relative w-full max-w-[380px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-xl shadow-2xl border-4 border-zinc-600 overflow-hidden">
        {/* Chrome Trim */}
        <div className="absolute inset-0 border-2 border-zinc-500/20 rounded-lg pointer-events-none" />

        {/* Handle */}
        <div className="flex justify-center -mt-2">
          <div className="w-32 h-3 bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-b-lg border-x-2 border-b-2 border-zinc-700" />
        </div>

        {/* Top Controls */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-7 h-7 text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </Button>
          <span className="text-red-500 font-bold text-xs tracking-widest">BOOM BOX</span>
          <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-7 h-7 text-zinc-400">
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Display Row */}
        <div className="flex items-center gap-2 px-3">
          {/* Left Speaker */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-zinc-900 to-black border-4 border-zinc-600 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-zinc-700 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600"
                animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Center Display */}
          <div className="flex-1 bg-gradient-to-b from-zinc-900 to-black rounded-lg p-2 border border-zinc-700">
            {/* LCD Display */}
            <div className="bg-gradient-to-b from-lime-900 to-lime-950 rounded p-2 mb-2 border border-lime-700/30">
              <div className="text-lime-400 font-mono text-[10px] text-center truncate">{currentStation.name}</div>
              <div className="text-lime-300/60 font-mono text-[8px] text-center truncate">{currentStation.description}</div>
              {isPlaying && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-lime-400"
                      animate={{ height: [2, 8, 2] }}
                      transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cassette Deck */}
            <div className="bg-zinc-800 rounded p-1 border border-zinc-700">
              <div className="flex items-center gap-1">
                <img src={currentStation.artwork} alt="" className="w-8 h-8 rounded object-cover" />
                <div className="flex-1 flex justify-center gap-1">
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-600"
                  />
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-600"
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-[8px] text-center mt-1">{error}</p>}
            {sleepTimer && (
              <p className="text-lime-400/60 text-[8px] text-center mt-1">Sleep: {remainingMinutes}m</p>
            )}
          </div>

          {/* Right Speaker */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-zinc-900 to-black border-4 border-zinc-600 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-zinc-700 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600"
                animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
              />
            </div>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex justify-center gap-1 py-3 px-4">
          {/* Control Buttons Row */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={skipToPrevious}
            className="w-12 h-8 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded border border-zinc-500 flex items-center justify-center shadow-md"
          >
            <SkipBack className="w-4 h-4 text-zinc-300" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="w-16 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded border border-red-500 flex items-center justify-center shadow-md"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={skipToNext}
            className="w-12 h-8 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded border border-zinc-500 flex items-center justify-center shadow-md"
          >
            <SkipForward className="w-4 h-4 text-zinc-300" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-10 h-8 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded border border-zinc-500 flex items-center justify-center shadow-md"
          >
            <Heart className={cn("w-4 h-4", isFav ? "text-red-500 fill-red-500" : "text-zinc-300")} />
          </motion.button>
        </div>

        {/* Volume Sliders */}
        <div className="flex items-center gap-2 px-6 pb-4">
          <span className="text-[8px] text-zinc-500 uppercase">Vol</span>
          <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-red-500"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="absolute opacity-0 w-full cursor-pointer"
          />
          <span className="text-[8px] text-zinc-500">{Math.round(volume * 100)}%</span>
        </div>

        {/* Bottom Vents */}
        <div className="flex justify-center gap-1 pb-2">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-1 h-2 bg-zinc-700 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// Neon Cyberpunk Skin
// ========================================
const NeonCyberSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-slate-950 to-black overflow-hidden">
      {/* Neon Grid Background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-[calc(var(--safe-top)+12px)] pb-4">
        <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-10 h-10 text-pink-400">
          <ChevronDown className="w-6 h-6" />
        </Button>
        <motion.div
          className="text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-xs text-cyan-400 uppercase tracking-[0.5em] font-bold">CYBER FM</p>
          {sleepTimer && (
            <p className="text-xs text-pink-400 flex items-center justify-center gap-1">
              <Moon className="w-3 h-3" /> {remainingMinutes}m
            </p>
          )}
        </motion.div>
        <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-10 h-10 text-pink-400">
          <Palette className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Glitch Frame */}
        <motion.div
          className="relative"
          animate={{ x: isPlaying ? [-1, 1, -1, 0] : 0 }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
        >
          {/* Outer Neon Border */}
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg opacity-75 blur-sm" />

          {/* Album Art */}
          <div className="relative w-56 h-56 rounded-lg overflow-hidden border-2 border-cyan-400/50 bg-black">
            <img
              src={currentStation.artwork}
              alt={currentStation.name}
              className="w-full h-full object-cover"
              style={{ filter: isPlaying ? 'saturate(1.2) contrast(1.1)' : 'grayscale(0.5)' }}
            />

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Station Info */}
        <div className="text-center mt-6">
          <motion.h2
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            animate={{
              textShadow: isPlaying ? [
                '0 0 10px #ec4899, 0 0 20px #ec4899',
                '0 0 10px #06b6d4, 0 0 20px #06b6d4',
                '0 0 10px #ec4899, 0 0 20px #ec4899',
              ] : 'none'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentStation.name}
          </motion.h2>
          <p className="text-purple-300/60 text-sm font-mono">{currentStation.description}</p>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Waveform */}
        <div className="mt-6 flex items-end justify-center gap-1 h-12">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full"
              style={{
                background: `linear-gradient(180deg, #ec4899, #8b5cf6, #06b6d4)`,
              }}
              animate={{
                height: isPlaying ? [8, 32, 8] : 8,
                opacity: isPlaying ? [0.5, 1, 0.5] : 0.3,
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 px-6 pb-[calc(var(--safe-bottom)+16px)]">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-12 h-12 text-pink-400/60 hover:text-pink-400"
          >
            <Heart className={cn("w-6 h-6", isFav && "text-pink-500 fill-pink-500")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToPrevious}
            className="w-12 h-12 text-cyan-400/60 hover:text-cyan-400"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
          >
            {/* Neon glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full blur-md opacity-75" />
            <div className="relative w-14 h-14 rounded-full bg-black border-2 border-pink-400/50 flex items-center justify-center">
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 text-pink-400" />
              ) : (
                <Play className="w-7 h-7 text-cyan-400 ml-1" />
              )}
            </div>
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToNext}
            className="w-12 h-12 text-cyan-400/60 hover:text-cyan-400"
          >
            <SkipForward className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-12 h-12 text-purple-400/60 hover:text-purple-400"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>

        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-3 px-2 max-w-xs mx-auto">
                <VolumeX className="w-4 h-4 text-pink-400/60" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-cyan-400/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};

// ========================================
// Vinyl Turntable Skin
// ========================================
const VinylTurntableSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-950 p-4 overflow-y-auto">
      {/* Turntable Base */}
      <div className="relative w-full max-w-[360px] bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl shadow-2xl border border-neutral-700 overflow-hidden p-4">
        {/* Wood Grain Effect */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 69, 19, 0.1) 2px, rgba(139, 69, 19, 0.1) 4px)',
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-8 h-8 text-neutral-400">
            <ChevronDown className="w-5 h-5" />
          </Button>
          <span className="text-neutral-500 text-xs font-mono uppercase tracking-widest">Turntable</span>
          <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-8 h-8 text-neutral-400">
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Platter */}
        <div className="relative mx-auto w-64 h-64">
          {/* Platter Base */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 shadow-inner" />

          {/* Vinyl Record */}
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-b from-neutral-900 to-black shadow-lg"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            {/* Vinyl Grooves */}
            <div className="absolute inset-0 rounded-full"
              style={{
                background: `repeating-radial-gradient(circle at center, transparent 0px, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
              }}
            />

            {/* Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-red-700 to-red-900 border-2 border-red-600 flex items-center justify-center overflow-hidden">
              <img src={currentStation.artwork} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Center Spindle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-600 border-2 border-neutral-500" />
          </motion.div>

          {/* Tonearm */}
          <motion.div
            className="absolute top-4 right-0 w-24 origin-top-right"
            animate={{ rotate: isPlaying ? -25 : -5 }}
            transition={{ duration: 0.5 }}
          >
            {/* Arm */}
            <div className="w-full h-2 bg-gradient-to-r from-neutral-500 to-neutral-400 rounded-full shadow-lg" />
            {/* Headshell */}
            <div className="absolute -bottom-1 left-0 w-4 h-4 bg-neutral-400 rounded-sm transform -rotate-45" />
            {/* Counterweight */}
            <div className="absolute -top-1 right-0 w-6 h-6 rounded-full bg-gradient-to-b from-neutral-500 to-neutral-600 border border-neutral-400" />
          </motion.div>
        </div>

        {/* Station Info */}
        <div className="text-center mt-4">
          <h3 className="text-white font-bold text-lg">{currentStation.name}</h3>
          <p className="text-neutral-400 text-sm">{currentStation.description}</p>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          {sleepTimer && (
            <p className="text-neutral-500 text-xs mt-1 flex items-center justify-center gap-1">
              <Moon className="w-3 h-3" /> {remainingMinutes}m
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-10 h-10 text-neutral-400"
          >
            <Heart className={cn("w-5 h-5", isFav && "text-red-500 fill-red-500")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToPrevious}
            className="w-10 h-10 text-neutral-400"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          {/* Start/Stop Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-red-600 to-red-700 border-2 border-red-500 shadow-lg flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipToNext}
            className="w-10 h-10 text-neutral-400"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-10 h-10 text-neutral-400"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        {/* Pitch/Volume Faders */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-neutral-500" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-neutral-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ========================================
// Steampunk Skin
// ========================================
const SteampunkSkin: React.FC<SkinProps> = ({
  currentStation, isPlaying, isLoading, volume, isMuted, sleepTimer,
  error, isFav, remainingMinutes, showVolumeSlider, setShowVolumeSlider,
  togglePlayPause, setVolume, toggleFavorite, collapsePlayer, skipToNext, skipToPrevious, onOpenSkinSelector
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 p-4 overflow-y-auto">
      {/* Machine Body */}
      <div className="relative w-full max-w-[340px] bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-2xl shadow-2xl border-8 border-amber-950 overflow-hidden"
        style={{ boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.5)' }}
      >
        {/* Brass Rivets */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-700" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-700" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-700" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-700" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-4 pb-2">
          <Button variant="ghost" size="icon" onClick={collapsePlayer} className="w-8 h-8 text-amber-300">
            <ChevronDown className="w-5 h-5" />
          </Button>
          <span className="text-amber-200 font-serif text-sm tracking-widest">AETHER RADIO</span>
          <Button variant="ghost" size="icon" onClick={onOpenSkinSelector} className="w-8 h-8 text-amber-300">
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Display */}
        <div className="mx-4 mb-4">
          {/* Pressure Gauge Style Display */}
          <div className="relative bg-gradient-to-b from-stone-800 to-stone-900 rounded-full p-4 border-4 border-amber-600"
            style={{ boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' }}
          >
            {/* Glass Effect */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Album Art */}
            <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-amber-700">
              <img src={currentStation.artwork} alt="" className="w-full h-full object-cover" />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Rotating Gears */}
            <motion.div
              className="absolute -top-2 -right-2 text-4xl"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2 text-3xl"
              animate={{ rotate: isPlaying ? -360 : 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.div>
          </div>
        </div>

        {/* Station Info Plate */}
        <div className="mx-4 mb-4 bg-gradient-to-b from-amber-100 to-amber-200 rounded p-3 border-2 border-amber-700"
          style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}
        >
          <h3 className="text-amber-900 font-serif font-bold text-center text-lg">{currentStation.name}</h3>
          <p className="text-amber-700 text-center text-xs font-serif">{currentStation.description}</p>
          {error && <p className="text-red-700 text-center text-[10px] mt-1">{error}</p>}
          {sleepTimer && (
            <p className="text-amber-600 text-center text-[10px] mt-1">Auto-shutoff: {remainingMinutes}m</p>
          )}
        </div>

        {/* Steam Pipes Decoration */}
        <div className="flex justify-around px-4 mb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative">
              <div className="w-3 h-8 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full border border-amber-800" />
              {isPlaying && (
                <motion.div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/20 rounded-full"
                  animate={{ y: [-5, -20], opacity: [0.5, 0], scale: [0.5, 1.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Control Levers */}
        <div className="flex items-center justify-center gap-6 px-4 pb-4">
          <motion.button
            whileTap={{ y: 2 }}
            onClick={skipToPrevious}
            className="w-10 h-16 bg-gradient-to-b from-amber-500 to-amber-600 rounded-t-full border-2 border-amber-700 shadow-lg flex items-end justify-center pb-2"
          >
            <SkipBack className="w-4 h-4 text-amber-900" />
          </motion.button>

          {/* Main Power Lever */}
          <motion.button
            whileTap={{ y: 4 }}
            onClick={togglePlayPause}
            className="w-14 h-20 bg-gradient-to-b from-red-600 to-red-700 rounded-t-full border-2 border-red-800 shadow-xl flex items-end justify-center pb-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-amber-200" />
            ) : (
              <Play className="w-6 h-6 text-amber-200 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ y: 2 }}
            onClick={skipToNext}
            className="w-10 h-16 bg-gradient-to-b from-amber-500 to-amber-600 rounded-t-full border-2 border-amber-700 shadow-lg flex items-end justify-center pb-2"
          >
            <SkipForward className="w-4 h-4 text-amber-900" />
          </motion.button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between px-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentStation.id)}
            className="w-10 h-10 text-amber-300"
          >
            <Heart className={cn("w-5 h-5", isFav && "text-red-500 fill-red-500")} />
          </Button>

          {/* Volume Dial */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-300 font-serif uppercase">Volume</span>
            <motion.button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-700 shadow-lg flex items-center justify-center"
            >
              <div className="w-1 h-4 bg-amber-900 rounded-full"
                style={{ transform: `rotate(${(volume * 270) - 135}deg)` }}
              />
            </motion.button>
          </div>
        </div>

        {/* Volume Slider Popup */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-amber-900 rounded-lg p-3 shadow-xl border-2 border-amber-700"
            >
              <div className="flex items-center gap-2 w-40">
                <VolumeX className="w-3 h-3 text-amber-300" />
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  className="flex-1"
                />
                <Volume2 className="w-3 h-3 text-amber-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ========================================
// Main Component - Skin Router
// ========================================
export const RadioPlayerSkinned: React.FC = () => {
  const {
    currentStation,
    currentSkin,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    sleepTimer,
    error,
    togglePlayPause,
    setVolume,
    toggleFavorite,
    isFavorite,
    collapsePlayer,
    getRemainingTime,
    skipToNext,
    skipToPrevious,
  } = useRadioPlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSkinSelector, setShowSkinSelector] = useState(false);

  // If no station, show a loading/empty state instead of returning null
  // This prevents the player from disappearing unexpectedly
  if (!currentStation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted animate-pulse" />
          <p className="text-muted-foreground">Select a station to play</p>
          <button
            onClick={collapsePlayer}
            className="mt-4 px-4 py-2 text-sm bg-secondary rounded-lg hover:bg-secondary/80"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  const isFav = isFavorite(currentStation.id);
  const remainingTime = getRemainingTime();
  const remainingMinutes = Math.ceil(remainingTime / 60000);

  const skinProps: SkinProps = {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    sleepTimer,
    error,
    isFav,
    remainingMinutes,
    showVolumeSlider,
    setShowVolumeSlider,
    togglePlayPause,
    setVolume,
    toggleFavorite,
    collapsePlayer,
    skipToNext,
    skipToPrevious,
    onOpenSkinSelector: () => setShowSkinSelector(true),
  };

  const renderSkin = () => {
    switch (currentSkin) {
      case 'default':
        return <DefaultSkin {...skinProps} />;
      case 'ipod-classic':
        return <IpodClassicSkin {...skinProps} />;
      case 'gameboy':
        return <GameBoySkin {...skinProps} />;
      case 'vintage-radio':
        return <VintageRadioSkin {...skinProps} />;
      case 'walkman':
        return <WalkmanSkin {...skinProps} />;
      case 'beach':
        return <BeachSkin {...skinProps} />;
      case 'ufo':
        return <UfoSkin {...skinProps} />;
      case 'boombox':
        return <BoomboxSkin {...skinProps} />;
      case 'neon-cyber':
        return <NeonCyberSkin {...skinProps} />;
      case 'vinyl-turntable':
        return <VinylTurntableSkin {...skinProps} />;
      case 'steampunk':
        return <SteampunkSkin {...skinProps} />;
      default:
        return <DefaultSkin {...skinProps} />;
    }
  };

  return (
    <>
      {renderSkin()}
      <RadioSkinSelector
        isOpen={showSkinSelector}
        onClose={() => setShowSkinSelector(false)}
      />
    </>
  );
};
