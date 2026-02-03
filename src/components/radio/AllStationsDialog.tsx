import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Heart, Search, Filter } from 'lucide-react';
import { RadioStation, CityLocation } from '@/types/radio';
import { radioStations, cityThemes, getAllCities } from '@/data/radioStations';

interface AllStationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: RadioStation | null;
  onPlayStation: (station: RadioStation) => void;
  onToggleFavorite: (stationId: string) => void;
  favoriteStations: string[];
}

export function AllStationsDialog({
  isOpen,
  onClose,
  currentStation,
  onPlayStation,
  onToggleFavorite,
  favoriteStations
}: AllStationsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityLocation | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const allCities = getAllCities();

  // Get unique genres
  const allGenres = useMemo(() => {
    const genres = new Set(radioStations.map(s => s.genre));
    return Array.from(genres).sort();
  }, []);

  // Filter stations based on search and filters
  const filteredStations = useMemo(() => {
    return radioStations.filter(station => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.genre.toLowerCase().includes(searchQuery.toLowerCase());

      // City filter
      const matchesCity = selectedCity === 'all' || station.city === selectedCity;

      // Genre filter
      const matchesGenre = selectedGenre === 'all' || station.genre === selectedGenre;

      return matchesSearch && matchesCity && matchesGenre;
    });
  }, [searchQuery, selectedCity, selectedGenre]);

  // Group stations by city for organized display
  const stationsByCity = useMemo(() => {
    const grouped = new Map<CityLocation, RadioStation[]>();
    filteredStations.forEach(station => {
      if (!grouped.has(station.city)) {
        grouped.set(station.city, []);
      }
      grouped.get(station.city)!.push(station);
    });
    return grouped;
  }, [filteredStations]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white">All Radio Stations</h2>
              <p className="text-sm text-gray-400">{filteredStations.length} stations available</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-700 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations by name, genre, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="flex gap-3 flex-wrap">
                {/* City Filter */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value as CityLocation | 'all')}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">All Cities</option>
                  {allCities.map(city => (
                    <option key={city} value={city}>
                      {cityThemes[city].name}
                    </option>
                  ))}
                </select>

                {/* Genre Filter */}
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">All Genres</option>
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(selectedCity !== 'all' || selectedGenre !== 'all' || searchQuery !== '') && (
                  <button
                    onClick={() => {
                      setSelectedCity('all');
                      setSelectedGenre('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Station List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredStations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No stations found matching your criteria</p>
              </div>
            ) : (
              Array.from(stationsByCity.entries()).map(([city, stations]) => (
                <div key={city} className="space-y-2">
                  {/* City Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${cityThemes[city].primaryColor}, ${cityThemes[city].secondaryColor})`
                      }}
                    />
                    <h3 className="text-sm font-semibold text-gray-300">
                      {cityThemes[city].name}
                    </h3>
                    <div className="flex-1 h-px bg-gray-700" />
                  </div>

                  {/* Stations */}
                  {stations.map(station => {
                    const isPlaying = currentStation?.id === station.id;
                    const isFavorite = favoriteStations.includes(station.id);

                    return (
                      <motion.div
                        key={station.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-3 rounded-lg transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-500/20 border border-rose-500/50'
                            : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                        }`}
                        onClick={() => onPlayStation(station)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Play Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayStation(station);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              isPlaying
                                ? 'bg-rose-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <Play className="w-4 h-4" fill="currentColor" />
                          </button>

                          {/* Station Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate">
                                  {station.name}
                                </h4>
                                <p className="text-xs text-gray-400 truncate">
                                  {station.description}
                                </p>
                              </div>

                              {/* Favorite Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(station.id);
                                }}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                {station.frequency}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                {station.genre}
                              </span>
                              {isPlaying && (
                                <span className="px-2 py-0.5 bg-rose-500 rounded text-xs text-white">
                                  Now Playing
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Click any station to play</span>
              <span>♥ to favorite</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
