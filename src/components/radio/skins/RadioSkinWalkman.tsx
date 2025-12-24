import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';
import { RadioStation } from '@/data/radioStations';
import { cn } from '@/lib/utils';

interface SkinProps {
  station: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
}

export const RadioSkinWalkman: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
  onPlayPause,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Walkman Body */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-[260px] bg-gradient-to-b from-[#2a4b7c] to-[#1a3a5c] rounded-2xl p-4 shadow-2xl border-2 border-[#3a5b8c]"
      >
        {/* Sony Logo */}
        <div className="text-center mb-2">
          <span className="text-[10px] font-bold text-[#c0c0c0] tracking-[0.3em]">
            WALKMAN
          </span>
        </div>

        {/* Cassette Window */}
        <div className="bg-[#1a1a1a] rounded-lg p-3 mb-4 border border-[#3a3a3a]">
          <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded p-2">
            {/* Tape Reels */}
            <div className="flex justify-between items-center mb-2">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full bg-[#8B4513] border-4 border-[#5a3510] flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-[#3a2a1a]" />
              </motion.div>

              <div className="flex-1 mx-2">
                {/* Tape */}
                <div className="h-1 bg-[#4a3a2a] rounded" />
                <div className="h-6 bg-gradient-to-b from-[#3a2a1a] to-[#2a1a0a] my-1 flex items-center justify-center">
                  <span className="text-[8px] text-[#a0a0a0] truncate px-1">
                    {station.name}
                  </span>
                </div>
                <div className="h-1 bg-[#4a3a2a] rounded" />
              </div>

              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full bg-[#8B4513] border-4 border-[#5a3510] flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-[#3a2a1a]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="bg-[#2a6b4f] rounded p-2 mb-4 font-mono">
          <div className="flex justify-between text-[10px] text-[#1a4030]">
            <span>FM STEREO</span>
            <span>{isPlaying ? '▶' : '■'}</span>
          </div>
          <div className="text-center text-lg text-[#0a2a1f] font-bold">
            {station.isLive ? 'LIVE' : '---'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <button className="w-12 h-8 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded flex items-center justify-center border border-[#5a5a5a]">
            <Rewind className="w-4 h-4 text-[#c0c0c0]" />
          </button>

          <button
            onClick={onPlayPause}
            className={cn(
              "w-16 h-8 rounded flex items-center justify-center border",
              "bg-gradient-to-b from-[#ff6b35] to-[#cc4a20] border-[#ff8b55]",
              "active:from-[#cc4a20] active:to-[#aa3a10]"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>

          <button className="w-12 h-8 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded flex items-center justify-center border border-[#5a5a5a]">
            <FastForward className="w-4 h-4 text-[#c0c0c0]" />
          </button>
        </div>

        {/* Volume Slider Decoration */}
        <div className="mt-4 flex items-center gap-2 px-4">
          <span className="text-[8px] text-[#8a9aaa]">VOL</span>
          <div className="flex-1 h-1 bg-[#1a2a3c] rounded-full">
            <div className="w-2/3 h-full bg-gradient-to-r from-[#ff6b35] to-[#ffaa75] rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
