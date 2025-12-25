import React from 'react';
import { ChevronRight, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGenre } from '@/data/radioStations';
import { RadioStationCard } from './RadioStationCard';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

interface RadioGenreSectionProps {
  genre: RadioGenre;
  onViewAll: () => void;
}

export const RadioGenreSection: React.FC<RadioGenreSectionProps> = ({ genre, onViewAll }) => {
  const { shufflePlayGenre } = useRadioPlayer();

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    shufflePlayGenre(genre.id);
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{genre.emoji}</span>
          <div>
            <h2 className="font-bold text-base">{genre.name}</h2>
            <p className="text-xs text-muted-foreground">{genre.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShuffle}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title={`Shuffle ${genre.name}`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-primary gap-1 pr-1"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative -mx-4">
        <div
          className={cn(
            "flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2",
            "snap-x snap-mandatory"
          )}
        >
          {genre.stations.slice(0, 6).map((station) => (
            <div key={station.id} className="snap-start">
              <RadioStationCard station={station} />
            </div>
          ))}

          {/* View More Card */}
          <div
            onClick={onViewAll}
            className={cn(
              "w-[160px] shrink-0 rounded-2xl cursor-pointer snap-start",
              "bg-gradient-to-br",
              genre.gradient,
              "flex flex-col items-center justify-center aspect-square",
              "hover:scale-[1.02] transition-transform duration-200"
            )}
          >
            <div className="text-4xl mb-2">{genre.emoji}</div>
            <span className="text-white font-semibold text-sm">View All</span>
            <span className="text-white/70 text-xs">{genre.stations.length} stations</span>
          </div>
        </div>
      </div>
    </section>
  );
};
