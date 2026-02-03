import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, X, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes } from '@/data/radioStations';

interface MiniRadioPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  currentCity: CityLocation;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
}

export function MiniRadioPlayer({
  station,
  isPlaying,
  currentCity,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
  onClose
}: MiniRadioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cityTheme = cityThemes[currentCity];

  // Don't show on radio page
  if (location.pathname === '/radio') {
    return null;
  }

  // Don't show if no station
  if (!station) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 right-4 z-50"
      >
        {isExpanded ? (
          // Expanded view
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-72 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${cityTheme.primaryColor}, ${cityTheme.secondaryColor})`
            }}
          >
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                >
                  <Radio className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-white text-xs font-medium">{cityTheme.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full hover:bg-white/10"
                >
                  <ChevronUp className="w-4 h-4 text-white rotate-180" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Station Info */}
            <div className="p-4">
              <div className="text-white font-semibold truncate">{station.name}</div>
              <div className="text-white/70 text-sm truncate">{station.genre}</div>
              <div className="text-white/50 text-xs mt-1">{station.frequency}</div>
            </div>

            {/* Controls */}
            <div className="px-4 pb-3 flex items-center justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onPrevious}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <SkipBack className="w-5 h-5 text-white" fill="white" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onPlayPause}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" fill="white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onNext}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <SkipForward className="w-5 h-5 text-white" fill="white" />
              </motion.button>
            </div>

            {/* Volume */}
            <div className="px-4 pb-3 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
                className="p-1"
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white/70" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white/70" />
                )}
              </motion.button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Open Full Player */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/radio')}
              className="w-full p-3 bg-black/20 text-white text-sm font-medium hover:bg-black/30 transition-colors"
            >
              Open Full Player
            </motion.button>
          </motion.div>
        ) : (
          // Collapsed bubble view
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="relative cursor-pointer"
          >
            {/* Animated ring when playing */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${cityTheme.primaryColor}, ${cityTheme.secondaryColor})`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}

            {/* Main bubble */}
            <div
              className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${cityTheme.primaryColor}, ${cityTheme.secondaryColor})`
              }}
            >
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
              >
                <Radio className="w-6 h-6 text-white" />
              </motion.div>

              {/* Play indicator */}
              {isPlaying && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Station name tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            >
              {station.name}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
