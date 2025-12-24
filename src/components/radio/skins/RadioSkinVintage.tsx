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

export const RadioSkinVintage: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
  onPlayPause,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Vintage Radio Body */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-[280px] bg-gradient-to-b from-[#8B4513] to-[#5D3A1A] rounded-2xl p-5 shadow-2xl"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Wood grain texture overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.1) 2px,
              rgba(0,0,0,0.1) 4px
            )`
          }}
        />

        {/* Speaker Grille */}
        <div className="bg-[#2a1a0a] rounded-xl p-3 mb-4 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #4a3a2a 1px, transparent 1px)',
              backgroundSize: '6px 6px'
            }}
          />

          {/* Speaker Animation */}
          <div className="relative h-24 flex items-center justify-center">
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.05, 1] : 1
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3a2a1a] to-[#1a0a00] flex items-center justify-center border-4 border-[#4a3a2a]"
            >
              <div className="w-8 h-8 rounded-full bg-[#2a1a0a] border-2 border-[#5a4a3a]" />
            </motion.div>
          </div>
        </div>

        {/* Dial Display */}
        <div className="bg-[#f5f0e0] rounded-lg p-3 mb-4 relative overflow-hidden">
          {/* Dial markings */}
          <div className="relative h-12">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#8B4513]" />

            {/* Frequency markings */}
            <div className="absolute inset-x-0 top-0 flex justify-between text-[8px] text-[#5a4a3a] font-serif">
              <span>88</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108</span>
            </div>

            {/* Dial needle */}
            <motion.div
              animate={{
                left: isPlaying ? ['30%', '70%', '50%'] : '50%'
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-3 w-0.5 h-8 bg-red-600 transform -translate-x-1/2"
            />

            {/* Station name */}
            <div className="absolute bottom-0 inset-x-0 text-center">
              <span className="text-[10px] text-[#5a4a3a] font-serif tracking-wide">
                {station.name}
              </span>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Tuning Knob Left */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#d4a574] to-[#8B4513] border-2 border-[#6a4a2a] shadow-lg">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#4a3a2a] rounded-full" />
            </div>
            <span className="block text-center text-[8px] text-[#d4a574] mt-1">TUNING</span>
          </div>

          {/* Power/Play Button */}
          <button
            onClick={onPlayPause}
            className={cn(
              "w-14 h-14 rounded-full",
              "bg-gradient-to-b from-[#d4a574] to-[#8B4513]",
              "border-4 border-[#6a4a2a]",
              "flex items-center justify-center",
              "shadow-lg active:shadow-inner",
              "transition-all active:scale-95"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#2a1a0a] border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-[#2a1a0a]" />
            ) : (
              <Play className="w-5 h-5 text-[#2a1a0a] ml-0.5" />
            )}
          </button>

          {/* Volume Knob Right */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#d4a574] to-[#8B4513] border-2 border-[#6a4a2a] shadow-lg">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#4a3a2a] rounded-full" />
            </div>
            <span className="block text-center text-[8px] text-[#d4a574] mt-1">VOLUME</span>
          </div>
        </div>

        {/* Power Indicator */}
        <div className="flex justify-center mt-4">
          <div className={cn(
            "w-3 h-3 rounded-full transition-all",
            isPlaying
              ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              : "bg-[#4a3a2a]"
          )} />
        </div>

        {/* Brand */}
        <div className="text-center mt-3">
          <span className="text-[10px] text-[#d4a574] font-serif tracking-[0.2em]">
            VINTAGE
          </span>
        </div>
      </motion.div>
    </div>
  );
};
