import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, Heart, Shuffle } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { useState, useEffect } from 'react';

interface ModernSkinProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isFavorite: boolean;
  currentCity: CityLocation;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: () => void;
  onCityChange: () => void;
  theme?: 'light' | 'dark';
}

export function ModernSkin({
  station,
  isPlaying,
  isShuffle,
  isFavorite,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleFavorite,
  theme = 'light'
}: ModernSkinProps) {
  const [frequencyNum, setFrequencyNum] = useState(99.2);

  // Extract numeric frequency from station
  useEffect(() => {
    if (station?.frequency) {
      const match = station.frequency.match(/(\d+\.?\d*)/);
      if (match) {
        setFrequencyNum(parseFloat(match[1]));
      }
    }
  }, [station]);

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const accentColor = theme === 'dark' ? 'text-pink-500' : 'text-rose-500';
  const dialBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const buttonBg = theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-between p-8 relative`}>
      {/* Top Icons */}
      <div className="w-full max-w-md flex justify-between items-start">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-3 rounded-full ${buttonBg} transition-colors`}
        >
          <Shuffle className={`w-5 h-5 ${isShuffle ? accentColor : secondaryText}`} />
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFavorite}
            className={`p-3 rounded-full ${buttonBg} transition-colors`}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : secondaryText}`}
            />
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-12">
        {/* Large Frequency Display */}
        <div className="text-center">
          <motion.div
            className={`text-8xl font-light ${textColor} mb-2 tracking-tighter`}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {frequencyNum.toFixed(1)}
          </motion.div>
          <div className={`text-3xl font-light ${secondaryText} -mt-2`}>FM</div>
        </div>

        {/* Station Info */}
        {station && (
          <div className="text-center space-y-1">
            <div className={`text-sm font-medium ${accentColor} flex items-center justify-center gap-2`}>
              <Radio className="w-4 h-4" />
              {isPlaying ? 'PLAYING' : 'PAUSED'}
            </div>
            <div className={`text-xl font-medium ${textColor}`}>{station.name}</div>
            <div className={`text-sm ${secondaryText}`}>{station.genre}</div>
          </div>
        )}

        {/* Horizontal Frequency Dial */}
        <div className="w-full space-y-4">
          <div className={`w-full h-24 ${dialBg} rounded-2xl relative overflow-hidden`}>
            {/* Frequency Scale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full relative px-6">
                {/* Frequency markers */}
                <div className="absolute top-4 left-0 right-0 flex justify-between px-6">
                  {[88, 92, 96, 100, 104, 108].map((freq) => (
                    <div key={freq} className="flex flex-col items-center">
                      <div className={`text-xs ${secondaryText} font-medium`}>{freq}</div>
                      <div className={`w-px h-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} mt-1`} />
                    </div>
                  ))}
                </div>

                {/* Current frequency indicator (red line) */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
                  <div className="w-1 h-16 bg-gradient-to-b from-transparent via-rose-500 to-transparent" />
                </div>

                {/* Animated waves when playing */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-8">
          {/* Previous Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className={`p-4 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipBack className={`w-6 h-6 ${textColor}`} fill="currentColor" />
          </motion.button>

          {/* Play/Pause Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className={`p-8 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'} shadow-xl transition-all`}
          >
            {isPlaying ? (
              <Pause className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`} fill="currentColor" />
            ) : (
              <Play className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-900' : 'text-white'} ml-1`} fill="currentColor" />
            )}
          </motion.button>

          {/* Next Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className={`p-4 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipForward className={`w-6 h-6 ${textColor}`} fill="currentColor" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
