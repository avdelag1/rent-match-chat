import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRadioContext } from '@/contexts/RadioContext';
import { ModernSkin } from '@/components/radio/skins/ModernSkin';
import { PlaylistDialog } from '@/components/radio/PlaylistDialog';
import { CityLocation } from '@/types/radio';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List } from 'lucide-react';
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
    selectCity: setCity,
    toggleShuffle,
    toggleFavorite,
    setSkin,
    setVolume,
    isStationFavorite
  } = useRadioContext();

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);

  const handleCitySelect = (city: CityLocation) => {
    setCity(city);
  };

  const handleAddToPlaylist = () => {
    setAddingToPlaylist(true);
    setShowPlaylistDialog(true);
  };

  const handleToggleFavorite = () => {
    if (state.currentStation) {
      toggleFavorite(state.currentStation.id);
      const isFav = isStationFavorite(state.currentStation.id);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    }
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

      {/* Render Radio Player */}
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
