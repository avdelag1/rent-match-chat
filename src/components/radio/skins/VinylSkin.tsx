import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Disc3, Volume2, Globe } from 'lucide-react';
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

// Cities available for toggle (as requested)
const CITY_GROUPS: CityLocation[] = ['california', 'texas', 'new-york', 'french', 'podcasts'];

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
  const cityTheme = cityThemes[currentCity];
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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Wood grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]" />

      {/* Top Icons */}
      <div className="w-full max-w-lg flex justify-between items-start mb-8 z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-3 rounded-full ${isShuffle ? 'bg-amber-500/20' : 'bg-white/10'} backdrop-blur-sm transition-colors`}
        >
          <Shuffle className={`w-5 h-5 ${isShuffle ? 'text-amber-400' : 'text-white/70'}`} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFavorite}
          className={`p-3 rounded-full ${isFavorite ? 'bg-red-500/20' : 'bg-white/10'} backdrop-blur-sm transition-colors`}
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white/70'}`}
          />
        </motion.button>
      </div>

      {/* Vinyl Record */}
      <div className="relative z-10">
        {/* Record player base/platter */}
        <div className="w-80 h-80 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-2xl flex items-center justify-center relative">
          {/* Vinyl Record - only this rotates */}
          <motion.div
            className="w-72 h-72 rounded-full bg-gradient-to-br from-gray-900 to-black shadow-inner flex items-center justify-center relative overflow-hidden"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
          >
            {/* Record grooves */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/5"
                style={{
                  width: `${280 - i * 30}px`,
                  height: `${280 - i * 30}px`,
                }}
              />
            ))}

            {/* Center label with retro stripes */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-lg flex items-center justify-center relative overflow-hidden">
              {/* Retro stripes */}
              <div className="absolute inset-0 flex flex-col justify-center">
                <div className="h-4 bg-yellow-300 opacity-50" />
                <div className="h-4 bg-orange-300 opacity-50" />
                <div className="h-4 bg-red-300 opacity-50" />
                <div className="h-4 bg-blue-300 opacity-50" />
                <div className="h-4 bg-cyan-300 opacity-50" />
              </div>

              {/* Center hole */}
              <div className="w-8 h-8 rounded-full bg-gray-900 shadow-inner z-10" />
            </div>
          </motion.div>

          {/* Spindle */}
          <div className="absolute w-4 h-4 rounded-full bg-gray-700 shadow-lg z-20" />

          {/* Tonearm - FIXED to base, does not rotate with vinyl */}
          <motion.div
            className="absolute -right-4 -top-4 z-30"
            initial={{ rotate: -45 }}
            animate={{ rotate: isPlaying ? -25 : -45 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Tonearm pivot base */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 shadow-lg flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gray-800" />
            </div>
            {/* Tonearm */}
            <div
              className="absolute top-3 left-3 w-36 h-2 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300 rounded-full shadow-md origin-left"
              style={{ transform: 'rotate(35deg)' }}
            >
              {/* Headshell */}
              <div className="absolute -right-1 -top-1 w-6 h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-sm shadow-md transform -rotate-12">
                {/* Cartridge */}
                <div className="absolute right-0 top-1 w-3 h-2 bg-gray-700 rounded-sm" />
                {/* Stylus/Needle */}
                <div className="absolute right-0.5 bottom-0 w-0.5 h-2 bg-gray-300" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Station Info Card */}
        {station && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-black/40 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Disc3 className="w-4 h-4 text-amber-400" />
              <div className="text-amber-400 text-sm font-medium">
                {isPlaying ? 'NOW SPINNING' : 'PAUSED'}
              </div>
            </div>
            <div className="text-white text-2xl font-bold mb-1">{station.name}</div>
            <div className="text-white/70 text-sm mb-2">{station.frequency}</div>
            <div className="text-white/50 text-xs">{station.genre}</div>
          </motion.div>
        )}
      </div>

      {/* City Toggle Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 z-10 max-w-md">
        {CITY_GROUPS.map((city) => (
          <motion.button
            key={city}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCitySelect(city)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentCity === city
                ? 'bg-amber-500 text-gray-900 shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {cityThemes[city].name}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-6 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPrevious}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <SkipBack className="w-6 h-6 text-white" fill="currentColor" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onPlayPause}
          className="p-6 rounded-full bg-amber-500 hover:bg-amber-600 shadow-xl transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-gray-900" fill="currentColor" />
          ) : (
            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <SkipForward className="w-6 h-6 text-white" fill="currentColor" />
        </motion.button>
      </div>

      {/* Volume Slider - Touch friendly */}
      <div className="mt-6 flex items-center gap-3 z-10">
        <Volume2 className="w-5 h-5 text-white/70" />
        <div
          ref={volumeRef}
          className="w-48 h-3 bg-white/10 rounded-full relative cursor-pointer touch-none"
          onMouseDown={handleVolumeStart}
          onMouseMove={handleVolumeMove}
          onMouseUp={handleVolumeEnd}
          onMouseLeave={handleVolumeEnd}
          onTouchStart={handleVolumeStart}
          onTouchMove={handleVolumeMove}
          onTouchEnd={handleVolumeEnd}
        >
          <motion.div
            className="absolute left-0 top-0 h-full bg-amber-500 rounded-full"
            style={{ width: `${volume * 100}%` }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg"
            style={{ left: `calc(${volume * 100}% - 10px)` }}
          />
        </div>
        <span className="text-white/70 text-sm w-10">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
