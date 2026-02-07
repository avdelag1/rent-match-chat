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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading Radio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
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
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background with subtle gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.primaryColor} 0%, #000 70%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
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
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Station Visual */}
          <motion.div
            className="w-64 h-64 rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden"
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
              <span className="text-6xl font-bold text-white/90">
                {state.currentStation?.name.charAt(0) || '?'}
              </span>
            </div>
          </motion.div>

          {/* Station Info */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold text-white mb-2"
              key={state.currentStation?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {state.currentStation?.name || 'Select Station'}
            </motion.h1>
            <p className="text-white/50 mb-1">{state.currentStation?.genre}</p>
            <p className="text-white/40 text-sm">{state.currentStation?.frequency} • {cityThemes[state.currentCity].name}</p>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => setShowCitySelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors"
            >
              <span className="text-sm">{cityThemes[state.currentCity].name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {state.isShuffle && (
              <motion.button
                onClick={toggleShuffle}
                className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 pb-8">
          {/* Volume */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setVolume(state.volume > 0 ? 0 : 0.7)}
              className="text-white/60 hover:text-white transition-colors"
            >
              {state.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ background: theme.secondaryColor }}
                animate={{ width: `${state.volume * 100}%` }}
              />
            </div>
            <span className="text-white/40 text-sm w-10 text-right">{Math.round(state.volume * 100)}%</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6">
            <motion.button
              onClick={() => changeStation('prev')}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <SkipBack className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={togglePlayPause}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {state.isPlaying ? (
                <Pause className="w-10 h-10" fill="currentColor" />
              ) : (
                <Play className="w-10 h-10 ml-1" fill="currentColor" />
              )}
            </motion.button>

            <motion.button
              onClick={() => changeStation('next')}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <SkipForward className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={() => state.currentStation && toggleFavorite(state.currentStation.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                state.currentStation && state.favorites.includes(state.currentStation.id)
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-5 h-5" fill={state.currentStation && state.favorites.includes(state.currentStation.id) ? "currentColor" : "none"} />
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
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Stations</h2>
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
                      className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${
                        state.currentStation?.id === station.id
                          ? 'bg-white/20'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`
                        }}
                      >
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{station.name}</p>
                        <p className="text-white/40 text-sm">{station.genre} • {station.frequency}</p>
                      </div>
                      {state.currentStation?.id === station.id && (
                        <div className="w-3 h-3 rounded-full" style={{ background: theme.secondaryColor }} />
                      )}
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
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Select City</h2>
                <button
                  onClick={() => setShowCitySelector(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cities */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {allCities.map((city) => {
                    const cityTheme = cityThemes[city];
                    const stationCount = getStationsByCity(city).length;
                    return (
                      <motion.button
                        key={city}
                        onClick={() => {
                          setCity(city);
                          setShowCitySelector(false);
                        }}
                        className={`p-4 rounded-xl text-left transition-colors ${
                          state.currentCity === city
                            ? 'ring-2 ring-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        style={{
                          background: state.currentCity === city
                            ? `linear-gradient(135deg, ${cityTheme.primaryColor} 0%, ${cityTheme.secondaryColor} 100%)`
                            : undefined
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className={`font-medium ${state.currentCity === city ? 'text-white' : 'text-white/80'}`}>
                          {cityTheme.name}
                        </p>
                        <p className={`text-sm ${state.currentCity === city ? 'text-white/70' : 'text-white/40'}`}>
                          {stationCount} stations
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
