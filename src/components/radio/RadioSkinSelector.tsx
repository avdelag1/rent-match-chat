import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRadioPlayer, AVAILABLE_SKINS, RadioSkin } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

interface RadioSkinSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RadioSkinSelector: React.FC<RadioSkinSelectorProps> = ({ isOpen, onClose }) => {
  const { currentSkin, setSkin } = useRadioPlayer();

  const handleSelectSkin = (skinId: RadioSkin) => {
    setSkin(skinId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-background rounded-t-3xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <h2 className="text-lg font-bold">Choose Player Skin</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Skin Grid */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_SKINS.map((skin) => {
                  const isSelected = currentSkin === skin.id;
                  return (
                    <motion.button
                      key={skin.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectSkin(skin.id)}
                      className={cn(
                        "relative p-3 rounded-xl border-2 transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      )}
                    >
                      {/* Gradient Preview */}
                      <div
                        className={cn(
                          "w-full h-20 rounded-lg mb-2 flex items-center justify-center text-3xl",
                          `bg-gradient-to-br ${skin.gradient}`
                        )}
                      >
                        {skin.emoji}
                      </div>

                      {/* Info */}
                      <h3 className="font-semibold text-sm">{skin.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{skin.description}</p>

                      {/* Selected Check */}
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

              {/* Info Footer */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Your skin preference is saved automatically and will persist across sessions.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
