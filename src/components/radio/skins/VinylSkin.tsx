import { motion } from 'framer-motion';
import { Shuffle, Star, Globe, Plus, Volume2, VolumeX, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes } from '@/data/radioStations';

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
  onCityChange: () => void;
  onVolumeChange: (volume: number) => void;
  onAddToPlaylist?: () => void;
}

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
  onCityChange,
  onVolumeChange,
  onAddToPlaylist
}: VinylSkinProps) {
  const cityTheme = cityThemes[currentCity];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900 flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(139, 90, 43, 0.3) 2px,
            rgba(139, 90, 43, 0.3) 4px
          )`
        }}
      />

      {/* Top Controls */}
      <div className="w-full max-w-md flex justify-between items-center z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-3 rounded-full ${isShuffle ? 'bg-amber-500/30' : 'bg-black/20'} backdrop-blur-sm transition-colors`}
          aria-label="Toggle shuffle"
        >
          <Shuffle className={`w-5 h-5 ${isShuffle ? 'text-amber-300' : 'text-amber-100'}`} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFavorite}
          className={`p-3 rounded-full ${isFavorite ? 'bg-red-500/30' : 'bg-black/20'} backdrop-blur-sm transition-colors`}
          aria-label="Toggle favorite"
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'text-red-400 fill-red-400' : 'text-amber-100'}`} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCityChange}
          className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-colors relative"
          aria-label="Change city"
        >
          <Globe className="w-5 h-5 text-amber-100" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-medium text-amber-200">
            {cityTheme.name.slice(0, 3).toUpperCase()}
          </span>
        </motion.button>
      </div>

      {/* Turntable Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-6 z-10">
        {/* Turntable Base */}
        <div className="relative w-72 h-72 bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl p-4">
          {/* Vinyl Record */}
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{
              duration: 2,
              repeat: isPlaying ? Infinity : 0,
              ease: 'linear'
            }}
          >
            {/* Record grooves */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-gray-700/30"
                style={{
                  top: `${10 + i * 5}%`,
                  left: `${10 + i * 5}%`,
                  right: `${10 + i * 5}%`,
                  bottom: `${10 + i * 5}%`,
                }}
              />
            ))}

            {/* Label in center */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${cityTheme.primaryColor}, ${cityTheme.secondaryColor})`
              }}
            >
              <div className="text-center text-white">
                <div className="text-xs font-bold truncate max-w-16 px-1">
                  {station?.name?.slice(0, 8) || 'RADIO'}
                </div>
                <div className="text-[8px] opacity-70">
                  {station?.frequency || '101.9 FM'}
                </div>
              </div>
            </div>

            {/* Spindle hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-600" />
          </motion.div>

          {/* Tonearm */}
          <motion.div
            className="absolute top-4 right-4 origin-top-right"
            animate={{ rotate: isPlaying ? -25 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="w-1 h-32 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform rotate-45" />
            <div className="w-3 h-3 bg-gray-500 rounded-full absolute -bottom-1 -left-1" />
          </motion.div>

          {/* Add to playlist button */}
          {onAddToPlaylist && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onAddToPlaylist}
              className="absolute top-2 left-2 w-8 h-8 rounded-full bg-amber-500/30 backdrop-blur-sm flex items-center justify-center"
              aria-label="Add to playlist"
            >
              <Plus className="w-4 h-4 text-amber-100" />
            </motion.button>
          )}
        </div>

        {/* Station Info */}
        {station && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-amber-100 text-xl font-bold">{station.name}</div>
            <div className="text-amber-200/70 text-sm flex items-center justify-center gap-2 mt-1">
              <span className="bg-amber-500/20 px-2 py-0.5 rounded-full text-xs uppercase">
                {cityTheme.name}
              </span>
              <span>{station.genre}</span>
            </div>
            <div className="text-amber-200/50 text-xs mt-1 max-w-xs">
              {station.description}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md space-y-4 z-10">
        {/* Volume Slider */}
        <div className="flex items-center gap-3 px-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
            className="p-1"
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5 text-amber-200" />
            ) : (
              <Volume2 className="w-5 h-5 text-amber-200" />
            )}
          </motion.button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-black/30 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-amber-400
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-amber-400
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
            aria-label="Volume"
          />
          <span className="text-xs font-medium text-amber-200/70 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className="w-12 h-12 rounded-full bg-black/30 text-amber-100 flex items-center justify-center backdrop-blur-sm"
            aria-label="Previous station"
          >
            <SkipBack size={20} fill="currentColor" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xl"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="w-12 h-12 rounded-full bg-black/30 text-amber-100 flex items-center justify-center backdrop-blur-sm"
            aria-label="Next station"
          >
            <SkipForward size={20} fill="currentColor" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
