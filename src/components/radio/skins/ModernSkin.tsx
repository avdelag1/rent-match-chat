import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, Heart, Shuffle, Volume2 } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { useState, useRef } from 'react';

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
    <div className={`h-screen ${bgColor} flex flex-col items-center justify-between p-4 pb-6 relative overflow-hidden`}>
      {/* Top Icons */}
      <div className="w-full max-w-md flex justify-between items-start">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleShuffle}
          className={`p-3 rounded-full ${buttonBg} transition-colors`}
        >
          <Shuffle className={`w-5 h-5 ${isShuffle ? accentColor : secondaryText}`} />
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
      </div>

      {/* Main Content - Scrolling Station Banner */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl space-y-8">
        {/* Playing Status */}
        {station && (
          <div className={`text-sm font-medium ${accentColor} flex items-center justify-center gap-2`}>
            <Radio className="w-4 h-4" />
            {isPlaying ? 'PLAYING' : 'PAUSED'}
          </div>
        )}

        {/* Scrolling Station Name Banner */}
        <div className="w-full overflow-hidden">
          <motion.div
            className={`text-5xl md:text-7xl font-bold ${textColor} whitespace-nowrap`}
            animate={isPlaying ? { x: [0, -1000] } : {}}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 15,
                ease: "linear"
              }
            }}
          >
            {station ? `${station.name}  •  ${station.name}  •  ${station.name}  •  ${station.name}  •  ${station.name}` : 'No Station Selected'}
          </motion.div>
        </div>

        {/* Genre Badge (if available) */}
        {station?.genre && (
          <div className={`px-4 py-2 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} ${textColor}`}>
            {station.genre}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center justify-center gap-6">
          {/* Previous Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className={`p-3 rounded-full ${buttonBg} transition-colors`}
          >
            <SkipBack className={`w-5 h-5 ${textColor}`} fill="currentColor" />
          </motion.button>

          {/* Play/Pause Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayPause}
            className={`p-6 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'} shadow-xl transition-all`}
          >
            {isPlaying ? (
              <Pause className={`w-7 h-7 ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`} fill="currentColor" />
            ) : (
              <Play className={`w-7 h-7 ${theme === 'dark' ? 'text-gray-900' : 'text-white'} ml-1`} fill="currentColor" />
            )}
          </motion.button>

          {/* Next Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className={`p-3 rounded-full ${buttonBg} transition-colors`}
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
