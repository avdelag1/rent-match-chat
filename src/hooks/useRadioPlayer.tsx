import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { RadioStation, getStationById } from '@/data/radioStations';

// Player Skin Types
export type RadioSkin =
  | 'minimal'
  | 'ipod-classic'
  | 'walkman'
  | 'dj-controller'
  | 'gameboy'
  | 'vintage-radio'
  | 'apple-glass';

// Coming Soon Skins (disabled but visible)
export type ComingSoonSkin =
  | 'cyberpunk-neon'
  | 'tesla-dashboard'
  | 'studio-rack'
  | 'bauhaus-dial'
  | 'space-hud'
  | 'tulum-jungle'
  | 'analog-synth'
  | 'boombox-90s'
  | 'modular-eurorack';

export interface SkinConfig {
  id: RadioSkin | ComingSoonSkin;
  name: string;
  description: string;
  preview: string;
  available: boolean;
}

export const AVAILABLE_SKINS: SkinConfig[] = [
  {
    id: 'minimal',
    name: 'Apple Glass Minimal',
    description: 'Clean, elegant, iOS-inspired design',
    preview: 'glass-morphism',
    available: true,
  },
  {
    id: 'ipod-classic',
    name: 'iPod Classic',
    description: 'Nostalgic scroll wheel interface',
    preview: 'ipod-white',
    available: true,
  },
  {
    id: 'walkman',
    name: 'Walkman Cassette',
    description: 'Retro Sony Walkman aesthetic',
    preview: 'cassette-deck',
    available: true,
  },
  {
    id: 'dj-controller',
    name: 'DJ Controller',
    description: 'Professional deck layout',
    preview: 'mixer-dark',
    available: true,
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    description: 'Pixel-perfect Nintendo tribute',
    preview: 'pixel-green',
    available: true,
  },
  {
    id: 'vintage-radio',
    name: 'Vintage Radio',
    description: 'Classic tube radio dial',
    preview: 'wood-brass',
    available: true,
  },
  {
    id: 'apple-glass',
    name: 'Apple Glass',
    description: 'Futuristic glassmorphic UI',
    preview: 'translucent',
    available: true,
  },
];

export const COMING_SOON_SKINS: SkinConfig[] = [
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', description: 'Night City vibes', preview: 'neon-pink', available: false },
  { id: 'tesla-dashboard', name: 'Tesla Dashboard', description: 'Electric vehicle UI', preview: 'dark-auto', available: false },
  { id: 'studio-rack', name: 'Studio Rack', description: 'VU meters and faders', preview: 'studio-gear', available: false },
  { id: 'bauhaus-dial', name: 'Bauhaus Dial', description: 'Geometric precision', preview: 'primary-colors', available: false },
  { id: 'space-hud', name: 'Space HUD', description: 'Sci-fi command center', preview: 'holographic', available: false },
  { id: 'tulum-jungle', name: 'Tulum Jungle Totem', description: 'Organic ceremonial', preview: 'wood-natural', available: false },
  { id: 'analog-synth', name: 'Analog Synth', description: 'Moog-inspired knobs', preview: 'synth-panel', available: false },
  { id: 'boombox-90s', name: 'Boombox 90s', description: 'Street style ghetto blaster', preview: 'chrome-silver', available: false },
  { id: 'modular-eurorack', name: 'Modular Eurorack', description: 'Patch cable chaos', preview: 'rack-modules', available: false },
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

  const [state, setState] = useState<RadioPlayerState>(() => ({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    volume: loadFromStorage(STORAGE_KEYS.VOLUME, 0.8),
    isMuted: false,
    error: null,
    currentSkin: loadFromStorage(STORAGE_KEYS.SKIN, 'minimal') as RadioSkin,
    sleepTimer: null,
    sleepTimerEndTime: null,
    favorites: loadFromStorage<string[]>(STORAGE_KEYS.FAVORITES, []),
    recentlyPlayed: loadFromStorage<string[]>(STORAGE_KEYS.RECENTLY_PLAYED, []),
    isPlayerExpanded: false,
  }));

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
      audioRef.current.volume = state.volume;

      // Event listeners
      audioRef.current.addEventListener('playing', () => {
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
        setState(prev => ({
          ...prev,
          isLoading: false,
          isPlaying: false,
          error: 'Unable to load stream. Please try another station.'
        }));
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
