import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from './useGeolocation';
import { useAuth } from './useAuth';

interface LocationBasedProfile {
  id: string;
  user_id: string;
  full_name: string;
  age?: number;
  bio?: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    address?: string;
  };
  distance?: number;
  verified?: boolean;
  role: 'client' | 'owner';
}

interface LocationBasedListing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  property_type?: string;
  images?: string[];
  beds?: number;
  baths?: number;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    address?: string;
  };
  distance?: number;
  owner_id: string;
  owner_name?: string;
}

interface LocationFilter {
  maxDistance: number; // in kilometers
  minDistance?: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

export function useLocationBasedMatching() {
  const { user } = useAuth();
  const { coordinates, calculateDistance } = useGeolocation();
  const [locationFilter, setLocationFilter] = useState<LocationFilter | null>(null);

  // Update location filter when user's coordinates change
  useEffect(() => {
    if (coordinates) {
      setLocationFilter(prev => ({
        maxDistance: prev?.maxDistance || 10,
        minDistance: prev?.minDistance || 0,
        currentLocation: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      }));
    }
  }, [coordinates]);

  // Fetch nearby profiles based on location
  const { 
    data: nearbyProfiles = [], 
    isLoading: profilesLoading,
    refetch: refetchProfiles 
  } = useQuery({
    queryKey: ['nearby-profiles', user?.id, locationFilter],
    queryFn: async (): Promise<LocationBasedProfile[]> => {
      if (!user || !locationFilter) return [];

      try {
        // Get all profiles with location data
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .eq('is_active', true)
          .not('location', 'is', null);

        if (error) {
          console.error('Error fetching profiles:', error);
          return [];
        }

        if (!profiles || profiles.length === 0) return [];

        // Filter and calculate distances
        const profilesWithDistance = profiles
          .map(profile => {
            // Parse location data (could be JSON or coordinates)
            let locationData = null;
            if (profile.location) {
              try {
                locationData = typeof profile.location === 'string' 
                  ? JSON.parse(profile.location)
                  : profile.location;
              } catch (e) {
                console.warn('Invalid location data for profile:', profile.id);
                return null;
              }
            }

            if (!locationData?.latitude || !locationData?.longitude) {
              return null;
            }

            // Calculate distance
            const distance = calculateDistance(
              locationFilter.currentLocation.latitude,
              locationFilter.currentLocation.longitude,
              locationData.latitude,
              locationData.longitude
            );

            // Apply distance filter
            if (distance > locationFilter.maxDistance) {
              return null;
            }

            if (locationFilter.minDistance && distance < locationFilter.minDistance) {
              return null;
            }

            return {
              id: profile.id,
              user_id: profile.id,
              full_name: profile.full_name || 'Unknown User',
              age: profile.age,
              bio: profile.bio,
              images: profile.images || [],
              location: locationData,
              distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
              verified: profile.verified || false,
              role: profile.role as 'client' | 'owner',
            };
          })
          .filter(profile => profile !== null)
          .sort((a, b) => (a!.distance || 0) - (b!.distance || 0));

        return profilesWithDistance as LocationBasedProfile[];

      } catch (error) {
        console.error('Error in nearby profiles query:', error);
        return [];
      }
    },
    enabled: !!user && !!locationFilter,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch nearby listings based on location
  const { 
    data: nearbyListings = [], 
    isLoading: listingsLoading,
    refetch: refetchListings 
  } = useQuery({
    queryKey: ['nearby-listings', user?.id, locationFilter],
    queryFn: async (): Promise<LocationBasedListing[]> => {
      if (!user || !locationFilter) return [];

      try {
        // Get all active listings with location data
        const { data: listings, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles:owner_id (
              full_name
            )
          `)
          .eq('is_active', true)
          .eq('status', 'active')
          .neq('owner_id', user.id);

        if (error) {
          console.error('Error fetching listings:', error);
          return [];
        }

        if (!listings || listings.length === 0) return [];

        // Filter and calculate distances
        const listingsWithDistance = listings
          .map(listing => {
            // For listings, we might need to geocode the address if no coordinates
            // For now, we'll skip listings without coordinates
            if (!listing.address && !listing.city) {
              return null;
            }

            // TODO: Implement geocoding for addresses without coordinates
            // For now, assign random coordinates near Mexico (this should be replaced with real geocoding)
            const mockCoordinates = {
              latitude: 20.2 + (Math.random() - 0.5) * 2, // Around Mexico
              longitude: -87.4 + (Math.random() - 0.5) * 2,
            };

            const distance = calculateDistance(
              locationFilter.currentLocation.latitude,
              locationFilter.currentLocation.longitude,
              mockCoordinates.latitude,
              mockCoordinates.longitude
            );

            // Apply distance filter
            if (distance > locationFilter.maxDistance) {
              return null;
            }

            return {
              id: listing.id,
              title: listing.title || 'Untitled Property',
              description: listing.description,
              price: listing.price,
              property_type: listing.property_type,
              images: listing.images || [],
              beds: listing.beds,
              baths: listing.baths,
              location: {
                ...mockCoordinates,
                city: listing.city,
                address: listing.address,
              },
              distance: Math.round(distance * 100) / 100,
              owner_id: listing.owner_id,
              owner_name: (listing.profiles as any)?.full_name || 'Unknown Owner',
            };
          })
          .filter(listing => listing !== null)
          .sort((a, b) => (a!.distance || 0) - (b!.distance || 0));

        return listingsWithDistance as LocationBasedListing[];

      } catch (error) {
        console.error('Error in nearby listings query:', error);
        return [];
      }
    },
    enabled: !!user && !!locationFilter,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Update location filter
  const updateLocationFilter = useCallback((newFilter: Partial<LocationFilter>) => {
    setLocationFilter(prev => prev ? { ...prev, ...newFilter } : null);
  }, []);

  // Get profiles within specific distance
  const getProfilesWithinDistance = useCallback((maxDistance: number) => {
    return nearbyProfiles.filter(profile => (profile.distance || 0) <= maxDistance);
  }, [nearbyProfiles]);

  // Get listings within specific distance
  const getListingsWithinDistance = useCallback((maxDistance: number) => {
    return nearbyListings.filter(listing => (listing.distance || 0) <= maxDistance);
  }, [nearbyListings]);

  return {
    // Data
    nearbyProfiles,
    nearbyListings,
    locationFilter,

    // Loading states
    profilesLoading,
    listingsLoading,
    isLoading: profilesLoading || listingsLoading,

    // Actions
    updateLocationFilter,
    refetchProfiles,
    refetchListings,
    getProfilesWithinDistance,
    getListingsWithinDistance,

    // Helper
    calculateDistance,
  };
}