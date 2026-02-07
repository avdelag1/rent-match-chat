import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '@/contexts/RadioContext';
import { getStationsByCity, cityThemes, CityLocation } from '@/data/radioStations';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Mic2, Settings, Wifi, WifiOff } from 'lucide-react';

const ACCENT_COLOR = '#8B5CF6';

export default function RadioPlayer() {
  const { state, loading, error, togglePlayPause, changeStation, setCity, toggleFavorite, play, setVolume } = useRadio();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const theme = cityThemes[state.currentCity];
  const cityStations = getStationsByCity(state.currentCity);
  const currentStationIndex = cityStations.findIndex(s => s.id === state.currentStation?.id);
  const allCities = Object.keys(cityThemes) as CityLocation[];

  // Station index for the dial (0 to cityStations.length - 1)
  const [dialValue, setDialValue] = useState(currentStationIndex);

  useEffect(() => {
    setDialValue(currentStationIndex);
  }, [currentStationIndex]);

  // Handle dial drag - snaps to nearest station
  const handleDialStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    handleDialMove(e);
  };

  const handleDialMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const dialElement = document.getElementById('station-dial');
    if (!dialElement) return;

    const rect = dialElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;

    // Calculate angle from center (-135 to +135 degrees)
    const deltaX = clientX - centerX;
    const maxDelta = rect.width / 2;
    const normalized = Math.max(-1, Math.min(1, deltaX / maxDelta));

    // Map to station index
    const newIndex = Math.round((normalized + 1) / 2 * (cityStations.length - 1));
    setDialValue(newIndex);

    // Only switch station on release
    if ('touches' in e || e.type === 'mouseup' || e.type === 'mouseleave') {
      const station = cityStations[newIndex];
      if (station && station.id !== state.currentStation?.id) {
        play(station);
      }
      setIsDragging(false);
    }
  }, [isDragging, cityStations, play, state.currentStation?.id]);

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden p-6">
        <div className="text-center">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white/60 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-white/40 text-xs font-medium tracking-widest">FM RADIO</span>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${state.isPlaying ? 'bg-green-500/20' : 'bg-white/5'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${state.isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
          <span className={`text-xs font-medium ${state.isPlaying ? 'text-green-400' : 'text-white/40'}`}>
            {state.isPlaying ? 'LIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Vinyl Player Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Vinyl Record */}
        <div className="relative mb-6">
          {/* Vinyl spinning animation */}
          <motion.div
            className="w-56 h-56 rounded-full relative"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)',
              boxShadow: `0 0 60px ${ACCENT_COLOR}30, 0 0 100px rgba(0,0,0,0.5)`
            }}
            animate={{ rotate: state.isPlaying ? 360 : 0 }}
            transition={{ duration: state.isPlaying ? 3 : 0, repeat: Infinity, ease: "linear" }}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <div className="absolute inset-4 rounded-full border border-white/5" />
            <div className="absolute inset-6 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-10 rounded-full border border-white/5" />

            {/* Center label - Station info */}
            <div
              className="absolute inset-12 rounded-full flex flex-col items-center justify-center"
              style={{ background: ACCENT_COLOR }}
            >
              <span className="text-xs font-bold text-white tracking-wider mb-1">{state.currentStation?.frequency || '--.-'}</span>
              <span className="text-[10px] text-white/80 uppercase tracking-wider">{state.currentStation?.genre || '---'}</span>
            </div>

            {/* Center spindle hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-black" />
            </div>
          </motion.div>

          {/* Tone arm (stationary when paused, moves when playing) */}
          <motion.div
            className="absolute -top-2 -right-4 w-4 h-24 origin-top"
            animate={{
              rotate: state.isPlaying ? -25 : -5
            }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'linear-gradient(180deg, #666 0%, #333 100%)',
              borderRadius: '2px'
            }}
          >
            {/* Cartridge head */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-3"
              style={{ background: '#444' }}
            />
          </motion.div>
        </div>

        {/* Station Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            {state.currentStation?.name || 'Select Station'}
          </h1>
          <p className="text-white/40 text-sm">{cityThemes[state.currentCity].name}</p>
        </div>

        {/* Station Dial */}
        <div id="station-dial" className="relative w-full max-w-xs mx-auto mb-2">
          {/* Track */}
          <div className="relative h-8 bg-white/10 rounded-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleDialStart}
            onMouseMove={handleDialMove}
            onMouseUp={handleDialMove}
            onMouseLeave={handleDialMove}
            onTouchStart={handleDialStart}
            onTouchMove={handleDialMove}
            onTouchEnd={handleDialMove}
          >
            {/* Active progress */}
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${dialValue >= 0 ? (dialValue / (cityStations.length - 1)) * 100 : 0}%`,
                background: ACCENT_COLOR
              }}
            />

            {/* Tick marks */}
            {cityStations.map((_, idx) => (
              <div
                key={idx}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/30"
                style={{ left: `${(idx / (cityStations.length - 1)) * 100}%` }}
              />
            ))}

            {/* Thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing"
              style={{
                left: `calc(${dialValue >= 0 ? (dialValue / (cityStations.length - 1)) * 100 : 0}% - 12px)`,
                background: ACCENT_COLOR
              }}
              animate={{ scale: isDragging ? 1.2 : 1 }}
            />
          </div>

          {/* Station names */}
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[10px] text-white/30 truncate max-w-[60px]">{cityStations[0]?.name}</span>
            <span className="text-[10px] text-white/30 truncate max-w-[60px]">{cityStations[cityStations.length - 1]?.name}</span>
          </div>
        </div>

        {/* City Selector */}
        <button
          onClick={() => setShowCitySelector(true)}
          className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full active:bg-white/20 transition-colors mb-4"
        >
          <span className="text-xs text-white/70">{cityThemes[state.currentCity].name}</span>
          <span className="text-white/30 text-xs">• {cityStations.length} stations</span>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="px-6 pb-4">
        {/* Volume Slider - ONLY ONE */}
        <div className="flex items-center gap-3 mb-6">
          <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{ width: `${state.volume * 100}%`, background: ACCENT_COLOR }}
            />
          </div>
          <button onClick={() => setVolume(state.volume > 0 ? 0 : 0.7)} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
            {state.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Playback Controls - MOVED DOWN */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Previous */}
          <button
            onClick={() => changeStation('prev')}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause - Largest */}
          <motion.button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full flex items-center justify-center text-black"
            style={{ background: ACCENT_COLOR }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {state.isPlaying ? (
              <Pause className="w-8 h-8" fill="currentColor" />
            ) : (
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={() => changeStation('next')}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="flex items-center justify-center gap-8">
          <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <Heart className={`w-4 h-4 ${state.currentStation && state.favorites.includes(state.currentStation.id) ? 'text-white' : 'text-white/30'}`}
              fill={state.currentStation && state.favorites.includes(state.currentStation.id) ? "currentColor" : "none"} />
          </button>
          <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <Mic2 className="w-4 h-4 text-white/30" />
          </button>
          <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
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
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="text-lg font-semibold">Select City</span>
              <button onClick={() => setShowCitySelector(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allCities.map((city) => (
                <button
                  key={city}
                  onClick={() => { setCity(city); setShowCitySelector(false); }}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${
                    state.currentCity === city ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: ACCENT_COLOR }}>
                    <span className="text-lg">{city.charAt(0)}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{cityThemes[city].name}</p>
                    <p className="text-white/40 text-sm">{getStationsByCity(city).length} stations</p>
                  </div>
                  {state.currentCity === city && (
                    <div className="w-2 h-2 rounded-full" style={{ background: ACCENT_COLOR }} />
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
