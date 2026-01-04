/**
 * Lazy-loaded Google Maps wrapper
 * Only loads the Google Maps script when the component is actually rendered
 * Reduces initial bundle size by ~200KB for users who don't visit location pages
 */

import { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Script loading state
let googleMapsLoadPromise: Promise<void> | null = null;
let isGoogleMapsLoaded = false;

// Load Google Maps script dynamically
function loadGoogleMapsScript(): Promise<void> {
  // Already loaded
  if (isGoogleMapsLoaded && window.google?.maps) {
    return Promise.resolve();
  }

  // Already loading
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  // Start loading
  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded (e.g., from another source)
    if (window.google?.maps) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // If no API key, resolve anyway - components will show fallback UI
    if (!apiKey) {
      console.warn('[LazyGoogleMaps] No VITE_GOOGLE_MAPS_API_KEY configured');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    script.onerror = () => {
      googleMapsLoadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

// Loading placeholder component
function MapLoadingFallback({ title = 'Loading Map...' }: { title?: string }) {
  return (
    <Card className="bg-card border-border animate-pulse">
      <CardHeader>
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p className="text-sm">Loading location services...</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Lazy-loaded GoogleLocationSelector
const GoogleLocationSelectorLazy = lazy(() =>
  import('./GoogleLocationSelector').then((module) => ({
    default: module.GoogleLocationSelector,
  }))
);

// Lazy-loaded ClientLocationSelector
const ClientLocationSelectorLazy = lazy(() =>
  import('./ClientLocationSelector').then((module) => ({
    default: module.ClientLocationSelector,
  }))
);

// Props types (re-export from original components)
interface GoogleLocationSelectorProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  neighborhood?: string;
  locationType?: 'home' | 'current' | 'property';
  userType?: 'client' | 'owner';
  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    country?: string;
    neighborhood?: string;
    region?: string;
    locationType?: 'home' | 'current' | 'property';
  }) => void;
  showMap?: boolean;
  showPrivacyNotice?: boolean;
  title?: string;
}

interface ClientLocationSelectorProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  locationType?: 'home' | 'current';
  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    country?: string;
    locationType: 'home' | 'current';
  }) => void;
}

// Hook to load Google Maps on component mount
function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isGoogleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    loadGoogleMapsScript()
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, []);

  return { isLoaded, error };
}

/**
 * Lazy-loaded Google Location Selector
 * Loads Google Maps script on demand, then renders the full component
 */
export function LazyGoogleLocationSelector(props: GoogleLocationSelectorProps) {
  const { isLoaded, error } = useGoogleMapsLoader();

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {props.title || 'Your Location'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Unable to load maps. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return <MapLoadingFallback title={props.title || 'Your Location'} />;
  }

  return (
    <Suspense fallback={<MapLoadingFallback title={props.title || 'Your Location'} />}>
      <GoogleLocationSelectorLazy {...props} />
    </Suspense>
  );
}

/**
 * Lazy-loaded Client Location Selector
 * Loads Google Maps script on demand, then renders the full component
 */
export function LazyClientLocationSelector(props: ClientLocationSelectorProps) {
  const { isLoaded, error } = useGoogleMapsLoader();

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Your Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Unable to load maps. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return <MapLoadingFallback title="Your Location" />;
  }

  return (
    <Suspense fallback={<MapLoadingFallback title="Your Location" />}>
      <ClientLocationSelectorLazy {...props} />
    </Suspense>
  );
}

// Pre-load function for route prefetching
export function preloadGoogleMaps(): void {
  loadGoogleMapsScript().catch(() => {});
}

export { MapLoadingFallback };
