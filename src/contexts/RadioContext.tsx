import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RadioStation, CityLocation, RadioSkin, RadioPlayerState } from '@/types/radio';
import { getStationsByCity, getStationById, getRandomStation } from '@/data/radioStations';
import { logger } from '@/utils/prodLogger';

interface RadioContextValue {
  state: RadioPlayerState;
  loading: boolean;
  error: string | null;
  play: (station?: RadioStation) => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  changeStation: (direction: 'next' | 'prev') => void;
  changeCity: (direction: 'next' | 'prev', cities: CityLocation[]) => void;
  selectCity: (city: CityLocation) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setSkin: (skin: RadioSkin) => void;
  toggleFavorite: (stationId: string) => void;
  isStationFavorite: (stationId: string) => boolean;
  closePlayer: () => void;
  showMiniPlayer: boolean;
}

const RadioContext = createContext<RadioContextValue | undefined>(undefined);

interface RadioProviderProps {
  children: React.ReactNode;
}

export function RadioProvider({ children }: RadioProviderProps) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<RadioPlayerState>({
    isPlaying: false,
    currentStation: null,
    currentCity: 'tulum',
    volume: 0.7,
    isShuffle: false,
    skin: 'modern',
    favorites: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  // Load user preferences from Supabase
  useEffect(() => {
    loadUserPreferences();
  }, [user?.id]);

  // Initialize audio element ONCE (persists across navigation)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;
      audioRef.current.preload = 'auto';

      // Handle audio events
      audioRef.current.addEventListener('ended', handleTrackEnded);
      audioRef.current.addEventListener('error', handleAudioError);
    }

    return () => {
      // Don't cleanup on unmount - we want audio to persist
    };
  }, []);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Show mini player when playing and station is set
  useEffect(() => {
    if (state.isPlaying && state.currentStation) {
      setShowMiniPlayer(true);
    }
  }, [state.isPlaying, state.currentStation]);

  const loadUserPreferences = async () => {
    if (!user?.id) {
      // Set default station for non-logged in users
      const stations = getStationsByCity('tulum');
      if (stations.length > 0) {
        setState(prev => ({ ...prev, currentStation: stations[0] }));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('radio_skin, radio_current_city, radio_current_station_id, radio_volume, radio_shuffle_mode, radio_favorite_stations')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.info('[RadioContext] Using default preferences (columns may not exist yet)');
        setLoading(false);
        return;
      }

      if (data) {
        const city = (data.radio_current_city as CityLocation) || 'tulum';
        const currentStationId = data.radio_current_station_id;
        let currentStation = currentStationId ? getStationById(currentStationId) : null;

        // If no saved station, use first station from city
        if (!currentStation) {
          const stations = getStationsByCity(city);
          currentStation = stations.length > 0 ? stations[0] : null;
        }

        setState(prev => ({
          ...prev,
          skin: (data.radio_skin as RadioSkin) || 'modern',
          currentCity: city,
          currentStation: currentStation,
          volume: data.radio_volume || 0.7,
          isShuffle: data.radio_shuffle_mode || false,
          favorites: data.radio_favorite_stations || []
        }));
      }
    } catch (err) {
      logger.info('[RadioContext] Using default preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates: Partial<RadioPlayerState>) => {
    if (!user?.id) return;

    try {
      const dbUpdates: any = {};

      if (updates.skin !== undefined) dbUpdates.radio_skin = updates.skin;
      if (updates.currentCity !== undefined) dbUpdates.radio_current_city = updates.currentCity;
      if (updates.currentStation !== undefined) dbUpdates.radio_current_station_id = updates.currentStation?.id || null;
      if (updates.volume !== undefined) dbUpdates.radio_volume = updates.volume;
      if (updates.isShuffle !== undefined) dbUpdates.radio_shuffle_mode = updates.isShuffle;
      if (updates.favorites !== undefined) dbUpdates.radio_favorite_stations = updates.favorites;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) {
        logger.info('[RadioContext] Could not save preferences (columns may not exist yet)');
      }
    } catch (err) {
      logger.info('[RadioContext] Preferences saved locally only:', err);
    }
  };

  const play = useCallback(async (station?: RadioStation) => {
    const targetStation = station || state.currentStation;
    if (!targetStation || !audioRef.current) return;

    try {
      if (state.currentStation?.id !== targetStation.id) {
        audioRef.current.src = targetStation.streamUrl;
        audioRef.current.load();
        setState(prev => ({ ...prev, currentStation: targetStation }));
        savePreferences({ currentStation: targetStation });
      }

      await audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
      setShowMiniPlayer(true);
      setError(null);
    } catch (err) {
      logger.error('[RadioContext] Playback error:', err);
      setError('Failed to play station');
    }
  }, [state.currentStation]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const changeStation = useCallback((direction: 'next' | 'prev') => {
    if (!state.currentStation) {
      const stations = getStationsByCity(state.currentCity);
      if (stations.length > 0) {
        play(stations[0]);
      }
      return;
    }

    if (state.isShuffle) {
      play(getRandomStation());
      return;
    }

    const stations = getStationsByCity(state.currentCity);
    const currentIndex = stations.findIndex(s => s.id === state.currentStation?.id);

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % stations.length;
    } else {
      nextIndex = (currentIndex - 1 + stations.length) % stations.length;
    }

    play(stations[nextIndex]);
  }, [state.currentStation, state.currentCity, state.isShuffle, play]);

  const changeCity = useCallback((direction: 'next' | 'prev', cities: CityLocation[]) => {
    const currentIndex = cities.indexOf(state.currentCity);
    let nextIndex: number;

    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % cities.length;
    } else {
      nextIndex = (currentIndex - 1 + cities.length) % cities.length;
    }

    const newCity = cities[nextIndex];
    setState(prev => ({ ...prev, currentCity: newCity }));
    savePreferences({ currentCity: newCity });

    const stations = getStationsByCity(newCity);
    if (stations.length > 0) {
      play(stations[0]);
    }
  }, [state.currentCity, play]);

  const selectCity = useCallback((city: CityLocation) => {
    if (city === state.currentCity) return;

    setState(prev => ({ ...prev, currentCity: city }));
    savePreferences({ currentCity: city });

    const stations = getStationsByCity(city);
    if (stations.length > 0) {
      play(stations[0]);
    }
  }, [state.currentCity, play]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: clampedVolume }));
    savePreferences({ volume: clampedVolume });
  }, []);

  const toggleShuffle = useCallback(() => {
    const newShuffle = !state.isShuffle;
    setState(prev => ({ ...prev, isShuffle: newShuffle }));
    savePreferences({ isShuffle: newShuffle });
  }, [state.isShuffle]);

  const setSkin = useCallback((skin: RadioSkin) => {
    setState(prev => ({ ...prev, skin }));
    savePreferences({ skin });
  }, []);

  const toggleFavorite = useCallback((stationId: string) => {
    setState(prev => {
      const isFavorite = prev.favorites.includes(stationId);
      const newFavorites = isFavorite
        ? prev.favorites.filter(id => id !== stationId)
        : [...prev.favorites, stationId];

      savePreferences({ favorites: newFavorites });
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  const handleTrackEnded = useCallback(() => {
    changeStation('next');
  }, [changeStation]);

  const handleAudioError = useCallback((e: Event) => {
    const target = e.target as HTMLAudioElement;
    const errorCode = target.error?.code;
    let errorMessage = 'Stream unavailable';

    switch (errorCode) {
      case MediaError.MEDIA_ERR_ABORTED:
        errorMessage = 'Playback aborted';
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        errorMessage = 'Network error - check your connection';
        break;
      case MediaError.MEDIA_ERR_DECODE:
        errorMessage = 'Stream format not supported';
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = 'Station stream unavailable';
        break;
      default:
        errorMessage = 'Playback error';
    }

    logger.error('[RadioContext] Audio error:', errorCode, errorMessage);
    setError(errorMessage);

    // Auto-skip to next station after a brief delay
    setTimeout(() => {
      changeStation('next');
    }, 1500);
  }, [changeStation]);

  const closePlayer = useCallback(() => {
    pause();
    setShowMiniPlayer(false);
  }, [pause]);

  const isStationFavorite = useCallback((stationId: string) => {
    return state.favorites.includes(stationId);
  }, [state.favorites]);

  const value: RadioContextValue = {
    state,
    loading,
    error,
    play,
    pause,
    togglePlayPause,
    changeStation,
    changeCity,
    selectCity,
    setVolume,
    toggleShuffle,
    setSkin,
    toggleFavorite,
    isStationFavorite,
    closePlayer,
    showMiniPlayer
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadioContext(): RadioContextValue {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadioContext must be used within a RadioProvider');
  }
  return context;
}

// Alias for compatibility
export const useRadio = useRadioContext;

// Optional hook that returns undefined if not within provider (for MiniPlayer)
export function useRadioContextOptional(): RadioContextValue | undefined {
  return useContext(RadioContext);
}
