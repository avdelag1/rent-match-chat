import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, Heart, Shuffle, Volume2, VolumeX, Globe, ChevronDown, Plus } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes, getAllCities } from '@/data/radioStations';

interface ModernSkinProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isFavorite: boolean;
  currentCity: CityLocation;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: () => void;
  onCityChange: () => void;
  onSelectCity: (city: CityLocation) => void;
  onVolumeChange: (volume: number) => void;
  onAddToPlaylist?: () => void;
  theme?: 'light' | 'dark';
}

export function ModernSkin({
  station,
  isPlaying,
  isShuffle,
  isFavorite,
  currentCity,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleFavorite,
  onCityChange,
  onSelectCity,
  onVolumeChange,
  onAddToPlaylist,
  theme = 'light'
}: ModernSkinProps) {
  const [frequencyNum, setFrequencyNum] = useState(99.2);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const cityTheme = cityThemes[currentCity];
  const allCities = getAllCities();

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
          {/* City Selector Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCitySelector(!showCitySelector)}
            className={`p-3 rounded-full ${buttonBg} transition-colors flex items-center gap-1`}
          >
            <Globe className={`w-5 h-5 ${secondaryText}`} />
            <span className={`text-xs ${textColor}`}>{cityTheme.name.slice(0, 4)}</span>
            <ChevronDown className={`w-3 h-3 ${secondaryText} ${showCitySelector ? 'rotate-180' : ''} transition-transform`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFavorite}
            className={`p-3 rounded-full ${buttonBg} transition-colors`}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : secondaryText}`}
            />
          </motion.button>

          {onAddToPlaylist && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onAddToPlaylist}
              className={`p-3 rounded-full ${buttonBg} transition-colors`}
            >
              <Plus className={`w-5 h-5 ${secondaryText}`} />
            </motion.button>
          )}
        </div>
      </div>

      {/* City Selector Dropdown */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-20 left-4 right-4 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow-2xl`}
          >
            <div className={`${secondaryText} text-xs uppercase tracking-wider mb-3 text-center`}>Select City</div>
            <div className="grid grid-cols-4 gap-2">
              {allCities.map((city) => {
                const cTheme = cityThemes[city];
                const isSelected = city === currentCity;
                return (
                  <motion.button
                    key={city}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onSelectCity(city);
                      setShowCitySelector(false);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'ring-2 ring-rose-500 shadow-lg'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${cTheme.primaryColor}, ${cTheme.secondaryColor})`
                        : undefined
                    }}
                  >
                    <div className="text-2xl mb-1">
                      {city === 'new-york' && '🗽'}
                      {city === 'miami' && '🌴'}
                      {city === 'ibiza' && '🎧'}
                      {city === 'tulum' && '🏝️'}
                      {city === 'california' && '🌊'}
                      {city === 'texas' && '🤠'}
                      {city === 'french' && '🗼'}
                      {city === 'podcasts' && '🎙️'}
                    </div>
                    <div className={`text-[10px] font-medium ${isSelected ? 'text-white' : secondaryText}`}>
                      {cTheme.name}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className={`text-sm ${secondaryText} flex items-center justify-center gap-2`}>
              <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {cityTheme.name}
              </span>
              <span>{station.genre}</span>
            </div>
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

          {/* Volume Control */}
          <div className="flex items-center gap-3 px-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
              className="p-1"
            >
              {volume === 0 ? (
                <VolumeX className={`w-5 h-5 ${secondaryText}`} />
              ) : (
                <Volume2 className={`w-5 h-5 ${secondaryText}`} />
              )}
            </motion.button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className={`flex-1 h-1 ${dialBg} rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-rose-500
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-rose-500
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer`}
              aria-label="Volume"
            />
            <span className={`text-xs font-medium ${secondaryText} w-8`}>
              {Math.round(volume * 100)}%
            </span>
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
