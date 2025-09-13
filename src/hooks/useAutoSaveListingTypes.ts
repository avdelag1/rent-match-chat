import { useClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useAutoSaveListingTypes() {
  const { updatePreferences } = useClientFilterPreferences();
  const queryClient = useQueryClient();

  const saveListingTypes = async (types: string[]) => {
    try {
      await updatePreferences({ preferred_listing_types: types });
      // Refresh listings to apply new filter
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (error) {
      console.error('Failed to save listing type preferences:', error);
    }
  };

  return { saveListingTypes };
}