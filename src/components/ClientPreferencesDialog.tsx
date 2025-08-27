
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useClientFilterPreferences, useSaveClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { toast } from '@/components/ui/use-toast';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function ClientPreferencesDialog({ open, onOpenChange }: Props) {
  const { data, isLoading } = useClientFilterPreferences();
  const saveMutation = useSaveClientFilterPreferences();

  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minBeds, setMinBeds] = useState<number | ''>('');
  const [maxBeds, setMaxBeds] = useState<number | ''>('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [rentalDuration, setRentalDuration] = useState<string>('monthly');
  const [zones, setZones] = useState<string>('');
  const [amenities, setAmenities] = useState<string>('');

  useEffect(() => {
    if (!data) return;
    setMinPrice(data.min_price ?? '');
    setMaxPrice(data.max_price ?? '');
    setMinBeds(data.min_bedrooms ?? '');
    setMaxBeds(data.max_bedrooms ?? '');
    setPetFriendly(Boolean(data.pet_friendly_required));
    setFurnished(Boolean(data.furnished_required));
    setRentalDuration(data.rental_duration ?? 'monthly');
    setZones((data.location_zones ?? []).join(', '));
    setAmenities((data.amenities_required ?? []).join(', '));
  }, [data]);

  const handleSave = async () => {
    const payload = {
      min_price: minPrice === '' ? null : Number(minPrice),
      max_price: maxPrice === '' ? null : Number(maxPrice),
      min_bedrooms: minBeds === '' ? null : Number(minBeds),
      max_bedrooms: maxBeds === '' ? null : Number(maxBeds),
      pet_friendly_required: petFriendly,
      furnished_required: furnished,
      rental_duration: rentalDuration,
      location_zones: zones
        ? zones.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      amenities_required: amenities
        ? amenities.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    await saveMutation.mutateAsync(payload);
    toast({ title: 'Preferences saved', description: 'Your search preferences were updated.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Preferences</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="3000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minBeds">Min Bedrooms</Label>
              <Input
                id="minBeds"
                type="number"
                value={minBeds}
                onChange={(e) => setMinBeds(e.target.value ? Number(e.target.value) : '')}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="maxBeds">Max Bedrooms</Label>
              <Input
                id="maxBeds"
                type="number"
                value={maxBeds}
                onChange={(e) => setMaxBeds(e.target.value ? Number(e.target.value) : '')}
                placeholder="3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <Label className="mb-0">Pet friendly</Label>
                <p className="text-sm text-muted-foreground">Only pet-friendly</p>
              </div>
              <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
            </div>

            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <Label className="mb-0">Furnished</Label>
                <p className="text-sm text-muted-foreground">Furniture required</p>
              </div>
              <Switch checked={furnished} onCheckedChange={setFurnished} />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Rental Duration</Label>
            <Input
              id="duration"
              value={rentalDuration ?? ''}
              onChange={(e) => setRentalDuration(e.target.value)}
              placeholder="monthly | yearly | weekly"
            />
          </div>

          <div>
            <Label htmlFor="zones">Preferred Zones</Label>
            <Input
              id="zones"
              value={zones}
              onChange={(e) => setZones(e.target.value)}
              placeholder="e.g. Downtown, Beach, Aldea Zama"
            />
          </div>

          <div>
            <Label htmlFor="amenities">Required Amenities</Label>
            <Input
              id="amenities"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="e.g. Gym, Pool, Rooftop"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
