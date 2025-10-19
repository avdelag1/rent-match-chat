import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedFilter {
  id?: string;
  user_id?: string;
  name: string;
  category: string;
  mode: string;
  filters: any;
  is_active?: boolean;
  listing_types?: string[];
  client_types?: string[];
  min_budget?: number;
  max_budget?: number;
  min_age?: number;
  max_age?: number;
  lifestyle_tags?: string[];
  preferred_occupations?: string[];
  allows_pets?: boolean;
  allows_smoking?: boolean;
  allows_parties?: boolean;
  requires_employment_proof?: boolean;
  requires_references?: boolean;
  min_monthly_income?: number;
  created_at?: string;
  updated_at?: string;
}

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<SavedFilter | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setSavedFilters(data);
        const active = data.find(f => f.is_active);
        setActiveFilter(active || null);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
      toast({
        title: "Error",
        description: "Failed to load saved filters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (filter: SavedFilter) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save filters",
          variant: "destructive"
        });
        return;
      }

      // Check if filter with same name exists
      const { data: existing } = await supabase
        .from('saved_filters')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', filter.name)
        .maybeSingle();

      if (existing) {
        // Update existing filter
        const { error } = await supabase
          .from('saved_filters')
          .update({
            category: filter.category,
            mode: filter.mode,
            filters: filter.filters,
            listing_types: filter.listing_types,
            client_types: filter.client_types,
            min_budget: filter.min_budget,
            max_budget: filter.max_budget,
            min_age: filter.min_age,
            max_age: filter.max_age,
            lifestyle_tags: filter.lifestyle_tags,
            preferred_occupations: filter.preferred_occupations,
            allows_pets: filter.allows_pets,
            allows_smoking: filter.allows_smoking,
            allows_parties: filter.allows_parties,
            requires_employment_proof: filter.requires_employment_proof,
            requires_references: filter.requires_references,
            min_monthly_income: filter.min_monthly_income,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        
        toast({
          title: "Filter Updated",
          description: `"${filter.name}" has been updated successfully`,
        });
      } else {
        // Create new filter
        const { error } = await supabase
          .from('saved_filters')
          .insert({
            user_id: user.id,
            name: filter.name,
            category: filter.category,
            mode: filter.mode,
            filters: filter.filters,
            listing_types: filter.listing_types,
            client_types: filter.client_types,
            min_budget: filter.min_budget,
            max_budget: filter.max_budget,
            min_age: filter.min_age,
            max_age: filter.max_age,
            lifestyle_tags: filter.lifestyle_tags,
            preferred_occupations: filter.preferred_occupations,
            allows_pets: filter.allows_pets,
            allows_smoking: filter.allows_smoking,
            allows_parties: filter.allows_parties,
            requires_employment_proof: filter.requires_employment_proof,
            requires_references: filter.requires_references,
            min_monthly_income: filter.min_monthly_income,
            is_active: false
          });

        if (error) throw error;
        
        toast({
          title: "Filter Saved",
          description: `"${filter.name}" has been saved successfully`,
        });
      }

      await loadSavedFilters();
    } catch (error: any) {
      console.error('Error saving filter:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save filter",
        variant: "destructive"
      });
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: "Filter Deleted",
        description: "Your saved filter has been deleted",
      });

      await loadSavedFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive"
      });
    }
  };

  const setAsActive = async (filterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate all filters first
      await supabase
        .from('saved_filters')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Set selected filter as active
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_active: true })
        .eq('id', filterId);

      if (error) throw error;

      // Also update owner_client_preferences with this filter
      const filter = savedFilters.find(f => f.id === filterId);
      if (filter) {
        await supabase
          .from('owner_client_preferences')
          .upsert({
            user_id: user.id,
            min_budget: filter.min_budget,
            max_budget: filter.max_budget,
            min_age: filter.min_age,
            max_age: filter.max_age,
            compatible_lifestyle_tags: filter.lifestyle_tags,
            preferred_occupations: filter.preferred_occupations,
            allows_pets: filter.allows_pets,
            allows_smoking: filter.allows_smoking,
            allows_parties: filter.allows_parties,
            requires_employment_proof: filter.requires_employment_proof,
            requires_references: filter.requires_references,
            min_monthly_income: filter.min_monthly_income,
          });
      }

      toast({
        title: "Filter Activated",
        description: "This filter is now active for client discovery",
      });

      await loadSavedFilters();
    } catch (error) {
      console.error('Error setting active filter:', error);
      toast({
        title: "Error",
        description: "Failed to activate filter",
        variant: "destructive"
      });
    }
  };

  const applyFilter = async (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (!filter) return null;

    await setAsActive(filterId);
    return filter;
  };

  return {
    savedFilters,
    activeFilter,
    loading,
    saveFilter,
    deleteFilter,
    setAsActive,
    applyFilter,
    loadSavedFilters
  };
}