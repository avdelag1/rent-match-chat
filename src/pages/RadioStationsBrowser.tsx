import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Heart, Plus, Search, Filter, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioStation, CityLocation } from '@/types/radio';
import { radioStations, cityThemes, getAllCities } from '@/data/radioStations';
import { useRadioContext } from '@/contexts/RadioContext';
import { PlaylistDialog } from '@/components/radio/PlaylistDialog';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';

export default function RadioStationsBrowser() {
  const navigate = useNavigate();
  const {
    state,
    play,
    toggleFavorite,
    isStationFavorite
  } = useRadioContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityLocation | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);

  const allCities = getAllCities();

  // Get unique genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    radioStations.forEach(station => {
      if (station.genre) genres.add(station.genre);
    });
    return Array.from(genres).sort();
  }, []);

  // Filter stations
  const filteredStations = useMemo(() => {
    return radioStations.filter(station => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // City filter
      const matchesCity = selectedCity === 'all' || station.city === selectedCity;

      // Genre filter
      const matchesGenre = selectedGenre === 'all' || station.genre === selectedGenre;

      return matchesSearch && matchesCity && matchesGenre;
    });
  }, [searchQuery, selectedCity, selectedGenre]);

  // Group stations by city
  const stationsByCity = useMemo(() => {
    const grouped: Record<CityLocation, RadioStation[]> = {} as Record<CityLocation, RadioStation[]>;
    filteredStations.forEach(station => {
      if (!grouped[station.city]) {
        grouped[station.city] = [];
      }
      grouped[station.city].push(station);
    });
    return grouped;
  }, [filteredStations]);

  const handlePlayStation = (station: RadioStation) => {
    play(station);
    toast.success(`Playing ${station.name}`);
  };

  const handleToggleFavorite = (station: RadioStation) => {
    toggleFavorite(station.id);
    const isFav = isStationFavorite(station.id);
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleAddToPlaylist = (station: RadioStation) => {
    setSelectedStation(station);
    setShowPlaylistDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('all');
    setSelectedGenre('all');
  };

  const activeFiltersCount = [
    searchQuery !== '',
    selectedCity !== 'all',
    selectedGenre !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Radio Stations</h1>
                <p className="text-sm text-gray-400">
                  {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search stations, genres, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* City Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCity('all')}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedCity === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        All Cities
                      </button>
                      {allCities.map(city => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedCity === city
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {cityThemes[city].name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedGenre('all')}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedGenre === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        All Genres
                      </button>
                      {allGenres.map(genre => (
                        <button
                          key={genre}
                          onClick={() => setSelectedGenre(genre)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedGenre === genre
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Station List */}
      <div className="container mx-auto px-4 py-6">
        {filteredStations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📻</div>
            <h2 className="text-2xl font-bold mb-2">No stations found</h2>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="space-y-8">
            {Object.entries(stationsByCity).map(([city, stations]) => (
              <div key={city}>
                <div
                  className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700"
                  style={{
                    borderColor: cityThemes[city as CityLocation].primaryColor
                  }}
                >
                  <h2 className="text-2xl font-bold">{cityThemes[city as CityLocation].name}</h2>
                  <span className="text-sm text-gray-400">
                    {stations.length} station{stations.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stations.map(station => {
                    const isFavorite = isStationFavorite(station.id);
                    const isPlaying = state.currentStation?.id === station.id && state.isPlaying;
                    const cityTheme = cityThemes[station.city];

                    return (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cityTheme.primaryColor }}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleToggleFavorite(station)}
                              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Heart
                                className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                              />
                            </button>
                            <button
                              onClick={() => handleAddToPlaylist(station)}
                              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{station.name}</h3>
                        <p className="text-sm text-gray-400 mb-1">{station.frequency}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          {station.genre}
                        </p>

                        {station.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                            {station.description}
                          </p>
                        )}

                        <button
                          onClick={() => handlePlayStation(station)}
                          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                            isPlaying
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        >
                          <Play className="w-4 h-4" fill={isPlaying ? 'currentColor' : 'none'} />
                          {isPlaying ? 'Playing' : 'Play'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredStations.map(station => {
              const isFavorite = isStationFavorite(station.id);
              const isPlaying = state.currentStation?.id === station.id && state.isPlaying;
              const cityTheme = cityThemes[station.city];

              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-800 transition-all flex items-center gap-4"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cityTheme.primaryColor }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{station.name}</h3>
                        <p className="text-sm text-gray-400">
                          {station.frequency} • {station.genre} • {cityTheme.name}
                        </p>
                        {station.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {station.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(station)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(station)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handlePlayStation(station)}
                      className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all ${
                        isPlaying
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      <Play className="w-4 h-4" fill={isPlaying ? 'currentColor' : 'none'} />
                      {isPlaying ? 'Playing' : 'Play'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Playlist Dialog */}
      <PlaylistDialog
        isOpen={showPlaylistDialog}
        onClose={() => {
          setShowPlaylistDialog(false);
          setSelectedStation(null);
        }}
        currentStation={selectedStation}
        onPlayStation={handlePlayStation}
        addingMode={true}
      />
    </div>
  );
}
