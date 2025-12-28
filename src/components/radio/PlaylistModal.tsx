import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  ListMusic,
  Trash2,
  Edit3,
  Check,
  Shuffle,
  Play,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRadioPlayer, RadioPlaylist } from '@/hooks/useRadioPlayer';
import { getAllStations, RadioStation } from '@/data/radioStations';
import { cn } from '@/lib/utils';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'manage' | 'view';
  playlistId?: string;
  initialStationIds?: string[];
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  mode,
  playlistId,
  initialStationIds = [],
}) => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    play,
    shufflePlayPlaylist,
    getPlaylistById,
  } = useRadioPlayer();

  const [playlistName, setPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const allStations = getAllStations();

  const handleCreatePlaylist = () => {
    if (playlistName.trim()) {
      createPlaylist(playlistName.trim(), initialStationIds);
      setPlaylistName('');
      onClose();
    }
  };

  const handleStartEdit = (playlist: RadioPlaylist) => {
    setEditingId(playlist.id);
    setEditName(playlist.name);
  };

  const handleSaveEdit = (playlistId: string) => {
    if (editName.trim()) {
      renamePlaylist(playlistId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    deletePlaylist(playlistId);
  };

  const handlePlayPlaylist = (playlist: RadioPlaylist) => {
    if (playlist.stationIds.length > 0) {
      const station = allStations.find(s => s.id === playlist.stationIds[0]);
      if (station) {
        play(station);
      }
    }
  };

  const handleShufflePlaylist = (playlistId: string) => {
    shufflePlayPlaylist(playlistId);
    onClose();
  };

  const getPlaylistStations = (stationIds: string[]): RadioStation[] => {
    return stationIds
      .map(id => allStations.find(s => s.id === id))
      .filter(Boolean) as RadioStation[];
  };

  const currentPlaylist = playlistId ? getPlaylistById(playlistId) : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-background border border-border rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <ListMusic className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold">
                {mode === 'create' && 'Create Playlist'}
                {mode === 'manage' && 'Your Playlists'}
                {mode === 'view' && currentPlaylist?.name}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Create Mode */}
            {mode === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Playlist Name
                  </label>
                  <Input
                    placeholder="My Playlist"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                    autoFocus
                    className="h-12"
                  />
                </div>
                {initialStationIds.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {initialStationIds.length} station{initialStationIds.length !== 1 ? 's' : ''} will be added
                  </div>
                )}
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={!playlistName.trim()}
                  className="w-full h-12"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Playlist
                </Button>
              </div>
            )}

            {/* Manage Mode */}
            {mode === 'manage' && (
              <div className="space-y-3">
                {playlists.length === 0 ? (
                  <div className="text-center py-8">
                    <ListMusic className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No playlists yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Create a playlist from your favorites
                    </p>
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      layout
                      className="bg-secondary/50 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Playlist Icon */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                          <Music className="w-5 h-5 text-primary" />
                        </div>

                        {/* Playlist Info */}
                        <div className="flex-1 min-w-0">
                          {editingId === playlist.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(playlist.id)}
                                autoFocus
                                className="h-8 text-sm"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 shrink-0"
                                onClick={() => handleSaveEdit(playlist.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium truncate">{playlist.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {playlist.stationIds.length} station{playlist.stationIds.length !== 1 ? 's' : ''}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        {editingId !== playlist.id && (
                          <div className="flex items-center gap-1">
                            {playlist.stationIds.length > 0 && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handlePlayPlaylist(playlist)}
                                  title="Play"
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleShufflePlaylist(playlist.id)}
                                  title="Shuffle"
                                >
                                  <Shuffle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleStartEdit(playlist)}
                              title="Rename"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeletePlaylist(playlist.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* View Mode - Show playlist stations */}
            {mode === 'view' && currentPlaylist && (
              <div className="space-y-3">
                {/* Playlist Actions */}
                {currentPlaylist.stationIds.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handlePlayPlaylist(currentPlaylist)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play All
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleShufflePlaylist(currentPlaylist.id)}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Shuffle
                    </Button>
                  </div>
                )}

                {/* Station List */}
                {currentPlaylist.stationIds.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No stations in this playlist</p>
                  </div>
                ) : (
                  getPlaylistStations(currentPlaylist.stationIds).map((station) => (
                    <motion.button
                      key={station.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => play(station)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <img
                        src={station.artwork || '/placeholder-radio.png'}
                        alt={station.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{station.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {station.country}
                        </p>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlaylistModal;
