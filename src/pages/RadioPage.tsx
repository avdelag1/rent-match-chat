import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Search,
  Heart,
  Clock,
  ChevronLeft,
  Settings,
  Sparkles,
  Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { radioGenres, getAllStations, searchStations, RadioStation, RadioGenre } from '@/data/radioStations';
import { RadioStationCard } from '@/components/radio/RadioStationCard';
import { RadioGenreSection } from '@/components/radio/RadioGenreSection';
import { RadioPlayerSkinned } from '@/components/radio/RadioPlayerSkinned';
import { RadioMiniPlayer } from '@/components/radio/RadioMiniPlayer';
import { RadioSleepTimer } from '@/components/radio/RadioSleepTimer';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'browse' | 'favorites' | 'recent' | 'search' | 'settings';

const RadioPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    currentStation,
    isPlayerExpanded,
    favorites,
    recentlyPlayed,
    expandPlayer,
    shufflePlay
  } = useRadioPlayer();

  // Get favorite stations
  const favoriteStations = useMemo(() => {
    const allStations = getAllStations();
    return favorites.map(id => allStations.find(s => s.id === id)).filter(Boolean) as RadioStation[];
  }, [favorites]);

  // Get recently played stations
  const recentStations = useMemo(() => {
    const allStations = getAllStations();
    return recentlyPlayed.map(id => allStations.find(s => s.id === id)).filter(Boolean) as RadioStation[];
  }, [recentlyPlayed]);

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchStations(searchQuery);
  }, [searchQuery]);

  // Selected genre data
  const selectedGenreData = useMemo(() => {
    if (!selectedGenre) return null;
    return radioGenres.find(g => g.id === selectedGenre);
  }, [selectedGenre]);

  const renderContent = () => {
    // Settings view
    if (viewMode === 'settings') {
      return (
        <div className="space-y-6 pb-32">
          <RadioSleepTimer />
        </div>
      );
    }

    // Search view
    if (viewMode === 'search' && searchQuery.length >= 2) {
      return (
        <div className="space-y-4 pb-32">
          <h2 className="text-lg font-semibold text-foreground/80">
            {searchResults.length} results for "{searchQuery}"
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {searchResults.map(station => (
              <RadioStationCard key={station.id} station={station} compact />
            ))}
          </div>
          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No stations found</p>
            </div>
          )}
        </div>
      );
    }

    // Favorites view
    if (viewMode === 'favorites') {
      return (
        <div className="space-y-4 pb-32">
          <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            Your Favorites
          </h2>
          {favoriteStations.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {favoriteStations.map(station => (
                <RadioStationCard key={station.id} station={station} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Tap the heart on any station to save it
              </p>
            </div>
          )}
        </div>
      );
    }

    // Recent view
    if (viewMode === 'recent') {
      return (
        <div className="space-y-4 pb-32">
          <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recently Played
          </h2>
          {recentStations.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {recentStations.map(station => (
                <RadioStationCard key={station.id} station={station} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No history yet</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Your recently played stations will appear here
              </p>
            </div>
          )}
        </div>
      );
    }

    // Single genre view
    if (selectedGenre && selectedGenreData) {
      return (
        <div className="space-y-4 pb-32">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedGenre(null)}
              className="shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>{selectedGenreData.emoji}</span>
                <span>{selectedGenreData.name}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{selectedGenreData.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {selectedGenreData.stations.map(station => (
              <RadioStationCard key={station.id} station={station} />
            ))}
          </div>
        </div>
      );
    }

    // Browse view (default)
    return (
      <div className="space-y-6 pb-32">
        {/* Featured / Now Playing Promo */}
        {currentStation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer"
            onClick={expandPlayer}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentStation.artwork})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            <div className="relative p-6 flex items-end min-h-[180px]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                  <span className="text-white/70 text-xs">{currentStation.country}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{currentStation.name}</h3>
                <p className="text-white/70 text-sm">{currentStation.description}</p>
              </div>
              <Button
                size="icon"
                className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 shadow-xl"
              >
                <Sparkles className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Genre Sections */}
        {radioGenres.map((genre) => (
          <RadioGenreSection
            key={genre.id}
            genre={genre}
            onViewAll={() => setSelectedGenre(genre.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Full Screen Player with Skins */}
      <AnimatePresence>
        {isPlayerExpanded && <RadioPlayerSkinned />}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "transition-opacity duration-300",
        isPlayerExpanded && "opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="px-4 pt-[calc(var(--safe-top)+8px)] pb-3">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Radio</h1>
                  <p className="text-xs text-muted-foreground">Curated stations</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shufflePlay}
                  className="text-muted-foreground hover:text-primary"
                  title="Shuffle all stations"
                >
                  <Shuffle className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'settings' ? 'browse' : 'settings')}
                  className={cn(viewMode === 'settings' && "bg-primary/10 text-primary")}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stations, genres, countries..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    setViewMode('search');
                  } else if (viewMode === 'search') {
                    setViewMode('browse');
                  }
                }}
                className="pl-9 h-11 bg-secondary/50 border-0 rounded-xl"
              />
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {[
                { id: 'browse', label: 'Browse', icon: Radio },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'recent', label: 'Recent', icon: Clock },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={viewMode === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode(tab.id as ViewMode);
                    setSelectedGenre(null);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "shrink-0 rounded-xl gap-1.5",
                    viewMode === tab.id && "bg-primary text-primary-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-4">
          {renderContent()}
        </main>
      </div>

      {/* Mini Player */}
      {currentStation && !isPlayerExpanded && <RadioMiniPlayer />}
    </div>
  );
};

export default RadioPage;
