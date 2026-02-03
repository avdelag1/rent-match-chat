import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Volume2, VolumeX, Globe, Plus, ChevronDown } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes, getAllCities } from '@/data/radioStations';

interface RetroSkinProps {
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
  onCitySelect: (city: CityLocation) => void;
  onVolumeChange: (volume: number) => void;
}

// Cities available for toggle (as requested)
const CITY_GROUPS: CityLocation[] = ['miami', 'ibiza', 'california', 'texas', 'new-york', 'tulum', 'french', 'podcasts'];

export function RetroSkin({
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
  onCitySelect,
  onVolumeChange
}: RetroSkinProps) {
  const [showCitySelector, setShowCitySelector] = useState(false);
  const cityTheme = cityThemes[currentCity];
  const allCities = getAllCities();
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle volume change via touch/mouse (horizontal slider)
  const handleVolumeInteraction = (clientX: number) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const width = rect.width;
    const offsetX = clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, offsetX / width));
    onVolumeChange(newVolume);
  };

  const handleVolumeStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    handleVolumeInteraction(clientX);
  };

  const handleVolumeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    handleVolumeInteraction(clientX);
  };

  const handleVolumeEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* City Selector Modal */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCitySelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 shadow-2xl border-2 border-cyan-500/50 max-w-sm w-full mx-4"
            >
              <div className="text-cyan-400 text-xs uppercase tracking-wider mb-3 text-center font-mono">
                Select City Station
              </div>
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
                      className={`p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 shadow-lg'
                          : 'hover:bg-gray-700'
                      }`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${cTheme.primaryColor}, ${cTheme.secondaryColor})`
                          : 'rgba(55, 65, 81, 0.5)'
                      }}
                    >
                      <div className="text-xl mb-1">
                        {city === 'new-york' && '🗽'}
                        {city === 'miami' && '🌴'}
                        {city === 'ibiza' && '🎧'}
                        {city === 'tulum' && '🏝️'}
                        {city === 'california' && '🌊'}
                        {city === 'texas' && '🤠'}
                        {city === 'french' && '🗼'}
                        {city === 'podcasts' && '🎙️'}
                      </div>
                      <div className={`text-[9px] font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {cTheme.name}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowCitySelector(false)}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-300"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boombox/Cassette Player */}
      <div className="relative">
        {/* Main Boombox Body */}
        <div className="w-80 sm:w-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-gray-700 relative">
          {/* Top Handle */}
          <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 w-40 sm:w-48 h-5 sm:h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-t-full border-4 border-gray-700" />

          {/* Speakers */}
          <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 aspect-square bg-gray-900 rounded-2xl p-3 sm:p-4 border-2 border-gray-700">
              <div className="w-full h-full grid grid-cols-6 gap-0.5 sm:gap-1">
                {[...Array(36)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gray-700 rounded-full"
                    animate={{
                      scale: isPlaying ? [1, 1.2, 1] : 1,
                      backgroundColor: isPlaying ? ['#374151', '#4b5563', '#374151'] : '#374151',
                    }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.02,
                      repeat: isPlaying ? Infinity : 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 aspect-square bg-gray-900 rounded-2xl p-3 sm:p-4 border-2 border-gray-700">
              <div className="w-full h-full grid grid-cols-6 gap-0.5 sm:gap-1">
                {[...Array(36)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gray-700 rounded-full"
                    animate={{
                      scale: isPlaying ? [1, 1.2, 1] : 1,
                      backgroundColor: isPlaying ? ['#374151', '#4b5563', '#374151'] : '#374151',
                    }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.02,
                      repeat: isPlaying ? Infinity : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cassette Display */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border-2 border-gray-600">
            {/* Cassette Tape */}
            <div
              className="rounded-lg p-3 sm:p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${cityTheme.primaryColor}40, ${cityTheme.secondaryColor}40)`
              }}
            >
              {/* Tape reels */}
              <div className="flex justify-between items-center mb-2">
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center"
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700" />
                  <div
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: cityTheme.primaryColor }}
                  />
                </motion.div>

                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center"
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700" />
                  <div
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: cityTheme.secondaryColor }}
                  />
                </motion.div>
              </div>

              {/* Tape label */}
              <div className="bg-white rounded p-2 text-center">
                <div className="text-[10px] sm:text-xs font-mono text-gray-800 mb-0.5">{station?.frequency || 'No Signal'}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{station?.name || 'RADIO'}</div>
                <div className="text-[10px] sm:text-xs text-gray-600 flex items-center justify-center gap-1">
                  <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[8px]">{cityTheme.name}</span>
                  <span>{station?.genre || '---'}</span>
                </div>
              </div>

              {/* Tape window */}
              <div className="absolute top-1/2 left-14 right-14 h-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 -translate-y-1/2 opacity-70" />
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
            {/* LED Display */}
            <div className="bg-green-900 rounded px-2 sm:px-3 py-1.5 sm:py-2 font-mono text-green-400 text-center text-[10px] sm:text-xs tracking-wider border border-green-800">
              {isPlaying ? '▶ PLAYING' : '⏸ PAUSED'} • {cityTheme.name.toUpperCase()}
            </div>

            {/* Button Controls */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggleShuffle}
                className={`p-1.5 sm:p-2 rounded ${isShuffle ? 'bg-cyan-500' : 'bg-gray-800'} transition-colors`}
              >
                <Shuffle className={`w-3 h-3 sm:w-4 sm:h-4 ${isShuffle ? 'text-white' : 'text-gray-400'}`} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCitySelector(true)}
                className="p-1.5 sm:p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onPrevious}
                className="p-2 sm:p-3 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onPlayPause}
                className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="currentColor" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onNext}
                className="p-2 sm:p-3 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggleFavorite}
                className={`p-1.5 sm:p-2 rounded ${isFavorite ? 'bg-red-500' : 'bg-gray-800'} transition-colors`}
              >
                <Heart
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'text-white fill-white' : 'text-gray-400'}`}
                />
              </motion.button>

              {onAddToPlaylist && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddToPlaylist}
                  className="p-1.5 sm:p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </motion.button>
              )}
            </div>

            {/* Volume Slider - Touch friendly */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div
                ref={volumeRef}
                className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden relative cursor-pointer touch-none"
                onMouseDown={handleVolumeStart}
                onMouseMove={handleVolumeMove}
                onMouseUp={handleVolumeEnd}
                onMouseLeave={handleVolumeEnd}
                onTouchStart={handleVolumeStart}
                onTouchMove={handleVolumeMove}
                onTouchEnd={handleVolumeEnd}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                  style={{ width: `${volume * 100}%` }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                  style={{ left: `calc(${volume * 100}% - 8px)` }}
                />
              </div>
              <span className="text-gray-400 text-xs w-8">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>

        {/* City Toggle Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-96">
          {CITY_GROUPS.map((city) => (
            <motion.button
              key={city}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCitySelect(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentCity === city
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cityThemes[city].name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
