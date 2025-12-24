import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { RadioStation } from '@/data/radioStations';
import { cn } from '@/lib/utils';

interface SkinProps {
  station: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
}

export const RadioSkinIPod: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
  onPlayPause,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* iPod Body */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-[240px] bg-gradient-to-b from-[#f0f0f0] to-[#d0d0d0] rounded-[32px] p-4 shadow-2xl"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        {/* Screen */}
        <div className="bg-gradient-to-b from-[#8fa8a8] to-[#6b8a8a] rounded-lg p-2 mb-4 shadow-inner">
          {/* LCD Display */}
          <div className="bg-[#c5d8c8] rounded p-2 aspect-square">
            {/* Album Art */}
            <img
              src={station.artwork}
              alt={station.name}
              className="w-full h-full object-cover rounded"
            />
          </div>

          {/* Status Bar */}
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[8px] text-[#2a2a2a] font-mono">
              {isPlaying ? '▶ PLAYING' : '⏸ PAUSED'}
            </span>
            <span className="text-[8px] text-[#2a2a2a] font-mono">
              LIVE
            </span>
          </div>
        </div>

        {/* Click Wheel */}
        <div className="relative w-[160px] h-[160px] mx-auto">
          {/* Outer Ring */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-b from-[#f5f5f5] to-[#c5c5c5]"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(255,255,255,0.5)'
            }}
          >
            {/* Menu */}
            <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#333]">
              MENU
            </span>

            {/* Back */}
            <button className="absolute left-3 top-1/2 -translate-y-1/2">
              <SkipBack className="w-4 h-4 text-[#333]" />
            </button>

            {/* Forward */}
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <SkipForward className="w-4 h-4 text-[#333]" />
            </button>

            {/* Play/Pause */}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-[#333]">
              ▶❚❚
            </span>
          </div>

          {/* Center Button */}
          <button
            onClick={onPlayPause}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-16 h-16 rounded-full",
              "bg-gradient-to-b from-[#e8e8e8] to-[#b8b8b8]",
              "flex items-center justify-center",
              "active:scale-95 transition-transform"
            )}
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-[#333]" />
            ) : (
              <Play className="w-5 h-5 text-[#333] ml-0.5" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
