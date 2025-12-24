import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { RadioStation } from '@/data/radioStations';

interface SkinProps {
  station: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
}

export const RadioSkinMinimal: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-[280px] flex flex-col items-center">
      {/* Album Art */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl"
      >
        <img
          src={station.artwork}
          alt={station.name}
          className="w-full h-full object-cover"
        />

        {/* Playing Animation Overlay */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white/80 rounded-full"
                  animate={{ height: [20, 40, 20] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Vinyl effect decoration */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute w-72 h-72 rounded-full border border-white/5 -z-10"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />
    </div>
  );
};
