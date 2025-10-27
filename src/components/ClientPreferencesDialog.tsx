
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClientFilterPreferences } from '@/hooks/useClientFilterPreferences'
import { toast } from '@/hooks/use-toast'

interface ClientPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientPreferencesDialog({ open, onOpenChange }: ClientPreferencesDialogProps) {
  const { data: preferences, updatePreferences, isLoading } = useClientFilterPreferences()

  const [formData, setFormData] = useState({
    // Category interests
    interested_in_properties: true,
    interested_in_motorcycles: false,
    interested_in_bicycles: false,
    interested_in_yachts: false,

    // Property preferences
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

    // Motorcycle preferences
    moto_types: [] as string[],
    moto_engine_size_min: 50,
    moto_engine_size_max: 2000,
    moto_year_min: 1990,
    moto_year_max: new Date().getFullYear(),
    moto_price_min: 0,
    moto_price_max: 100000,
    moto_mileage_max: 150000,
    moto_transmission: [] as string[],
    moto_condition: [] as string[],
    moto_fuel_types: [] as string[],
    moto_cylinders: [] as string[],
    moto_cooling_system: [] as string[],
    moto_has_abs: null as boolean | null,
    moto_features: [] as string[],
    moto_is_electric: null as boolean | null,
    moto_battery_capacity_min: 0,

    // Bicycle preferences
    bicycle_types: [] as string[],
    bicycle_price_min: 0,
    bicycle_price_max: 10000,
    bicycle_wheel_sizes: [] as string[],
    bicycle_suspension_type: [] as string[],
    bicycle_material: [] as string[],
    bicycle_gears_min: 1,
    bicycle_gears_max: 30,
    bicycle_year_min: 2010,
    bicycle_condition: [] as string[],
    bicycle_is_electric: null as boolean | null,
    bicycle_battery_range_min: 0,

    // Yacht preferences
    yacht_types: [] as string[],
    yacht_length_min: 20,
    yacht_length_max: 300,
    yacht_price_min: 0,
    yacht_price_max: 10000000,
    yacht_year_min: 1970,
    yacht_guest_capacity_min: 1,
    yacht_guest_capacity_max: 50,
    yacht_cabin_count_min: 1,
    yacht_cabin_count_max: 15,
    yacht_condition: [] as string[],
    yacht_fuel_types: [] as string[],
    yacht_engine_power_min: 0,
    yacht_engine_power_max: 10000,
    yacht_max_speed_min: 0,
    yacht_range_nm_min: 0,
    yacht_hull_material: [] as string[],
    yacht_water_activities: [] as string[],
    yacht_navigation_equipment: [] as string[],
    yacht_has_stabilizers: null as boolean | null,
  })

