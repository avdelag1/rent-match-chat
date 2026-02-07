import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Disc3, Volume2 } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes } from '@/data/radioStations';
import { useRef, useState } from 'react';

interface VinylSkinProps {
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

const CITY_GROUPS: CityLocation[] = ['miami', 'ibiza', 'california', 'texas', 'new-york', 'tulum', 'french', 'podcasts'];

export function VinylSkin({
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
}: VinylSkinProps) {
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col p-4 sm:p-6 relative overflow-hidden">
      {/* Wood grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]" />

      {/* Top Icons */}
      <div className="w-full max-w-md flex justify-between items-start flex-shrink-0 z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-2 sm:p-3 rounded-full ${isShuffle ? 'bg-amber-500/20' : 'bg-white/10'} backdrop-blur-sm transition-colors`}
        >
          <Shuffle className={`w-4 h-4 sm:w-5 sm:h-5 ${isShuffle ? 'text-amber-400' : 'text-white/70'}`} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFavorite}
          className={`p-2 sm:p-3 rounded-full ${isFavorite ? 'bg-red-500/20' : 'bg-white/10'} backdrop-blur-sm transition-colors`}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white/70'}`} />
        </motion.button>
      </div>

      {/* Main Content - flex to fill available space */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2">
        {/* Vinyl Record */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Record player base/platter */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-2xl flex items-center justify-center relative">
            {/* Vinyl Record - only this rotates */}
            <motion.div
              className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full bg-gradient-to-br from-gray-900 to-black shadow-inner flex items-center justify-center relative overflow-hidden"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
            >
              {/* Record grooves */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute rounded-full border border-white/5" style={{ width: `${220 - i * 28}px`, height: `${220 - i * 28}px` }} />
              ))}

              {/* Center label with retro stripes */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-center">
                  <div className="h-3 sm:h-4 bg-yellow-300 opacity-50" />
                  <div className="h-3 sm:h-4 bg-orange-300 opacity-50" />
                  <div className="h-3 sm:h-4 bg-red-300 opacity-50" />
                  <div className="h-3 sm:h-4 bg-blue-300 opacity-50" />
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-900 shadow-inner z-10" />
              </div>
            </motion.div>

            {/* Spindle */}
            <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-700 shadow-lg z-20" />

            {/* Tonearm */}
            <motion.div className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 z-30" initial={{ rotate: -45 }} animate={{ rotate: isPlaying ? -25 : -45 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-800" />
              </div>
              <div className="absolute top-2 left-2 w-28 h-1.5 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300 rounded-full shadow-md origin-left" style={{ transform: 'rotate(35deg)' }}>
                <div className="absolute -right-1 -top-1 w-5 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-sm shadow-md transform -rotate-12">
                  <div className="absolute right-0 top-0.5 w-2.5 h-1.5 bg-gray-700 rounded-sm" />
                  <div className="absolute right-0 bottom-0 w-0.5 h-1.5 bg-gray-300" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Station Info Card */}
          {station && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 sm:mt-6 bg-black/40 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-white/10 max-w-xs">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Disc3 className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                <div className="text-amber-400 text-xs sm:text-sm font-medium">{isPlaying ? 'NOW SPINNING' : 'PAUSED'}</div>
              </div>
              <div className="text-white text-base sm:text-lg font-bold mb-0.5">{station.name}</div>
              <div className="text-white/70 text-xs sm:text-sm mb-1">{station.frequency}</div>
              <div className="text-white/50 text-[10px] sm:text-xs">{station.genre}</div>
            </motion.div>
          )}
        </div>
      </div>

      {/* City Toggle Buttons */}
      <div className="w-full max-w-md flex-shrink-0 z-10 mb-2">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-h-14 sm:max-h-16 overflow-y-auto">
          {CITY_GROUPS.map((city) => (
            <motion.button key={city} whileTap={{ scale: 0.95 }} onClick={() => onCitySelect(city)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${currentCity === city ? 'bg-amber-500 text-gray-900 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
              {cityThemes[city].name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex-shrink-0 flex flex-col items-center gap-3 sm:gap-4 pb-2">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onPrevious} className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors">
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} onClick={onPlayPause} className="p-4 sm:p-5 rounded-full bg-amber-500 hover:bg-amber-600 shadow-xl transition-colors">
            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="currentColor" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 ml-0.5" fill="currentColor" />}
          </motion.button>

          <motion.button whileTap={{ scale: 0.9 }} onClick={onNext} className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors">
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
          </motion.button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-xs px-2">
          <Volume2 className="w-4 h-4 text-white/70 shrink-0" />
          <div ref={volumeRef} className="flex-1 h-2 bg-white/10 rounded-full relative cursor-pointer touch-none" onMouseDown={handleVolumeStart} onMouseMove={handleVolumeMove} onMouseUp={handleVolumeEnd} onMouseLeave={handleVolumeEnd} onTouchStart={handleVolumeStart} onTouchMove={handleVolumeMove} onTouchEnd={handleVolumeEnd}>
            <motion.div className="absolute left-0 top-0 h-full bg-amber-500 rounded-full" style={{ width: `${volume * 100}%` }} />
            <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" style={{ left: `calc(${volume * 100}% - 8px)` }} />
          </div>
          <span className="text-white/70 text-xs sm:text-sm w-10 shrink-0 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
