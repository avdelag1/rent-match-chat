import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useRadioPlayer, AVAILABLE_SKINS, COMING_SOON_SKINS, RadioSkin } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

const SKIN_PREVIEWS: Record<string, { emoji: string; gradient: string }> = {
  'minimal': { emoji: '🎵', gradient: 'from-gray-500 to-gray-700' },
  'ipod-classic': { emoji: '📱', gradient: 'from-gray-200 to-gray-400' },
  'walkman': { emoji: '📼', gradient: 'from-blue-600 to-blue-900' },
  'dj-controller': { emoji: '🎛️', gradient: 'from-gray-800 to-black' },
  'gameboy': { emoji: '🎮', gradient: 'from-gray-300 to-gray-500' },
  'vintage-radio': { emoji: '📻', gradient: 'from-amber-600 to-amber-900' },
  'apple-glass': { emoji: '✨', gradient: 'from-purple-400 to-pink-400' },
  'cyberpunk-neon': { emoji: '🌆', gradient: 'from-pink-500 to-cyan-500' },
  'tesla-dashboard': { emoji: '🚗', gradient: 'from-gray-700 to-gray-900' },
  'studio-rack': { emoji: '🎚️', gradient: 'from-zinc-600 to-zinc-800' },
  'bauhaus-dial': { emoji: '⬛', gradient: 'from-red-500 via-yellow-500 to-blue-500' },
  'space-hud': { emoji: '🛸', gradient: 'from-indigo-600 to-violet-800' },
  'tulum-jungle': { emoji: '🌿', gradient: 'from-green-600 to-emerald-800' },
  'analog-synth': { emoji: '🎹', gradient: 'from-orange-500 to-red-600' },
  'boombox-90s': { emoji: '📻', gradient: 'from-zinc-400 to-zinc-600' },
  'modular-eurorack': { emoji: '🔌', gradient: 'from-gray-600 to-gray-800' },
};

export const RadioSkinSelector: React.FC = () => {
  const { currentSkin, setSkin } = useRadioPlayer();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base mb-1">Player Skins</h3>
        <p className="text-xs text-muted-foreground">Choose your radio experience</p>
      </div>

      {/* Available Skins */}
      <div className="grid grid-cols-2 gap-3">
        {AVAILABLE_SKINS.map((skin, index) => {
          const preview = SKIN_PREVIEWS[skin.id];
          const isSelected = currentSkin === skin.id;

          return (
            <motion.button
              key={skin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSkin(skin.id as RadioSkin)}
              className={cn(
                "relative p-4 rounded-2xl text-left transition-all",
                "border-2",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-card/50 hover:bg-card"
              )}
            >
              {/* Preview */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl mb-3 flex items-center justify-center",
                  "bg-gradient-to-br",
                  preview.gradient
                )}
              >
                <span className="text-2xl">{preview.emoji}</span>
              </div>

              {/* Info */}
              <h4 className="font-semibold text-sm">{skin.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {skin.description}
              </p>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Coming Soon Section */}
      <div className="pt-4 border-t border-border/50">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Coming Soon
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {COMING_SOON_SKINS.map((skin) => {
            const preview = SKIN_PREVIEWS[skin.id];

            return (
              <div
                key={skin.id}
                className="relative p-3 rounded-xl bg-secondary/30 opacity-60"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg mb-2 flex items-center justify-center mx-auto",
                    "bg-gradient-to-br opacity-50",
                    preview.gradient
                  )}
                >
                  <span className="text-lg grayscale">{preview.emoji}</span>
                </div>
                <p className="text-[10px] text-center text-muted-foreground truncate">
                  {skin.name}
                </p>

                {/* Lock Icon */}
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
