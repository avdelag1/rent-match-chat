import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, Heart, Shuffle, Volume2, Filter } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { useState, useRef } from 'react';

// Podcast categories for organization
const PODCAST_CATEGORIES = {
  'all': 'All Podcasts',
  'news': 'News & Talk',
  'jazz': 'Jazz & Soul',
  'indie': 'Indie & Alternative',
  'folk': 'Folk & Americana',
  'eclectic': 'Eclectic & World'
} as const;

type PodcastCategory = keyof typeof PODCAST_CATEGORIES;

// Map genres to categories
const GENRE_TO_CATEGORY: Record<string, PodcastCategory> = {
  'World News': 'news',
  'News & Culture': 'news',
  'Culture & Ideas': 'news',
  'Jazz Variety': 'jazz',
  'Soul': 'jazz',
  'Indie Pop': 'indie',
  'Cover Songs': 'indie',
  'Folk & Americana': 'folk',
  'Americana': 'folk',
  'Eclectic Radio': 'eclectic',
  'Eclectic Mix': 'eclectic',
  'Eclectic': 'eclectic',
  'Mellow Mix': 'eclectic',
  'Rock Mix': 'eclectic'
};

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
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPodcastCategory, setSelectedPodcastCategory] = useState<PodcastCategory>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Check if we're in podcast mode
  const isPodcastMode = currentCity === 'podcasts';

  // Get the category for the current podcast station
  const getCurrentStationCategory = (): PodcastCategory | null => {
    if (!isPodcastMode || !station?.genre) return null;
    return GENRE_TO_CATEGORY[station.genre] || null;
  };

  const currentStationCategory = getCurrentStationCategory();

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

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const accentColor = theme === 'dark' ? 'text-pink-500' : 'text-rose-500';
  const dialBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const buttonBg = theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';

  return (
    <div className={`h-screen ${bgColor} flex flex-col items-center justify-between p-3 pb-4 relative overflow-hidden`}>
      {/* Top Icons */}
      <div className="w-full max-w-md flex justify-between items-center flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-2.5 rounded-full ${buttonBg} transition-colors`}
        >
          <Shuffle className={`w-4 h-4 ${isShuffle ? accentColor : secondaryText}`} />
        </motion.button>

        <div className="flex gap-2">
          {/* Category Filter Button (only for podcasts) */}
          {isPodcastMode && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className={`p-2.5 rounded-full ${buttonBg} transition-colors`}
            >
              <Filter className={`w-4 h-4 ${showCategoryFilter ? accentColor : secondaryText}`} />
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-full ${buttonBg} transition-colors`}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : secondaryText}`}
            />
          </motion.button>
        </div>
      </div>

      {/* Podcast Category Filter Dropdown */}
      <AnimatePresence>
        {isPodcastMode && showCategoryFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-20 left-4 right-4 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow-2xl max-w-md mx-auto`}
          >
            <div className={`${secondaryText} text-xs uppercase tracking-wider mb-3 text-center`}>Podcast Categories</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PODCAST_CATEGORIES) as PodcastCategory[]).map((category) => {
                const isSelected = category === selectedPodcastCategory;
                return (
                  <motion.button
                    key={category}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPodcastCategory(category);
                      setShowCategoryFilter(false);
                    }}
                    className={`px-4 py-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                        : theme === 'dark' ? 'hover:bg-gray-700 bg-gray-700/50' : 'hover:bg-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${isSelected ? 'text-white' : textColor}`}>
                      {PODCAST_CATEGORIES[category]}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Scrolling Station Banner */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl space-y-4 overflow-hidden">
        {/* Playing Status */}
        {station && (
          <div className={`text-xs font-medium ${accentColor} flex items-center justify-center gap-1.5`}>
            <Radio className="w-3.5 h-3.5" />
            {isPlaying ? 'PLAYING' : 'PAUSED'}
          </div>
        )}

        {/* Scrolling Station Name Banner */}
        <div className="w-full overflow-hidden relative">
          <motion.div
            className={`text-3xl md:text-5xl font-bold ${textColor} whitespace-nowrap inline-block`}
            animate={isPlaying ? {
              x: ['0%', '-50%']
            } : {}}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear"
            }}
            style={{ willChange: 'transform' }}
          >
            {station ? `${station.name}  •  ${station.name}  •  ${station.name}  •  ${station.name}  •  ${station.name}  •  ${station.name}  •  ` : 'No Station Selected'}
          </motion.div>
        </div>

        {/* Genre/Category Badges */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {station?.genre && (
            <div className={`px-3 py-1.5 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} ${textColor}`}>
              {station.genre}
            </div>
          )}
          {isPodcastMode && currentStationCategory && (
            <div className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-purple-600 to-pink-500 text-white">
              📂 {PODCAST_CATEGORIES[currentStationCategory]}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md space-y-2 flex-shrink-0">
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className={`p-2.5 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipBack className={`w-5 h-5 ${textColor}`} fill="currentColor" />
          </motion.button>

          {/* Play/Pause Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className={`p-5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'} shadow-xl transition-all`}
          >
            {isPlaying ? (
              <Pause className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`} fill="currentColor" />
            ) : (
              <Play className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-900' : 'text-white'} ml-0.5`} fill="currentColor" />
            )}
          </motion.button>

          {/* Next Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className={`p-2.5 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipForward className={`w-5 h-5 ${textColor}`} fill="currentColor" />
          </motion.button>
        </div>

        {/* Volume Slider - Touch friendly */}
        <div className="flex items-center gap-2 px-2">
          <Volume2 className={`w-4 h-4 ${secondaryText}`} />
          <div
            ref={volumeRef}
            className={`flex-1 h-2 ${dialBg} rounded-full relative cursor-pointer touch-none`}
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
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`}
              style={{ left: `calc(${volume * 100}% - 8px)` }}
            />
          </div>
          <span className={`${secondaryText} text-xs w-8`}>{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
