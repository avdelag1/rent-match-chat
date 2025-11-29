import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Mode } from '@/components/CategorySelector';

export interface CategoryListing {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: Category;
  mode: Mode;
  owner_id: string;
  description: string;
  description_short?: string;
  description_full?: string;
  status: string;
  
  // Common fields
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  latitude?: number;
  longitude?: number;
  
  // Yacht fields
  length_m?: number;
  berths?: number;
  max_passengers?: number;
  hull_material?: string;
  engines?: string;
  fuel_type?: string;
  equipment?: string[];
  rental_rates?: any;
  
  // Motorcycle fields
  mileage?: number;
  engine_cc?: number;
  transmission?: string;
  color?: string;
  license_required?: string;
  vehicle_type?: string;
  
  // Bicycle fields
  frame_size?: string;
  wheel_size?: number;
  frame_material?: string;
  brake_type?: string;
  gear_type?: string;
  electric_assist?: boolean;
  battery_range?: number;
  
  // Property fields (for backward compatibility)
  address?: string;
  city?: string;
  neighborhood?: string;
  property_type?: string;
  beds?: number;
  baths?: number;
  square_footage?: number;
  furnished?: boolean;
  pet_friendly?: boolean;
  amenities?: string[];
  listing_type?: string;
  tulum_location?: string;
  lifestyle_compatible?: string[];
}

export function useCategoryListings(
  category: Category = 'property',
  mode: Mode = 'rent',
  filters: any = {},
  excludeSwipedIds: string[] = []
) {
  return useQuery({
    queryKey: ['listings', category, mode, filters, excludeSwipedIds],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('is_active', true)
          .eq('category', category);

        // Filter by mode
        if (mode !== 'both') {
          query = query.or(`mode.eq.${mode},mode.eq.both`);
        }

        // Apply price filter
        if (filters.priceRange) {
          query = query
            .gte('price', filters.priceRange[0])
            .lte('price', filters.priceRange[1]);
        }

        // Category-specific filters
        if (category === 'yacht') {
          if (filters.lengthRange) {
            query = query
              .gte('length_m', filters.lengthRange[0])
              .lte('length_m', filters.lengthRange[1]);
          }
          if (filters.berthsRange) {
            query = query
              .gte('berths', filters.berthsRange[0])
              .lte('berths', filters.berthsRange[1]);
          }
          if (filters.yearMin) query = query.gte('year', filters.yearMin);
          if (filters.yearMax) query = query.lte('year', filters.yearMax);
        }

        if (category === 'motorcycle') {
          if (filters.engineCCRange) {
            query = query
              .gte('engine_cc', filters.engineCCRange[0])
              .lte('engine_cc', filters.engineCCRange[1]);
          }
          if (filters.mileageRange) {
            query = query
              .gte('mileage', filters.mileageRange[0])
              .lte('mileage', filters.mileageRange[1]);
          }
        }

        if (category === 'bicycle') {
          if (filters.electricOnly) {
            query = query.eq('electric_assist', true);
          }
        }

        // Exclude swiped properties
        if (excludeSwipedIds.length > 0) {
          query = query.not('id', 'in', `(${excludeSwipedIds.join(',')})`);
        }

        query = query.limit(20);

        const { data: listings, error } = await query;
        if (error) {
          console.error('Listings query error:', error);
          throw error;
        }

        return (listings as CategoryListing[]) || [];
      } catch (error) {
        console.error('Error in useCategoryListings:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
}