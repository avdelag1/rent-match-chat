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

export const RadioSkinGameBoy: React.FC<SkinProps> = ({
  station,
  isPlaying,
  isLoading,
  onPlayPause,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Game Boy Body */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-[220px] bg-[#c4c4b4] rounded-[20px] rounded-br-[60px] p-4 shadow-2xl"
        style={{
          boxShadow: '4px 4px 0 #888, inset -2px -2px 0 #aaa, inset 2px 2px 0 #ddd'
        }}
      >
        {/* Top indent */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-2 bg-[#8a8a7a] rounded-full" />

        {/* Screen bezel */}
        <div className="bg-[#6b6b6b] rounded-lg p-3 mb-4 mx-2">
          {/* Screen label */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[8px] text-[#c4c4b4] italic font-bold">DOT MATRIX WITH STEREO SOUND</span>
          </div>

          {/* LCD Screen */}
          <div className="bg-[#8bac0f] rounded p-2 aspect-square relative overflow-hidden">
            {/* Pixel grid overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(#306230 1px, transparent 1px), linear-gradient(90deg, #306230 1px, transparent 1px)',
                backgroundSize: '4px 4px'
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-[#0f380f] font-mono">
              {/* Pixel art speaker icon */}
              <div className="mb-2 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[#0f380f]"
                    animate={{
                      height: isPlaying ? [8, 16 + i * 2, 8] : 4
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>

              <span className="text-[10px] font-bold tracking-tight truncate max-w-full px-2">
                {station.name.toUpperCase().slice(0, 12)}
              </span>

              <span className="text-[8px] mt-1">
                {isPlaying ? '♪ PLAYING ♪' : 'PRESS START'}
              </span>

              {isLoading && (
                <span className="text-[8px] mt-1 animate-pulse">LOADING...</span>
              )}
            </div>
          </div>

          {/* Power LED */}
          <div className="flex items-center gap-1 mt-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isPlaying ? "bg-red-500 shadow-[0_0_4px_red]" : "bg-[#4a4a4a]"
            )} />
            <span className="text-[6px] text-[#c4c4b4]">BATTERY</span>
          </div>
        </div>

        {/* Nintendo logo area */}
        <div className="text-center mb-3">
          <span className="text-[10px] font-bold italic text-[#333] tracking-wider">
            RADIO BOY
          </span>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-end px-2">
          {/* D-Pad */}
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-6 bg-[#3a3a3a] rounded-sm" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-6 bg-[#3a3a3a] rounded-sm" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-5 bg-[#3a3a3a] rounded-sm" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-5 bg-[#3a3a3a] rounded-sm" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#3a3a3a]" />
          </div>

          {/* A/B Buttons */}
          <div className="flex gap-2 -rotate-[25deg]">
            <button
              onClick={onPlayPause}
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-[#a01050] shadow-[2px_2px_0_#700030]",
                "flex items-center justify-center",
                "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
                "text-[#faa] font-bold text-xs"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#faa] border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                'B'
              ) : (
                'A'
              )}
            </button>
            <button
              onClick={onPlayPause}
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-[#a01050] shadow-[2px_2px_0_#700030]",
                "flex items-center justify-center",
                "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
                "text-[#faa] font-bold text-xs"
              )}
            >
              {isPlaying ? 'A' : 'B'}
            </button>
          </div>
        </div>

        {/* Start/Select */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-2 bg-[#5a5a5a] rounded-full -rotate-[25deg]" />
            <span className="text-[6px] text-[#5a5a5a] mt-1">SELECT</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={onPlayPause}
              className="w-8 h-2 bg-[#5a5a5a] rounded-full -rotate-[25deg] active:bg-[#4a4a4a]"
            />
            <span className="text-[6px] text-[#5a5a5a] mt-1">START</span>
          </div>
        </div>

        {/* Speaker grille */}
        <div className="absolute bottom-6 right-6 w-12 h-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-1 bg-[#8a8a7a] mb-1 rounded-full"
              style={{ width: `${60 + i * 8}%`, marginLeft: `${20 - i * 4}%` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
