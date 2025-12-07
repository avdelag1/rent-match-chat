import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { getStates, getCitiesForState, getNeighborhoodsForCity } from '@/data/mexicanLocations';

interface OwnerLocationSelectorProps {
  country?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  onCountryChange: (country: string) => void;
  onStateChange?: (state: string) => void;
  onCityChange: (city: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
}

export function OwnerLocationSelector({
  country,
  state,
  city,
  neighborhood,
  onCountryChange,
  onStateChange,
  onCityChange,
  onNeighborhoodChange,
}: OwnerLocationSelectorProps) {
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhood || '');

  const states = getStates();
  const cities = selectedState ? getCitiesForState(selectedState) : [];
  const neighborhoods = selectedState && selectedCity ? getNeighborhoodsForCity(selectedState, selectedCity) : [];

  // Sync props with internal state
  useEffect(() => {
    if (state && state !== selectedState) setSelectedState(state);
    if (city && city !== selectedCity) setSelectedCity(city);
    if (neighborhood && neighborhood !== selectedNeighborhood) setSelectedNeighborhood(neighborhood);
  }, [state, city, neighborhood]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity('');
    setSelectedNeighborhood('');
    onStateChange?.(value);
    onCityChange('');
    onNeighborhoodChange('');
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedNeighborhood('');
    onCityChange(value);
    onNeighborhoodChange('');
  };

  const handleNeighborhoodChange = (value: string) => {
    setSelectedNeighborhood(value);
    onNeighborhoodChange(value);
  };

  // Set Mexico as default country
  useEffect(() => {
    if (!country) {
      onCountryChange('Mexico');
    }
  }, [country, onCountryChange]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-foreground text-lg">Location</CardTitle>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              General location only - no exact address shown
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* State */}
          <div className="space-y-2">
            <Label className="text-foreground">State *</Label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {states.map(s => (
                  <SelectItem key={s} value={s} className="text-foreground">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-foreground">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={!selectedState}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {cities.map(c => (
                  <SelectItem key={c} value={c} className="text-foreground">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Neighborhood */}
          <div className="space-y-2">
            <Label className="text-foreground">Neighborhood</Label>
            <Select
              value={selectedNeighborhood}
              onValueChange={handleNeighborhoodChange}
              disabled={!selectedCity}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={selectedCity ? "Select neighborhood" : "Select city first"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {neighborhoods.map(n => (
                  <SelectItem key={n} value={n} className="text-foreground">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional - helps clients find you
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Privacy Note
          </h4>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>Your state, city, and neighborhood are visible to clients</li>
            <li>Your exact address is kept private until after a match</li>
            <li>Clients see your property on a map within your neighborhood</li>
            <li>You can share your full address after activation if you choose</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
