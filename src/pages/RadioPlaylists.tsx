import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRadioPlaylists } from '@/hooks/useRadioPlaylists';
import { useRadio } from '@/contexts/RadioContext';
import { getStationById } from '@/data/radioStations';
import { ArrowLeft, Plus, Music, Trash2, Play, Shuffle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function RadioPlaylistsPage() {
  const navigate = useNavigate();
  const { state, play, playPlaylist, toggleShuffle } = useRadio();
  const { playlists, loading, createPlaylist, deletePlaylist, removeStationFromPlaylist } = useRadioPlaylists();
  
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowAddForm(false);
    toast.success('Playlist created');
  };

  const handleShufflePlay = (stationIds: string[]) => {
    if (stationIds.length === 0) return;
    if (!state.isShuffle) toggleShuffle();
    const randomId = stationIds[Math.floor(Math.random() * stationIds.length)];
    const station = getStationById(randomId);
    if (station) {
      play(station);
      toast.success('Shuffle play started');
    }
  };

  const handlePlayStation = (stationId: string) => {
    const station = getStationById(stationId);
    if (station) {
      play(station);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black -mt-12 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p>Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black -mt-12 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10 border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Playlists</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors text-white"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Create Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="flex-1 bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <Button
                onClick={handleCreatePlaylist}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4"
                disabled={!newPlaylistName.trim()}
              >
                Create
              </Button>
              <button
                onClick={() => { setShowAddForm(false); setNewPlaylistName(''); }}
                className="p-3 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Playlists */}
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Music className="w-20 h-20 mb-4 opacity-20" />
            <p className="text-xl font-medium mb-2">No Playlists</p>
            <p className="text-sm">Create a playlist to organize your stations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Playlist Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-white/40">
                      <Music className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{playlist.name}</h3>
                      <p className="text-sm text-white/40">
                        {playlist.station_ids.length} station{playlist.station_ids.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShufflePlay(playlist.station_ids)}
                      disabled={playlist.station_ids.length === 0}
                      className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-full text-green-500 transition-colors disabled:opacity-30"
                    >
                      <Shuffle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-full text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stations */}
                {playlist.station_ids.length > 0 && (
                  <div className="border-t border-white/5">
                    {playlist.station_ids.slice(0, 5).map((stationId) => {
                      const station = getStationById(stationId);
                      if (!station) return null;
                      return (
                        <button
                          key={stationId}
                          onClick={() => handlePlayStation(stationId)}
                          className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {station.name[0]}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-white text-sm">{station.name}</div>
                            <div className="text-xs text-white/40">{station.genre}</div>
                          </div>
                          <Play className="w-5 h-5 text-white/40" fill="currentColor" />
                        </button>
                      );
                    })}
                    {playlist.station_ids.length > 5 && (
                      <div className="p-3 text-center text-sm text-white/30">
                        +{playlist.station_ids.length - 5} more stations
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
