import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Music, Trash2, Play } from 'lucide-react';
import { useRadioPlaylists } from '@/hooks/useRadioPlaylists';
import { RadioStation } from '@/types/radio';
import { getStationById } from '@/data/radioStations';
import { Button } from '@/components/ui/button';

interface PlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: RadioStation | null;
  onPlayStation: (station: RadioStation) => void;
  addingMode?: boolean; // When true, focus on adding current station to a playlist
}

export function PlaylistDialog({ isOpen, onClose, currentStation, onPlayStation, addingMode = false }: PlaylistDialogProps) {
  const { playlists, loading, createPlaylist, deletePlaylist, addStationToPlaylist, removeStationFromPlaylist } = useRadioPlaylists();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowAddForm(false);
  };

  const handleAddStation = async (playlistId: string) => {
    if (!currentStation) return;
    await addStationToPlaylist(playlistId, currentStation.id);
  };

  const handleRemoveStation = async (playlistId: string, stationId: string) => {
    await removeStationFromPlaylist(playlistId, stationId);
  };

  const handlePlayStationFromPlaylist = (stationId: string) => {
    const station = getStationById(stationId);
    if (station) {
      onPlayStation(station);
    }
  };

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPlaylist ? selectedPlaylist.name : (addingMode ? 'Add to Playlist' : 'My Playlists')}
              </h2>
              <button
                onClick={selectedPlaylist ? () => setSelectedPlaylistId(null) : onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            {addingMode && currentStation && !selectedPlaylist && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                Select a playlist to add <strong>{currentStation.name}</strong>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading playlists...</div>
            ) : selectedPlaylist ? (
              /* Show playlist stations */
              <div className="space-y-3">
                {selectedPlaylist.station_ids.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No stations in this playlist yet</p>
                  </div>
                ) : (
                  selectedPlaylist.station_ids.map(stationId => {
                    const station = getStationById(stationId);
                    if (!station) return null;

                    return (
                      <div
                        key={stationId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{station.name}</div>
                          <div className="text-sm text-gray-600">{station.genre} • {station.frequency}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlayStationFromPlaylist(stationId)}
                            className="p-2 hover:bg-green-100 rounded-full transition-colors"
                          >
                            <Play className="w-5 h-5 text-green-600" fill="currentColor" />
                          </button>
                          <button
                            onClick={() => handleRemoveStation(selectedPlaylist.id, stationId)}
                            className="p-2 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Show playlists list */
              <div className="space-y-3">
                {playlists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No playlists yet. Create your first playlist!</p>
                  </div>
                ) : (
                  playlists.map(playlist => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{playlist.name}</div>
                        <div className="text-sm text-gray-600">
                          {playlist.station_ids.length} station{playlist.station_ids.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {currentStation && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddStation(playlist.id);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                            title="Add current station"
                          >
                            <Plus className="w-5 h-5 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlaylist(playlist.id);
                          }}
                          className="p-2 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Add playlist form */}
                {showAddForm ? (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                      className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreatePlaylist}
                        className="flex-1"
                        disabled={!newPlaylistName.trim()}
                      >
                        Create
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewPlaylistName('');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Playlist</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
