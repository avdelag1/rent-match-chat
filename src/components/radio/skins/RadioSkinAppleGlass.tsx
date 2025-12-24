import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { RadioStation } from '@/data/radioStations';
import { cn } from '@/lib/utils';

interface SkinProps {
  station: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
}

export const RadioSkinAppleGlass: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
  onPlayPause,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-[300px]">
      {/* Glass Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full relative"
      >
        {/* Background Blur Element */}
        <div
          className="absolute inset-0 rounded-[32px] overflow-hidden"
          style={{
            background: `url(${station.artwork})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) saturate(1.5)',
            transform: 'scale(1.2)',
            opacity: 0.6
          }}
        />

        {/* Glass Surface */}
        <div
          className="relative rounded-[32px] p-6 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          {/* Album Art */}
          <motion.div
            animate={{
              boxShadow: isPlaying
                ? [
                    '0 20px 60px rgba(0,0,0,0.3)',
                    '0 25px 70px rgba(0,0,0,0.4)',
                    '0 20px 60px rgba(0,0,0,0.3)'
                  ]
                : '0 20px 60px rgba(0,0,0,0.3)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full aspect-square rounded-2xl overflow-hidden mb-6"
          >
            <img
              src={station.artwork}
              alt={station.name}
              className="w-full h-full object-cover"
            />

            {/* Playing Overlay */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <div className="flex items-end gap-1 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      animate={{ height: [8, 20, 8] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </motion.div>

          {/* Station Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {station.isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 backdrop-blur-sm rounded-full text-[10px] font-semibold text-red-400">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-red-500 rounded-full"
                  />
                  LIVE
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white truncate">
              {station.name}
            </h3>
            <p className="text-sm text-white/60 truncate">
              {station.country}
            </p>
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-center justify-center gap-0.5 h-8 mb-6">
            {[...Array(32)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/40 rounded-full"
                animate={{
                  height: isPlaying
                    ? [4, Math.random() * 20 + 8, 4]
                    : 4
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.02
                }}
              />
            ))}
          </div>

          {/* Play Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayPause}
              className={cn(
                "w-16 h-16 rounded-full",
                "bg-white/20 backdrop-blur-md",
                "border border-white/30",
                "flex items-center justify-center",
                "shadow-lg",
                "transition-colors hover:bg-white/30"
              )}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
