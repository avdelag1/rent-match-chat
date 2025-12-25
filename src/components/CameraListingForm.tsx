import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { toast } from '@/hooks/use-toast';

export interface CameraFormData {
  id?: string;
  title: string;
  camera_type?: string;
  mode: 'sale' | 'rent' | 'both';
  price?: number;
  rental_rates?: {
    per_day?: number;
    per_week?: number;
    per_month?: number;
  };
  camera_brand: string;
  camera_model: string;
  camera_year?: number;
  camera_condition: string;

  // Sensor specs
  sensor_type?: string;
  sensor_size?: string;
  megapixels?: number;
  iso_range_min?: number;
  iso_range_max?: number;

  // Lens specs
  lens_mount?: string;
  lens_type?: string;
  focal_length_min?: number;
  focal_length_max?: number;
  aperture_max?: number;
  aperture_min?: number;

  // Smartphone camera specs (for phones with cameras)
  has_front_camera?: boolean;
  front_camera_megapixels?: number;
  front_camera_aperture?: number;
  rear_camera_count?: number;
  main_rear_camera_megapixels?: number;
  main_rear_camera_aperture?: number;

  // Video specs
  video_resolution?: string;
  video_frame_rate?: number;
  video_codec?: string;

  // Features
  has_image_stabilization?: boolean;
  stabilization_type?: string;
  has_weather_sealing?: boolean;
  has_touchscreen?: boolean;
  screen_size?: number;
  has_viewfinder?: boolean;
  viewfinder_type?: string;
  autofocus_type?: string;
  autofocus_points?: number;
  continuous_shooting_fps?: number;

  // Connectivity
  has_wifi?: boolean;
  has_bluetooth?: boolean;
  has_gps?: boolean;
  has_nfc?: boolean;

  // Physical specs
  weight_grams?: number;
  battery_type?: string;
  battery_shots?: number;

  // Included accessories
  included_accessories?: string[];

  city?: string;
  neighborhood?: string;
}

interface CameraListingFormProps {
  onDataChange: (data: Partial<CameraFormData>) => void;
  initialData?: Partial<CameraFormData>;
}

const CAMERA_TYPES = [
  'DSLR',
  'Mirrorless',
  'Point & Shoot',
  'Action Camera',
  'Instant Camera',
  'Medium Format',
  'Film Camera',
  'Smartphone',
  'Camcorder',
  'Drone Camera',
  '360 Camera',
  'Cinema Camera'
];

const SENSOR_TYPES = [
  'CMOS',
  'BSI-CMOS',
  'Stacked CMOS',
  'CCD',
  'Live MOS',
  'Foveon X3'
];

const SENSOR_SIZES = [
  'Full Frame (35mm)',
  'APS-C',
  'APS-H',
  'Micro Four Thirds',
  '1-inch',
  '1/1.7-inch',
  '1/2.3-inch',
  'Medium Format',
  'Super 35mm'
];

const LENS_MOUNTS = [
  'Canon EF',
  'Canon EF-M',
  'Canon RF',
  'Nikon F',
  'Nikon Z',
  'Sony E',
  'Sony FE',
  'Fujifilm X',
  'Fujifilm G',
  'Micro Four Thirds',
  'Leica L',
  'Pentax K',
  'Hasselblad X',
  'Fixed (Non-interchangeable)',
  'None (Smartphone)'
];

const LENS_TYPES = [
  'Prime (Fixed)',
  'Zoom',
  'Wide Angle',
  'Telephoto',
  'Macro',
  'Fisheye',
  'Tilt-Shift',
  'Kit Lens',
  'Multiple Lenses (Smartphone)'
];

const VIDEO_RESOLUTIONS = [
  '720p',
  '1080p (Full HD)',
  '2.7K',
  '4K UHD',
  '5K',
  '6K',
  '8K',
  'RAW Video'
];

const CONDITIONS = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'For Parts'
];

const STABILIZATION_TYPES = [
  'None',
  'Optical (OIS)',
  'In-Body (IBIS)',
  'Electronic (EIS)',
  'Hybrid',
  'Lens + Body',
  'Gimbal Stabilized'
];

const VIEWFINDER_TYPES = [
  'None',
  'Optical (OVF)',
  'Electronic (EVF)',
  'Hybrid',
  'Rangefinder'
];

