import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface BicycleClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function BicycleClientFilters({ onApply, initialFilters = {}, activeCount }: BicycleClientFiltersProps) {
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [bicycleTypes, setBicycleTypes] = useState<string[]>(initialFilters.bicycle_types || []);
  const [frameSize, setFrameSize] = useState(initialFilters.frame_size || 'any');
  const [terrainPreference, setTerrainPreference] = useState<string[]>(initialFilters.terrain_preference || []);
  const [accessories, setAccessories] = useState<string[]>(initialFilters.accessories_needed || []);
  const [fitnessLevel, setFitnessLevel] = useState(initialFilters.fitness_level || 'any');

  const bicycleTypeOptions = ['Road Bike', 'Mountain Bike', 'Electric Bike', 'Hybrid', 'BMX', 'Folding'];
  const terrainOptions = ['Urban', 'Trail', 'Road', 'All-Terrain', 'Beach'];
  const accessoryOptions = ['Helmet', 'Lights', 'Basket', 'Lock', 'Water Bottle Holder'];

  const handleApply = () => {
    onApply({
      category: 'bicycle',
      interest_type: interestType,
      bicycle_types: bicycleTypes,
      frame_size: frameSize,
      terrain_preference: terrainPreference,
      accessories_needed: accessories,
      fitness_level: fitnessLevel
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setBicycleTypes([]);
    setFrameSize('any');
    setTerrainPreference([]);
    setAccessories([]);
    setFitnessLevel('any');
    onApply({});
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Bicycle Filters</h3>
        {activeCount > 0 && (
          <Badge variant="default">{activeCount} Active</Badge>
        )}
      </div>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Interest Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={interestType} onValueChange={setInterestType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent Only</SelectItem>
              <SelectItem value="buy">Buy Only</SelectItem>
              <SelectItem value="both">Rent or Buy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Filter clients looking to rent, purchase, or both bicycles</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Bicycle Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {bicycleTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={bicycleTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBicycleTypes([...bicycleTypes, type]);
                    } else {
                      setBicycleTypes(bicycleTypes.filter(t => t !== type));
                    }
                  }}
                />
                <Label className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Match clients with preferences for specific bike categories</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Frame Size</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={frameSize} onValueChange={setFrameSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Size</SelectItem>
              <SelectItem value="small">Small (5'0" - 5'4")</SelectItem>
              <SelectItem value="medium">Medium (5'5" - 5'9")</SelectItem>
              <SelectItem value="large">Large (5'10" - 6'2")</SelectItem>
              <SelectItem value="xl">X-Large (6'3"+)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Find clients by fit to avoid mismatches in sizing</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Terrain Preference</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {terrainOptions.map((terrain) => (
              <div key={terrain} className="flex items-center space-x-2">
                <Checkbox
                  checked={terrainPreference.includes(terrain)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTerrainPreference([...terrainPreference, terrain]);
                    } else {
                      setTerrainPreference(terrainPreference.filter(t => t !== terrain));
                    }
                  }}
                />
                <Label className="text-sm">{terrain}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Target clients based on where they plan to ride</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Accessories Needed</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {accessoryOptions.map((accessory) => (
              <div key={accessory} className="flex items-center space-x-2">
                <Checkbox
                  checked={accessories.includes(accessory)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAccessories([...accessories, accessory]);
                    } else {
                      setAccessories(accessories.filter(a => a !== accessory));
                    }
                  }}
                />
                <Label className="text-sm">{accessory}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Connect with clients seeking bundles or add-ons</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Fitness Level</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Level</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="fitness">Fitness Enthusiast</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Filter by rider's activity level for appropriate recommendations</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
        <Button onClick={handleApply} className="flex-1">Apply Filters</Button>
      </div>
    </div>
  );
}
