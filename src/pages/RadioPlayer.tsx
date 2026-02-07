import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '@/contexts/RadioContext';
import { getStationsByCity, getStationById, cityThemes, CityLocation } from '@/data/radioStations';
import { RadioStation } from '@/types/radio';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Music, X, List, ChevronDown } from 'lucide-react';

export default function RadioPlayer() {
  const { state, loading, error, togglePlayPause, changeStation, setCity, toggleShuffle, toggleFavorite, play, setVolume } = useRadio();
  const [showStationList, setShowStationList] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);

  // Get current city theme
  const theme = cityThemes[state.currentCity];

  // Get stations for current city
  const cityStations = getStationsByCity(state.currentCity);

  // Get all cities
  const allCities = Object.keys(cityThemes) as CityLocation[];

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          changeStation('next');
          break;
        case 'ArrowLeft':
          changeStation('prev');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, state.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, state.volume - 0.1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, changeStation, setVolume, state.volume]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading Radio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-red-500 text-lg font-bold mb-2">Stream Error</div>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-full font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background with subtle gradient */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.primaryColor} 0%, #000 70%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider">Now Playing</p>
          </div>

          <button
            onClick={() => setShowStationList(true)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content - Station Info & Visual */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          {/* Station Visual */}
          <motion.div
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl mb-6 flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
              boxShadow: `0 20px 60px ${theme.primaryColor}40`
            }}
            animate={{
              rotate: state.isPlaying ? 360 : 0
            }}
            transition={{
              duration: state.isPlaying ? 20 : 0,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* Animated inner ring when playing */}
            {state.isPlaying && (
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-white/20 border-dashed"
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Station initial */}
            <div className="text-center">
              <span className="text-5xl sm:text-6xl font-bold text-white/90">
                {state.currentStation?.name.charAt(0) || '?'}
              </span>
            </div>
          </motion.div>

          {/* Station Info */}
          <div className="text-center mb-6">
            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-white mb-1"
              key={state.currentStation?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {state.currentStation?.name || 'Select Station'}
            </motion.h1>
            <p className="text-white/50 text-sm">{state.currentStation?.genre}</p>
            <p className="text-white/40 text-xs">{state.currentStation?.frequency} • {cityThemes[state.currentCity].name}</p>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowCitySelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors text-sm"
            >
              <span>{cityThemes[state.currentCity].name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {state.isShuffle && (
              <motion.button
                onClick={toggleShuffle}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-6">
          {/* Volume */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setVolume(state.volume > 0 ? 0 : 0.7)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {state.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ width: `${state.volume * 100}%` }}
              />
            </div>
            <span className="text-white/40 text-xs w-8 text-right">{Math.round(state.volume * 100)}%</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={() => changeStation('prev')}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            <motion.button
              onClick={togglePlayPause}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              {state.isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" fill="currentColor" />
              )}
            </motion.button>

            <motion.button
              onClick={() => changeStation('next')}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            <motion.button
              onClick={() => state.currentStation && toggleFavorite(state.currentStation.id)}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                state.currentStation && state.favorites.includes(state.currentStation.id)
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={state.currentStation && state.favorites.includes(state.currentStation.id) ? "currentColor" : "none"} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Station List Modal */}
      <AnimatePresence>
        {showStationList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Stations</h2>
                <button
                  onClick={() => setShowStationList(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stations */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {cityStations.map((station) => (
                    <motion.button
                      key={station.id}
                      onClick={() => {
                        play(station);
                        setShowStationList(false);
                      }}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                        state.currentStation?.id === station.id
                          ? 'bg-white/20'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`
                        }}
                      >
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium text-sm">{station.name}</p>
                        <p className="text-white/40 text-xs">{station.genre} • {station.frequency}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Select City</h2>
                <button
                  onClick={() => setShowCitySelector(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cities */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {allCities.map((city) => (
                    <motion.button
                      key={city}
                      onClick={() => {
                        setCity(city);
                        setShowCitySelector(false);
                      }}
                      className={`w-full p-4 rounded-xl flex items-center gap-3 transition-colors ${
                        state.currentCity === city
                          ? 'bg-white/20'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${cityThemes[city].primaryColor} 0%, ${cityThemes[city].secondaryColor} 100%)`
                        }}
                      >
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{cityThemes[city].name}</p>
                        <p className="text-white/40 text-xs">{getStationsByCity(city).length} stations</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
