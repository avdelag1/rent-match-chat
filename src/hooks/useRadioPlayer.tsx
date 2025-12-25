import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { RadioStation, getStationById, radioGenres, getAllStations } from '@/data/radioStations';

// Player Skin Types - 10 Creative Retro-Modern Skins
export type RadioSkin =
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
}

const RadioPlayerContext = createContext<RadioPlayerContextType | null>(null);

const STORAGE_KEYS = {
  FAVORITES: 'radio_favorites',
  RECENTLY_PLAYED: 'radio_recently_played',
  SKIN: 'radio_skin',
  VOLUME: 'radio_volume',
  LAST_STATION: 'radio_last_station',
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<RadioPlayerState>(() => ({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    volume: loadFromStorage(STORAGE_KEYS.VOLUME, 0.8),
    isMuted: false,
    error: null,
    currentSkin: loadFromStorage(STORAGE_KEYS.SKIN, 'ipod-classic') as RadioSkin,
    sleepTimer: null,
    sleepTimerEndTime: null,
    favorites: loadFromStorage<string[]>(STORAGE_KEYS.FAVORITES, []),
    recentlyPlayed: loadFromStorage<string[]>(STORAGE_KEYS.RECENTLY_PLAYED, []),
    isPlayerExpanded: false,
  }));

  // Stop radio function - exposed via window for auth to call
  const stopRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
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
      audioRef.current.preload = 'none';
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

      audioRef.current.addEventListener('error', () => {
        // Retry up to 3 times with exponential backoff
        if (retryCountRef.current < 3) {
          retryCountRef.current += 1;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);

          setState(prev => ({
            ...prev,
            isLoading: true,
            error: `Retrying connection (${retryCountRef.current}/3)...`
          }));

          retryTimeoutRef.current = setTimeout(() => {
            if (audioRef.current && state.currentStation) {
              audioRef.current.load();
              audioRef.current.play().catch(() => {
                // If retry fails, continue to next retry
              });
            }
          }, retryDelay);
        } else {
          // Max retries exceeded
          setState(prev => ({
            ...prev,
            isLoading: false,
            isPlaying: false,
            error: 'Stream unavailable. Try skipping to the next station.'
          }));
          retryCountRef.current = 0;
        }
      });
    }

    // Load last played station on mount
    const lastStationId = loadFromStorage<string | null>(STORAGE_KEYS.LAST_STATION, null);
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
    saveToStorage(STORAGE_KEYS.VOLUME, state.volume);
  }, [state.volume, state.isMuted]);

  // Save skin preference
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SKIN, state.currentSkin);
  }, [state.currentSkin]);

  // Save favorites
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVORITES, state.favorites);
  }, [state.favorites]);

  // Save recently played
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECENTLY_PLAYED, state.recentlyPlayed);
  }, [state.recentlyPlayed]);

  // Save current station
  useEffect(() => {
    if (state.currentStation) {
      saveToStorage(STORAGE_KEYS.LAST_STATION, state.currentStation.id);
    }
  }, [state.currentStation]);

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
    if (station) {
      setStation(station);
    }

    if (audioRef.current && state.currentStation) {
      if (!audioRef.current.src || (station && audioRef.current.src !== station.streamUrl)) {
        audioRef.current.src = station?.streamUrl || state.currentStation.streamUrl;
      }
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      audioRef.current.play().catch(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to play. Check your connection.'
        }));
      });
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
