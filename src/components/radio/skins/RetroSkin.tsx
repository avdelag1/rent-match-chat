import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Volume2 } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { cityThemes } from '@/data/radioStations';
import { useRef, useState } from 'react';

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
    <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex flex-col p-4 sm:p-6 relative overflow-hidden">
      {/* Top Icons */}
      <div className="w-full max-w-md flex justify-between items-start flex-shrink-0 z-10">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onToggleShuffle} className={`p-2 sm:p-3 rounded-full ${isShuffle ? 'bg-cyan-500/30' : 'bg-white/20'} backdrop-blur-sm transition-colors`}>
          <Shuffle className={`w-4 h-4 sm:w-5 sm:h-5 ${isShuffle ? 'text-white' : 'text-white/70'}`} />
        </motion.button>

        <motion.button whileTap={{ scale: 0.95 }} onClick={onToggleFavorite} className={`p-2 sm:p-3 rounded-full ${isFavorite ? 'bg-red-500/30' : 'bg-white/20'} backdrop-blur-sm transition-colors`}>
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-white fill-white' : 'text-white/70'}`} />
        </motion.button>
      </div>

      {/* Main Content - flex to fill available space */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-2 overflow-auto">
        {/* Compact Boombox */}
        <div className="relative w-full max-w-xs sm:max-w-sm">
          {/* Main Boombox Body */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border-2 sm:border-4 border-gray-700 relative">
            {/* Top Handle */}
            <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-4 sm:h-6 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-t-full border-2 sm:border-4 border-gray-700" />

            {/* Speakers */}
            <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 aspect-square bg-gray-900 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700">
                <div className="w-full h-full grid grid-cols-4 sm:grid-cols-6 gap-1">
                  {[...Array(24)].map((_, i) => (
                    <motion.div key={i} className="bg-gray-700 rounded-full" animate={{ scale: isPlaying ? [1, 1.2, 1] : 1, backgroundColor: isPlaying ? ['#374151', '#4b5563', '#374151'] : '#374151' }} transition={{ duration: 0.5, delay: i * 0.03, repeat: isPlaying ? Infinity : 0 }} />
                  ))}
                </div>
              </div>

              <div className="flex-1 aspect-square bg-gray-900 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700">
                <div className="w-full h-full grid grid-cols-4 sm:grid-cols-6 gap-1">
                  {[...Array(24)].map((_, i) => (
                    <motion.div key={i} className="bg-gray-700 rounded-full" animate={{ scale: isPlaying ? [1, 1.2, 1] : 1, backgroundColor: isPlaying ? ['#374151', '#4b5563', '#374151'] : '#374151' }} transition={{ duration: 0.5, delay: i * 0.03, repeat: isPlaying ? Infinity : 0 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Cassette Display */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-600">
              {/* Cassette Tape */}
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-3 relative overflow-hidden">
                {/* Tape reels */}
                <div className="flex justify-between items-center mb-2">
                  <motion.div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center relative" animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700" />
                    <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-200 rounded-full" />
                  </motion.div>

                  <motion.div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 flex items-center justify-center relative" animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700" />
                    <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-200 rounded-full" />
                  </motion.div>
                </div>

                {/* Tape label */}
                <div className="bg-white rounded p-2 text-center">
                  <div className="text-[10px] sm:text-xs font-mono text-gray-800 mb-1">{station?.frequency || 'No Signal'}</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">{station?.name || 'RADIO'}</div>
                  <div className="text-[10px] sm:text-xs text-gray-600">{station?.genre || '---'}</div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
              {/* LED Display */}
              <div className="bg-green-900 rounded px-2 sm:px-3 py-1.5 sm:py-2 font-mono text-green-400 text-center text-[10px] sm:text-xs tracking-wider border border-green-800">
                {isPlaying ? '▶ PLAYING' : '⏸ PAUSED'} • {station?.city.toUpperCase() || 'OFFLINE'}
              </div>

              {/* Button Controls */}
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={onToggleShuffle} className={`p-1.5 sm:p-2 rounded-lg ${isShuffle ? 'bg-cyan-500' : 'bg-gray-800'} transition-colors`}>
                  <Shuffle className={`w-3 h-3 sm:w-4 sm:h-4 ${isShuffle ? 'text-white' : 'text-gray-400'}`} />
                </motion.button>

                <motion.button whileTap={{ scale: 0.9 }} onClick={onPrevious} className="p-2 sm:p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <SkipBack className={`w-4 h-4 sm:w-5 sm:h-5 text-white`} fill="currentColor" />
                </motion.button>

                <motion.button whileTap={{ scale: 0.95 }} onClick={onPlayPause} className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all">
                  {isPlaying ? <Pause className={`w-5 h-5 sm:w-6 sm:h-6 text-white`} fill="currentColor" /> : <Play className={`w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5`} fill="currentColor" />}
                </motion.button>

                <motion.button whileTap={{ scale: 0.9 }} onClick={onNext} className="p-2 sm:p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <SkipForward className={`w-4 h-4 sm:w-5 sm:h-5 text-white`} fill="currentColor" />
                </motion.button>

                <motion.button whileTap={{ scale: 0.95 }} onClick={onToggleFavorite} className={`p-1.5 sm:p-2 rounded-lg ${isFavorite ? 'bg-red-500' : 'bg-gray-800'} transition-colors`}>
                  <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'text-white fill-white' : 'text-gray-400'}`} />
                </motion.button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                <div ref={volumeRef} className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative cursor-pointer touch-none" onMouseDown={handleVolumeStart} onMouseMove={handleVolumeMove} onMouseUp={handleVolumeEnd} onMouseLeave={handleVolumeEnd} onTouchStart={handleVolumeStart} onTouchMove={handleVolumeMove} onTouchEnd={handleVolumeEnd}>
                  <motion.div className="h-full bg-gradient-to-r from-green-500 to-cyan-500" style={{ width: `${volume * 100}%` }} />
                  <motion.div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg" style={{ left: `calc(${volume * 100}% - 6px)` }} />
                </div>
                <span className="text-gray-400 text-[10px] sm:text-xs w-8 shrink-0 text-right">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Toggle Buttons */}
      <div className="w-full max-w-md flex-shrink-0 z-10">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-h-14 sm:max-h-16 overflow-y-auto">
          {CITY_GROUPS.map((city) => (
            <motion.button key={city} whileTap={{ scale: 0.95 }} onClick={() => onCitySelect(city)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${currentCity === city ? 'bg-cyan-500 text-white shadow-lg' : 'bg-white/20 text-white/80 hover:bg-white/30'}`}>
              {cityThemes[city].name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
