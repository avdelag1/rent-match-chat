import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, DollarSign, Clock, MapPin, Globe } from 'lucide-react';

export const SERVICE_CATEGORIES = [
  { value: 'nanny', label: 'Nanny / Childcare', icon: '👶' },
  { value: 'chef', label: 'Private Chef', icon: '👨‍🍳' },
  { value: 'cleaning', label: 'Cleaning Service', icon: '🧹' },
  { value: 'massage', label: 'Massage Therapist', icon: '💆' },
  { value: 'english_teacher', label: 'English Teacher', icon: '📚' },
  { value: 'spanish_teacher', label: 'Spanish Teacher', icon: '🇲🇽' },
  { value: 'yoga', label: 'Yoga Instructor', icon: '🧘' },
  { value: 'personal_trainer', label: 'Personal Trainer', icon: '💪' },
  { value: 'handyman', label: 'Handyman', icon: '🔧' },
  { value: 'gardener', label: 'Gardener', icon: '🌱' },
  { value: 'pool_maintenance', label: 'Pool Maintenance', icon: '🏊' },
  { value: 'driver', label: 'Private Driver', icon: '🚗' },
  { value: 'security', label: 'Security Guard', icon: '🛡️' },
  { value: 'broker', label: 'Real Estate Broker', icon: '🏠' },
  { value: 'tour_guide', label: 'Tour Guide', icon: '🗺️' },
  { value: 'photographer', label: 'Photographer', icon: '📷' },
  { value: 'pet_care', label: 'Pet Care / Dog Walker', icon: '🐕' },
  { value: 'music_teacher', label: 'Music Teacher', icon: '🎵' },
  { value: 'beauty', label: 'Beauty / Hair Stylist', icon: '💇' },
  { value: 'other', label: 'Other Service', icon: '✨' },
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number]['value'];

export const PRICING_UNITS = [
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_session', label: 'Per Session' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_week', label: 'Per Week' },
  { value: 'per_month', label: 'Per Month' },
  { value: 'quote', label: 'Quote-Based' },
] as const;

export type PricingUnit = typeof PRICING_UNITS[number]['value'];

export interface WorkerFormData {
  title: string;
  description: string;
  service_category: ServiceCategory | '';
  custom_service_name?: string;
  price: number | '';
  pricing_unit: PricingUnit;
  availability: string;
  experience_years: number | '';
  languages: string[];
  city: string;
  country: string;
}

interface WorkerListingFormProps {
  onDataChange: (data: Partial<WorkerFormData>) => void;
  initialData?: Partial<WorkerFormData>;
}

export function WorkerListingForm({ onDataChange, initialData = {} }: WorkerListingFormProps) {
  const [formData, setFormData] = useState<WorkerFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    service_category: initialData.service_category || '',
    custom_service_name: initialData.custom_service_name || '',
    price: initialData.price || '',
    pricing_unit: initialData.pricing_unit || 'per_hour',
    availability: initialData.availability || '',
    experience_years: initialData.experience_years || '',
    languages: initialData.languages || [],
    city: initialData.city || '',
    country: initialData.country || '',
  });

  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, []);

  const handleChange = (field: keyof WorkerFormData, value: unknown) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onDataChange(newFormData);
  };

  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && languageInput.trim()) {
      e.preventDefault();
      const newLanguages = [...formData.languages, languageInput.trim()];
      handleChange('languages', newLanguages);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    handleChange('languages', newLanguages);
  };

  const selectedCategoryInfo = SERVICE_CATEGORIES.find(c => c.value === formData.service_category);

  return (
    <div className="space-y-6">
      {/* Service Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_category">Service Category *</Label>
            <Select
              value={formData.service_category}
              onValueChange={(value) => handleChange('service_category', value)}
            >
              <SelectTrigger id="service_category">
                <SelectValue placeholder="Select service category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.service_category === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom_service_name">Custom Service Name *</Label>
              <Input
                id="custom_service_name"
                value={formData.custom_service_name || ''}
                onChange={(e) => handleChange('custom_service_name', e.target.value)}
                placeholder="e.g., Personal Stylist"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={selectedCategoryInfo ? `e.g., Professional ${selectedCategoryInfo.label}` : "e.g., Experienced Yoga Instructor"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your service, experience, and what clients can expect..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0 for quote-based"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing_unit">Pricing Unit</Label>
              <Select
                value={formData.pricing_unit}
                onValueChange={(value) => handleChange('pricing_unit', value as PricingUnit)}
              >
                <SelectTrigger id="pricing_unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Experience & Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              value={formData.experience_years}
              onChange={(e) => handleChange('experience_years', e.target.value ? parseInt(e.target.value) : '')}
              placeholder="e.g., 5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              value={formData.availability}
              onChange={(e) => handleChange('availability', e.target.value)}
              placeholder="e.g., Mon-Fri 9am-6pm, Weekends available"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (press Enter to add)</Label>
            <Input
              id="languages"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={handleAddLanguage}
              placeholder="e.g., English, Spanish"
            />
            {formData.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm cursor-pointer hover:bg-primary/20"
                    onClick={() => handleRemoveLanguage(index)}
                  >
                    <Globe className="w-3 h-3" />
                    {lang}
                    <span className="ml-1 text-xs">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g., Miami"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g., United States"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
