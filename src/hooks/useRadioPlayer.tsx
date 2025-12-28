import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { RadioStation, getStationById, orderedRadioGenres as radioGenres, getAllStations, getRandomStation, getRandomStationFromGenre } from '@/data/radioStations';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

// Player Skin Types - 11 Skins including Default/Minimal
export type RadioSkin =
  | 'default'
  | 'ipod-classic'
  | 'gameboy'
  | 'vintage-radio'
  | 'walkman'
  | 'beach'
  | 'ufo'
  | 'boombox'
  | 'neon-cyber'
  | 'vinyl-turntable'
  | 'steampunk';

export interface SkinConfig {
  id: RadioSkin;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  accentColor: string;
}

export const AVAILABLE_SKINS: SkinConfig[] = [
  {
    id: 'default',
    name: 'Minimal',
    description: 'Clean and compact design',
    emoji: '🎧',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    accentColor: '#8b5cf6',
  },
  {
    id: 'ipod-classic',
    name: 'iPod Classic',
    description: 'Nostalgic click wheel interface',
    emoji: '🎵',
    gradient: 'from-gray-100 via-gray-50 to-white',
    accentColor: '#1d1d1f',
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    description: 'Pixel-perfect Nintendo tribute',
    emoji: '🎮',
    gradient: 'from-[#8bac0f] via-[#9bbc0f] to-[#306230]',
    accentColor: '#0f380f',
  },
  {
    id: 'vintage-radio',
    name: 'Vintage Radio',
    description: 'Classic tube radio with warm wood',
    emoji: '📻',
    gradient: 'from-amber-800 via-amber-700 to-amber-900',
    accentColor: '#d4a574',
  },
  {
    id: 'walkman',
    name: 'Sony Walkman',
    description: 'Retro cassette player vibes',
    emoji: '📼',
    gradient: 'from-blue-600 via-blue-500 to-blue-700',
    accentColor: '#fbbf24',
  },
  {
    id: 'beach',
    name: 'Beach Vibes',
    description: 'Sunset waves and palm trees',
    emoji: '🏖️',
    gradient: 'from-orange-400 via-pink-500 to-purple-600',
    accentColor: '#fcd34d',
  },
  {
    id: 'ufo',
    name: 'UFO Alien',
    description: 'Extraterrestrial holographic tech',
    emoji: '🛸',
    gradient: 'from-emerald-400 via-cyan-500 to-violet-600',
    accentColor: '#22d3ee',
  },
  {
    id: 'boombox',
    name: 'Boombox 90s',
    description: 'Street style ghetto blaster',
    emoji: '📻',
    gradient: 'from-zinc-800 via-zinc-700 to-zinc-900',
    accentColor: '#ef4444',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyberpunk',
    description: 'Night City neon vibes',
    emoji: '🌃',
    gradient: 'from-purple-900 via-pink-600 to-cyan-400',
    accentColor: '#f472b6',
  },
  {
    id: 'vinyl-turntable',
    name: 'Vinyl Turntable',
    description: 'Classic DJ turntable setup',
    emoji: '💿',
    gradient: 'from-neutral-900 via-neutral-800 to-neutral-950',
    accentColor: '#dc2626',
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Victorian brass and gears',
    emoji: '⚙️',
    gradient: 'from-amber-600 via-yellow-700 to-amber-800',
    accentColor: '#78350f',
  },
];

// Sleep Timer Options
export type SleepTimerOption = 15 | 30 | 60 | null;

// Playlist interface
export interface RadioPlaylist {
  id: string;
  name: string;
  stationIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface RadioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  currentSkin: RadioSkin;
  sleepTimer: SleepTimerOption;
  sleepTimerEndTime: number | null;
  favorites: string[];
  recentlyPlayed: string[];
  isPlayerExpanded: boolean;
  playlists: RadioPlaylist[];
}

interface RadioPlayerContextType extends RadioPlayerState {
  play: (station?: RadioStation) => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setStation: (station: RadioStation) => void;
  setSkin: (skin: RadioSkin) => void;
  setSleepTimer: (minutes: SleepTimerOption) => void;
  cancelSleepTimer: () => void;
  toggleFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
  expandPlayer: () => void;
  collapsePlayer: () => void;
  togglePlayerExpanded: () => void;
  getRemainingTime: () => number;
  skipToNext: () => void;
  skipToPrevious: () => void;
  shufflePlay: () => void;
  shufflePlayGenre: (genreId: string) => void;
  shufflePlayFavorites: () => void;
  shufflePlayPlaylist: (playlistId: string) => void;
  stopPlayback: () => void;
  createPlaylist: (name: string, stationIds?: string[]) => RadioPlaylist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addToPlaylist: (playlistId: string, stationId: string) => void;
  removeFromPlaylist: (playlistId: string, stationId: string) => void;
  getPlaylistById: (playlistId: string) => RadioPlaylist | undefined;
}

