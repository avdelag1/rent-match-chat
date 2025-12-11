import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClientService, SERVICE_TYPES, ServiceType } from '@/hooks/useClientService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ImageUpload';
import { Briefcase, DollarSign, Clock, Camera, Trash2, Sparkles, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ServiceOfferForm() {
  const { service, isLoading, upsertService, deleteService } = useClientService();
  
  const [formData, setFormData] = useState({
    service_type: '' as ServiceType | '',
    custom_service_name: '',
    title: '',
    description: '',
    hourly_rate: '',
    experience_years: '',
    availability: '',
    service_photos: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        service_type: service.service_type,
        custom_service_name: service.custom_service_name || '',
        title: service.title,
        description: service.description || '',
        hourly_rate: service.hourly_rate?.toString() || '',
        experience_years: service.experience_years?.toString() || '',
        availability: service.availability || '',
        service_photos: service.service_photos || [],
        is_active: service.is_active,
      });
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    upsertService.mutate({
      service_type: formData.service_type as ServiceType,
      custom_service_name: formData.service_type === 'other' ? formData.custom_service_name : undefined,
      title: formData.title,
      description: formData.description || undefined,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
      availability: formData.availability || undefined,
      service_photos: formData.service_photos,
      is_active: formData.is_active,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to remove your service offering?')) {
      deleteService.mutate();
      setFormData({
        service_type: '',
        custom_service_name: '',
        title: '',
        description: '',
        hourly_rate: '',
        experience_years: '',
        availability: '',
        service_photos: [],
        is_active: true,
      });
    }
  };

  const selectedServiceInfo = SERVICE_TYPES.find(s => s.value === formData.service_type);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Offer Your Services</CardTitle>
              <CardDescription>
                Let property owners find and hire you for your skills
              </CardDescription>
            </div>
          </div>
          {service && (
            <Badge variant={service.is_active ? "default" : "secondary"} className="w-fit mt-2">
              {service.is_active ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
              ) : (
                'Inactive'
              )}
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value as ServiceType }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select your service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Service Name (if "other" selected) */}
            {formData.service_type === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium">Custom Service Name *</Label>
                <Input
                  value={formData.custom_service_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_service_name: e.target.value }))}
                  placeholder="e.g., Personal Stylist"
                  className="bg-background/50"
                />
              </motion.div>
            )}

            {/* Service Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Service Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={selectedServiceInfo ? `e.g., Professional ${selectedServiceInfo.label}` : "e.g., Experienced Nanny"}
                className="bg-background/50"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your service, skills, and what makes you stand out..."
                className="bg-background/50 min-h-[100px]"
              />
            </div>

            {/* Hourly Rate & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Hourly Rate (USD)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="25"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Years of Experience
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                  placeholder="3"
                  className="bg-background/50"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Availability</Label>
              <Input
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="e.g., Mon-Fri 9am-6pm, Weekends available"
                className="bg-background/50"
              />
            </div>

            {/* Service Photos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-500" />
                Service Photos (up to 4)
              </Label>
              <ImageUpload
                images={formData.service_photos}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, service_photos: images }))}
                maxImages={4}
                bucket="profile-images"
                folder="service-photos"
              />
              <p className="text-xs text-muted-foreground">
                Add photos showcasing your work or service
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
              <div>
                <Label className="text-sm font-medium">Service Active</Label>
                <p className="text-xs text-muted-foreground">
                  When active, owners can discover your service
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!formData.service_type || !formData.title || upsertService.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                {upsertService.isPending ? (
                  <Sparkles className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {service ? 'Update Service' : 'Create Service'}
              </Button>

              {service && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteService.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
