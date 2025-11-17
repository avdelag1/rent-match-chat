import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CountrySelector } from './CountrySelector';
import { AlertCircle } from 'lucide-react';

interface OwnerLocationSelectorProps {
  country?: string;
  city?: string;
  neighborhood?: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
}

export function OwnerLocationSelector({
  country,
  city,
  neighborhood,
  onCountryChange,
  onCityChange,
  onNeighborhoodChange,
}: OwnerLocationSelectorProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-foreground text-lg">Location</CardTitle>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              General location only - no exact address shown to clients
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Country */}
          <div className="space-y-2">
            <CountrySelector
              value={country}
              onChange={onCountryChange}
              required={true}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-foreground">City *</Label>
            <Input
              value={city || ''}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="e.g., Tulum"
              className="bg-background border-border text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your city name
            </p>
          </div>

          {/* Neighborhood */}
          <div className="space-y-2">
            <Label className="text-foreground">Neighborhood</Label>
            <Input
              value={neighborhood || ''}
              onChange={(e) => onNeighborhoodChange(e.target.value)}
              placeholder="e.g., Aldea Zama"
              className="bg-background border-border text-foreground"
            />
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
            <li>✓ Your country, city, and neighborhood are visible to clients</li>
            <li>✓ Your exact address is kept private until after a match</li>
            <li>✓ Clients see your property on a map within your neighborhood</li>
            <li>✓ You can share your full address after activation if you choose</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
