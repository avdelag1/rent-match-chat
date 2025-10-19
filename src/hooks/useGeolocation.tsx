import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  address: string | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    address: null,
    city: null,
    country: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Using free OpenStreetMap Nominatim service for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Tinderents App',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      return {
        address: data.display_name || null,
        city: data.address?.city || data.address?.town || data.address?.village || null,
        country: data.address?.country || null,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        address: null,
        city: null,
        country: null,
      };
    }
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(async (highAccuracy = true): Promise<void> => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionStatus: permission.state as any }));
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      const coordinates: GeolocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      // Get address from coordinates
      const locationInfo = await reverseGeocode(coordinates.latitude, coordinates.longitude);

      setState(prev => ({
        ...prev,
        coordinates,
        ...locationInfo,
        loading: false,
        error: null,
      }));

      // Only show toast if we have valid location data
      if (locationInfo.city && locationInfo.country) {
        toast({
          title: "Location detected",
          description: `${locationInfo.city}, ${locationInfo.country}`,
        });
      } else {
        console.warn('Coordinates obtained but reverse geocoding incomplete:', {
          coordinates,
          locationInfo
        });
      }

    } catch (error: any) {
      let errorMessage = 'Failed to get your location';
      
      if (error.code) {
        switch (error.code) {
          case 1:
            errorMessage = 'Location access denied. Please enable location access in your browser settings.';
            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          case 2:
            errorMessage = 'Location information is unavailable.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [reverseGeocode]);

  // Watch position for real-time updates
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const coordinates: GeolocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        const locationInfo = await reverseGeocode(coordinates.latitude, coordinates.longitude);

        setState(prev => ({
          ...prev,
          coordinates,
          ...locationInfo,
          loading: false,
          error: null,
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    return watchId;
  }, [reverseGeocode]);

  // Clear position
  const clearPosition = useCallback(() => {
    setState({
      coordinates: null,
      address: null,
      city: null,
      country: null,
      loading: false,
      error: null,
      permissionStatus: null,
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearPosition,
    calculateDistance,
    reverseGeocode,
  };
}