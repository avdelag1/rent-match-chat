import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { IPhoneSkin } from '@/components/radio/skins/IPhoneSkin';
import { PlaylistDialog } from '@/components/radio/PlaylistDialog';
import { getAllCities, cityThemes } from '@/data/radioStations';
import { CityLocation, RadioSkin } from '@/types/radio';
import { Button } from '@/components/ui/button';
import { Palette, ArrowLeft, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function RadioPlayer() {
  const navigate = useNavigate();
  const {
    state,
    loading,
    error,
    play,
    togglePlayPause,
    changeStation,
    changeCity,
    toggleShuffle,
    toggleFavorite,
    setSkin,
    isStationFavorite
  } = useRadioPlayer();

  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [skinTheme, setSkinTheme] = useState<'light' | 'dark' | 'vibrant'>('dark');
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

  const cities = getAllCities();
  const currentCityTheme = cityThemes[state.currentCity];

  const handleCityChange = () => {
    changeCity('next', cities);
    const nextIndex = (cities.indexOf(state.currentCity) + 1) % cities.length;
    const nextCity = cities[nextIndex];
    toast.success(`Switched to ${cityThemes[nextCity].name}`);
  };

  const handleToggleFavorite = () => {
    if (state.currentStation) {
      toggleFavorite(state.currentStation.id);
      const isFav = isStationFavorite(state.currentStation.id);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  const handleSkinChange = (skin: RadioSkin) => {
    setSkin(skin);
    setShowSkinSelector(false);
    toast.success(`Changed to ${skin} skin`);
  };

  const handleThemeChange = () => {
    const themes: Array<'light' | 'dark' | 'vibrant'> = ['dark', 'light', 'vibrant'];
    const currentIndex = themes.indexOf(skinTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setSkinTheme(nextTheme);
    toast.success(`Theme: ${nextTheme}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-4">Loading Radio...</div>
          <div className="animate-pulse">🎵</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <div className="text-white text-center max-w-md">
          <div className="text-2xl font-bold mb-4 text-red-500">Error</div>
          <div className="mb-6">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Back Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Playlist Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPlaylistDialog(true)}
        className="fixed top-20 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
        aria-label="Open playlists"
      >
        <List className="w-5 h-5" />
      </motion.button>

      {/* Theme Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleThemeChange}
        className="fixed top-20 right-16 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
        aria-label="Change theme"
      >
        <Palette className="w-5 h-5" />
      </motion.button>

      {/* Skin Selector Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSkinSelector(!showSkinSelector)}
        className="fixed top-20 right-28 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
        aria-label="Change skin"
      >
        <span className="text-lg">🎨</span>
      </motion.button>

      {/* Skin Selector Dropdown */}
      <AnimatePresence>
        {showSkinSelector && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-32 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 min-w-[150px]"
          >
            <div className="text-sm font-semibold mb-2 text-gray-900">Select Skin</div>
            <div className="space-y-2">
              {(['iphone', 'vinyl', 'ipod'] as RadioSkin[]).map((skin) => (
                <button
                  key={skin}
                  onClick={() => handleSkinChange(skin)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    state.skin === skin
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {skin === 'iphone' && '📱 iPhone'}
                  {skin === 'vinyl' && '🎵 Vinyl'}
                  {skin === 'ipod' && '🎧 iPod'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active Skin */}
      <AnimatePresence mode="wait">
        {state.skin === 'iphone' && (
          <motion.div
            key="iphone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IPhoneSkin
              station={state.currentStation}
              isPlaying={state.isPlaying}
              isShuffle={state.isShuffle}
              isFavorite={state.currentStation ? isStationFavorite(state.currentStation.id) : false}
              currentCity={state.currentCity}
              onPlayPause={togglePlayPause}
              onPrevious={() => changeStation('prev')}
              onNext={() => changeStation('next')}
              onToggleShuffle={toggleShuffle}
              onToggleFavorite={handleToggleFavorite}
              onCityChange={handleCityChange}
              onAddToPlaylist={() => toast.info('Playlist feature coming soon!')}
              theme={skinTheme}
            />
          </motion.div>
        )}

        {/* Placeholder for Vinyl skin */}
        {state.skin === 'vinyl' && (
          <motion.div
            key="vinyl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-amber-900 to-orange-950 flex items-center justify-center p-6"
          >
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎵</div>
              <div className="text-2xl font-bold mb-2">Vinyl Skin</div>
              <div className="text-lg mb-4">Coming Soon!</div>
              <div className="text-sm opacity-70">
                Retro turntable with spinning record animation
              </div>
              <Button
                onClick={() => setSkin('iphone')}
                className="mt-4"
                variant="secondary"
              >
                Switch to iPhone Skin
              </Button>
            </div>
          </motion.div>
        )}

        {/* Placeholder for iPod skin */}
        {state.skin === 'ipod' && (
          <motion.div
            key="ipod"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center p-6"
          >
            <div className="text-center text-gray-900">
              <div className="text-6xl mb-4">🎧</div>
              <div className="text-2xl font-bold mb-2">iPod Classic Skin</div>
              <div className="text-lg mb-4">Coming Soon!</div>
              <div className="text-sm opacity-70">
                Nostalgic click-wheel interface
              </div>
              <Button
                onClick={() => setSkin('iphone')}
                className="mt-4"
              >
                Switch to iPhone Skin
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Dialog */}
      <PlaylistDialog
        isOpen={showPlaylistDialog}
        onClose={() => setShowPlaylistDialog(false)}
        currentStation={state.currentStation}
        onPlayStation={(station) => {
          play(station);
          setShowPlaylistDialog(false);
        }}
      />
    </div>
  );
}
