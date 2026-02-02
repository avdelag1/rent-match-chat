import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RadioStation, CityLocation, RadioSkin, RadioPlayerState } from '@/types/radio';
import { getStationsByCity, getStationById, getRandomStation } from '@/data/radioStations';
import { logger } from '@/utils/prodLogger';

export function useRadioPlayer() {
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

  // Load user preferences from Supabase
  useEffect(() => {
    loadUserPreferences();
  }, [user?.id]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;

      // Handle audio events
      audioRef.current.addEventListener('ended', handleTrackEnded);
      audioRef.current.addEventListener('error', handleAudioError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleTrackEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      }
    };
  }, []);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  const loadUserPreferences = async () => {
    if (!user?.id) {
      // Auto-select first station of default city for non-logged-in users
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

      // If columns don't exist or query fails, use defaults (radio feature not yet deployed)
      if (error) {
        logger.info('[RadioPlayer] Using default preferences (columns may not exist yet)');
        setLoading(false);
        return;
      }

      if (data) {
        const currentStationId = data.radio_current_station_id;
        const city = (data.radio_current_city as CityLocation) || 'tulum';
        let currentStation = currentStationId ? getStationById(currentStationId) : null;

        // Auto-select first station if no station is saved
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
      } else {
        // No saved data, auto-select first station of default city
        const stations = getStationsByCity('tulum');
        if (stations.length > 0) {
          setState(prev => ({ ...prev, currentStation: stations[0] }));
        }
      }
    } catch (err) {
      // Silently use defaults if preferences can't be loaded
      logger.info('[RadioPlayer] Using default preferences:', err);
      // Auto-select first station of default city
      const stations = getStationsByCity('tulum');
      if (stations.length > 0) {
        setState(prev => ({ ...prev, currentStation: stations[0] }));
      }
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

      // Silently ignore errors (columns may not exist yet)
      if (error) {
        logger.info('[RadioPlayer] Could not save preferences (columns may not exist yet)');
      }
    } catch (err) {
      // Silently ignore - preferences will work locally until migration is applied
      logger.info('[RadioPlayer] Preferences saved locally only:', err);
    }
  };

  const play = useCallback(async (station?: RadioStation) => {
    const targetStation = station || state.currentStation;
    if (!targetStation || !audioRef.current) return;

    try {
      if (state.currentStation?.id !== targetStation.id) {
        audioRef.current.src = targetStation.streamUrl;
        setState(prev => ({ ...prev, currentStation: targetStation }));
        savePreferences({ currentStation: targetStation });
      }

      await audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    } catch (err) {
      logger.error('[RadioPlayer] Playback error:', err);
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
      // If no station, start with first station of current city
      const stations = getStationsByCity(state.currentCity);
      if (stations.length > 0) {
        play(stations[0]);
      }
      return;
    }

    if (state.isShuffle) {
      // Shuffle: play random station from any city
      play(getRandomStation());
      return;
    }

    // Normal mode: cycle through current city's stations
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
    setState(prev => ({ ...prev, currentCity: newCity, isPlaying: false }));
    savePreferences({ currentCity: newCity });

    // Auto-play first station of new city
    const stations = getStationsByCity(newCity);
    if (stations.length > 0) {
      play(stations[0]);
    }
  }, [state.currentCity, play]);

  const setCity = useCallback((city: CityLocation) => {
    if (city === state.currentCity) return;

    setState(prev => ({ ...prev, currentCity: city, isPlaying: false }));
    savePreferences({ currentCity: city });

    // Auto-play first station of new city
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
    // Auto-advance to next station
    changeStation('next');
  }, [changeStation]);

  const handleAudioError = useCallback((e: Event) => {
    logger.error('[RadioPlayer] Audio error:', e);
    setError('Stream unavailable');
    // Try next station
    changeStation('next');
  }, [changeStation]);

  return {
    state,
    loading,
    error,
    play,
    pause,
    togglePlayPause,
    changeStation,
    changeCity,
    setCity,
    setVolume,
    toggleShuffle,
    setSkin,
    toggleFavorite,
    isStationFavorite: (stationId: string) => state.favorites.includes(stationId)
  };
}
