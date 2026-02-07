import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '@/contexts/RadioContext';
import { getStationsByCity, cityThemes, CityLocation } from '@/data/radioStations';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Music, X, List, ChevronDown } from 'lucide-react';

const ACCENT_COLOR = '#8B5CF6'; // Purple

export default function RadioPlayer() {
  const { state, loading, error, togglePlayPause, changeStation, setCity, toggleShuffle, toggleFavorite, play, setVolume } = useRadio();
  const [showStationList, setShowStationList] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);

  const theme = cityThemes[state.currentCity];
  const cityStations = getStationsByCity(state.currentCity);
  const allCities = Object.keys(cityThemes) as CityLocation[];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlayPause(); break;
        case 'ArrowRight': changeStation('next'); break;
        case 'ArrowLeft': changeStation('prev'); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(1, state.volume + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, state.volume - 0.1)); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, changeStation, setVolume, state.volume]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">Stream Error</div>
          <p className="text-white/60 mb-4 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 opacity-15 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 30%, ${theme.primaryColor} 0%, #000 70%)` }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-white/40 text-xs tracking-wider">RADIO</span>
          <button onClick={() => setShowStationList(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20">
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Station Circle */}
          <motion.div
            className="w-40 h-40 rounded-full flex items-center justify-center mb-6"
            style={{ background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, ${theme.secondaryColor} 100%)` }}
            animate={{ rotate: state.isPlaying ? 360 : 0 }}
            transition={{ duration: state.isPlaying ? 20 : 0, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-5xl font-bold text-white">{state.currentStation?.name.charAt(0) || '?'}</span>
          </motion.div>

          {/* Info */}
          <h1 className="text-2xl font-bold text-white mb-1">{state.currentStation?.name || 'Select Station'}</h1>
          <p className="text-white/50 text-sm mb-4">{state.currentStation?.genre} • {state.currentStation?.frequency}</p>

          {/* City */}
          <button onClick={() => setShowCitySelector(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-sm hover:bg-white/20 mb-8">
            <span>{cityThemes[state.currentCity].name}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 pb-8">
          {/* Volume */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setVolume(state.volume > 0 ? 0 : 0.7)} className="text-white/60">
              {state.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${state.volume * 100}%` }} />
            </div>
            <span className="text-white/40 text-xs w-8 text-right">{Math.round(state.volume * 100)}%</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={toggleShuffle} className={`w-10 h-10 rounded-full flex items-center justify-center ${state.isShuffle ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}>
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={() => changeStation('prev')} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <SkipBack className="w-5 h-5" />
            </button>

            <motion.button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white"
              style={{ background: ACCENT_COLOR }}
              whileTap={{ scale: 0.95 }}
            >
              {state.isPlaying ? <Pause className="w-7 h-7" fill="currentColor" /> : <Play className="w-7 h-7 ml-1" fill="currentColor" />}
            </motion.button>

            <button onClick={() => changeStation('next')} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => state.currentStation && toggleFavorite(state.currentStation.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${state.currentStation && state.favorites.includes(state.currentStation.id) ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}
            >
              <Heart className="w-4 h-4" fill={state.currentStation && state.favorites.includes(state.currentStation.id) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Station List Modal */}
      <AnimatePresence>
        {showStationList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Stations</h2>
                <button onClick={() => setShowStationList(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cityStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => { play(station); setShowStationList(false); }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${state.currentStation?.id === station.id ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: ACCENT_COLOR }}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium text-sm">{station.name}</p>
                      <p className="text-white/40 text-xs">{station.genre} • {station.frequency}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Select City</h2>
                <button onClick={() => setShowCitySelector(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setCity(city); setShowCitySelector(false); }}
                    className={`w-full p-4 rounded-xl flex items-center gap-3 transition-colors ${state.currentCity === city ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: ACCENT_COLOR }}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{cityThemes[city].name}</p>
                      <p className="text-white/40 text-xs">{getStationsByCity(city).length} stations</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
