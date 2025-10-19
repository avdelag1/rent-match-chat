import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface MotoClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function MotoClientFilters({ onApply, initialFilters = {}, activeCount }: MotoClientFiltersProps) {
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [motoTypes, setMotoTypes] = useState<string[]>(initialFilters.moto_types || []);
  const [engineRange, setEngineRange] = useState([initialFilters.engine_cc_min || 50, initialFilters.engine_cc_max || 1000]);
  const [experienceLevel, setExperienceLevel] = useState(initialFilters.experience_level || 'any');
  const [usagePurpose, setUsagePurpose] = useState<string[]>(initialFilters.usage_purpose || []);

  const motoTypeOptions = ['Sport Bike', 'Cruiser', 'Scooter', 'Off-Road', 'Touring', 'Street'];
  const usagePurposeOptions = ['Commuting', 'Touring', 'Racing', 'Off-Road', 'City Riding'];

  const handleApply = () => {
    onApply({
      category: 'moto',
      interest_type: interestType,
      moto_types: motoTypes,
      engine_cc_min: engineRange[0],
      engine_cc_max: engineRange[1],
      experience_level: experienceLevel,
      usage_purpose: usagePurpose
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setMotoTypes([]);
    setEngineRange([50, 1000]);
    setExperienceLevel('any');
    setUsagePurpose([]);
    onApply({});
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Moto Filters</h3>
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
          <p className="text-xs text-muted-foreground">Filter clients interested in renting, buying, or both motorcycles</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Moto Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {motoTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={motoTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMotoTypes([...motoTypes, type]);
                    } else {
                      setMotoTypes(motoTypes.filter(t => t !== type));
                    }
                  }}
                />
                <Label className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Target clients seeking specific motorcycle styles</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Engine Size (CC)</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{engineRange[0]}cc</span>
              <span>{engineRange[1]}cc</span>
            </div>
            <Slider
              value={engineRange}
              onValueChange={setEngineRange}
              min={50}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">Find clients based on preferred power and size</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Experience Level</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Level</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Filter by rider experience to ensure safety and suitability</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Usage Purpose</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {usagePurposeOptions.map((purpose) => (
              <div key={purpose} className="flex items-center space-x-2">
                <Checkbox
                  checked={usagePurpose.includes(purpose)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setUsagePurpose([...usagePurpose, purpose]);
                    } else {
                      setUsagePurpose(usagePurpose.filter(p => p !== purpose));
                    }
                  }}
                />
                <Label className="text-sm">{purpose}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Connect with clients whose intended use aligns with your motos</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
        <Button onClick={handleApply} className="flex-1">Apply Filters</Button>
      </div>
    </div>
  );
}
