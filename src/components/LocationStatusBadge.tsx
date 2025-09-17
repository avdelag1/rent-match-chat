import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface LocationStatusBadgeProps {
  distance?: number;
  city?: string;
  isLoading?: boolean;
  hasLocationPermission?: boolean;
  className?: string;
}

export function LocationStatusBadge({ 
  distance, 
  city, 
  isLoading, 
  hasLocationPermission = true,
  className 
}: LocationStatusBadgeProps) {
  if (isLoading) {
    return (
      <Badge variant="secondary" className={`animate-pulse ${className}`}>
        <Navigation className="w-3 h-3 mr-1 animate-spin" />
        Locating...
      </Badge>
    );
  }

  if (!hasLocationPermission) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className="w-3 h-3 mr-1" />
        Location disabled
      </Badge>
    );
  }

  if (distance !== undefined) {
    const distanceText = distance < 1 
      ? `${Math.round(distance * 1000)}m away`
      : distance < 10 
        ? `${distance.toFixed(1)}km away`
        : `${Math.round(distance)}km away`;

    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        <MapPin className="w-3 h-3 mr-1 text-green-500" />
        {distanceText}
      </Badge>
    );
  }

  if (city) {
    return (
      <Badge variant="secondary" className={className}>
        <MapPin className="w-3 h-3 mr-1" />
        {city}
      </Badge>
    );
  }

  return null;
}