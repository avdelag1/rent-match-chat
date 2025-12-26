import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { RadioStation } from '@/data/radioStations';
import { cn } from '@/lib/utils';

interface RadioStationCardProps {
  station: RadioStation;
  compact?: boolean;
  showRemoveButton?: boolean;
}

export const RadioStationCard: React.FC<RadioStationCardProps> = ({ station, compact = false, showRemoveButton = false }) => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    play,
    pause,
    toggleFavorite,
    isFavorite,
    expandPlayer
  } = useRadioPlayer();

  const isCurrentStation = currentStation?.id === station.id;
  const isCurrentlyPlaying = isCurrentStation && isPlaying;
  const isFav = isFavorite(station.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pause();
    } else {
      play(station);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(station.id);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(station.id);
  };

  const handleCardClick = () => {
    if (!isCurrentStation) {
      play(station);
    }
    // Always expand the player when clicking a station
    expandPlayer();
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 cursor-pointer",
          "hover:bg-card/80 transition-all duration-200",
          isCurrentStation && "bg-primary/10 border-primary/30"
        )}
      >
        {/* Artwork */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
          <img
            src={station.artwork}
            alt={station.name}
            className="w-full h-full object-cover"
          />
          {isCurrentStation && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      animate={{ height: [8, 16, 8] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {station.isLive && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            <span className="text-[10px] text-muted-foreground uppercase">
              {station.countryCode}
            </span>
          </div>
          <h3 className="font-semibold text-sm truncate">{station.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{station.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {showRemoveButton ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveClick}
              className="w-9 h-9 shrink-0 hover:bg-red-500/10 hover:text-red-500"
              title="Remove from favorites"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="w-9 h-9 shrink-0"
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  isFav ? "text-red-500 fill-red-500" : "text-muted-foreground"
                )}
              />
            </Button>
          )}
          <Button
            size="icon"
            onClick={handlePlayClick}
            className={cn(
              "w-10 h-10 rounded-full shrink-0",
              isCurrentlyPlaying
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {isLoading && isCurrentStation ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isCurrentlyPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={cn(
        "relative w-[160px] shrink-0 rounded-2xl overflow-hidden cursor-pointer",
        "bg-card border border-border/50 shadow-lg",
        "hover:shadow-xl transition-all duration-300",
        isCurrentStation && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* Artwork */}
      <div className="relative aspect-square">
        <img
          src={station.artwork}
          alt={station.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Live Badge */}
        {station.isLive && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-red-500/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-all",
              isFav ? "text-red-500 fill-red-500 scale-110" : "text-white/80"
            )}
          />
        </button>

        {/* Play Button / Now Playing Indicator */}
        <div className="absolute bottom-2 right-2">
          <Button
            size="icon"
            onClick={handlePlayClick}
            className={cn(
              "w-10 h-10 rounded-full shadow-lg transition-all",
              isCurrentlyPlaying
                ? "bg-white text-black hover:bg-white/90"
                : "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
            )}
          >
            {isLoading && isCurrentStation ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isCurrentlyPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Country Badge */}
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] text-white/70 font-medium">
            {station.countryCode}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{station.name}</h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {station.description}
        </p>
      </div>
    </motion.div>
  );
};
