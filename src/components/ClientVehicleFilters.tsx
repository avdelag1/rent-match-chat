import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { toast } from '@/hooks/use-toast';

export function ClientVehicleFilters() {
  const { data: preferences, updatePreferences } = useClientFilterPreferences();

  const [interestType, setInterestType] = useState(preferences?.preferred_listing_types?.[0] || 'rent');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(preferences?.vehicle_types || []);
  const [bodyTypes, setBodyTypes] = useState<string[]>(preferences?.vehicle_body_types || []);
  const [driveTypes, setDriveTypes] = useState<string[]>(preferences?.vehicle_drive_types || []);
  const [priceRange, setPriceRange] = useState([
    preferences?.vehicle_price_min || 0,
    preferences?.vehicle_price_max || 500000
  ]);
  const [yearRange, setYearRange] = useState([
    preferences?.vehicle_year_min || 2010,
    preferences?.vehicle_year_max || new Date().getFullYear()
  ]);
  const [mileageMax, setMileageMax] = useState(preferences?.vehicle_mileage_max || 200000);
  const [transmission, setTransmission] = useState<string[]>(preferences?.vehicle_transmission || []);
  const [fuelTypes, setFuelTypes] = useState<string[]>(preferences?.vehicle_fuel_types || []);
  const [condition, setCondition] = useState<string[]>(preferences?.vehicle_condition || []);
  const [seatingCapacity, setSeatingCapacity] = useState(preferences?.vehicle_seating_capacity || 0);
  const [numberOfDoors, setNumberOfDoors] = useState(preferences?.vehicle_number_of_doors || 0);

  const vehicleTypeOptions = ['Car', 'Truck', 'SUV', 'Van', 'Pickup Truck', 'Minivan', 'Coupe', 'Sedan', 'Hatchback', 'Wagon', 'Convertible'];
  const bodyTypeOptions = ['Sedan', 'Coupe', 'Hatchback', 'Wagon', 'Pickup', 'Cargo Van', 'Passenger Van', 'SUV'];
  const driveTypeOptions = ['FWD', 'RWD', 'AWD', '4WD'];
  const transmissionOptions = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
  const fuelTypeOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
  const conditionOptions = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

  const toggleArrayOption = (current: string[], value: string) => {
    return current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
  };

  const handleSave = async () => {
    try {
      await updatePreferences({
        interested_in_vehicles: true,
        preferred_listing_types: [interestType],
        vehicle_types: vehicleTypes,
        vehicle_body_types: bodyTypes,
        vehicle_drive_types: driveTypes,
        vehicle_price_min: priceRange[0],
        vehicle_price_max: priceRange[1],
        vehicle_year_min: yearRange[0],
        vehicle_year_max: yearRange[1],
        vehicle_mileage_max: mileageMax,
        vehicle_transmission: transmission,
        vehicle_fuel_types: fuelTypes,
        vehicle_condition: condition,
        vehicle_seating_capacity: seatingCapacity || null,
        vehicle_number_of_doors: numberOfDoors || null
      });
      toast({
        title: 'Vehicle Preferences Saved',
        description: 'Your vehicle preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Interest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>I'm interested in</Label>
            <Select value={interestType} onValueChange={setInterestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Renting</SelectItem>
                <SelectItem value="sale">Buying</SelectItem>
                <SelectItem value="both">Both Renting & Buying</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
            <Slider
              min={0}
              max={500000}
              step={5000}
              value={priceRange}
              onValueChange={setPriceRange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {vehicleTypeOptions.map((type) => (
              <Badge
                key={type}
                variant={vehicleTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setVehicleTypes(toggleArrayOption(vehicleTypes, type))}
              >
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {bodyTypeOptions.map((type) => (
              <Badge
                key={type}
                variant={bodyTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setBodyTypes(toggleArrayOption(bodyTypes, type))}
              >
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Year Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
            <Slider
              min={2000}
              max={new Date().getFullYear()}
              step={1}
              value={yearRange}
              onValueChange={setYearRange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maximum Mileage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium">{mileageMax.toLocaleString()} km</div>
            <Slider
              min={0}
              max={300000}
              step={10000}
              value={[mileageMax]}
              onValueChange={(v) => setMileageMax(v[0])}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transmission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {transmissionOptions.map((type) => (
              <Badge
                key={type}
                variant={transmission.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTransmission(toggleArrayOption(transmission, type))}
              >
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fuel Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {fuelTypeOptions.map((type) => (
              <Badge
                key={type}
                variant={fuelTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFuelTypes(toggleArrayOption(fuelTypes, type))}
              >
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map((cond) => (
              <Badge
                key={cond}
                variant={condition.includes(cond) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setCondition(toggleArrayOption(condition, cond))}
              >
                {cond}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Minimum Seating Capacity</Label>
            <Select value={String(seatingCapacity)} onValueChange={(v) => setSeatingCapacity(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
                <SelectItem value="7">7+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Number of Doors</Label>
            <Select value={String(numberOfDoors)} onValueChange={(v) => setNumberOfDoors(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="2">2 Doors</SelectItem>
                <SelectItem value="3">3 Doors</SelectItem>
                <SelectItem value="4">4 Doors</SelectItem>
                <SelectItem value="5">5 Doors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="h-4 w-4 mr-2" />
        Save Vehicle Preferences
      </Button>
    </div>
  );
}
