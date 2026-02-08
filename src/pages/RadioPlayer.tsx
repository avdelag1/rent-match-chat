import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '@/contexts/RadioContext';
import { getStationsByCity, cityThemes, CityLocation } from '@/data/radioStations';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Mic2, Settings, Shuffle, ListMusic } from 'lucide-react';

export default function RadioPlayer() {
  const { state, error, togglePlayPause, changeStation, setCity, toggleFavorite, play, setVolume, toggleShuffle, playFavorites } = useRadio();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const cityStations = getStationsByCity(state.currentCity);
  const currentStationIndex = cityStations.findIndex(s => s.id === state.currentStation?.id);
  const allCities = Object.keys(cityThemes) as CityLocation[];

  // Station dial value (0 to stations.length - 1)
  const [dialValue, setDialValue] = useState(currentStationIndex);

  useEffect(() => {
    setDialValue(currentStationIndex);
  }, [currentStationIndex]);

  // Handle dial - snaps to nearest station
  const handleDialChange = useCallback((value: number) => {
    const station = cityStations[value];
    if (station && station.id !== state.currentStation?.id) {
      play(station);
    }
  }, [cityStations, play, state.currentStation?.id]);

  // Keyboard controls
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

  // No loading spinner - UI renders immediately
  // Error is shown inline if stream fails

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      {/* Header - UI chrome */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-white/40 text-xs tracking-widest">RADIO</span>
        <div className={`px-3 py-1 rounded-full ${state.isPlaying ? 'bg-white/20' : 'bg-white/10'}`}>
          <span className={`text-xs ${state.isPlaying ? 'text-white' : 'text-white/40'}`}>
            {state.isPlaying ? 'LIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Center - Vinyl & Controls */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        
        {/* Quick Controls - Shuffle, Playlist, Favorites - Close to vinyl */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button 
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${state.isShuffle ? 'bg-white/20' : 'bg-white/5'}`}
          >
            <Shuffle className={`w-5 h-5 ${state.isShuffle ? 'text-white' : 'text-white/50'}`} />
          </button>
          
          <button 
            onClick={() => setShowPlaylist(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ListMusic className="w-5 h-5 text-white/50" />
          </button>
          
          <button 
            onClick={() => state.currentStation && toggleFavorite(state.currentStation.id)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Heart className={`w-5 h-5 ${state.currentStation && state.favorites.includes(state.currentStation.id) ? 'text-white' : 'text-white/50'}`}
              fill={state.currentStation && state.favorites.includes(state.currentStation.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Vinyl Record */}
        <motion.div
          className="w-36 h-36 rounded-full relative mb-4"
          style={{
            background: 'linear-gradient(135deg, #222 0%, #111 50%, #222 100%)',
            border: '1px solid #333'
          }}
          animate={{ rotate: state.isPlaying ? 360 : 0 }}
          transition={{ duration: state.isPlaying ? 4 : 0, repeat: Infinity, ease: "linear" }}
        >
          {/* Vinyl grooves */}
          <div className="absolute inset-1.5 rounded-full border border-white/10" />
          <div className="absolute inset-3 rounded-full border border-white/5" />
          <div className="absolute inset-5 rounded-full border border-white/5" />

          {/* Center label - Station info */}
          <div className="absolute inset-10 rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-black">{state.currentStation?.frequency || '--.-'}</span>
            <span className="text-[8px] text-black/60 uppercase">{state.currentStation?.genre || '---'}</span>
          </div>

          {/* Center hole */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
          </div>
        </motion.div>

        {/* Station Name */}
        <h1 className="text-lg font-bold text-white mb-1">{state.currentStation?.name || 'Select Station'}</h1>
        <p className="text-white/40 text-sm mb-2">{cityThemes[state.currentCity].name}</p>

        {/* City Selector */}
        <button
          onClick={() => setShowCitySelector(true)}
          className="px-3 py-1 bg-white/10 rounded-full mb-4"
        >
          <span className="text-xs text-white/70">{cityThemes[state.currentCity].name}</span>
        </button>

        {/* Station Dial */}
        <div className="w-full max-w-xs">
          <input
            type="range"
            min="0"
            max={cityStations.length - 1}
            value={dialValue}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setDialValue(val);
              handleDialChange(val);
            }}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white ${(dialValue / (cityStations.length - 1)) * 100}%, white/20 ${(dialValue / (cityStations.length - 1)) * 100}%)`
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/30">{cityStations[0]?.name}</span>
            <span className="text-[10px] text-white/30">{cityStations[cityStations.length - 1]?.name}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-4 pb-2">
        {/* Volume Slider */}
        <div className="flex items-center gap-3 mb-4">
          <Volume2 className="w-4 h-4 text-white/40" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white ${state.volume * 100}%, white/20 ${state.volume * 100}%)`
            }}
          />
          <VolumeX className="w-4 h-4 text-white/40" />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => changeStation('prev')} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <SkipBack className="w-5 h-5" />
          </button>

          <motion.button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            {state.isPlaying ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
          </motion.button>

          <button onClick={() => changeStation('next')} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="flex items-center justify-center gap-6">
          <button className="flex flex-col items-center gap-1">
            <Mic2 className="w-4 h-4 text-white/30" />
          </button>
          <button className="flex flex-col items-center gap-1">
            <Settings className="w-4 h-4 text-white/30" />
          </button>
        </div>
      </div>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-4 inset-y-16 bg-black/95 z-50 flex flex-col rounded-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-semibold">Select City</span>
              <button onClick={() => setShowCitySelector(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allCities.map((city) => (
                <button
                  key={city}
                  onClick={() => { setCity(city); setShowCitySelector(false); }}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 ${state.currentCity === city ? 'bg-white/20' : 'bg-white/5'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    <span>{city.charAt(0)}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{cityThemes[city].name}</p>
                    <p className="text-white/40 text-sm">{getStationsByCity(city).length} stations</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Modal */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-4 inset-y-16 bg-black/95 z-50 flex flex-col rounded-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-semibold">Playlist</span>
              <button onClick={() => setShowPlaylist(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Play Favorites */}
              {state.favorites.length > 0 && (
                <button
                  onClick={() => { playFavorites(); setShowPlaylist(false); }}
                  className="w-full p-4 rounded-xl bg-white/20 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <Heart className="w-6 h-6 text-black" fill="currentColor" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Favorites</p>
                    <p className="text-white/40 text-sm">{state.favorites.length} stations</p>
                  </div>
                </button>
              )}

              {/* Current City Stations */}
              <p className="text-white/40 text-sm mt-4 mb-2">{cityThemes[state.currentCity].name}</p>
              {cityStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => { play(station); setShowPlaylist(false); }}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 ${state.currentStation?.id === station.id ? 'bg-white/20' : 'bg-white/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                    {station.frequency}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{station.name}</p>
                    <p className="text-white/40 text-xs">{station.genre}</p>
                  </div>
                  {state.favorites.includes(station.id) && (
                    <Heart className="w-4 h-4 text-white" fill="currentColor" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
