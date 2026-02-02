import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Briefcase, DollarSign, Clock, MapPin, Globe, Award, Calendar, X } from 'lucide-react';

// (Keep all the constants like SERVICE_CATEGORIES, PRICING_UNITS, etc. as they are)

export const SERVICE_CATEGORIES = [
    { value: 'nanny', label: 'Nanny / Childcare', icon: '👶' },
    { value: 'baby_sitting', label: 'Baby Sitting', icon: '👶' },
    { value: 'chef', label: 'Private Chef', icon: '👨‍🍳' },
    { value: 'home_cook', label: 'Home Cook / Meal Prep', icon: '🍲' },
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
    { value: 'pet_sitting', label: 'Pet Sitting', icon: '🐾' },
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
  
  export const COMMON_SKILLS = {
    nanny: ['CPR Certified', 'First Aid', 'Newborn Care', 'Special Needs', 'Bilingual', 'Homework Help', 'Potty Training', 'Meal Prep'],
    baby_sitting: ['CPR Certified', 'First Aid', 'Infant Care', 'Toddler Care', 'Bedtime Routine', 'Light Housekeeping', 'Flexible Hours', 'References Available'],
    chef: ['Italian Cuisine', 'Mexican Cuisine', 'Vegan/Vegetarian', 'Pastry', 'Meal Prep', 'Catering', 'Food Safety Certified', 'Wine Pairing'],
    home_cook: ['Meal Prep', 'Dietary Restrictions', 'Gluten-Free', 'Keto/Low-Carb', 'Vegan/Vegetarian', 'Family Style Meals', 'Food Safety', 'Portion Control'],
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
    pet_sitting: ['Overnight Care', 'Daily Visits', 'Multiple Pets', 'Medication Admin', 'Exercise & Play', 'Feeding', 'House Sitting', 'Pet First Aid'],
    music_teacher: ['Piano', 'Guitar', 'Vocals', 'Drums', 'Music Theory', 'Kids Teaching', 'Online Lessons', 'Performance Training'],
    beauty: ['Hair Cutting', 'Hair Coloring', 'Makeup', 'Nails', 'Skincare', 'Waxing', 'Bridal', 'Mobile Service'],
    other: ['Custom Skills'],
  } as const;

export interface WorkerFormData {
    title: string;
    description?: string;
    service_category: ServiceCategory | '';
    custom_service_name?: string;
    price: number | '';
    pricing_unit: PricingUnit;
    work_type: string[];
    schedule_type: string[];
    days_available: string[];
    time_slots_available: string[];
    location_type: string[];
    experience_level: string;
    experience_years: number | '';
    skills: string[];
    certifications: string[];
    tools_equipment: string[];
    service_radius_km?: number;
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
    const { register, control, watch, setValue, formState: { errors } } = useForm<WorkerFormData>({
        defaultValues: {
            ...initialData,
            work_type: initialData.work_type || [],
            schedule_type: initialData.schedule_type || [],
            days_available: initialData.days_available || [],
            time_slots_available: initialData.time_slots_available || [],
            location_type: initialData.location_type || [],
            skills: initialData.skills || [],
            certifications: initialData.certifications || [],
            tools_equipment: initialData.tools_equipment || [],
            languages: initialData.languages || [],
            price: initialData.price || '',
            experience_years: initialData.experience_years || '',
        }
    });

    const formData = watch();

    useEffect(() => {
        onDataChange(formData);
    }, [formData, onDataChange]);

    const watchedServiceCategory = watch('service_category');
    const availableSkills = watchedServiceCategory && watchedServiceCategory in COMMON_SKILLS
        ? COMMON_SKILLS[watchedServiceCategory as keyof typeof COMMON_SKILLS]
        : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Service Category</Label>
                        <Controller
                            name="service_category"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <SelectTrigger><SelectValue placeholder="Select service category" /></SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.service_category && <p className="text-sm text-destructive mt-1">{errors.service_category.message}</p>}
                    </div>

                    {watchedServiceCategory === 'other' && (
                        <div>
                            <Label>Custom Service Name</Label>
                            <Input {...register('custom_service_name')} placeholder="e.g., Personal Stylist" />
                            {errors.custom_service_name && <p className="text-sm text-destructive mt-1">{errors.custom_service_name.message}</p>}
                        </div>
                    )}

                    <div>
                        <Label>Service Title</Label>
                        <Input {...register('title')} placeholder="e.g., Experienced Yoga Instructor" />
                        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <Textarea {...field} placeholder="Describe your service..." rows={3} />}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input {...register('city')} placeholder="e.g., Tulum" />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <Label>Country</Label>
                  <Input {...register('country')} placeholder="e.g., Mexico" />
                  {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Price (USD)</Label>
                        <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="25" />
                        {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <Label>Pricing Unit</Label>
                        <Controller
                            name="pricing_unit"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                                    <SelectContent>
                                        {PRICING_UNITS.map(unit => <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.pricing_unit && <p className="text-sm text-destructive mt-1">{errors.pricing_unit.message}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Experience & Qualifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Experience Level</Label>
                        <Controller
                            name="experience_level"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                                    <SelectContent>
                                        {EXPERIENCE_LEVELS.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.experience_level && <p className="text-sm text-destructive mt-1">{errors.experience_level.message}</p>}
                    </div>
                    <div>
                        <Label>Years of Experience</Label>
                        <Input type="number" {...register('experience_years', { valueAsNumber: true, min: 0 })} placeholder="5" />
                        {errors.experience_years && <p className="text-sm text-destructive mt-1">{errors.experience_years.message}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
