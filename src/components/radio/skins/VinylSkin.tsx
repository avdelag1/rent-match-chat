import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Disc3 } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes } from '@/data/radioStations';

interface VinylSkinProps {
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
}

export function VinylSkin({
  station,
  isPlaying,
  isShuffle,
  isFavorite,
  currentCity,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleFavorite
}: VinylSkinProps) {
  const cityTheme = cityThemes[currentCity];

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
          {/* Vinyl Record */}
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

            {/* Tonearm when playing */}
            {isPlaying && (
              <motion.div
                className="absolute right-8 top-12 w-32 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-lg origin-right"
                style={{ transform: 'rotate(-25deg)' }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Needle/cartridge */}
                <div className="absolute right-0 w-4 h-4 bg-gray-500 rounded-full shadow-md" />
                <div className="absolute right-1 top-1/2 w-2 h-px bg-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Spindle */}
          <div className="absolute w-4 h-4 rounded-full bg-gray-700 shadow-lg" />
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

      {/* Controls */}
      <div className="mt-12 flex items-center justify-center gap-6 z-10">
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
    </div>
  );
}
