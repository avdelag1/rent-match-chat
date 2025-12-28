import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Search,
  Heart,
  Clock,
  ChevronLeft,
  Settings,
  Shuffle,
  Palette,
  Check,
  AlertCircle,
  RefreshCw,
  ListMusic,
  Plus,
  Play,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRadioPlayer, AVAILABLE_SKINS, RadioSkin } from '@/hooks/useRadioPlayer';
import { orderedRadioGenres as radioGenres, getAllStations, searchStations, RadioStation, RadioGenre } from '@/data/radioStations';
import { RadioStationCard } from '@/components/radio/RadioStationCard';
import { RadioGenreSection } from '@/components/radio/RadioGenreSection';
import { RadioSleepTimer } from '@/components/radio/RadioSleepTimer';
import { PlaylistModal } from '@/components/radio/PlaylistModal';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type ViewMode = 'browse' | 'favorites' | 'recent' | 'search' | 'settings' | 'playlists';

const RadioPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState<'create' | 'manage' | 'view'>('manage');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentStation,
    isPlayerExpanded,
    favorites,
    recentlyPlayed,
    playlists,
    expandPlayer,
    shufflePlay,
    shufflePlayFavorites,
    shufflePlayPlaylist,
    play,
    currentSkin,
    setSkin
  } = useRadioPlayer();

  // Smart back handler - clears internal state first, then navigates to dashboard
  const handleBack = () => {
    // If viewing a specific genre, go back to browse
    if (selectedGenre) {
      setSelectedGenre(null);
      return;
    }
    // If in search mode with query, clear search
    if (viewMode === 'search' && searchQuery) {
      setSearchQuery('');
      setViewMode('browse');
      return;
    }
    // If in any non-browse view, go back to browse
    if (viewMode !== 'browse') {
      setViewMode('browse');
      return;
    }
    // Always navigate to the user's dashboard directly to avoid history issues
    const role = user?.user_metadata?.role;
    navigate(role === 'owner' ? '/owner/dashboard' : '/client/dashboard', { replace: true });
  };

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
          {/* Player Skins Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Player Skins</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a visual style for your radio player
            </p>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_SKINS.map((skin) => {
                const isSelected = currentSkin === skin.id;
                return (
                  <motion.button
                    key={skin.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSkin(skin.id)}
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
                        "w-full h-16 rounded-lg mb-2 flex items-center justify-center text-2xl",
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
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sleep Timer Section */}
          <div className="border-t border-border pt-6">
            <RadioSleepTimer />
          </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
              Your Favorites
            </h2>
            {favoriteStations.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shufflePlayFavorites}
                  className="gap-1.5"
                  title="Shuffle favorites"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlaylistModalMode('create');
                    setSelectedPlaylistId(undefined);
                    setPlaylistModalOpen(true);
                  }}
                  className="gap-1.5"
                  title="Create playlist from favorites"
                >
                  <Plus className="w-4 h-4" />
                  Create Playlist
                </Button>
              </div>
            )}
          </div>
          {favoriteStations.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {favoriteStations.map(station => (
                <RadioStationCard key={station.id} station={station} compact showRemoveButton />
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

    // Playlists view
    if (viewMode === 'playlists') {
      return (
        <div className="space-y-4 pb-32">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-primary" />
              Your Playlists
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPlaylistModalMode('create');
                setSelectedPlaylistId(undefined);
                setPlaylistModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Playlist
            </Button>
          </div>
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {playlists.map(playlist => {
                const playlistStations = playlist.stationIds
                  .map(id => getAllStations().find(s => s.id === id))
                  .filter(Boolean) as RadioStation[];
                const firstStation = playlistStations[0];

                return (
                  <motion.div
                    key={playlist.id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-secondary/50 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Playlist Artwork */}
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {firstStation?.artwork ? (
                          <img
                            src={firstStation.artwork}
                            alt={playlist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      {/* Playlist Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {playlist.stationIds.length} station{playlist.stationIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {playlist.stationIds.length > 0 && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9"
                              onClick={() => {
                                if (firstStation) play(firstStation);
                              }}
                              title="Play"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9"
                              onClick={() => shufflePlayPlaylist(playlist.id)}
                              title="Shuffle"
                            >
                              <Shuffle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => {
                            setPlaylistModalMode('view');
                            setSelectedPlaylistId(playlist.id);
                            setPlaylistModalOpen(true);
                          }}
                          title="View"
                        >
                          <ListMusic className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ListMusic className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No playlists yet</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Create a playlist from your favorite stations
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5"
                onClick={() => {
                  setPlaylistModalMode('create');
                  setPlaylistModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Playlist
              </Button>
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
        {/* Stream Notice Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">
                Live Radio Streams
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Some radio stations may experience delays or temporary outages due to their live nature.
                If a station isn't working, try the <RefreshCw className="w-3 h-3 inline mx-0.5" /> shuffle button
                or choose another station. Most streams work great!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Genre Sections - No duplicate featured card */}
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
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Main Content - hidden when player is expanded (global overlay handles the player) */}
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
                  onClick={handleBack}
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
                { id: 'playlists', label: 'Playlists', icon: ListMusic },
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
        <main className="px-4 py-4 pb-32">
          {renderContent()}
        </main>
      </div>

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        mode={playlistModalMode}
        playlistId={selectedPlaylistId}
        initialStationIds={playlistModalMode === 'create' && viewMode === 'favorites' ? favorites : []}
      />
    </div>
  );
};

export default RadioPage;
