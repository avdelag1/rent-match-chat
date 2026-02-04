import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, Heart, Shuffle, Volume2, VolumeX, Globe, ChevronDown } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes, getAllCities } from '@/data/radioStations';
import { useState, useEffect, useRef } from 'react';

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
  onCitySelect: (city: CityLocation) => void;
  onVolumeChange: (volume: number) => void;
  theme?: 'light' | 'dark';
}

// Cities available for toggle (as requested)
const CITY_GROUPS: CityLocation[] = ['miami', 'ibiza', 'california', 'texas', 'new-york', 'tulum', 'french', 'podcasts'];

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
  onCitySelect,
  onVolumeChange,
  theme = 'light'
}: ModernSkinProps) {
  const [frequencyNum, setFrequencyNum] = useState<number | null>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const cachedRectRef = useRef<{ left: number; width: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  // Touch/swipe state for frequency dial
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDialDragging, setIsDialDragging] = useState(false);
  const dialStartX = useRef<number>(0);
  const dialCurrentX = useRef<number>(0);

  // Ref for city selector dropdown
  const citySelectorRef = useRef<HTMLDivElement>(null);

  const cityTheme = cityThemes[currentCity];
  const allCities = getAllCities();

  // Handle volume change via touch/mouse (horizontal slider) - optimized version
  const handleVolumeInteraction = (clientX: number) => {
    if (!cachedRectRef.current) return;
    const { left, width } = cachedRectRef.current;
    const offsetX = clientX - left;
    const newVolume = Math.max(0, Math.min(1, offsetX / width));

    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      onVolumeChange(newVolume);
      rafRef.current = null;
    });
  };

  const handleVolumeStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    // Cache the bounding rect once on start
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      cachedRectRef.current = { left: rect.left, width: rect.width };
    }
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
    cachedRectRef.current = null;
    // Clean up any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Handle frequency dial swipe
  const handleDialStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDialDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dialStartX.current = clientX;
    dialCurrentX.current = clientX;
  };

  const handleDialMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDialDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dialCurrentX.current = clientX;
  };

  const handleDialEnd = () => {
    if (!isDialDragging) return;
    setIsDialDragging(false);

    const deltaX = dialCurrentX.current - dialStartX.current;
    const threshold = 30; // Minimum swipe distance in pixels

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - next station
        onNext();
      } else {
        // Swipe left - previous station
        onPrevious();
      }
    }
  };

  // Extract numeric frequency from station
  useEffect(() => {
    if (station?.frequency) {
      const match = station.frequency.match(/(\d+\.?\d*)/);
      if (match) {
        setFrequencyNum(parseFloat(match[1]));
      }
    }
  }, [station]);

  // Calculate red line position based on frequency (88-108 FM range)
  const getDialPosition = () => {
    if (frequencyNum === null) return 50; // Default to center
    const minFreq = 88;
    const maxFreq = 108;
    const range = maxFreq - minFreq;
    const position = ((frequencyNum - minFreq) / range) * 100;
    return Math.max(10, Math.min(90, position)); // Clamp between 10% and 90%
  };

  // Close city selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySelectorRef.current && !citySelectorRef.current.contains(event.target as Node)) {
        // Check if the click is on the button itself
        const target = event.target as HTMLElement;
        if (!target.closest('button')?.textContent?.includes(cityTheme.name.slice(0, 4))) {
          setShowCitySelector(false);
        }
      }
    };

    if (showCitySelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCitySelector, cityTheme.name]);

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const accentColor = theme === 'dark' ? 'text-pink-500' : 'text-rose-500';
  const dialBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const buttonBg = theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';

  return (
    <div className={`h-screen ${bgColor} flex flex-col items-center justify-between p-2 pb-3 relative overflow-hidden`}>
      {/* Top Icons */}
      <div className="w-full max-w-md flex justify-between items-start pt-16">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-2 rounded-full ${buttonBg} transition-colors`}
        >
          <Shuffle className={`w-4 h-4 ${isShuffle ? accentColor : secondaryText}`} />
        </motion.button>

        <div className="flex gap-2">
          {/* City Selector Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCitySelector(!showCitySelector)}
            className={`p-2 rounded-full ${buttonBg} transition-colors flex items-center gap-1`}
          >
            <Globe className={`w-4 h-4 ${secondaryText}`} />
            <span className={`text-xs ${textColor}`}>{cityTheme.name.slice(0, 4)}</span>
            <ChevronDown className={`w-3 h-3 ${secondaryText} ${showCitySelector ? 'rotate-180' : ''} transition-transform`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFavorite}
            className={`p-2 rounded-full ${buttonBg} transition-colors`}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : secondaryText}`}
            />
          </motion.button>
        </div>
      </div>

      {/* City Selector Dropdown */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            ref={citySelectorRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-20 left-4 right-4 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow-2xl max-w-md mx-auto`}
          >
            <div className={`${secondaryText} text-xs uppercase tracking-wider mb-3 text-center`}>Select City</div>
            <div className="grid grid-cols-2 gap-2">
              {allCities.map((city) => {
                const cTheme = cityThemes[city];
                const isSelected = city === currentCity;
                return (
                  <motion.button
                    key={city}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onCitySelect(city);
                      setShowCitySelector(false);
                    }}
                    className={`px-4 py-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'ring-2 ring-rose-500 shadow-lg'
                        : theme === 'dark' ? 'hover:bg-gray-700 bg-gray-700/50' : 'hover:bg-gray-100 bg-gray-50'
                    }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${cTheme.primaryColor}, ${cTheme.secondaryColor})`
                        : undefined
                    }}
                  >
                    <div className={`text-sm font-semibold ${isSelected ? 'text-white' : textColor}`}>
                      {cTheme.name}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : secondaryText} mt-0.5`}>
                      {city === 'new-york' && 'New York Vibes'}
                      {city === 'miami' && 'Tropical Beats'}
                      {city === 'ibiza' && 'Electronic Party'}
                      {city === 'tulum' && 'Beach Ambient'}
                      {city === 'california' && 'West Coast'}
                      {city === 'texas' && 'Lone Star'}
                      {city === 'french' && 'French Culture'}
                      {city === 'podcasts' && 'Talk & Stories'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-1">
        {/* Large Frequency Display */}
        <div className="text-center">
          <motion.div
            className={`text-4xl font-light ${textColor} mb-0 tracking-tighter`}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {frequencyNum !== null ? frequencyNum.toFixed(1) : '--.-'}
          </motion.div>
          <div className={`text-lg font-light ${secondaryText} -mt-1`}>FM</div>
        </div>

        {/* Station Info */}
        {station && (
          <div className="text-center space-y-0">
            <div className={`text-xs font-medium ${accentColor} flex items-center justify-center gap-1`}>
              <Radio className="w-3 h-3" />
              {isPlaying ? 'PLAYING' : 'PAUSED'}
            </div>
            <div className={`text-base font-medium ${textColor}`}>{station.name}</div>
            <div className={`text-xs ${secondaryText} flex items-center justify-center gap-1.5`}>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {cityTheme.name}
              </span>
              <span>{station.genre || 'Radio'}</span>
            </div>
          </div>
        )}

        {/* Horizontal Frequency Dial */}
        <div className="w-full space-y-1">
          <div
            ref={dialRef}
            className={`w-full h-12 ${dialBg} rounded-xl relative overflow-hidden cursor-pointer touch-none select-none ${isDialDragging ? 'scale-[1.02]' : ''} transition-transform`}
            onMouseDown={handleDialStart}
            onMouseMove={handleDialMove}
            onMouseUp={handleDialEnd}
            onMouseLeave={handleDialEnd}
            onTouchStart={handleDialStart}
            onTouchMove={handleDialMove}
            onTouchEnd={handleDialEnd}
          >
            {/* Frequency Scale */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

                {/* Current frequency indicator (red line) - Animated based on frequency */}
                <motion.div
                  className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                  animate={{ left: `${getDialPosition()}%` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{ transform: 'translateX(-50%)' }}
                >
                  <div className="w-1 h-12 bg-gradient-to-b from-transparent via-rose-500 to-transparent shadow-lg shadow-rose-500/50" />
                </motion.div>

                {/* Animated waves when playing */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* City Toggle Buttons */}
      <div className="w-full max-w-md mb-0.5">
        <div className="flex flex-wrap justify-center gap-1">
          {CITY_GROUPS.map((city) => (
            <motion.button
              key={city}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCitySelect(city)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                currentCity === city
                  ? theme === 'dark'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-rose-500 text-white shadow-lg'
                  : buttonBg + ' ' + secondaryText
              }`}
            >
              {cityThemes[city].name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md space-y-1">
        <div className="flex items-center justify-center gap-3">
          {/* Previous Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className={`p-2 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipBack className={`w-4 h-4 ${textColor}`} fill="currentColor" />
          </motion.button>

          {/* Play/Pause Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className={`p-4 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'} shadow-xl transition-all`}
          >
            {isPlaying ? (
              <Pause className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`} fill="currentColor" />
            ) : (
              <Play className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-900' : 'text-white'} ml-0.5`} fill="currentColor" />
            )}
          </motion.button>

          {/* Next Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className={`p-2 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipForward className={`w-4 h-4 ${textColor}`} fill="currentColor" />
          </motion.button>
        </div>

        {/* Volume Slider - Touch friendly */}
        <div className="flex items-center gap-1.5 px-2">
          <Volume2 className={`w-3.5 h-3.5 ${secondaryText}`} />
          <div
            ref={volumeRef}
            className={`flex-1 h-1.5 ${dialBg} rounded-full relative cursor-pointer touch-none`}
            onMouseDown={handleVolumeStart}
            onMouseMove={handleVolumeMove}
            onMouseUp={handleVolumeEnd}
            onMouseLeave={handleVolumeEnd}
            onTouchStart={handleVolumeStart}
            onTouchMove={handleVolumeMove}
            onTouchEnd={handleVolumeEnd}
          >
            <motion.div
              className="absolute left-0 top-0 h-full bg-rose-500 rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
            <motion.div
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`}
              style={{ left: `calc(${volume * 100}% - 6px)` }}
            />
          </div>
          <span className={`${secondaryText} text-xs w-7`}>{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
