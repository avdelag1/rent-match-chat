import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save } from 'lucide-react';
import { useOwnerClientPreferences, OwnerClientPreferences } from '@/hooks/useOwnerClientPreferences';
import { useSavedFilters } from '@/hooks/useSavedFilters';

interface OwnerClientFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LISTING_TYPE_OPTIONS = [
  { value: 'property', label: 'Properties' },
  { value: 'motorcycle', label: 'Motorcycles' },
  { value: 'bicycle', label: 'Bicycles' },
  { value: 'yacht', label: 'Yachts' },
];

const CLIENT_TYPE_OPTIONS = [
  { value: 'tenant', label: 'Tenants (Renters)' },
  { value: 'buyer', label: 'Buyers' },
];

const LIFESTYLE_OPTIONS = [
  'Digital Nomad',
  'Professional',
  'Student',
  'Family-Oriented',
  'Party-Friendly',
  'Quiet',
  'Social',
  'Health-Conscious',
  'Pet Lover',
  'Eco-Friendly',
];

const OCCUPATION_OPTIONS = [
  'Remote Worker',
  'Entrepreneur',
  'Student',
  'Teacher',
  'Healthcare',
  'Tech',
  'Creative',
  'Hospitality',
  'Finance',
  'Retired',
];

export function OwnerClientFilterDialog({ open, onOpenChange }: OwnerClientFilterDialogProps) {
  const { preferences, updatePreferences, isUpdating } = useOwnerClientPreferences();
  const { saveFilter } = useSavedFilters();
  
  const [filterName, setFilterName] = useState('');
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [formData, setFormData] = useState<Partial<OwnerClientPreferences>>({
    min_budget: undefined,
    max_budget: undefined,
    min_age: 18,
    max_age: 65,
    compatible_lifestyle_tags: [],
    allows_pets: true,
    allows_smoking: false,
    allows_parties: false,
    requires_employment_proof: false,
    requires_references: false,
    min_monthly_income: undefined,
    preferred_occupations: [],
  });

  const [selectedListingTypes, setSelectedListingTypes] = useState<string[]>(['property']);
  const [selectedClientTypes, setSelectedClientTypes] = useState<string[]>(['tenant']);

  useEffect(() => {
    if (preferences) {
      setFormData({
        min_budget: preferences.min_budget,
        max_budget: preferences.max_budget,
        min_age: preferences.min_age || 18,
        max_age: preferences.max_age || 65,
        compatible_lifestyle_tags: preferences.compatible_lifestyle_tags || [],
        allows_pets: preferences.allows_pets ?? true,
        allows_smoking: preferences.allows_smoking ?? false,
        allows_parties: preferences.allows_parties ?? false,
        requires_employment_proof: preferences.requires_employment_proof ?? false,
        requires_references: preferences.requires_references ?? false,
        min_monthly_income: preferences.min_monthly_income,
        preferred_occupations: preferences.preferred_occupations || [],
      });
    }
  }, [preferences]);

  const toggleLifestyleTag = (tag: string) => {
    const current = formData.compatible_lifestyle_tags || [];
    if (current.includes(tag)) {
      setFormData({
        ...formData,
        compatible_lifestyle_tags: current.filter(t => t !== tag),
      });
    } else {
      setFormData({
        ...formData,
        compatible_lifestyle_tags: [...current, tag],
      });
    }
  };

  const toggleOccupation = (occupation: string) => {
    const current = formData.preferred_occupations || [];
    if (current.includes(occupation)) {
      setFormData({
        ...formData,
        preferred_occupations: current.filter(o => o !== occupation),
      });
    } else {
      setFormData({
        ...formData,
        preferred_occupations: [...current, occupation],
      });
    }
  };

  const handleSave = async () => {
    await updatePreferences(formData);
    onOpenChange(false);
  };

  const handleSaveAs = async () => {
    if (!filterName.trim()) {
      return;
    }

    await saveFilter({
      name: filterName,
      category: 'client',
      mode: 'discovery',
      filters: formData,
      listing_types: selectedListingTypes,
      client_types: selectedClientTypes,
      min_budget: formData.min_budget,
      max_budget: formData.max_budget,
      min_age: formData.min_age,
      max_age: formData.max_age,
      lifestyle_tags: formData.compatible_lifestyle_tags,
      preferred_occupations: formData.preferred_occupations,
      allows_pets: formData.allows_pets,
      allows_smoking: formData.allows_smoking,
      allows_parties: formData.allows_parties,
      requires_employment_proof: formData.requires_employment_proof,
      requires_references: formData.requires_references,
      min_monthly_income: formData.min_monthly_income,
    });

    await updatePreferences(formData);
    setFilterName('');
    setShowSaveAs(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl w-[95vw] max-h-[85vh] sm:h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b">
          <DialogTitle className="text-xl sm:text-2xl">Client Discovery Preferences</DialogTitle>
          <p className="text-sm sm:text-base text-muted-foreground">Set your preferences to improve Smart Match recommendations</p>
          <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> All active clients will always be visible. These filters help prioritize matches based on your preferences.
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="space-y-6">
          {/* Looking For Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Looking For</Label>
            <p className="text-sm text-muted-foreground">What type of clients are you looking for?</p>
            <div className="flex flex-wrap gap-2">
              {CLIENT_TYPE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedClientTypes.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                  onClick={() => {
                    if (selectedClientTypes.includes(option.value)) {
                      setSelectedClientTypes(selectedClientTypes.filter(t => t !== option.value));
                    } else {
                      setSelectedClientTypes([...selectedClientTypes, option.value]);
                    }
                  }}
                >
                  {option.label}
                  {selectedClientTypes.includes(option.value) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Listing Types Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Listings</Label>
            <p className="text-sm text-muted-foreground">What do you have available to rent/sell?</p>
            <div className="flex flex-wrap gap-2">
              {LISTING_TYPE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedListingTypes.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                  onClick={() => {
                    if (selectedListingTypes.includes(option.value)) {
                      setSelectedListingTypes(selectedListingTypes.filter(t => t !== option.value));
                    } else {
                      setSelectedListingTypes([...selectedListingTypes, option.value]);
                    }
                  }}
                >
                  {option.label}
                  {selectedListingTypes.includes(option.value) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Budget Range</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Min Budget</Label>
                <Input
                  type="number"
                  placeholder="Min $"
                  className="text-base"
                  value={formData.min_budget || ''}
                  onChange={(e) => setFormData({ ...formData, min_budget: Number(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Max Budget</Label>
                <Input
                  type="number"
                  placeholder="Max $"
                  className="text-base"
                  value={formData.max_budget || ''}
                  onChange={(e) => setFormData({ ...formData, max_budget: Number(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Age Range</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Min Age</Label>
                <Input
                  type="number"
                  min="18"
                  max="100"
                  className="text-base"
                  value={formData.min_age || 18}
                  onChange={(e) => setFormData({ ...formData, min_age: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Max Age</Label>
                <Input
                  type="number"
                  min="18"
                  max="100"
                  className="text-base"
                  value={formData.max_age || 65}
                  onChange={(e) => setFormData({ ...formData, max_age: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Lifestyle Tags */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Compatible Lifestyles</Label>
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_OPTIONS.map((tag) => (
                <Badge
                  key={tag}
                  variant={(formData.compatible_lifestyle_tags || []).includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                  onClick={() => toggleLifestyleTag(tag)}
                >
                  {tag}
                  {(formData.compatible_lifestyle_tags || []).includes(tag) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Occupations */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preferred Occupations</Label>
            <div className="flex flex-wrap gap-2">
              {OCCUPATION_OPTIONS.map((occupation) => (
                <Badge
                  key={occupation}
                  variant={(formData.preferred_occupations || []).includes(occupation) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                  onClick={() => toggleOccupation(occupation)}
                >
                  {occupation}
                  {(formData.preferred_occupations || []).includes(occupation) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Property Rules */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Property Rules</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="allows-pets">Allows Pets</Label>
                <Switch
                  id="allows-pets"
                  checked={formData.allows_pets ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, allows_pets: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allows-smoking">Allows Smoking</Label>
                <Switch
                  id="allows-smoking"
                  checked={formData.allows_smoking ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, allows_smoking: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allows-parties">Allows Parties</Label>
                <Switch
                  id="allows-parties"
                  checked={formData.allows_parties ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, allows_parties: checked })}
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Client Requirements</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="requires-employment">Requires Employment Proof</Label>
                <Switch
                  id="requires-employment"
                  checked={formData.requires_employment_proof ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_employment_proof: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requires-references">Requires References</Label>
                <Switch
                  id="requires-references"
                  checked={formData.requires_references ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_references: checked })}
                />
              </div>
              <div>
                <Label htmlFor="min-income" className="text-sm text-muted-foreground">Minimum Monthly Income</Label>
                <Input
                  id="min-income"
                  type="number"
                  placeholder="Min monthly income $"
                  className="text-base"
                  value={formData.min_monthly_income || ''}
                  onChange={(e) => setFormData({ ...formData, min_monthly_income: Number(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t gap-2 flex-col sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {showSaveAs ? (
            <>
              <Input
                placeholder="Filter name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleSaveAs} disabled={!filterName.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save As
              </Button>
              <Button variant="ghost" onClick={() => setShowSaveAs(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowSaveAs(true)}>
                <Save className="w-4 h-4 mr-2" />
                Save As New Filter
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Apply & Save'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}