const AUTOFOCUS_TYPES = [
  'Contrast Detection',
  'Phase Detection',
  'Hybrid AF',
  'Dual Pixel AF',
  'Eye AF',
  'Animal Eye AF',
  'Real-time Tracking',
  'Manual Focus Only'
];

const CAMERA_ACCESSORIES = [
  'Original Box',
  'Lens Cap',
  'Battery Charger',
  'Extra Battery',
  'Memory Card',
  'Camera Strap',
  'Camera Bag',
  'Lens Hood',
  'UV Filter',
  'ND Filter',
  'Polarizing Filter',
  'External Flash',
  'Remote Shutter',
  'Tripod',
  'Cleaning Kit',
  'Manual & Warranty Card',
  'USB Cable',
  'HDMI Cable'
];

export function CameraListingForm({ onDataChange, initialData }: CameraListingFormProps) {
  const { register, watch, setValue } = useForm<CameraFormData>({
    defaultValues: initialData || { mode: 'rent', included_accessories: [] }
  });

  const formData = watch();

  useEffect(() => {
    if (formData.title) {
      const error = validateNoContactInfo(formData.title);
      if (error) {
        toast({
          title: "Invalid Title",
          description: error,
          variant: "destructive"
        });
      }
    }
    onDataChange(formData);
  }, [formData, onDataChange]);

  const toggleAccessory = (accessory: string) => {
    const currentAccessories = formData.included_accessories || [];
    const newAccessories = currentAccessories.includes(accessory)
      ? currentAccessories.filter(a => a !== accessory)
      : [...currentAccessories, accessory];
    setValue('included_accessories', newAccessories);
    onDataChange({ ...formData, included_accessories: newAccessories });
  };

  const isSmartphone = formData.camera_type?.toLowerCase() === 'smartphone';
  const isActionCamera = formData.camera_type?.toLowerCase() === 'action camera';
  const hasInterchangeableLens =
    formData.camera_type?.toLowerCase() === 'dslr' ||
    formData.camera_type?.toLowerCase() === 'mirrorless' ||
    formData.camera_type?.toLowerCase() === 'medium format';

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Listing Title *</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              onChange={(e) => onDataChange({ ...formData, title: e.target.value })}
              placeholder="e.g., Sony A7 III with 28-70mm lens"
            />
            <p className="text-xs text-muted-foreground mt-1">
              No contact info allowed - share after messaging connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="camera_type">Camera Type *</Label>
              <Select
                value={formData.camera_type}
                onValueChange={(value) => {
                  setValue('camera_type', value);
                  onDataChange({ ...formData, camera_type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="camera_condition">Condition *</Label>
              <Select
                value={formData.camera_condition}
                onValueChange={(value) => {
                  setValue('camera_condition', value);
                  onDataChange({ ...formData, camera_condition: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="city">Location / City *</Label>
            <Input
              id="city"
              {...register('city', { required: true })}
              placeholder="e.g. Tulum, Playa del Carmen"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.mode === 'sale' || formData.mode === 'both') && (
            <div>
              <Label htmlFor="price">Sale Price (MXN) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
                onChange={(e) => onDataChange({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="e.g. 35,000 MXN"
              />
            </div>
          )}

          {(formData.mode === 'rent' || formData.mode === 'both') && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Per Day</Label>
                <Input
                  type="number"
                  placeholder="Daily rate"
                  value={formData.rental_rates?.per_day || ''}
                  onChange={(e) => onDataChange({
                    ...formData,
                    rental_rates: { ...formData.rental_rates, per_day: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label>Per Week</Label>
                <Input
                  type="number"
                  placeholder="Weekly rate"
                  value={formData.rental_rates?.per_week || ''}
                  onChange={(e) => onDataChange({
                    ...formData,
                    rental_rates: { ...formData.rental_rates, per_week: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label>Per Month</Label>
                <Input
                  type="number"
                  placeholder="Monthly rate"
                  value={formData.rental_rates?.per_month || ''}
                  onChange={(e) => onDataChange({
                    ...formData,
                    rental_rates: { ...formData.rental_rates, per_month: parseFloat(e.target.value) }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Camera Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="camera_brand">Brand *</Label>
            <Input
              id="camera_brand"
              {...register('camera_brand', { required: true })}
              onChange={(e) => onDataChange({ ...formData, camera_brand: e.target.value })}
              placeholder="e.g., Sony, Canon, Nikon"
            />
          </div>

          <div>
            <Label htmlFor="camera_model">Model *</Label>
            <Input
              id="camera_model"
              {...register('camera_model', { required: true })}
              onChange={(e) => onDataChange({ ...formData, camera_model: e.target.value })}
              placeholder="e.g., A7 III, EOS R5, Z6 II"
            />
          </div>

          <div>
            <Label htmlFor="camera_year">Year</Label>
            <Input
              id="camera_year"
              type="number"
              {...register('camera_year')}
              onChange={(e) => onDataChange({ ...formData, camera_year: parseInt(e.target.value) })}
              placeholder="2023"
            />
          </div>

          <div>
            <Label htmlFor="weight_grams">Weight (grams)</Label>
            <Input
              id="weight_grams"
              type="number"
              {...register('weight_grams')}
              onChange={(e) => onDataChange({ ...formData, weight_grams: parseInt(e.target.value) })}
              placeholder="e.g., 650"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sensor Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor & Image Quality</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sensor_type">Sensor Type</Label>
            <Select
              value={formData.sensor_type}
              onValueChange={(value) => {
                setValue('sensor_type', value);
                onDataChange({ ...formData, sensor_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sensor type" />
              </SelectTrigger>
              <SelectContent>
                {SENSOR_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sensor_size">Sensor Size</Label>
            <Select
              value={formData.sensor_size}
              onValueChange={(value) => {
                setValue('sensor_size', value);
                onDataChange({ ...formData, sensor_size: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sensor size" />
              </SelectTrigger>
              <SelectContent>
                {SENSOR_SIZES.map(size => (
                  <SelectItem key={size} value={size.toLowerCase()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="megapixels">Megapixels (MP)</Label>
            <Input
              id="megapixels"
              type="number"
              step="0.1"
              {...register('megapixels')}
              onChange={(e) => onDataChange({ ...formData, megapixels: parseFloat(e.target.value) })}
              placeholder="e.g., 24.2"
            />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iso_range_min">ISO Range Min</Label>
              <Input
                id="iso_range_min"
                type="number"
                {...register('iso_range_min')}
                onChange={(e) => onDataChange({ ...formData, iso_range_min: parseInt(e.target.value) })}
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <Label htmlFor="iso_range_max">ISO Range Max</Label>
              <Input
                id="iso_range_max"
                type="number"
                {...register('iso_range_max')}
                onChange={(e) => onDataChange({ ...formData, iso_range_max: parseInt(e.target.value) })}
                placeholder="e.g., 51200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lens Specifications */}
      {hasInterchangeableLens && (
        <Card>
          <CardHeader>
            <CardTitle>Lens Mount & Lens Specs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lens_mount">Lens Mount</Label>
              <Select
                value={formData.lens_mount}
                onValueChange={(value) => {
                  setValue('lens_mount', value);
                  onDataChange({ ...formData, lens_mount: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lens mount" />
                </SelectTrigger>
                <SelectContent>
                  {LENS_MOUNTS.map(mount => (
                    <SelectItem key={mount} value={mount.toLowerCase()}>
                      {mount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lens_type">Included Lens Type</Label>
              <Select
                value={formData.lens_type}
                onValueChange={(value) => {
                  setValue('lens_type', value);
                  onDataChange({ ...formData, lens_type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lens type" />
                </SelectTrigger>
                <SelectContent>
                  {LENS_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="focal_length_min">Focal Length Min (mm)</Label>
                <Input
                  id="focal_length_min"
                  type="number"
                  {...register('focal_length_min')}
                  onChange={(e) => onDataChange({ ...formData, focal_length_min: parseInt(e.target.value) })}
                  placeholder="e.g., 24"
                />
              </div>
              <div>
                <Label htmlFor="focal_length_max">Focal Length Max (mm)</Label>
                <Input
                  id="focal_length_max"
                  type="number"
                  {...register('focal_length_max')}
                  onChange={(e) => onDataChange({ ...formData, focal_length_max: parseInt(e.target.value) })}
                  placeholder="e.g., 70"
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aperture_max">Max Aperture (f-stop)</Label>
                <Input
                  id="aperture_max"
                  type="number"
                  step="0.1"
                  {...register('aperture_max')}
                  onChange={(e) => onDataChange({ ...formData, aperture_max: parseFloat(e.target.value) })}
                  placeholder="e.g., 2.8"
                />
              </div>
              <div>
                <Label htmlFor="aperture_min">Min Aperture (f-stop)</Label>
                <Input
                  id="aperture_min"
                  type="number"
                  step="0.1"
                  {...register('aperture_min')}
                  onChange={(e) => onDataChange({ ...formData, aperture_min: parseFloat(e.target.value) })}
                  placeholder="e.g., 22"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smartphone Camera Specs */}
      {isSmartphone && (
        <Card>
          <CardHeader>
            <CardTitle>Smartphone Camera Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_front_camera"
                checked={formData.has_front_camera || false}
                onCheckedChange={(checked) => {
                  setValue('has_front_camera', checked as boolean);
                  onDataChange({ ...formData, has_front_camera: checked as boolean });
                }}
              />
              <label htmlFor="has_front_camera" className="text-sm font-medium">
                Has Front Camera (Selfie)
              </label>
            </div>

            {formData.has_front_camera && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="front_camera_megapixels">Front Camera Megapixels</Label>
                  <Input
                    id="front_camera_megapixels"
                    type="number"
                    step="0.1"
                    {...register('front_camera_megapixels')}
                    onChange={(e) => onDataChange({ ...formData, front_camera_megapixels: parseFloat(e.target.value) })}
                    placeholder="e.g., 12"
                  />
                </div>
                <div>
                  <Label htmlFor="front_camera_aperture">Front Camera Aperture (f-stop)</Label>
                  <Input
                    id="front_camera_aperture"
                    type="number"
                    step="0.1"
                    {...register('front_camera_aperture')}
                    onChange={(e) => onDataChange({ ...formData, front_camera_aperture: parseFloat(e.target.value) })}
                    placeholder="e.g., 2.2"
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rear_camera_count">Number of Rear Cameras</Label>
                <Input
                  id="rear_camera_count"
                  type="number"
                  {...register('rear_camera_count')}
                  onChange={(e) => onDataChange({ ...formData, rear_camera_count: parseInt(e.target.value) })}
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <Label htmlFor="main_rear_camera_megapixels">Main Rear Camera MP</Label>
                <Input
                  id="main_rear_camera_megapixels"
                  type="number"
                  step="0.1"
                  {...register('main_rear_camera_megapixels')}
                  onChange={(e) => onDataChange({ ...formData, main_rear_camera_megapixels: parseFloat(e.target.value) })}
                  placeholder="e.g., 48"
                />
              </div>
              <div>
                <Label htmlFor="main_rear_camera_aperture">Main Rear Aperture</Label>
                <Input
                  id="main_rear_camera_aperture"
                  type="number"
                  step="0.1"
                  {...register('main_rear_camera_aperture')}
                  onChange={(e) => onDataChange({ ...formData, main_rear_camera_aperture: parseFloat(e.target.value) })}
                  placeholder="e.g., 1.8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Video Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="video_resolution">Video Resolution</Label>
            <Select
              value={formData.video_resolution}
              onValueChange={(value) => {
                setValue('video_resolution', value);
                onDataChange({ ...formData, video_resolution: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_RESOLUTIONS.map(res => (
                  <SelectItem key={res} value={res.toLowerCase()}>
                    {res}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="video_frame_rate">Max Frame Rate (fps)</Label>
            <Input
              id="video_frame_rate"
              type="number"
              {...register('video_frame_rate')}
              onChange={(e) => onDataChange({ ...formData, video_frame_rate: parseInt(e.target.value) })}
              placeholder="e.g., 60, 120, 240"
            />
          </div>
        </CardContent>
      </Card>

      {/* Features & Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stabilization_type">Image Stabilization</Label>
              <Select
                value={formData.stabilization_type}
                onValueChange={(value) => {
                  setValue('stabilization_type', value);
                  setValue('has_image_stabilization', value !== 'none');
                  onDataChange({
                    ...formData,
                    stabilization_type: value,
                    has_image_stabilization: value !== 'none'
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stabilization" />
                </SelectTrigger>
                <SelectContent>
                  {STABILIZATION_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="autofocus_type">Autofocus Type</Label>
              <Select
                value={formData.autofocus_type}
                onValueChange={(value) => {
                  setValue('autofocus_type', value);
                  onDataChange({ ...formData, autofocus_type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select autofocus" />
                </SelectTrigger>
                <SelectContent>
                  {AUTOFOCUS_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="autofocus_points">Autofocus Points</Label>
              <Input
                id="autofocus_points"
                type="number"
                {...register('autofocus_points')}
                onChange={(e) => onDataChange({ ...formData, autofocus_points: parseInt(e.target.value) })}
                placeholder="e.g., 693"
              />
            </div>

            <div>
              <Label htmlFor="continuous_shooting_fps">Continuous Shooting (fps)</Label>
              <Input
                id="continuous_shooting_fps"
                type="number"
                step="0.1"
                {...register('continuous_shooting_fps')}
                onChange={(e) => onDataChange({ ...formData, continuous_shooting_fps: parseFloat(e.target.value) })}
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <Label htmlFor="viewfinder_type">Viewfinder Type</Label>
              <Select
                value={formData.viewfinder_type}
                onValueChange={(value) => {
                  setValue('viewfinder_type', value);
                  setValue('has_viewfinder', value !== 'none');
                  onDataChange({
                    ...formData,
                    viewfinder_type: value,
                    has_viewfinder: value !== 'none'
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select viewfinder" />
                </SelectTrigger>
                <SelectContent>
                  {VIEWFINDER_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="screen_size">Screen Size (inches)</Label>
              <Input
                id="screen_size"
                type="number"
                step="0.1"
                {...register('screen_size')}
                onChange={(e) => onDataChange({ ...formData, screen_size: parseFloat(e.target.value) })}
                placeholder="e.g., 3.0"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_weather_sealing"
                checked={formData.has_weather_sealing || false}
                onCheckedChange={(checked) => {
                  setValue('has_weather_sealing', checked as boolean);
                  onDataChange({ ...formData, has_weather_sealing: checked as boolean });
                }}
              />
              <label htmlFor="has_weather_sealing" className="text-sm font-medium">
                Weather Sealing
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_touchscreen"
                checked={formData.has_touchscreen || false}
                onCheckedChange={(checked) => {
                  setValue('has_touchscreen', checked as boolean);
                  onDataChange({ ...formData, has_touchscreen: checked as boolean });
                }}
              />
              <label htmlFor="has_touchscreen" className="text-sm font-medium">
                Touchscreen
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connectivity */}
      <Card>
        <CardHeader>
          <CardTitle>Connectivity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_wifi"
                checked={formData.has_wifi || false}
                onCheckedChange={(checked) => {
                  setValue('has_wifi', checked as boolean);
                  onDataChange({ ...formData, has_wifi: checked as boolean });
                }}
              />
              <label htmlFor="has_wifi" className="text-sm font-medium">
                WiFi
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_bluetooth"
                checked={formData.has_bluetooth || false}
                onCheckedChange={(checked) => {
                  setValue('has_bluetooth', checked as boolean);
                  onDataChange({ ...formData, has_bluetooth: checked as boolean });
                }}
              />
              <label htmlFor="has_bluetooth" className="text-sm font-medium">
                Bluetooth
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_gps"
                checked={formData.has_gps || false}
                onCheckedChange={(checked) => {
                  setValue('has_gps', checked as boolean);
                  onDataChange({ ...formData, has_gps: checked as boolean });
                }}
              />
              <label htmlFor="has_gps" className="text-sm font-medium">
                GPS
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_nfc"
                checked={formData.has_nfc || false}
                onCheckedChange={(checked) => {
                  setValue('has_nfc', checked as boolean);
                  onDataChange({ ...formData, has_nfc: checked as boolean });
                }}
              />
              <label htmlFor="has_nfc" className="text-sm font-medium">
                NFC
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battery */}
      <Card>
        <CardHeader>
          <CardTitle>Battery</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="battery_type">Battery Type</Label>
            <Input
              id="battery_type"
              {...register('battery_type')}
              onChange={(e) => onDataChange({ ...formData, battery_type: e.target.value })}
              placeholder="e.g., NP-FZ100, LP-E6N"
            />
          </div>

          <div>
            <Label htmlFor="battery_shots">Battery Life (shots)</Label>
            <Input
              id="battery_shots"
              type="number"
              {...register('battery_shots')}
              onChange={(e) => onDataChange({ ...formData, battery_shots: parseInt(e.target.value) })}
              placeholder="e.g., 610"
            />
          </div>
        </CardContent>
      </Card>

      {/* Included Accessories */}
      <Card>
        <CardHeader>
          <CardTitle>Included Accessories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMERA_ACCESSORIES.map((accessory) => (
              <div key={accessory} className="flex items-center space-x-2">
                <Checkbox
                  id={accessory}
                  checked={formData.included_accessories?.includes(accessory) || false}
                  onCheckedChange={() => toggleAccessory(accessory)}
                />
                <label
                  htmlFor={accessory}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {accessory}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
