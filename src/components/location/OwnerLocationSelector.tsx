import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, ChevronDown } from 'lucide-react';
import {
  WORLD_LOCATIONS,
  getRegions,
  getCountriesInRegion,
  getCitiesInCountry,
  getCityByName,
  getAllCities,
} from '@/data/worldLocations';

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
  onCoordinatesChange,
}: OwnerLocationSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // Get all unique countries across all regions
  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    const regions = getRegions();
    for (const region of regions) {
      const regionCountries = getCountriesInRegion(region);
      regionCountries.forEach(c => countries.add(c));
    }
    return Array.from(countries).sort();
  }, []);

  // Find the region for the current country
  useEffect(() => {
    if (country) {
      const regions = getRegions();
      for (const region of regions) {
        const countriesInRegion = getCountriesInRegion(region);
        if (countriesInRegion.includes(country)) {
          setSelectedRegion(region);
          break;
        }
      }
    }
  }, [country]);

  // Get cities for the selected country
  const availableCities = useMemo(() => {
    if (!country || !selectedRegion) return [];
    return getCitiesInCountry(selectedRegion, country);
  }, [country, selectedRegion]);

  // Get neighborhoods for the selected city
  const availableNeighborhoods = useMemo(() => {
    if (!city) return [];
    const cityData = getCityByName(city);
    return cityData?.city.neighborhoods || [];
  }, [city]);

  // Handle country change
  const handleCountryChange = (newCountry: string) => {
    onCountryChange(newCountry);
    // Clear city and neighborhood when country changes
    onCityChange('');
    onNeighborhoodChange('');

    // Find the region for this country
    const regions = getRegions();
    for (const region of regions) {
      const countriesInRegion = getCountriesInRegion(region);
      if (countriesInRegion.includes(newCountry)) {
        setSelectedRegion(region);
        break;
      }
    }
  };

  // Handle city change
  const handleCityChange = (newCity: string) => {
    onCityChange(newCity);
    // Clear neighborhood when city changes
    onNeighborhoodChange('');

    // Update coordinates if available
    if (newCity && onCoordinatesChange) {
      const cityData = getCityByName(newCity);
      if (cityData?.city.coordinates) {
        onCoordinatesChange(cityData.city.coordinates.lat, cityData.city.coordinates.lng);
      }
    }
  };

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
        {/* Cascading Location Selects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country Select */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Country *</Label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-border bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                <option value="">Select a country</option>
                {allCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* City Select */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm">City *</Label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!country}
                className="w-full h-10 px-3 pr-10 rounded-md border border-border bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{country ? 'Select a city' : 'Select country first'}</option>
                {availableCities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Neighborhood Select */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Neighborhood</Label>
            <div className="relative">
              <select
                value={neighborhood}
                onChange={(e) => onNeighborhoodChange(e.target.value)}
                disabled={!city}
                className="w-full h-10 px-3 pr-10 rounded-md border border-border bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{city ? 'Select a neighborhood (optional)' : 'Select city first'}</option>
                {availableNeighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
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
