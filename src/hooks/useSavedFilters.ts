import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedFilters {
  id?: string;
  user_id?: string;
  category: string;
  mode: string;
  filters: any;
  created_at?: string;
  updated_at?: string;
}

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load saved filters on mount
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
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSavedFilters(data);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFilters = async (filters: SavedFilters) => {
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

      // Check if user already has saved filters
      const { data: existing } = await supabase
        .from('saved_filters')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing filters
        const { error } = await supabase
          .from('saved_filters')
          .update({
            category: filters.category,
            mode: filters.mode,
            filters: filters.filters,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new filters
        const { error } = await supabase
          .from('saved_filters')
          .insert({
            user_id: user.id,
            category: filters.category,
            mode: filters.mode,
            filters: filters.filters
          });

        if (error) throw error;
      }

      setSavedFilters(filters);
      
      toast({
        title: "Filters Saved",
        description: "Your filter preferences have been saved successfully",
      });

      await loadSavedFilters();
    } catch (error) {
      console.error('Error saving filters:', error);
      toast({
        title: "Error",
        description: "Failed to save filters",
        variant: "destructive"
      });
    }
  };

  const clearFilters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedFilters(null);
      
      toast({
        title: "Filters Cleared",
        description: "Your saved filters have been cleared",
      });
    } catch (error) {
      console.error('Error clearing filters:', error);
      toast({
        title: "Error",
        description: "Failed to clear filters",
        variant: "destructive"
      });
    }
  };

  return {
    savedFilters,
    loading,
    saveFilters,
    clearFilters,
    loadSavedFilters
  };
}