  useEffect(() => {
    if (preferences) {
      setFormData({
        // Category interests
        interested_in_properties: preferences.interested_in_properties ?? true,
        interested_in_motorcycles: preferences.interested_in_motorcycles ?? false,
        interested_in_bicycles: preferences.interested_in_bicycles ?? false,
        interested_in_yachts: preferences.interested_in_yachts ?? false,

        // Property preferences
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

        // Motorcycle preferences
        moto_types: preferences.moto_types || [],
        moto_engine_size_min: preferences.moto_engine_size_min || 50,
        moto_engine_size_max: preferences.moto_engine_size_max || 2000,
        moto_year_min: preferences.moto_year_min || 1990,
        moto_year_max: preferences.moto_year_max || new Date().getFullYear(),
        moto_price_min: preferences.moto_price_min || 0,
        moto_price_max: preferences.moto_price_max || 100000,
        moto_mileage_max: preferences.moto_mileage_max || 150000,
        moto_transmission: preferences.moto_transmission || [],
        moto_condition: preferences.moto_condition || [],
        moto_fuel_types: preferences.moto_fuel_types || [],
        moto_cylinders: preferences.moto_cylinders || [],
        moto_cooling_system: preferences.moto_cooling_system || [],
        moto_has_abs: preferences.moto_has_abs ?? null,
        moto_features: preferences.moto_features || [],
        moto_is_electric: preferences.moto_is_electric ?? null,
        moto_battery_capacity_min: preferences.moto_battery_capacity_min || 0,

        // Bicycle preferences
        bicycle_types: preferences.bicycle_types || [],
        bicycle_price_min: preferences.bicycle_price_min || 0,
        bicycle_price_max: preferences.bicycle_price_max || 10000,
        bicycle_wheel_sizes: preferences.bicycle_wheel_sizes || [],
        bicycle_suspension_type: preferences.bicycle_suspension_type || [],
        bicycle_material: preferences.bicycle_material || [],
        bicycle_gears_min: preferences.bicycle_gears_min || 1,
        bicycle_gears_max: preferences.bicycle_gears_max || 30,
        bicycle_year_min: preferences.bicycle_year_min || 2010,
        bicycle_condition: preferences.bicycle_condition || [],
        bicycle_is_electric: preferences.bicycle_is_electric ?? null,
        bicycle_battery_range_min: preferences.bicycle_battery_range_min || 0,

        // Yacht preferences
        yacht_types: preferences.yacht_types || [],
        yacht_length_min: preferences.yacht_length_min || 20,
        yacht_length_max: preferences.yacht_length_max || 300,
        yacht_price_min: preferences.yacht_price_min || 0,
        yacht_price_max: preferences.yacht_price_max || 10000000,
        yacht_year_min: preferences.yacht_year_min || 1970,
        yacht_guest_capacity_min: preferences.yacht_guest_capacity_min || 1,
        yacht_guest_capacity_max: preferences.yacht_guest_capacity_max || 50,
        yacht_cabin_count_min: preferences.yacht_cabin_count_min || 1,
        yacht_cabin_count_max: preferences.yacht_cabin_count_max || 15,
        yacht_condition: preferences.yacht_condition || [],
        yacht_fuel_types: preferences.yacht_fuel_types || [],
        yacht_engine_power_min: preferences.yacht_engine_power_min || 0,
        yacht_engine_power_max: preferences.yacht_engine_power_max || 10000,
        yacht_max_speed_min: preferences.yacht_max_speed_min || 0,
        yacht_range_nm_min: preferences.yacht_range_nm_min || 0,
        yacht_hull_material: preferences.yacht_hull_material || [],
        yacht_water_activities: preferences.yacht_water_activities || [],
        yacht_navigation_equipment: preferences.yacht_navigation_equipment || [],
        yacht_has_stabilizers: preferences.yacht_has_stabilizers ?? null,
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

  const motoTypeOptions = [
    'Sport', 'Cruiser', 'Touring', 'Adventure', 'Naked', 'Scooter', 'Off-Road', 'Cafe Racer'
  ]

  const motoTransmissionOptions = ['Manual', 'Automatic', 'Semi-Automatic', 'CVT']

  const conditionOptions = ['New', 'Like New', 'Excellent', 'Good', 'Fair']

  const motoFuelTypeOptions = ['Gasoline', 'Electric', 'Hybrid', 'Diesel']

  const motoCylinderOptions = ['Single', 'Twin', 'Triple', 'Four', 'Six']

  const motoCoolingOptions = ['Air', 'Liquid', 'Oil']

  const motoFeatureOptions = [
    'GPS Navigation', 'Heated Grips', 'Cruise Control', 'Quick Shifter',
    'Traction Control', 'Riding Modes', 'LED Lighting', 'USB Charging'
  ]

  const bicycleTypeOptions = [
    'Mountain', 'Road', 'Hybrid', 'Electric', 'BMX', 'Cruiser', 'Folding', 'Gravel'
  ]

  const bicycleWheelSizeOptions = ['20"', '24"', '26"', '27.5"', '29"', '700c', '650b']

  const bicycleSuspensionOptions = ['Rigid', 'Hardtail', 'Full Suspension']

  const bicycleMaterialOptions = ['Aluminum', 'Carbon Fiber', 'Steel', 'Titanium']

  const yachtTypeOptions = [
    'Motor Yacht', 'Sailing Yacht', 'Catamaran', 'Fishing Boat', 'Speedboat',
    'Gulet', 'Trimaran', 'Luxury Yacht'
  ]

  const yachtFuelTypeOptions = ['Diesel', 'Gasoline', 'Hybrid', 'Electric', 'Sail-Only']

  const yachtHullMaterialOptions = ['Fiberglass', 'Aluminum', 'Steel', 'Wood', 'Carbon Fiber']

  const yachtWaterActivitiesOptions = [
    'Diving', 'Snorkeling', 'Fishing', 'Jet Skiing', 'Kayaking',
    'Paddleboarding', 'Wakeboarding', 'Swimming'
  ]

  const yachtNavigationEquipmentOptions = [
    'GPS', 'Radar', 'Autopilot', 'Sonar', 'VHF Radio', 'AIS',
    'Chartplotter', 'Fish Finder'
  ]

  const toggleArrayValue = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter(v => v !== value)
    }
    return [...array, value]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>My Preferences</DialogTitle>
        </DialogHeader>

        {/* Category Interest Toggles */}
        <div className="px-6 pt-4 pb-2 border-b bg-muted/30">
          <h3 className="text-sm font-medium mb-3">I'm interested in:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interested_properties"
                checked={formData.interested_in_properties}
                onCheckedChange={(checked) => setFormData({ ...formData, interested_in_properties: !!checked })}
              />
              <Label htmlFor="interested_properties">Properties</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interested_motorcycles"
                checked={formData.interested_in_motorcycles}
                onCheckedChange={(checked) => setFormData({ ...formData, interested_in_motorcycles: !!checked })}
              />
              <Label htmlFor="interested_motorcycles">Motorcycles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interested_bicycles"
                checked={formData.interested_in_bicycles}
                onCheckedChange={(checked) => setFormData({ ...formData, interested_in_bicycles: !!checked })}
              />
              <Label htmlFor="interested_bicycles">Bicycles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interested_yachts"
                checked={formData.interested_in_yachts}
                onCheckedChange={(checked) => setFormData({ ...formData, interested_in_yachts: !!checked })}
              />
              <Label htmlFor="interested_yachts">Yachts</Label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="properties" className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="motorcycles" disabled={!formData.interested_in_motorcycles}>
              Motorcycles
            </TabsTrigger>
            <TabsTrigger value="bicycles" disabled={!formData.interested_in_bicycles}>
              Bicycles
            </TabsTrigger>
            <TabsTrigger value="yachts" disabled={!formData.interested_in_yachts}>
              Yachts
            </TabsTrigger>
          </TabsList>

          {/* PROPERTIES TAB */}
          <TabsContent value="properties" className="flex-1 mt-0">
            <ScrollArea className="h-full px-6">
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
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              property_types: toggleArrayValue(formData.property_types, type)
                            })
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
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              location_zones: toggleArrayValue(formData.location_zones, location)
                            })
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
                <div className="space-y-4 pb-4">
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
          </TabsContent>

