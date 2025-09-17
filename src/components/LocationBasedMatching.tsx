import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MapPin, Navigation, Clock, Target } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationPermissionDialog } from './LocationPermissionDialog';

interface LocationBasedMatchingProps {
  onLocationUpdate?: (location: { 
    latitude: number; 
    longitude: number; 
    city?: string; 
    radius: number 
  }) => void;
  className?: string;
}

export function LocationBasedMatching({ onLocationUpdate, className }: LocationBasedMatchingProps) {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [searchRadius, setSearchRadius] = useState([10]); // km
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  
  const { 
    coordinates, 
    city, 
    loading, 
    error, 
    permissionStatus,
    getCurrentPosition,
    calculateDistance 
  } = useGeolocation();

  useEffect(() => {
    if (coordinates && city) {
      setIsLocationEnabled(true);
      onLocationUpdate?.({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        city,
        radius: searchRadius[0]
      });
    }
  }, [coordinates, city, searchRadius, onLocationUpdate]);

  const handleEnableLocation = () => {
    if (permissionStatus === 'denied') {
      // Show instructions to manually enable location
      setShowPermissionDialog(true);
    } else {
      getCurrentPosition();
    }
  };

  const handleLocationGranted = (coords: { latitude: number; longitude: number }) => {
    setIsLocationEnabled(true);
    setShowPermissionDialog(false);
  };

  const getDistanceText = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  const getLocationAccuracyBadge = () => {
    if (!coordinates?.accuracy) return null;
    
    const accuracy = coordinates.accuracy;
    let color = 'bg-green-500';
    let text = 'High accuracy';
    
    if (accuracy > 100) {
      color = 'bg-red-500';
      text = 'Low accuracy';
    } else if (accuracy > 50) {
      color = 'bg-yellow-500';
      text = 'Medium accuracy';
    }
    
    return (
      <Badge variant="secondary" className={`${color} text-white text-xs`}>
        {text} (±{Math.round(accuracy)}m)
      </Badge>
    );
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location-Based Matching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLocationEnabled ? (
            <div className="text-center space-y-4">
              <div className="p-6 border-2 border-dashed border-muted rounded-lg">
                <Navigation className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">Enable Location Services</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find the best matches near your current location
                </p>
                <Button 
                  onClick={handleEnableLocation}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Enable Location
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Location */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Current Location</p>
                    <p className="text-xs text-muted-foreground">
                      {city || 'Unknown city'}
                    </p>
                  </div>
                </div>
                {getLocationAccuracyBadge()}
              </div>

              {/* Search Radius */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Search Radius
                  </label>
                  <Badge variant="outline">
                    {searchRadius[0]} km
                  </Badge>
                </div>
                
                <Slider
                  value={searchRadius}
                  onValueChange={setSearchRadius}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Quick Radius Options */}
              <div className="space-y-2">
                <p className="text-xs font-medium">Quick Select:</p>
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 20, 50].map((radius) => (
                    <Button
                      key={radius}
                      variant={searchRadius[0] === radius ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchRadius([radius])}
                      className="text-xs h-7"
                    >
                      {radius}km
                    </Button>
                  ))}
                </div>
              </div>

              {/* Location Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getCurrentPosition()}
                  disabled={loading}
                  className="flex-1"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLocationEnabled(false)}
                  className="flex-1"
                >
                  Disable
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LocationPermissionDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onLocationGranted={handleLocationGranted}
      />
    </>
  );
}