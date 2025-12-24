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

export const RadioSkinDJ: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
  onPlayPause,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-[320px]">
      {/* DJ Controller */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 shadow-2xl border border-[#333]"
      >
        {/* Top Section - Decks */}
        <div className="flex gap-4 mb-4">
          {/* Left Deck */}
          <div className="flex-1">
            <div className="aspect-square rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-2 border border-[#3a3a3a]">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full rounded-full bg-[#111] relative overflow-hidden"
              >
                {/* Vinyl grooves */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-[#222]"
                    style={{ margin: `${i * 8}%` }}
                  />
                ))}
                {/* Label */}
                <div className="absolute inset-1/3 rounded-full overflow-hidden">
                  <img
                    src={station.artwork}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Center hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#333]" />
              </motion.div>
            </div>
          </div>

          {/* Center Mixer */}
          <div className="w-20 flex flex-col items-center justify-center gap-2">
            {/* Channel faders */}
            <div className="w-full h-16 bg-[#0a0a0a] rounded p-1 flex justify-around">
              <div className="w-2 h-full bg-[#222] rounded-full relative">
                <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-full" />
              </div>
              <div className="w-2 h-full bg-[#222] rounded-full relative">
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-purple-500 to-purple-400 rounded-full" />
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={onPlayPause}
              className={cn(
                "w-12 h-12 rounded-full",
                "bg-gradient-to-b from-[#333] to-[#1a1a1a]",
                "border-2 border-[#444]",
                "flex items-center justify-center",
                "active:scale-95 transition-transform",
                isPlaying && "border-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-cyan-400" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Right Deck */}
          <div className="flex-1">
            <div className="aspect-square rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-2 border border-[#3a3a3a]">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full rounded-full bg-[#111] relative overflow-hidden"
              >
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-[#222]"
                    style={{ margin: `${i * 8}%` }}
                  />
                ))}
                <div className="absolute inset-1/3 rounded-full overflow-hidden">
                  <img
                    src={station.artwork}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#333]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Display */}
        <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#222]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500"
                  animate={{
                    height: isPlaying ? [8, 16 + Math.random() * 8, 8] : 4
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: i * 0.05
                  }}
                />
              ))}
            </div>
            <span className={cn(
              "text-[10px] font-mono",
              isPlaying ? "text-green-400" : "text-[#555]"
            )}>
              {isPlaying ? 'ON AIR' : 'STANDBY'}
            </span>
          </div>

          <div className="text-center">
            <p className="text-cyan-400 text-xs font-mono truncate">{station.name}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
