import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const SERVICE_TYPES = [
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

export type ServiceType = typeof SERVICE_TYPES[number]['value'];

export interface ClientService {
  id: string;
  user_id: string;
  service_type: ServiceType;
  custom_service_name?: string;
  title: string;
  description?: string;
  hourly_rate?: number;
  experience_years?: number;
  availability?: string;
  service_photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithProfile extends ClientService {
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string;
    city?: string;
  };
}

export function useClientService() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['client-service', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('client_services')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ClientService | null;
    },
    enabled: !!user?.id,
  });

  const upsertService = useMutation({
    mutationFn: async (serviceData: Partial<ClientService>) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if service exists
      const { data: existing } = await supabase
        .from('client_services')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const payload = {
        service_type: serviceData.service_type,
        custom_service_name: serviceData.custom_service_name,
        title: serviceData.title,
        description: serviceData.description,
        hourly_rate: serviceData.hourly_rate,
        experience_years: serviceData.experience_years,
        availability: serviceData.availability,
        service_photos: serviceData.service_photos,
        is_active: serviceData.is_active,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existing) {
        // Update
        result = await supabase
          .from('client_services')
          .update(payload)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Insert
        result = await supabase
          .from('client_services')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service'] });
      toast.success('Service updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update service', {
        description: error.message,
      });
    },
  });

  const deleteService = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_services')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service'] });
      toast.success('Service removed');
    },
    onError: (error) => {
      toast.error('Failed to remove service', {
        description: error.message,
      });
    },
  });

  return {
    service,
    isLoading,
    error,
    upsertService,
    deleteService,
  };
}

// Hook to browse all services (for owners)
export function useServiceProviders(serviceTypeFilter?: ServiceType) {
  return useQuery({
    queryKey: ['service-providers', serviceTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('client_services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (serviceTypeFilter) {
        query = query.eq('service_type', serviceTypeFilter);
      }

      const { data: services, error } = await query;

      if (error) throw error;

      // Fetch profiles separately
      if (services && services.length > 0) {
        const userIds = services.map(s => s.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city')
          .in('id', userIds);

        // Merge profiles with services
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        return services.map(s => ({
          ...s,
          profiles: profileMap.get(s.user_id),
        })) as ServiceWithProfile[];
      }

      return [] as ServiceWithProfile[];
    },
  });
}
