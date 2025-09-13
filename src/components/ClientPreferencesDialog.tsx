
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useClientFilterPreferences } from '@/hooks/useClientFilterPreferences'
import { toast } from '@/hooks/use-toast'

interface ClientPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientPreferencesDialog({ open, onOpenChange }: ClientPreferencesDialogProps) {
  const { data: preferences, updatePreferences, isLoading } = useClientFilterPreferences()
  
  const [formData, setFormData] = useState({
    min_price: 0,
    max_price: 100000,
    min_bedrooms: 1,
    max_bedrooms: 10,
    min_bathrooms: 1,
    max_bathrooms: 5,
    property_types: [] as string[],
    location_zones: [] as string[],
    preferred_listing_types: ['rent'] as string[],
    furnished_required: false,
    pet_friendly_required: false,
    requires_gym: false,
    requires_balcony: false,
    requires_elevator: false,
    requires_jacuzzi: false,
    requires_coworking_space: false,
    requires_solar_panels: false,
    rental_duration: 'monthly' as string,
  })

  useEffect(() => {
    if (preferences) {
      setFormData({
        min_price: preferences.min_price || 0,
        max_price: preferences.max_price || 100000,
        min_bedrooms: preferences.min_bedrooms || 1,
        max_bedrooms: preferences.max_bedrooms || 10,
        min_bathrooms: preferences.min_bathrooms || 1,
        max_bathrooms: preferences.max_bathrooms || 5,
        property_types: preferences.property_types || [],
        location_zones: preferences.location_zones || [],
        preferred_listing_types: preferences.preferred_listing_types || ['rent'],
        furnished_required: preferences.furnished_required || false,
        pet_friendly_required: preferences.pet_friendly_required || false,
        requires_gym: preferences.requires_gym || false,
        requires_balcony: preferences.requires_balcony || false,
        requires_elevator: preferences.requires_elevator || false,
        requires_jacuzzi: preferences.requires_jacuzzi || false,
        requires_coworking_space: preferences.requires_coworking_space || false,
        requires_solar_panels: preferences.requires_solar_panels || false,
        rental_duration: preferences.rental_duration || 'monthly',
      })
    }
  }, [preferences])

  const handleSave = async () => {
    try {
      await updatePreferences(formData)
      toast({
        title: 'Preferences Updated',
        description: 'Your filter preferences have been saved successfully.',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const propertyTypeOptions = [
    'Apartment', 'House', 'Villa', 'Studio', 'Loft', 'Penthouse', 'Condo'
  ]

  const locationOptions = [
    'Tulum Centro', 'Zona Hotelera', 'Aldea Zama', 'La Veleta', 'Región 15'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Filter Preferences</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Price Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_price">Min Price ($)</Label>
                  <Input
                    id="min_price"
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_price">Max Price ($)</Label>
                  <Input
                    id="max_price"
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: parseInt(e.target.value) || 100000 })}
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rooms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_bedrooms">Min Bedrooms</Label>
                  <Input
                    id="min_bedrooms"
                    type="number"
                    value={formData.min_bedrooms}
                    onChange={(e) => setFormData({ ...formData, min_bedrooms: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_bedrooms">Max Bedrooms</Label>
                  <Input
                    id="max_bedrooms"
                    type="number"
                    value={formData.max_bedrooms}
                    onChange={(e) => setFormData({ ...formData, max_bedrooms: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div>
                  <Label htmlFor="min_bathrooms">Min Bathrooms</Label>
                  <Input
                    id="min_bathrooms"
                    type="number"
                    value={formData.min_bathrooms}
                    onChange={(e) => setFormData({ ...formData, min_bathrooms: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_bathrooms">Max Bathrooms</Label>
                  <Input
                    id="max_bathrooms"
                    type="number"
                    value={formData.max_bathrooms}
                    onChange={(e) => setFormData({ ...formData, max_bathrooms: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {propertyTypeOptions.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`property-${type}`}
                      checked={formData.property_types.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            property_types: [...formData.property_types, type]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            property_types: formData.property_types.filter(t => t !== type)
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`property-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Looking For</h3>
              <div className="grid grid-cols-2 gap-2">
                {['rent', 'buy', 'both'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`listing-${type}`}
                      checked={
                        type === 'both' 
                          ? formData.preferred_listing_types.includes('rent') && formData.preferred_listing_types.includes('buy')
                          : formData.preferred_listing_types.includes(type)
                      }
                      onCheckedChange={(checked) => {
                        if (type === 'both') {
                          if (checked) {
                            setFormData({
                              ...formData,
                              preferred_listing_types: ['rent', 'buy']
                            })
                          } else {
                            setFormData({
                              ...formData,
                              preferred_listing_types: ['rent']
                            })
                          }
                        } else {
                          if (checked) {
                            setFormData({
                              ...formData,
                              preferred_listing_types: [type]
                            })
                          } else {
                            // Don't allow unchecking if it's the only option
                            if (formData.preferred_listing_types.length > 1) {
                              setFormData({
                                ...formData,
                                preferred_listing_types: formData.preferred_listing_types.filter(t => t !== type)
                              })
                            }
                          }
                        }
                      }}
                    />
                    <Label htmlFor={`listing-${type}`} className="capitalize">{type === 'both' ? 'Rent & Buy' : type}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Zones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferred Locations</h3>
              <div className="grid grid-cols-2 gap-2">
                {locationOptions.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={formData.location_zones.includes(location)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            location_zones: [...formData.location_zones, location]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            location_zones: formData.location_zones.filter(l => l !== location)
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`location-${location}`}>{location}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Required Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={formData.furnished_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, furnished_required: !!checked })}
                  />
                  <Label htmlFor="furnished">Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pet_friendly"
                    checked={formData.pet_friendly_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, pet_friendly_required: !!checked })}
                  />
                  <Label htmlFor="pet_friendly">Pet Friendly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gym"
                    checked={formData.requires_gym}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_gym: !!checked })}
                  />
                  <Label htmlFor="gym">Gym</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcony"
                    checked={formData.requires_balcony}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_balcony: !!checked })}
                  />
                  <Label htmlFor="balcony">Balcony</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="elevator"
                    checked={formData.requires_elevator}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_elevator: !!checked })}
                  />
                  <Label htmlFor="elevator">Elevator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="jacuzzi"
                    checked={formData.requires_jacuzzi}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_jacuzzi: !!checked })}
                  />
                  <Label htmlFor="jacuzzi">Jacuzzi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coworking"
                    checked={formData.requires_coworking_space}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_coworking_space: !!checked })}
                  />
                  <Label htmlFor="coworking">Coworking Space</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="solar"
                    checked={formData.requires_solar_panels}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_solar_panels: !!checked })}
                  />
                  <Label htmlFor="solar">Solar Panels</Label>
                </div>
              </div>
            </div>

            {/* Rental Duration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rental Duration</h3>
              <Select value={formData.rental_duration} onValueChange={(value) => setFormData({ ...formData, rental_duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rental duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
