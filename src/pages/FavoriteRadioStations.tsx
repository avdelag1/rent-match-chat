import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRadioContext } from '@/contexts/RadioContext';
import { getStationById } from '@/data/radioStations';
import { ArrowLeft, Play, Heart, Radio as RadioIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoriteRadioStations() {
  const navigate = useNavigate();
  const {
    state,
    play,
    toggleFavorite,
    isStationFavorite
  } = useRadioContext();

  const favoriteStations = state.favorites
    .map(id => getStationById(id))
    .filter(station => station !== undefined);

  const handlePlayStation = (stationId: string) => {
    const station = getStationById(stationId);
    if (station) {
      play(station);
      toast.success(`Now playing ${station.name}`);
      navigate('/radio/player');
    }
  };

  const handleToggleFavorite = (stationId: string, stationName: string) => {
    toggleFavorite(stationId);
    const isFav = isStationFavorite(stationId);
    toast.success(isFav ? `Added ${stationName} to favorites` : `Removed ${stationName} from favorites`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/radio/player')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              Liked Stations
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              {favoriteStations.length} {favoriteStations.length === 1 ? 'station' : 'stations'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {favoriteStations.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-white/5 rounded-full mb-6">
              <RadioIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Liked Stations Yet</h2>
            <p className="text-gray-400 mb-8">
              Start exploring and add your favorite stations to this list
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/radio/stations')}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-colors"
            >
              Browse Stations
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteStations.map((station) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Play Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlayStation(station.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      state.currentStation?.id === station.id && state.isPlaying
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  </motion.button>

                  {/* Station Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {station.frequency}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">
                        {station.genre}
                      </span>
                      {state.currentStation?.id === station.id && state.isPlaying && (
                        <span className="text-xs px-2 py-1 bg-rose-500/20 rounded-full text-rose-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                          Playing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleFavorite(station.id, station.name)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isStationFavorite(station.id)
                          ? 'text-rose-500 fill-rose-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Description */}
                {station.description && (
                  <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                    {station.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
