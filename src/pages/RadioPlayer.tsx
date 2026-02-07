import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from '@/contexts/RadioContext';
import { getStationsByCity, cityThemes, CityLocation, radioStations } from '@/data/radioStations';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Mic2, SlidersHorizontal, Settings, Wifi, WifiOff } from 'lucide-react';

const ACCENT_COLOR = '#8B5CF6';
const WHITE = '#FFFFFF';

export default function RadioPlayer() {
  const { state, loading, error, togglePlayPause, changeStation, setCity, toggleShuffle, toggleFavorite, play, setVolume } = useRadio();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const theme = cityThemes[state.currentCity];
  const cityStations = getStationsByCity(state.currentCity);
  const currentStationIndex = cityStations.findIndex(s => s.id === state.currentStation?.id);
  const allCities = Object.keys(cityThemes) as CityLocation[];

  // Calculate slider position based on current station
  useEffect(() => {
    if (currentStationIndex >= 0 && cityStations.length > 0) {
      setSliderValue((currentStationIndex / (cityStations.length - 1)) * 100);
    }
  }, [currentStationIndex, cityStations.length]);

  // Handle slider drag
  const handleSliderStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    handleSliderMove(e);
  };

  const handleSliderMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current || !isDragging) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setSliderValue(percent * 100);

    // Snap to station on release
    if ('touches' in e || e.type === 'mouseup') {
      const stationIndex = Math.round(percent * (cityStations.length - 1));
      const station = cityStations[stationIndex];
      if (station && station.id !== state.currentStation?.id) {
        play(station);
      }
      setIsDragging(false);
    }
  }, [isDragging, cityStations, play, state.currentStation?.id]);

  const handleSliderEnd = () => {
    setIsDragging(false);
  };

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
      {/* Subtle gradient background */}
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 50% 20%, ${theme.primaryColor} 0%, #000 70%)` }} />

      {/* TOP BAR */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-4 pb-2">
        <button onClick={() => window.history.back()} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs font-medium tracking-wider">FM RADIO</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${state.isPlaying ? 'bg-green-500/20' : 'bg-white/10'}`}>
            <div className={`w-2 h-2 rounded-full ${state.isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`} />
            <span className={`text-xs font-medium ${state.isPlaying ? 'text-green-400' : 'text-white/60'}`}>
              {state.isPlaying ? 'LIVE' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER SECTION */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Station Avatar */}
        <motion.div
          className="relative mb-6"
          animate={{ scale: state.isPlaying ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: theme.primaryColor }} />
          
          {/* Main circle */}
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}
          >
            {/* Inner ring */}
            <div className="absolute inset-2 rounded-full border border-white/20" />
            
            {/* Station initial */}
            <span className="text-7xl font-bold text-white tracking-tighter">
              {state.currentStation?.name.charAt(0) || '?'}
            </span>
          </div>
        </motion.div>

        {/* Station Info */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">{state.currentStation?.name || 'Select Station'}</h1>
          <p className="text-white/50 text-sm font-medium">{state.currentStation?.genre} • {state.currentStation?.frequency}</p>
        </div>

        {/* City Selector Pill */}
        <button
          onClick={() => setShowCitySelector(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full active:bg-white/20 transition-colors mb-8"
        >
          <span className="text-sm font-medium text-white/80">{cityThemes[state.currentCity].name}</span>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <span className="text-sm text-white/50">{cityStations.length} stations</span>
        </button>

        {/* FREQUENCY SLIDER */}
        <div className="w-full max-w-sm mb-8">
          {/* Track */}
          <div
            ref={sliderRef}
            className="relative h-3 bg-white/10 rounded-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleSliderStart}
            onMouseMove={handleSliderMove}
            onMouseUp={handleSliderEnd}
            onMouseLeave={handleSliderEnd}
            onTouchStart={handleSliderStart}
            onTouchMove={handleSliderMove}
            onTouchEnd={handleSliderEnd}
          >
            {/* Active fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${sliderValue}%`, background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
            />
            
            {/* Tick marks */}
            {cityStations.map((_, idx) => (
              <div
                key={idx}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white/20 rounded-full"
                style={{ left: `${(idx / (cityStations.length - 1)) * 100}%` }}
              />
            ))}

            {/* Thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg"
              style={{ left: `calc(${sliderValue}% - 12px)` }}
              animate={{ scale: isDragging ? 1.2 : 1 }}
              drag="x"
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0}
              onDrag={(_, info) => {
                if (sliderRef.current) {
                  const rect = sliderRef.current.getBoundingClientRect();
                  const percent = Math.max(0, Math.min(1, info.point.x / rect.width));
                  setSliderValue(percent * 100);
                }
              }}
              onDragEnd={(_, info) => {
                if (sliderRef.current) {
                  const rect = sliderRef.current.getBoundingClientRect();
                  const percent = Math.max(0, Math.min(1, info.point.x / rect.width));
                  const stationIndex = Math.round(percent * (cityStations.length - 1));
                  const station = cityStations[stationIndex];
                  if (station && station.id !== state.currentStation?.id) {
                    play(station);
                  }
                }
              }}
            />
          </div>

          {/* Station names below slider */}
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs text-white/30">{cityStations[0]?.name}</span>
            <span className="text-xs text-white/30">{cityStations[cityStations.length - 1]?.name}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="relative z-10 px-6 pb-4">
        {/* Volume */}
        <div className="flex items-center gap-3 mb-4">
          <Volume2 className="w-4 h-4 text-white/40" />
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-150"
              style={{ width: `${state.volume * 100}%` }}
            />
          </div>
          <button onClick={() => setVolume(state.volume > 0 ? 0 : 0.7)} className="text-white/40 active:text-white transition-colors">
            {state.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              state.isShuffle ? 'bg-white text-black' : 'bg-white/10 text-white/60 active:bg-white/20'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={() => changeStation('prev')}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Play/Pause - Large */}
          <motion.button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full flex items-center justify-center text-black"
            style={{ background: ACCENT_COLOR }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {state.isPlaying ? (
              <Pause className="w-10 h-10" fill="currentColor" />
            ) : (
              <Play className="w-10 h-10 ml-1" fill="currentColor" />
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={() => changeStation('next')}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Favorite */}
          <button
            onClick={() => state.currentStation && toggleFavorite(state.currentStation.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              state.currentStation && state.favorites.includes(state.currentStation.id)
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/60 active:bg-white/20'
            }`}
          >
            <Heart className="w-5 h-5" fill={state.currentStation && state.favorites.includes(state.currentStation.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-6">
          <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <Mic2 className="w-5 h-5 text-white/40" />
          </button>
          <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <SlidersHorizontal className="w-5 h-5 text-white/40" />
          </button>
          <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <Settings className="w-5 h-5 text-white/40" />
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