const RadioPlayerContext = createContext<RadioPlayerContextType | null>(null);

// Create role-specific storage keys
const getStorageKeys = (role: 'client' | 'owner' | null) => {
  const prefix = role ? `radio_${role}_` : 'radio_';
  return {
    FAVORITES: `${prefix}favorites`,
    RECENTLY_PLAYED: `${prefix}recently_played`,
    SKIN: `${prefix}skin`,
    VOLUME: `${prefix}volume`,
    LAST_STATION: `${prefix}last_station`,
    PLAYLISTS: `${prefix}playlists`,
  };
};

// Load from localStorage with fallback
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save to localStorage
const saveToStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage:', key);
  }
};

export const RadioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine current role from URL path (client or owner)
  const currentRole = useMemo((): 'client' | 'owner' | null => {
    const path = location.pathname;
    if (path.startsWith('/client')) return 'client';
    if (path.startsWith('/owner')) return 'owner';
    // For shared pages like /messages, /radio, try to infer from user metadata
    const metaRole = user?.user_metadata?.role;
    if (metaRole === 'client' || metaRole === 'owner') return metaRole;
    return null;
  }, [location.pathname, user?.user_metadata?.role]);

  // Get role-specific storage keys
  const storageKeys = useMemo(() => getStorageKeys(currentRole), [currentRole]);

  // Track previous role to detect changes
  const previousRoleRef = useRef<'client' | 'owner' | null>(currentRole);

  const [state, setState] = useState<RadioPlayerState>(() => ({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    volume: loadFromStorage(storageKeys.VOLUME, 0.8),
    isMuted: false,
    error: null,
    currentSkin: loadFromStorage(storageKeys.SKIN, 'ipod-classic') as RadioSkin,
    sleepTimer: null,
    sleepTimerEndTime: null,
    favorites: loadFromStorage<string[]>(storageKeys.FAVORITES, []),
    recentlyPlayed: loadFromStorage<string[]>(storageKeys.RECENTLY_PLAYED, []),
    isPlayerExpanded: false,
    playlists: loadFromStorage<RadioPlaylist[]>(storageKeys.PLAYLISTS, []),
  }));

  // When role changes, reload state from role-specific storage
  useEffect(() => {
    if (previousRoleRef.current !== currentRole && currentRole !== null) {
      // Stop current playback when switching roles
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Load role-specific state
      const newStorageKeys = getStorageKeys(currentRole);
      const lastStationId = loadFromStorage<string | null>(newStorageKeys.LAST_STATION, null);
      const station = lastStationId ? getStationById(lastStationId) : null;

      setState({
        currentStation: station,
        isPlaying: false,
        isLoading: false,
        volume: loadFromStorage(newStorageKeys.VOLUME, 0.8),
        isMuted: false,
        error: null,
        currentSkin: loadFromStorage(newStorageKeys.SKIN, 'ipod-classic') as RadioSkin,
        sleepTimer: null,
        sleepTimerEndTime: null,
        favorites: loadFromStorage<string[]>(newStorageKeys.FAVORITES, []),
        recentlyPlayed: loadFromStorage<string[]>(newStorageKeys.RECENTLY_PLAYED, []),
        isPlayerExpanded: false,
        playlists: loadFromStorage<RadioPlaylist[]>(newStorageKeys.PLAYLISTS, []),
      });

      previousRoleRef.current = currentRole;
    }
  }, [currentRole]);

  // Stop radio function - exposed via window for auth to call
  const stopRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
  }, []);

  // Stop playback completely and clear current station
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState(prev => ({ ...prev, currentStation: null, isPlaying: false, isLoading: false, error: null }));
  }, []);

  // Listen for sign-out event to stop radio
  useEffect(() => {
    const handleSignOut = () => {
      stopRadio();
    };

    window.addEventListener('user-signout', handleSignOut);
    return () => {
      window.removeEventListener('user-signout', handleSignOut);
    };
  }, [stopRadio]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Use 'auto' for faster loading
      audioRef.current.preload = 'auto';
      audioRef.current.volume = state.volume;

      // Event listeners
      audioRef.current.addEventListener('playing', () => {
        retryCountRef.current = 0; // Reset retry count on successful play
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
      });

      audioRef.current.addEventListener('pause', () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });

      audioRef.current.addEventListener('waiting', () => {
        setState(prev => ({ ...prev, isLoading: true }));
      });

      audioRef.current.addEventListener('canplay', () => {
        setState(prev => ({ ...prev, isLoading: false }));
      });

      // Faster loading - start playing as soon as we have some data
      audioRef.current.addEventListener('loadeddata', () => {
        setState(prev => ({ ...prev, isLoading: false }));
      });

      audioRef.current.addEventListener('error', (e) => {
        const audio = e.target as HTMLAudioElement;
        const error = audio.error;

        // Determine error type
        let errorMessage = 'Stream unavailable.';
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              // Don't show error for user-initiated aborts
              return;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error. Check your connection.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Stream format not supported.';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'This station is currently unavailable.';
              break;
          }
        }

        // Retry up to 2 times with shorter backoff for network errors
        if (retryCountRef.current < 2 && error?.code === MediaError.MEDIA_ERR_NETWORK) {
          retryCountRef.current += 1;
          const retryDelay = 500 * retryCountRef.current; // 500ms, 1000ms

          setState(prev => ({
            ...prev,
            isLoading: true,
            error: `Retrying (${retryCountRef.current}/2)...`
          }));

          retryTimeoutRef.current = setTimeout(() => {
            if (audioRef.current && audioRef.current.src) {
              audioRef.current.load();
              audioRef.current.play().catch(() => {
                // If retry fails, continue to next retry
              });
            }
          }, retryDelay);
        } else {
          // Max retries exceeded or non-network error
          setState(prev => ({
            ...prev,
            isLoading: false,
            isPlaying: false,
            error: errorMessage + ' Try another station.'
          }));
          retryCountRef.current = 0;
        }
      });
    }

    // Load last played station on mount (using current role's storage)
    const currentStorageKeys = getStorageKeys(previousRoleRef.current);
    const lastStationId = loadFromStorage<string | null>(currentStorageKeys.LAST_STATION, null);
    if (lastStationId) {
      const station = getStationById(lastStationId);
      if (station) {
        setState(prev => ({ ...prev, currentStation: station }));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
    saveToStorage(storageKeys.VOLUME, state.volume);
  }, [state.volume, state.isMuted, storageKeys.VOLUME]);

  // Save skin preference
  useEffect(() => {
    saveToStorage(storageKeys.SKIN, state.currentSkin);
  }, [state.currentSkin, storageKeys.SKIN]);

  // Save favorites
  useEffect(() => {
    saveToStorage(storageKeys.FAVORITES, state.favorites);
  }, [state.favorites, storageKeys.FAVORITES]);

  // Save recently played
  useEffect(() => {
    saveToStorage(storageKeys.RECENTLY_PLAYED, state.recentlyPlayed);
  }, [state.recentlyPlayed, storageKeys.RECENTLY_PLAYED]);

  // Save playlists
  useEffect(() => {
    saveToStorage(storageKeys.PLAYLISTS, state.playlists);
  }, [state.playlists, storageKeys.PLAYLISTS]);

  // Save current station
  useEffect(() => {
    if (state.currentStation) {
      saveToStorage(storageKeys.LAST_STATION, state.currentStation.id);
    }
  }, [state.currentStation, storageKeys.LAST_STATION]);

  // Sleep timer countdown
  useEffect(() => {
    if (state.sleepTimerEndTime) {
      const remaining = state.sleepTimerEndTime - Date.now();
      if (remaining <= 0) {
        pause();
        setState(prev => ({ ...prev, sleepTimer: null, sleepTimerEndTime: null }));
      } else {
        sleepTimerRef.current = setTimeout(() => {
          pause();
          setState(prev => ({ ...prev, sleepTimer: null, sleepTimerEndTime: null }));
        }, remaining);
      }
    }

    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, [state.sleepTimerEndTime]);

  const setStation = useCallback((station: RadioStation) => {
    // Reset retry count when changing stations
    retryCountRef.current = 0;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      currentStation: station,
      error: null,
      recentlyPlayed: [
        station.id,
        ...prev.recentlyPlayed.filter(id => id !== station.id)
      ].slice(0, 20),
    }));

    if (audioRef.current) {
      audioRef.current.src = station.streamUrl;
      audioRef.current.load(); // Force reload the stream
    }
  }, []);

  const play = useCallback((station?: RadioStation) => {
    // Cancel any pending play operations
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (station) {
      setStation(station);

      // Set audio source immediately for the new station
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl;
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Try to play with better error handling
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // AbortError is normal when quickly switching stations - ignore it
            if (err.name === 'AbortError') {
              return; // Silently ignore - this is expected behavior
            }

            console.error('Radio playback error:', err);
            let errorMessage = 'Failed to play.';

            if (err.name === 'NotAllowedError') {
              errorMessage = 'Tap to allow audio playback.';
            } else if (err.name === 'NotSupportedError') {
              errorMessage = 'Stream not supported. Try another station.';
            }

            setState(prev => ({
              ...prev,
              isLoading: false,
              isPlaying: false,
              error: errorMessage
            }));
          });
        }
      }
    } else if (audioRef.current && state.currentStation) {
      // Resume current station
      if (!audioRef.current.src || audioRef.current.src === '') {
        audioRef.current.src = state.currentStation.streamUrl;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === 'AbortError') return; // Ignore abort errors
          
          console.error('Radio playback error:', err);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isPlaying: false,
            error: 'Failed to resume. Tap play again.'
          }));
        });
      }
    }
  }, [state.currentStation, setStation]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, pause, play]);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setSkin = useCallback((skin: RadioSkin) => {
    setState(prev => ({ ...prev, currentSkin: skin }));
  }, []);

  const setSleepTimer = useCallback((minutes: SleepTimerOption) => {
    if (minutes === null) {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      setState(prev => ({ ...prev, sleepTimer: null, sleepTimerEndTime: null }));
    } else {
      const endTime = Date.now() + minutes * 60 * 1000;
      setState(prev => ({ ...prev, sleepTimer: minutes, sleepTimerEndTime: endTime }));
    }
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepTimer(null);
  }, [setSleepTimer]);

  const toggleFavorite = useCallback((stationId: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(stationId)
        ? prev.favorites.filter(id => id !== stationId)
        : [...prev.favorites, stationId],
    }));
  }, []);

  const isFavorite = useCallback((stationId: string) => {
    return state.favorites.includes(stationId);
  }, [state.favorites]);

  const expandPlayer = useCallback(() => {
    setState(prev => ({ ...prev, isPlayerExpanded: true }));
  }, []);

  const collapsePlayer = useCallback(() => {
    setState(prev => ({ ...prev, isPlayerExpanded: false }));
  }, []);

  const togglePlayerExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isPlayerExpanded: !prev.isPlayerExpanded }));
  }, []);

  const getRemainingTime = useCallback(() => {
    if (!state.sleepTimerEndTime) return 0;
    return Math.max(0, state.sleepTimerEndTime - Date.now());
  }, [state.sleepTimerEndTime]);

  const skipToNext = useCallback(() => {
    if (!state.currentStation) return;
    
    // Get stations from current genre or all stations
    const currentGenre = radioGenres.find(g => 
      g.stations.some(s => s.id === state.currentStation?.id)
    );
    
    const stationList = currentGenre?.stations || getAllStations();
    const currentIndex = stationList.findIndex(s => s.id === state.currentStation?.id);
    
    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + 1) % stationList.length;
      const nextStation = stationList[nextIndex];
      setStation(nextStation);
      play(nextStation);
    }
  }, [state.currentStation, setStation, play]);

  const skipToPrevious = useCallback(() => {
    if (!state.currentStation) return;

    // Check recently played first
    if (state.recentlyPlayed.length > 1) {
      const previousStationId = state.recentlyPlayed[1];
      const previousStation = getStationById(previousStationId);
      if (previousStation) {
        setStation(previousStation);
        play(previousStation);
        return;
      }
    }

    // Otherwise go to previous in genre
    const currentGenre = radioGenres.find(g =>
      g.stations.some(s => s.id === state.currentStation?.id)
    );

    const stationList = currentGenre?.stations || getAllStations();
    const currentIndex = stationList.findIndex(s => s.id === state.currentStation?.id);

    if (currentIndex >= 0) {
      const prevIndex = currentIndex === 0 ? stationList.length - 1 : currentIndex - 1;
      const prevStation = stationList[prevIndex];
      setStation(prevStation);
      play(prevStation);
    }
  }, [state.currentStation, state.recentlyPlayed, setStation, play]);

  // Shuffle play - play a random station from all genres
  const shufflePlay = useCallback(() => {
    const randomStation = getRandomStation(state.currentStation?.id);
    if (randomStation) {
      setStation(randomStation);
      play(randomStation);
    }
  }, [state.currentStation, setStation, play]);

  // Shuffle play within a specific genre
  const shufflePlayGenre = useCallback((genreId: string) => {
    const randomStation = getRandomStationFromGenre(genreId, state.currentStation?.id);
    if (randomStation) {
      setStation(randomStation);
      play(randomStation);
    }
  }, [state.currentStation, setStation, play]);

  // Shuffle play from favorites
  const shufflePlayFavorites = useCallback(() => {
    if (state.favorites.length === 0) return;

    const allStations = getAllStations();
    const favoriteStations = state.favorites
      .map(id => allStations.find(s => s.id === id))
      .filter(Boolean) as RadioStation[];

    if (favoriteStations.length === 0) return;

    // Filter out current station to avoid repeating
    const availableStations = favoriteStations.filter(
      s => s.id !== state.currentStation?.id
    );

    // If only one station in favorites, play it anyway
    const stationsToShuffle = availableStations.length > 0 ? availableStations : favoriteStations;
    const randomIndex = Math.floor(Math.random() * stationsToShuffle.length);
    const randomStation = stationsToShuffle[randomIndex];

    setStation(randomStation);
    play(randomStation);
  }, [state.favorites, state.currentStation, setStation, play]);

  // Shuffle play from a specific playlist
  const shufflePlayPlaylist = useCallback((playlistId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.stationIds.length === 0) return;

    const allStations = getAllStations();
    const playlistStations = playlist.stationIds
      .map(id => allStations.find(s => s.id === id))
      .filter(Boolean) as RadioStation[];

    if (playlistStations.length === 0) return;

    // Filter out current station to avoid repeating
    const availableStations = playlistStations.filter(
      s => s.id !== state.currentStation?.id
    );

    // If only one station in playlist, play it anyway
    const stationsToShuffle = availableStations.length > 0 ? availableStations : playlistStations;
    const randomIndex = Math.floor(Math.random() * stationsToShuffle.length);
    const randomStation = stationsToShuffle[randomIndex];

    setStation(randomStation);
    play(randomStation);
  }, [state.playlists, state.currentStation, setStation, play]);

  // Create a new playlist
  const createPlaylist = useCallback((name: string, stationIds: string[] = []): RadioPlaylist => {
    const newPlaylist: RadioPlaylist = {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      stationIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      playlists: [...prev.playlists, newPlaylist],
    }));

    return newPlaylist;
  }, []);

  // Delete a playlist
  const deletePlaylist = useCallback((playlistId: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.filter(p => p.id !== playlistId),
    }));
  }, []);

  // Rename a playlist
  const renamePlaylist = useCallback((playlistId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.map(p =>
        p.id === playlistId
          ? { ...p, name: newName, updatedAt: Date.now() }
          : p
      ),
    }));
  }, []);

  // Add station to playlist
  const addToPlaylist = useCallback((playlistId: string, stationId: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.map(p =>
        p.id === playlistId && !p.stationIds.includes(stationId)
          ? { ...p, stationIds: [...p.stationIds, stationId], updatedAt: Date.now() }
          : p
      ),
    }));
  }, []);

  // Remove station from playlist
  const removeFromPlaylist = useCallback((playlistId: string, stationId: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.map(p =>
        p.id === playlistId
          ? { ...p, stationIds: p.stationIds.filter(id => id !== stationId), updatedAt: Date.now() }
          : p
      ),
    }));
  }, []);

  // Get playlist by ID
  const getPlaylistById = useCallback((playlistId: string): RadioPlaylist | undefined => {
    return state.playlists.find(p => p.id === playlistId);
  }, [state.playlists]);

  const contextValue: RadioPlayerContextType = {
    ...state,
    play,
    pause,
    togglePlayPause,
    setVolume,
    toggleMute,
    setStation,
    setSkin,
    setSleepTimer,
    cancelSleepTimer,
    toggleFavorite,
    isFavorite,
    expandPlayer,
    collapsePlayer,
    togglePlayerExpanded,
    getRemainingTime,
    skipToNext,
    skipToPrevious,
    shufflePlay,
    shufflePlayGenre,
    shufflePlayFavorites,
    shufflePlayPlaylist,
    stopPlayback,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getPlaylistById,
  };

  return (
    <RadioPlayerContext.Provider value={contextValue}>
      {children}
    </RadioPlayerContext.Provider>
  );
};

export const useRadioPlayer = (): RadioPlayerContextType => {
  const context = useContext(RadioPlayerContext);
  if (!context) {
    throw new Error('useRadioPlayer must be used within a RadioPlayerProvider');
  }
  return context;
};
