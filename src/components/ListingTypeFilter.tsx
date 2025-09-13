import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export function ListingTypeFilter() {
  const { data: preferences, updatePreferences, isLoading } = useClientFilterPreferences();
  const [currentTypes, setCurrentTypes] = useState<string[]>(['rent']);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (preferences?.preferred_listing_types) {
      setCurrentTypes(preferences.preferred_listing_types);
    }
  }, [preferences]);

  const handleTypeChange = async (types: string[]) => {
    try {
      await updatePreferences({ preferred_listing_types: types });
      setCurrentTypes(types);
      
      // Refresh listings to apply new filter
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      
      toast({
        title: "Filter Updated",
        description: `Now showing ${types.includes('rent') && types.includes('buy') ? 'both rental and sale' : types.includes('rent') ? 'rental' : 'sale'} properties.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update filter preferences.",
        variant: "destructive"
      });
    }
  };

  const isActive = (type: string) => {
    if (type === 'both') {
      return currentTypes.includes('rent') && currentTypes.includes('buy');
    }
    return currentTypes.includes(type);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Looking For</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant={isActive('rent') && !isActive('buy') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange(['rent'])}
            disabled={isLoading}
          >
            Rent
          </Button>
          <Button
            variant={isActive('buy') && !isActive('rent') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange(['buy'])}
            disabled={isLoading}
          >
            Buy
          </Button>
          <Button
            variant={isActive('both') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange(['rent', 'buy'])}
            disabled={isLoading}
          >
            Both
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Currently showing: {' '}
          <Badge variant="secondary" className="text-xs">
            {currentTypes.includes('rent') && currentTypes.includes('buy') 
              ? 'Rent & Buy' 
              : currentTypes.includes('rent') 
                ? 'Rent Only' 
                : 'Buy Only'
            }
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}