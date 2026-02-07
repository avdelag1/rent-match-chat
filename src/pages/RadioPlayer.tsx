import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { ModernSkin } from '@/components/radio/skins/ModernSkin';
import { VinylSkin } from '@/components/radio/skins/VinylSkin';
import { RetroSkin } from '@/components/radio/skins/RetroSkin';
import { PlaylistDialog } from '@/components/radio/PlaylistDialog';
import { cityThemes } from '@/data/radioStations';
import { CityLocation, RadioSkin } from '@/types/radio';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List, Plus } from 'lucide-react';
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
    setCity,
    toggleShuffle,
    toggleFavorite,
    setSkin,
    setVolume,
    isStationFavorite
  } = useRadioPlayer();

  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);

  const handleCitySelect = (city: CityLocation) => {
    setCity(city);
    toast.success(`Switched to ${cityThemes[city].name}`);
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

  const handleAddToPlaylist = () => {
    setAddingToPlaylist(true);
    setShowPlaylistDialog(true);
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-lg font-bold mb-3">Loading Radio...</div>
          <div className="animate-pulse">🎵</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-white text-center max-w-md">
          <div className="text-lg font-bold mb-3 text-red-500">Error</div>
          <div className="mb-4 text-sm">{error}</div>
          <Button onClick={() => window.location.reload()} size="sm">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Compact Header Actions */}
      <div className="flex justify-between items-center px-3 py-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex gap-1">
          {/* Add to Playlist Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToPlaylist}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label="Add to playlist"
          >
            <Plus className="w-4 h-4" />
          </motion.button>

          {/* Skin Selector */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSkinSelector(!showSkinSelector)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label="Change skin"
          >
            <span className="text-sm">🎨</span>
          </motion.button>

          {/* Playlist Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlaylistDialog(true)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label="Open playlists"
          >
            <List className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Skin Selector Dropdown */}
      <AnimatePresence>
        {showSkinSelector && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 right-4 z-50 bg-gray-800 rounded-lg shadow-xl p-2 min-w-[120px]"
          >
            <div className="text-xs font-semibold mb-2 text-gray-400 px-2">Skin</div>
            <div className="space-y-1">
              {(['modern', 'vinyl', 'retro'] as RadioSkin[]).map((skin) => (
                <button
                  key={skin}
                  onClick={() => handleSkinChange(skin)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    state.skin === skin
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {skin === 'modern' && <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-blue-600" />}
                  {skin === 'vinyl' && <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-600" />}
                  {skin === 'retro' && <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-orange-500" />}
                  <span className="capitalize">{skin}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active Skin */}
      <AnimatePresence mode="wait">
        {state.skin === 'modern' && (
          <motion.div
            key="modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <ModernSkin
              station={state.currentStation}
              isPlaying={state.isPlaying}
              isShuffle={state.isShuffle}
              isFavorite={state.currentStation ? isStationFavorite(state.currentStation.id) : false}
              currentCity={state.currentCity}
              volume={state.volume}
              onPlayPause={togglePlayPause}
              onPrevious={() => changeStation('prev')}
              onNext={() => changeStation('next')}
              onToggleShuffle={toggleShuffle}
              onToggleFavorite={handleToggleFavorite}
              onCitySelect={handleCitySelect}
              onVolumeChange={setVolume}
              theme="dark"
            />
          </motion.div>
        )}

        {state.skin === 'vinyl' && (
          <motion.div
            key="vinyl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <VinylSkin
              station={state.currentStation}
              isPlaying={state.isPlaying}
              isShuffle={state.isShuffle}
              isFavorite={state.currentStation ? isStationFavorite(state.currentStation.id) : false}
              currentCity={state.currentCity}
              volume={state.volume}
              onPlayPause={togglePlayPause}
              onPrevious={() => changeStation('prev')}
              onNext={() => changeStation('next')}
              onToggleShuffle={toggleShuffle}
              onToggleFavorite={handleToggleFavorite}
              onCitySelect={handleCitySelect}
              onVolumeChange={setVolume}
            />
          </motion.div>
        )}

        {state.skin === 'retro' && (
          <motion.div
            key="retro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <RetroSkin
              station={state.currentStation}
              isPlaying={state.isPlaying}
              isShuffle={state.isShuffle}
              isFavorite={state.currentStation ? isStationFavorite(state.currentStation.id) : false}
              currentCity={state.currentCity}
              volume={state.volume}
              onPlayPause={togglePlayPause}
              onPrevious={() => changeStation('prev')}
              onNext={() => changeStation('next')}
              onToggleShuffle={toggleShuffle}
              onToggleFavorite={handleToggleFavorite}
              onCitySelect={handleCitySelect}
              onVolumeChange={setVolume}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Dialog */}
      <PlaylistDialog
        isOpen={showPlaylistDialog}
        onClose={() => {
          setShowPlaylistDialog(false);
          setAddingToPlaylist(false);
        }}
        currentStation={state.currentStation}
        onPlayStation={(station) => {
          play(station);
          setShowPlaylistDialog(false);
          setAddingToPlaylist(false);
        }}
        addingMode={addingToPlaylist}
      />
    </div>
  );
}
