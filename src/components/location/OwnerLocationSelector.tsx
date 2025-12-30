import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin } from 'lucide-react';

interface OwnerLocationSelectorProps {
  region?: string;
  country?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  onRegionChange?: (region: string) => void;
  onCountryChange: (country: string) => void;
  onStateChange?: (state: string) => void;
  onCityChange: (city: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

export function OwnerLocationSelector({
  country = '',
  city = '',
  neighborhood = '',
  onCountryChange,
  onCityChange,
  onNeighborhoodChange,
}: OwnerLocationSelectorProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Location
          </CardTitle>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            General location only - no exact address shown
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Simple Location Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Country *</Label>
            <Input
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              placeholder="e.g. United States, Mexico, Spain"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm">City *</Label>
            <Input
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="e.g. Miami, Cancun, Barcelona"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm">Neighborhood</Label>
            <Input
              value={neighborhood}
              onChange={(e) => onNeighborhoodChange(e.target.value)}
              placeholder="e.g. Downtown, Beach Area (optional)"
              className="bg-background border-border text-foreground"
            />
            <p className="text-[10px] text-muted-foreground">
              Optional - helps clients find you
            </p>
          </div>
        </div>

        {/* Selected Location Tags */}
        {(city || country) && (
          <div className="flex flex-wrap gap-1.5">
            {country && (
              <Badge variant="secondary" className="text-xs py-0.5">
                {country}
              </Badge>
            )}
            {city && (
              <Badge variant="default" className="text-xs py-0.5">
                <MapPin className="w-3 h-3 mr-1" />
                {city}
              </Badge>
            )}
            {neighborhood && (
              <Badge variant="outline" className="text-xs py-0.5">
                {neighborhood}
              </Badge>
            )}
          </div>
        )}

        {/* Privacy Note - Compact */}
        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <p className="text-xs text-amber-200 font-medium mb-1">Privacy Note</p>
          <p className="text-xs text-amber-200/80">Your city and neighborhood are visible to clients searching in your area</p>
          <p className="text-xs text-amber-200/80">Your exact address is kept private until after a match</p>
        </div>
      </CardContent>
    </Card>
  );
}
