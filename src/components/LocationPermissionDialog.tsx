import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Shield, Users, Clock, X } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationGranted?: (coordinates: { latitude: number; longitude: number }) => void;
}

export function LocationPermissionDialog({ 
  open, 
  onOpenChange, 
  onLocationGranted 
}: LocationPermissionDialogProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { getCurrentPosition, loading, coordinates, error, permissionStatus } = useGeolocation();

  const handleEnableLocation = async () => {
    await getCurrentPosition(true);
    if (coordinates && onLocationGranted) {
      onLocationGranted(coordinates);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onOpenChange(false);
  };

  const benefits = [
    {
      icon: Users,
      title: "Better Matches",
      description: "Find clients and properties near your actual location"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "See travel times and distances to properties"
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your exact location is never shared with others"
    }
  ];

  if (isDismissed || permissionStatus === 'denied') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <DialogTitle>Enable Location Services</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Allow Tinderents to access your location for a better experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 bg-muted/50">
                <CardContent className="flex items-center gap-3 p-3">
                  <benefit.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <Shield className="h-3 w-3 inline mr-1" />
              Your location data is encrypted and only used to improve your matching experience. 
              You can disable this at any time in your settings.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 p-3 rounded-lg">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleEnableLocation}
              disabled={loading}
              className="flex-1"
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
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>

          {/* Manual Location Option */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Or{' '}
              <button 
                onClick={() => onOpenChange(false)}
                className="text-primary hover:underline"
              >
                set your location manually
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}