          {/* MOTORCYCLES TAB */}
          <TabsContent value="motorcycles" className="flex-1 mt-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-6 py-4">
                {/* Motorcycle Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Motorcycle Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {motoTypeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-type-${type}`}
                          checked={formData.moto_types.includes(type)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_types: toggleArrayValue(formData.moto_types, type)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Price Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moto_price_min">Min Price ($)</Label>
                      <Input
                        id="moto_price_min"
                        type="number"
                        value={formData.moto_price_min}
                        onChange={(e) => setFormData({ ...formData, moto_price_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="moto_price_max">Max Price ($)</Label>
                      <Input
                        id="moto_price_max"
                        type="number"
                        value={formData.moto_price_max}
                        onChange={(e) => setFormData({ ...formData, moto_price_max: parseInt(e.target.value) || 100000 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Engine Size */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Engine Size (cc)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moto_engine_size_min">Min (cc)</Label>
                      <Input
                        id="moto_engine_size_min"
                        type="number"
                        value={formData.moto_engine_size_min}
                        onChange={(e) => setFormData({ ...formData, moto_engine_size_min: parseInt(e.target.value) || 50 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="moto_engine_size_max">Max (cc)</Label>
                      <Input
                        id="moto_engine_size_max"
                        type="number"
                        value={formData.moto_engine_size_max}
                        onChange={(e) => setFormData({ ...formData, moto_engine_size_max: parseInt(e.target.value) || 2000 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Year Range */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Year</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moto_year_min">From</Label>
                      <Input
                        id="moto_year_min"
                        type="number"
                        value={formData.moto_year_min}
                        onChange={(e) => setFormData({ ...formData, moto_year_min: parseInt(e.target.value) || 1990 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="moto_year_max">To</Label>
                      <Input
                        id="moto_year_max"
                        type="number"
                        value={formData.moto_year_max}
                        onChange={(e) => setFormData({ ...formData, moto_year_max: parseInt(e.target.value) || new Date().getFullYear() })}
                      />
                    </div>
                  </div>
                </div>

                {/* Max Mileage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Max Mileage</h3>
                  <Input
                    type="number"
                    value={formData.moto_mileage_max}
                    onChange={(e) => setFormData({ ...formData, moto_mileage_max: parseInt(e.target.value) || 150000 })}
                  />
                </div>

                {/* Transmission */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Transmission</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {motoTransmissionOptions.map((trans) => (
                      <div key={trans} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-trans-${trans}`}
                          checked={formData.moto_transmission.includes(trans)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_transmission: toggleArrayValue(formData.moto_transmission, trans)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-trans-${trans}`}>{trans}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Condition</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {conditionOptions.map((cond) => (
                      <div key={cond} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-cond-${cond}`}
                          checked={formData.moto_condition.includes(cond)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_condition: toggleArrayValue(formData.moto_condition, cond)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-cond-${cond}`}>{cond}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fuel Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fuel Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {motoFuelTypeOptions.map((fuel) => (
                      <div key={fuel} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-fuel-${fuel}`}
                          checked={formData.moto_fuel_types.includes(fuel)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_fuel_types: toggleArrayValue(formData.moto_fuel_types, fuel)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-fuel-${fuel}`}>{fuel}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cylinders */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cylinders</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {motoCylinderOptions.map((cyl) => (
                      <div key={cyl} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-cyl-${cyl}`}
                          checked={formData.moto_cylinders.includes(cyl)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_cylinders: toggleArrayValue(formData.moto_cylinders, cyl)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-cyl-${cyl}`}>{cyl}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooling System */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cooling System</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {motoCoolingOptions.map((cool) => (
                      <div key={cool} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-cool-${cool}`}
                          checked={formData.moto_cooling_system.includes(cool)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_cooling_system: toggleArrayValue(formData.moto_cooling_system, cool)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-cool-${cool}`}>{cool}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Desired Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {motoFeatureOptions.map((feat) => (
                      <div key={feat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`moto-feat-${feat}`}
                          checked={formData.moto_features.includes(feat)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              moto_features: toggleArrayValue(formData.moto_features, feat)
                            })
                          }}
                        />
                        <Label htmlFor={`moto-feat-${feat}`}>{feat}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ABS & Electric */}
                <div className="space-y-4 pb-4">
                  <h3 className="text-lg font-semibold">Additional Preferences</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="moto_has_abs"
                      checked={formData.moto_has_abs === true}
                      onCheckedChange={(checked) => setFormData({ ...formData, moto_has_abs: checked ? true : null })}
                    />
                    <Label htmlFor="moto_has_abs">Must have ABS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="moto_is_electric"
                      checked={formData.moto_is_electric === true}
                      onCheckedChange={(checked) => setFormData({ ...formData, moto_is_electric: checked ? true : null })}
                    />
                    <Label htmlFor="moto_is_electric">Electric only</Label>
                  </div>
                  {formData.moto_is_electric && (
                    <div>
                      <Label htmlFor="moto_battery_capacity_min">Min Battery Capacity (kWh)</Label>
                      <Input
                        id="moto_battery_capacity_min"
                        type="number"
                        value={formData.moto_battery_capacity_min}
                        onChange={(e) => setFormData({ ...formData, moto_battery_capacity_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* BICYCLES TAB */}
          <TabsContent value="bicycles" className="flex-1 mt-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-6 py-4">
                {/* Bicycle Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bicycle Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {bicycleTypeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bike-type-${type}`}
                          checked={formData.bicycle_types.includes(type)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              bicycle_types: toggleArrayValue(formData.bicycle_types, type)
                            })
                          }}
                        />
                        <Label htmlFor={`bike-type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Price Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bicycle_price_min">Min Price ($)</Label>
                      <Input
                        id="bicycle_price_min"
                        type="number"
                        value={formData.bicycle_price_min}
                        onChange={(e) => setFormData({ ...formData, bicycle_price_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bicycle_price_max">Max Price ($)</Label>
                      <Input
                        id="bicycle_price_max"
                        type="number"
                        value={formData.bicycle_price_max}
                        onChange={(e) => setFormData({ ...formData, bicycle_price_max: parseInt(e.target.value) || 10000 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Wheel Size */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Wheel Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {bicycleWheelSizeOptions.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bike-wheel-${size}`}
                          checked={formData.bicycle_wheel_sizes.includes(size)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              bicycle_wheel_sizes: toggleArrayValue(formData.bicycle_wheel_sizes, size)
                            })
                          }}
                        />
                        <Label htmlFor={`bike-wheel-${size}`}>{size}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suspension Type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Suspension Type</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {bicycleSuspensionOptions.map((susp) => (
                      <div key={susp} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bike-susp-${susp}`}
                          checked={formData.bicycle_suspension_type.includes(susp)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              bicycle_suspension_type: toggleArrayValue(formData.bicycle_suspension_type, susp)
                            })
                          }}
                        />
                        <Label htmlFor={`bike-susp-${susp}`}>{susp}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Frame Material</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {bicycleMaterialOptions.map((mat) => (
                      <div key={mat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bike-mat-${mat}`}
                          checked={formData.bicycle_material.includes(mat)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              bicycle_material: toggleArrayValue(formData.bicycle_material, mat)
                            })
                          }}
                        />
                        <Label htmlFor={`bike-mat-${mat}`}>{mat}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gears */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Number of Gears</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bicycle_gears_min">Min Gears</Label>
                      <Input
                        id="bicycle_gears_min"
                        type="number"
                        value={formData.bicycle_gears_min}
                        onChange={(e) => setFormData({ ...formData, bicycle_gears_min: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bicycle_gears_max">Max Gears</Label>
                      <Input
                        id="bicycle_gears_max"
                        type="number"
                        value={formData.bicycle_gears_max}
                        onChange={(e) => setFormData({ ...formData, bicycle_gears_max: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Minimum Year</h3>
                  <Input
                    type="number"
                    value={formData.bicycle_year_min}
                    onChange={(e) => setFormData({ ...formData, bicycle_year_min: parseInt(e.target.value) || 2010 })}
                  />
                </div>

                {/* Condition */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Condition</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {conditionOptions.map((cond) => (
                      <div key={cond} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bike-cond-${cond}`}
                          checked={formData.bicycle_condition.includes(cond)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              bicycle_condition: toggleArrayValue(formData.bicycle_condition, cond)
                            })
                          }}
                        />
                        <Label htmlFor={`bike-cond-${cond}`}>{cond}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Electric */}
                <div className="space-y-4 pb-4">
                  <h3 className="text-lg font-semibold">Electric Preferences</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bicycle_is_electric"
                      checked={formData.bicycle_is_electric === true}
                      onCheckedChange={(checked) => setFormData({ ...formData, bicycle_is_electric: checked ? true : null })}
                    />
                    <Label htmlFor="bicycle_is_electric">Electric only</Label>
                  </div>
                  {formData.bicycle_is_electric && (
                    <div>
                      <Label htmlFor="bicycle_battery_range_min">Min Battery Range (miles)</Label>
                      <Input
                        id="bicycle_battery_range_min"
                        type="number"
                        value={formData.bicycle_battery_range_min}
                        onChange={(e) => setFormData({ ...formData, bicycle_battery_range_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* YACHTS TAB */}
          <TabsContent value="yachts" className="flex-1 mt-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-6 py-4">
                {/* Yacht Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Yacht Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {yachtTypeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`yacht-type-${type}`}
                          checked={formData.yacht_types.includes(type)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              yacht_types: toggleArrayValue(formData.yacht_types, type)
                            })
                          }}
                        />
                        <Label htmlFor={`yacht-type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Price Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yacht_price_min">Min Price ($)</Label>
                      <Input
                        id="yacht_price_min"
                        type="number"
                        value={formData.yacht_price_min}
                        onChange={(e) => setFormData({ ...formData, yacht_price_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yacht_price_max">Max Price ($)</Label>
                      <Input
                        id="yacht_price_max"
                        type="number"
                        value={formData.yacht_price_max}
                        onChange={(e) => setFormData({ ...formData, yacht_price_max: parseInt(e.target.value) || 10000000 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Length */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Length (feet)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yacht_length_min">Min Length</Label>
                      <Input
                        id="yacht_length_min"
                        type="number"
                        value={formData.yacht_length_min}
                        onChange={(e) => setFormData({ ...formData, yacht_length_min: parseInt(e.target.value) || 20 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yacht_length_max">Max Length</Label>
                      <Input
                        id="yacht_length_max"
                        type="number"
                        value={formData.yacht_length_max}
                        onChange={(e) => setFormData({ ...formData, yacht_length_max: parseInt(e.target.value) || 300 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Minimum Year</h3>
                  <Input
                    type="number"
                    value={formData.yacht_year_min}
                    onChange={(e) => setFormData({ ...formData, yacht_year_min: parseInt(e.target.value) || 1970 })}
                  />
                </div>

                {/* Guest Capacity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Guest Capacity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yacht_guest_capacity_min">Min Guests</Label>
                      <Input
                        id="yacht_guest_capacity_min"
                        type="number"
                        value={formData.yacht_guest_capacity_min}
                        onChange={(e) => setFormData({ ...formData, yacht_guest_capacity_min: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yacht_guest_capacity_max">Max Guests</Label>
                      <Input
                        id="yacht_guest_capacity_max"
                        type="number"
                        value={formData.yacht_guest_capacity_max}
                        onChange={(e) => setFormData({ ...formData, yacht_guest_capacity_max: parseInt(e.target.value) || 50 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Cabin Count */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cabins</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yacht_cabin_count_min">Min Cabins</Label>
                      <Input
                        id="yacht_cabin_count_min"
                        type="number"
                        value={formData.yacht_cabin_count_min}
                        onChange={(e) => setFormData({ ...formData, yacht_cabin_count_min: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yacht_cabin_count_max">Max Cabins</Label>
                      <Input
                        id="yacht_cabin_count_max"
                        type="number"
                        value={formData.yacht_cabin_count_max}
                        onChange={(e) => setFormData({ ...formData, yacht_cabin_count_max: parseInt(e.target.value) || 15 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Condition</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {conditionOptions.map((cond) => (
                      <div key={cond} className="flex items-center space-x-2">
                        <Checkbox
                          id={`yacht-cond-${cond}`}
                          checked={formData.yacht_condition.includes(cond)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              yacht_condition: toggleArrayValue(formData.yacht_condition, cond)
                            })
                          }}
                        />
                        <Label htmlFor={`yacht-cond-${cond}`}>{cond}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fuel Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fuel Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {yachtFuelTypeOptions.map((fuel) => (
                      <div key={fuel} className="flex items-center space-x-2">
                        <Checkbox
                          id={`yacht-fuel-${fuel}`}
                          checked={formData.yacht_fuel_types.includes(fuel)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              yacht_fuel_types: toggleArrayValue(formData.yacht_fuel_types, fuel)
                            })
                          }}
                        />
                        <Label htmlFor={`yacht-fuel-${fuel}`}>{fuel}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engine Power */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Engine Power (HP)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yacht_engine_power_min">Min HP</Label>
                      <Input
                        id="yacht_engine_power_min"
                        type="number"
                        value={formData.yacht_engine_power_min}
                        onChange={(e) => setFormData({ ...formData, yacht_engine_power_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yacht_engine_power_max">Max HP</Label>
                      <Input
                        id="yacht_engine_power_max"
                        type="number"
                        value={formData.yacht_engine_power_max}
                        onChange={(e) => setFormData({ ...formData, yacht_engine_power_max: parseInt(e.target.value) || 10000 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Speed & Range */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yacht_max_speed_min">Min Speed (knots)</Label>
                      <Input
                        id="yacht_max_speed_min"
                        type="number"
                        value={formData.yacht_max_speed_min}
                        onChange={(e) => setFormData({ ...formData, yacht_max_speed_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yacht_range_nm_min">Min Range (nm)</Label>
                      <Input
                        id="yacht_range_nm_min"
                        type="number"
                        value={formData.yacht_range_nm_min}
                        onChange={(e) => setFormData({ ...formData, yacht_range_nm_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Hull Material */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hull Material</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {yachtHullMaterialOptions.map((mat) => (
                      <div key={mat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`yacht-hull-${mat}`}
                          checked={formData.yacht_hull_material.includes(mat)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              yacht_hull_material: toggleArrayValue(formData.yacht_hull_material, mat)
                            })
                          }}
                        />
                        <Label htmlFor={`yacht-hull-${mat}`}>{mat}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Water Activities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Water Activities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {yachtWaterActivitiesOptions.map((act) => (
                      <div key={act} className="flex items-center space-x-2">
                        <Checkbox
                          id={`yacht-act-${act}`}
                          checked={formData.yacht_water_activities.includes(act)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              yacht_water_activities: toggleArrayValue(formData.yacht_water_activities, act)
                            })
                          }}
                        />
                        <Label htmlFor={`yacht-act-${act}`}>{act}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Equipment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Navigation Equipment</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {yachtNavigationEquipmentOptions.map((nav) => (
                      <div key={nav} className="flex items-center space-x-2">
                        <Checkbox
                          id={`yacht-nav-${nav}`}
                          checked={formData.yacht_navigation_equipment.includes(nav)}
                          onCheckedChange={() => {
                            setFormData({
                              ...formData,
                              yacht_navigation_equipment: toggleArrayValue(formData.yacht_navigation_equipment, nav)
                            })
                          }}
                        />
                        <Label htmlFor={`yacht-nav-${nav}`}>{nav}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stabilizers */}
                <div className="space-y-4 pb-4">
                  <h3 className="text-lg font-semibold">Additional Preferences</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="yacht_has_stabilizers"
                      checked={formData.yacht_has_stabilizers === true}
                      onCheckedChange={(checked) => setFormData({ ...formData, yacht_has_stabilizers: checked ? true : null })}
                    />
                    <Label htmlFor="yacht_has_stabilizers">Must have stabilizers</Label>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

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
