import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Search } from 'lucide-react';
import {
  getRegions,
  getCountriesInRegion,
  getCitiesInCountry,
  searchCities,
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

  // Get data from world locations
  const regions = useMemo(() => getRegions(), []);
  const countries = useMemo(() => selectedRegion ? getCountriesInRegion(selectedRegion) : [], [selectedRegion]);
  const cities = useMemo(() => selectedRegion && selectedCountry ? getCitiesInCountry(selectedRegion, selectedCountry) : [], [selectedRegion, selectedCountry]);
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
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity('');
    setSelectedNeighborhood('');
    onCountryChange(value);
    onCityChange('');
    onNeighborhoodChange('');
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

  // Handle quick city selection from search
  const handleQuickCitySelect = (cityData: CityLocation, countryName: string, regionName: string) => {
    setSelectedRegion(regionName);
    setSelectedCountry(countryName);
    setSelectedCity(cityData.name);
    setSelectedNeighborhood('');
    setSearchQuery('');

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
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Location Dropdowns - Single Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Region</Label>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="bg-background border-border text-foreground h-9">
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

          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Country *</Label>
            <Select
              value={selectedCountry}
              onValueChange={handleCountryChange}
              disabled={!selectedRegion}
            >
              <SelectTrigger className="bg-background border-border text-foreground h-9">
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

          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={!selectedCountry}
            >
              <SelectTrigger className="bg-background border-border text-foreground h-9">
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

          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Neighborhood</Label>
            <Select
              value={selectedNeighborhood}
              onValueChange={handleNeighborhoodChange}
              disabled={!selectedCity || neighborhoods.length === 0}
            >
              <SelectTrigger className="bg-background border-border text-foreground h-9">
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
            <p className="text-[10px] text-muted-foreground">
              Optional - helps clients find you
            </p>
          </div>
        </div>

        {/* Selected Location Tags */}
        {(selectedCity || selectedCountry) && (
          <div className="flex flex-wrap gap-1.5">
            {selectedRegion && (
              <Badge variant="secondary" className="text-xs py-0.5">
                {selectedRegion}
              </Badge>
            )}
            {selectedCountry && (
              <Badge variant="secondary" className="text-xs py-0.5">
                {selectedCountry}
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="default" className="text-xs py-0.5">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedCity}
              </Badge>
            )}
            {selectedNeighborhood && (
              <Badge variant="outline" className="text-xs py-0.5">
                {selectedNeighborhood}
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
