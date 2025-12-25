import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Globe, MapPin, Search, Star } from 'lucide-react';
import {
  getRegions,
  getCountriesInRegion,
  getCitiesInCountry,
  searchCities,
  getFeaturedDestinations,
  CityLocation,
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
  region,
  country,
  state,
  city,
  neighborhood,
  latitude,
  longitude,
  onRegionChange,
  onCountryChange,
  onStateChange,
  onCityChange,
  onNeighborhoodChange,
  onCoordinatesChange,
}: OwnerLocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(region || '');
  const [selectedCountry, setSelectedCountry] = useState(country || '');
  const [selectedCity, setSelectedCity] = useState(city || '');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhood || '');
  const [showQuickSelect, setShowQuickSelect] = useState(true);

  // Get data from world locations
  const regions = useMemo(() => getRegions(), []);
  const countries = useMemo(() => selectedRegion ? getCountriesInRegion(selectedRegion) : [], [selectedRegion]);
  const cities = useMemo(() => selectedRegion && selectedCountry ? getCitiesInCountry(selectedRegion, selectedCountry) : [], [selectedRegion, selectedCountry]);
  const featuredDestinations = useMemo(() => getFeaturedDestinations(), []);
  const searchResults = useMemo(() => searchQuery.length >= 2 ? searchCities(searchQuery) : [], [searchQuery]);

  // Get selected city data for neighborhoods
  const selectedCityData = useMemo(() => {
    if (!selectedCity || !cities.length) return null;
    return cities.find(c => c.name === selectedCity);
  }, [selectedCity, cities]);

  const neighborhoods = selectedCityData?.neighborhoods || [];

  // Sync props with internal state
  useEffect(() => {
    if (region && region !== selectedRegion) setSelectedRegion(region);
    if (country && country !== selectedCountry) setSelectedCountry(country);
    if (city && city !== selectedCity) setSelectedCity(city);
    if (neighborhood && neighborhood !== selectedNeighborhood) setSelectedNeighborhood(neighborhood);
  }, [region, country, city, neighborhood]);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCountry('');
    setSelectedCity('');
    setSelectedNeighborhood('');
    onRegionChange?.(value);
    onCountryChange('');
    onCityChange('');
    onNeighborhoodChange('');
    setShowQuickSelect(false);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity('');
    setSelectedNeighborhood('');
    onCountryChange(value);
    onCityChange('');
    onNeighborhoodChange('');
    setShowQuickSelect(false);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedNeighborhood('');
    onCityChange(value);
    onNeighborhoodChange('');

    // Update coordinates if available
    const cityData = cities.find(c => c.name === value);
    if (cityData && onCoordinatesChange) {
      onCoordinatesChange(cityData.coordinates.lat, cityData.coordinates.lng);
    }
  };

  const handleNeighborhoodChange = (value: string) => {
    setSelectedNeighborhood(value);
    onNeighborhoodChange(value);
  };

  // Handle quick city selection
  const handleQuickCitySelect = (cityData: CityLocation, countryName: string, regionName: string) => {
    setSelectedRegion(regionName);
    setSelectedCountry(countryName);
    setSelectedCity(cityData.name);
    setSelectedNeighborhood('');
    setSearchQuery('');
    setShowQuickSelect(false);

    onRegionChange?.(regionName);
    onCountryChange(countryName);
    onCityChange(cityData.name);
    onNeighborhoodChange('');

    if (onCoordinatesChange) {
      onCoordinatesChange(cityData.coordinates.lat, cityData.coordinates.lng);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Location
          </CardTitle>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              General location only - no exact address shown
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowQuickSelect(e.target.value.length < 2);
            }}
            placeholder="Search for your city..."
            className="pl-10 bg-background border-border text-foreground"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && searchResults.length > 0 && (
          <ScrollArea className="h-40 border border-border rounded-lg">
            <div className="p-2 space-y-1">
              {searchResults.slice(0, 15).map(({ region, country, city }) => (
                <button
                  key={`${region}-${country}-${city.name}`}
                  onClick={() => handleQuickCitySelect(city, country, region)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{city.name}</span>
                  <span className="text-xs text-muted-foreground">{country}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Quick Select - Popular Destinations */}
        {showQuickSelect && searchQuery.length < 2 && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3" />
              Popular Destinations
            </Label>
            <ScrollArea className="h-32">
              <div className="flex flex-wrap gap-1.5">
                {/* Top Mexico destinations */}
                {featuredDestinations.mexico.slice(0, 8).map(city => (
                  <Button
                    key={city.name}
                    variant={selectedCity === city.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickCitySelect(city, 'Mexico', 'North America')}
                    className="text-xs h-7"
                  >
                    {city.name}
                  </Button>
                ))}
                {/* Top USA destinations */}
                {featuredDestinations.usa.slice(0, 4).map(city => (
                  <Button
                    key={city.name}
                    variant={selectedCity === city.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickCitySelect(city, 'United States', 'North America')}
                    className="text-xs h-7"
                  >
                    {city.name}
                  </Button>
                ))}
                {/* Top Europe destinations */}
                {featuredDestinations.europe.slice(0, 6).map(city => (
                  <Button
                    key={city.name}
                    variant={selectedCity === city.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickCitySelect(city, city.name, 'Europe')}
                    className="text-xs h-7"
                  >
                    {city.name}
                  </Button>
                ))}
                {/* Bali */}
                {featuredDestinations.asiaPacific.slice(0, 3).map(city => (
                  <Button
                    key={city.name}
                    variant={selectedCity === city.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickCitySelect(city, city.name, 'Asia Pacific')}
                    className="text-xs h-7"
                  >
                    {city.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Region */}
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Region</Label>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {regions.map(r => (
                  <SelectItem key={r} value={r} className="text-foreground">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Country *</Label>
            <Select
              value={selectedCountry}
              onValueChange={handleCountryChange}
              disabled={!selectedRegion}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={selectedRegion ? "Select country" : "Select region first"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {countries.map(c => (
                  <SelectItem key={c} value={c} className="text-foreground">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-foreground text-xs">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={!selectedCountry}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {cities.map(c => (
                  <SelectItem key={c.name} value={c.name} className="text-foreground">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Neighborhood */}
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Neighborhood</Label>
            <Select
              value={selectedNeighborhood}
              onValueChange={handleNeighborhoodChange}
              disabled={!selectedCity || neighborhoods.length === 0}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={selectedCity ? "Select area" : "Select city first"} />
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

        {/* Selected Location Summary */}
        {(selectedCity || selectedCountry) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedRegion && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {selectedRegion}
              </Badge>
            )}
            {selectedCountry && (
              <Badge variant="secondary" className="text-xs">
                {selectedCountry}
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="default" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedCity}
              </Badge>
            )}
            {selectedNeighborhood && (
              <Badge variant="outline" className="text-xs">
                {selectedNeighborhood}
              </Badge>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Privacy Note
          </h4>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>Your city and neighborhood are visible to clients searching in your area</li>
            <li>Your exact address is kept private until after a match</li>
            <li>Clients see your property on a map within your neighborhood</li>
            <li>You can share your full address after activation if you choose</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
