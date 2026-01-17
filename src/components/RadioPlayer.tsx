import { memo, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface RadioStation {
  name: string;
  url: string;
  description?: string;
}

// Radio stations for each theme
export const RADIO_STATIONS: Record<string, RadioStation> = {
  'sunset-coconuts': {
    name: 'Radio Tulum',
    url: 'https://stream.zeno.fm/d8ta12arf5zuv', // Radio Tulum - tropical house & chill vibes
    description: 'Tulum tropical beats',
  },
  'vehicles-properties': {
    name: 'Dubai Radio',
    url: 'https://stream.zeno.fm/nq6s05sm938uv', // Dubai Radio - luxury city sounds
    description: 'Dubai luxury vibes',
  },
  'ducks': {
    name: 'Ibiza Global Radio',
    url: 'https://ibizaglobalradio.streaming-pro.com/igr.mp3', // Ibiza Global Radio - party music
    description: 'Ibiza party vibes',
  },
  'stars': {
    name: 'Chillout Lounge',
    url: 'https://stream.zeno.fm/b9rdaqxum18uv', // Ambient chillout
    description: 'Cosmic ambient music',
  },
  'ny-red': {
    name: 'Jamaica Irie FM',
    url: 'https://ais-edge09-live365-dal02.cdnstream.com/a10108', // Jamaica reggae station
    description: 'Authentic reggae vibes',
  },
};

interface RadioPlayerProps {
  stationKey: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const RadioPlayer = memo(({ stationKey, isEnabled, onToggle }: RadioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const station = RADIO_STATIONS[stationKey];

  useEffect(() => {
    if (!station || !isEnabled) {
      // Stop and cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
      return;
    }

    // Create or update audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    // Set new source and play
    if (audioRef.current.src !== station.url) {
      audioRef.current.src = station.url;
      audioRef.current.load();
    }

    // Try to play (may fail due to autoplay policies)
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.log('Radio autoplay prevented:', error);
        setIsPlaying(false);
      });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [station, isEnabled, volume]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!station) return null;

  return (
    <AnimatePresence>
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl border border-white/20 flex items-center gap-3">
            {/* Station info */}
            <div className="text-white text-sm">
              <div className="font-semibold">{station.name}</div>
              {station.description && (
                <div className="text-xs text-white/60">{station.description}</div>
              )}
            </div>

            {/* Volume control */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Play/pause indicator */}
            {isPlaying && (
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-1 h-3 bg-green-500 rounded-full"
                  animate={{ height: [12, 20, 12] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <motion.div
                  className="w-1 h-3 bg-green-500 rounded-full"
                  animate={{ height: [12, 16, 12] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1 h-3 bg-green-500 rounded-full"
                  animate={{ height: [12, 18, 12] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            )}

            {/* Mute/unmute button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/60" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

RadioPlayer.displayName = 'RadioPlayer';
