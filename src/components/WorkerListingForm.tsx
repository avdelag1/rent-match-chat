import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, DollarSign, Clock, MapPin, Globe, Award, Calendar, FileText } from 'lucide-react';

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

export const WORK_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
] as const;

export const SCHEDULE_TYPES = [
  { value: 'fixed_hours', label: 'Fixed Hours' },
  { value: 'flexible', label: 'Flexible Schedule' },
  { value: 'on_call', label: 'On-call' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'rotating_shifts', label: 'Rotating Shifts' },
  { value: 'weekends_only', label: 'Weekends Only' },
] as const;

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

export const TIME_SLOTS = [
  { value: 'early_morning', label: 'Early Morning (6am-9am)' },
  { value: 'morning', label: 'Morning (9am-12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
  { value: 'evening', label: 'Evening (5pm-9pm)' },
  { value: 'night', label: 'Night (9pm-6am)' },
  { value: 'anytime', label: 'Anytime/Flexible' },
] as const;

export const LOCATION_TYPES = [
  { value: 'on_site', label: 'On-site (Client Location)' },
  { value: 'remote', label: 'Remote (Virtual)' },
  { value: 'hybrid', label: 'Hybrid (Both)' },
  { value: 'travel_required', label: 'Travel Required' },
  { value: 'own_location', label: 'At My Location' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
] as const;

// Service-specific skill options
export const COMMON_SKILLS = {
  nanny: ['CPR Certified', 'First Aid', 'Newborn Care', 'Special Needs', 'Bilingual', 'Homework Help', 'Potty Training', 'Meal Prep'],
  chef: ['Italian Cuisine', 'Mexican Cuisine', 'Vegan/Vegetarian', 'Pastry', 'Meal Prep', 'Catering', 'Food Safety Certified', 'Wine Pairing'],
  cleaning: ['Deep Cleaning', 'Eco-Friendly Products', 'Organization', 'Laundry', 'Window Cleaning', 'Carpet Cleaning', 'Move-in/Move-out'],
  massage: ['Swedish Massage', 'Deep Tissue', 'Sports Massage', 'Prenatal', 'Hot Stone', 'Aromatherapy', 'Thai Massage', 'Reflexology'],
  english_teacher: ['TEFL Certified', 'TESOL', 'Business English', 'Conversational', 'Test Prep', 'Kids Teaching', 'Online Teaching'],
  spanish_teacher: ['Native Speaker', 'DELE Certified', 'Conversational', 'Business Spanish', 'Kids Teaching', 'Grammar Focus', 'Online Teaching'],
  yoga: ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin Yoga', 'Power Yoga', 'Prenatal', 'Kids Yoga', 'RYT 200', 'RYT 500'],
  personal_trainer: ['Weight Loss', 'Muscle Building', 'HIIT', 'CrossFit', 'Nutrition Planning', 'Injury Recovery', 'Senior Fitness', 'Sports-Specific'],
  handyman: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Drywall', 'Tile Work', 'Appliance Repair', 'General Repairs'],
  gardener: ['Landscape Design', 'Lawn Care', 'Pruning', 'Irrigation', 'Organic Gardening', 'Tree Care', 'Pest Control', 'Seasonal Planting'],
  pool_maintenance: ['Chemical Balancing', 'Filter Cleaning', 'Pump Repair', 'Tile Cleaning', 'Equipment Installation', 'Leak Detection', 'Saltwater Systems'],
  driver: ['Defensive Driving', 'Luxury Vehicles', 'Airport Transfers', 'Long Distance', 'CDL License', 'Clean Record', 'Bilingual', 'Tour Guide'],
  security: ['Armed', 'Unarmed', 'CCTV Monitoring', 'Patrol', 'Event Security', 'Executive Protection', 'Licensed', 'Background Verified'],
  broker: ['Residential', 'Commercial', 'Luxury Properties', 'Investment', 'Rental Management', 'MLS Access', 'Bilingual', 'Market Analysis'],
  tour_guide: ['Historical Tours', 'Food Tours', 'Adventure Tours', 'Cultural Tours', 'Photography Tours', 'Bilingual', 'Licensed', 'Transportation'],
  photographer: ['Portrait', 'Wedding', 'Event', 'Real Estate', 'Product', 'Food Photography', 'Drone', 'Video Editing'],
  pet_care: ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training', 'Overnight Care', 'Multiple Pets', 'Medication Admin', 'Special Needs'],
  music_teacher: ['Piano', 'Guitar', 'Vocals', 'Drums', 'Music Theory', 'Kids Teaching', 'Online Lessons', 'Performance Training'],
  beauty: ['Hair Cutting', 'Hair Coloring', 'Makeup', 'Nails', 'Skincare', 'Waxing', 'Bridal', 'Mobile Service'],
  other: ['Custom Skills'],
} as const;

export interface WorkerFormData {
  title: string;
  description?: string;  // Brief bio/description of service
  service_category: ServiceCategory | '';
  custom_service_name?: string;
  price: number | '';
  pricing_unit: PricingUnit;

  // Structured work details (NO free-text description)
  work_type?: string[];  // Full-time, Part-time, Contract, Freelance, etc.
  schedule_type?: string[];  // Fixed hours, Flexible, On-call, Seasonal
  days_available?: string[];  // Mon-Sun
  time_slots_available?: string[];  // Morning, Afternoon, Evening, Night, Anytime
  location_type?: string[];  // On-site, Remote, Hybrid, Travel
  experience_level?: string;  // Entry, Mid, Senior, Expert
  experience_years: number | '';

  // Skills & Certifications
  skills?: string[];
  certifications?: string[];
  tools_equipment?: string[];  // What tools/equipment they have or can provide

  // Service specifics
  service_radius_km?: number;  // How far they'll travel
  minimum_booking_hours?: number;
  offers_emergency_service?: boolean;
  background_check_verified?: boolean;
  insurance_verified?: boolean;

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
    work_type: initialData.work_type || [],
    schedule_type: initialData.schedule_type || [],
    days_available: initialData.days_available || [],
    time_slots_available: initialData.time_slots_available || [],
    location_type: initialData.location_type || [],
    experience_level: initialData.experience_level || '',
    experience_years: initialData.experience_years || '',
    skills: initialData.skills || [],
    certifications: initialData.certifications || [],
    tools_equipment: initialData.tools_equipment || [],
    service_radius_km: initialData.service_radius_km || undefined,
    minimum_booking_hours: initialData.minimum_booking_hours || undefined,
    offers_emergency_service: initialData.offers_emergency_service || false,
    background_check_verified: initialData.background_check_verified || false,
    insurance_verified: initialData.insurance_verified || false,
    languages: initialData.languages || [],
    city: initialData.city || '',
    country: initialData.country || '',
  });

  const [languageInput, setLanguageInput] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customCertInput, setCustomCertInput] = useState('');
  const [customToolInput, setCustomToolInput] = useState('');

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

  const toggleArrayValue = (field: keyof WorkerFormData, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    handleChange(field, newArray);
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      const newSkills = [...(formData.skills || []), customSkillInput.trim()];
      handleChange('skills', newSkills);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = (formData.skills || []).filter(s => s !== skill);
    handleChange('skills', newSkills);
  };

  const handleAddCustomCert = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customCertInput.trim()) {
      e.preventDefault();
      const newCerts = [...(formData.certifications || []), customCertInput.trim()];
      handleChange('certifications', newCerts);
      setCustomCertInput('');
    }
  };

  const handleRemoveCert = (cert: string) => {
    const newCerts = (formData.certifications || []).filter(c => c !== cert);
    handleChange('certifications', newCerts);
  };

  const handleAddCustomTool = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customToolInput.trim()) {
      e.preventDefault();
      const newTools = [...(formData.tools_equipment || []), customToolInput.trim()];
      handleChange('tools_equipment', newTools);
      setCustomToolInput('');
    }
  };

  const handleRemoveTool = (tool: string) => {
    const newTools = (formData.tools_equipment || []).filter(t => t !== tool);
    handleChange('tools_equipment', newTools);
  };

  const selectedCategoryInfo = SERVICE_CATEGORIES.find(c => c.value === formData.service_category);
  const availableSkills = formData.service_category && formData.service_category in COMMON_SKILLS
    ? COMMON_SKILLS[formData.service_category as keyof typeof COMMON_SKILLS]
    : [];

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
            <Label htmlFor="description">Brief Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your service, experience, and what makes you unique (max 500 characters)"
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {(formData.description?.length || 0)}/500
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Work Type & Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Work Type & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Work Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {WORK_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`work_type_${type.value}`}
                    checked={formData.work_type?.includes(type.value) || false}
                    onCheckedChange={() => toggleArrayValue('work_type', type.value)}
                  />
                  <label htmlFor={`work_type_${type.value}`} className="text-sm cursor-pointer">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Schedule Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SCHEDULE_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`schedule_${type.value}`}
                    checked={formData.schedule_type?.includes(type.value) || false}
                    onCheckedChange={() => toggleArrayValue('schedule_type', type.value)}
                  />
                  <label htmlFor={`schedule_${type.value}`} className="text-sm cursor-pointer">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Days Available *</Label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day_${day.value}`}
                    checked={formData.days_available?.includes(day.value) || false}
                    onCheckedChange={() => toggleArrayValue('days_available', day.value)}
                  />
                  <label htmlFor={`day_${day.value}`} className="text-sm cursor-pointer">
                    {day.short}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Slots Available *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => (
                <div key={slot.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`time_${slot.value}`}
                    checked={formData.time_slots_available?.includes(slot.value) || false}
                    onCheckedChange={() => toggleArrayValue('time_slots_available', slot.value)}
                  />
                  <label htmlFor={`time_${slot.value}`} className="text-sm cursor-pointer">
                    {slot.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service Location Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LOCATION_TYPES.map((locType) => (
                <div key={locType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location_${locType.value}`}
                    checked={formData.location_type?.includes(locType.value) || false}
                    onCheckedChange={() => toggleArrayValue('location_type', locType.value)}
                  />
                  <label htmlFor={`location_${locType.value}`} className="text-sm cursor-pointer">
                    {locType.label}
                  </label>
                </div>
              ))}
            </div>
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

      {/* Experience & Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            Experience & Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level *</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value) => handleChange('experience_level', value)}
              >
                <SelectTrigger id="experience_level">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          {availableSkills.length > 0 && (
            <div className="space-y-2">
              <Label>Skills & Specializations *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSkills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill_${skill}`}
                      checked={formData.skills?.includes(skill) || false}
                      onCheckedChange={() => toggleArrayValue('skills', skill)}
                    />
                    <label htmlFor={`skill_${skill}`} className="text-sm cursor-pointer">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="custom_skill">Add Custom Skills (press Enter)</Label>
            <Input
              id="custom_skill"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={handleAddCustomSkill}
              placeholder="Type a skill and press Enter"
            />
            {formData.skills && formData.skills.filter(s => !availableSkills.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.filter(s => !availableSkills.includes(s)).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill}
                    <span className="ml-1 text-xs">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (press Enter to add)</Label>
            <Input
              id="certifications"
              value={customCertInput}
              onChange={(e) => setCustomCertInput(e.target.value)}
              onKeyDown={handleAddCustomCert}
              placeholder="e.g., CPR Certified, Licensed Electrician"
            />
            {formData.certifications && formData.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer hover:bg-green-200"
                    onClick={() => handleRemoveCert(cert)}
                  >
                    <Award className="w-3 h-3" />
                    {cert}
                    <span className="ml-1 text-xs">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tools_equipment">Tools/Equipment You Provide (press Enter to add)</Label>
            <Input
              id="tools_equipment"
              value={customToolInput}
              onChange={(e) => setCustomToolInput(e.target.value)}
              onKeyDown={handleAddCustomTool}
              placeholder="e.g., Professional camera, Cleaning supplies, Own vehicle"
            />
            {formData.tools_equipment && formData.tools_equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tools_equipment.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm cursor-pointer hover:bg-orange-200"
                    onClick={() => handleRemoveTool(tool)}
                  >
                    {tool}
                    <span className="ml-1 text-xs">×</span>
                  </span>
                ))}
              </div>
            )}
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
                    key={`lang-${lang}-${index}`}
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

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_radius_km">Service Radius (km)</Label>
              <Input
                id="service_radius_km"
                type="number"
                min="0"
                value={formData.service_radius_km || ''}
                onChange={(e) => handleChange('service_radius_km', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="How far you'll travel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_booking_hours">Minimum Booking (hours)</Label>
              <Input
                id="minimum_booking_hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.minimum_booking_hours || ''}
                onChange={(e) => handleChange('minimum_booking_hours', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g., 2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="offers_emergency_service"
                checked={formData.offers_emergency_service || false}
                onCheckedChange={(checked) => handleChange('offers_emergency_service', checked)}
              />
              <label htmlFor="offers_emergency_service" className="text-sm cursor-pointer">
                Offers Emergency Service
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="background_check_verified"
                checked={formData.background_check_verified || false}
                onCheckedChange={(checked) => handleChange('background_check_verified', checked)}
              />
              <label htmlFor="background_check_verified" className="text-sm cursor-pointer">
                Background Check Verified
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="insurance_verified"
                checked={formData.insurance_verified || false}
                onCheckedChange={(checked) => handleChange('insurance_verified', checked)}
              />
              <label htmlFor="insurance_verified" className="text-sm cursor-pointer">
                Insurance Verified
              </label>
            </div>
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
