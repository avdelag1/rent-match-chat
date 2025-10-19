import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { useOwnerClientPreferences } from '@/hooks/useOwnerClientPreferences';

interface ActiveFiltersBarProps {
  onClearFilters: () => void;
  onOpenFilters: () => void;
}

export function ActiveFiltersBar({ onClearFilters, onOpenFilters }: ActiveFiltersBarProps) {
  const { preferences } = useOwnerClientPreferences();

  if (!preferences) return null;

  const activeFilters: string[] = [];

  // Check which filters are active
  if (preferences.min_budget || preferences.max_budget) {
    const budgetText = preferences.min_budget && preferences.max_budget 
      ? `Budget $${preferences.min_budget}-$${preferences.max_budget}`
      : preferences.min_budget 
      ? `Min Budget $${preferences.min_budget}`
      : `Max Budget $${preferences.max_budget}`;
    activeFilters.push(budgetText);
  }

  if (preferences.min_age || preferences.max_age) {
    const ageText = preferences.min_age && preferences.max_age
      ? `Age ${preferences.min_age}-${preferences.max_age}`
      : preferences.min_age
      ? `Min Age ${preferences.min_age}`
      : `Max Age ${preferences.max_age}`;
    activeFilters.push(ageText);
  }

  if (preferences.compatible_lifestyle_tags?.length) {
    activeFilters.push(`${preferences.compatible_lifestyle_tags.length} Lifestyle Tags`);
  }

  if (preferences.preferred_occupations?.length) {
    activeFilters.push(`${preferences.preferred_occupations.length} Occupations`);
  }

  if (preferences.allows_pets !== undefined) {
    activeFilters.push(preferences.allows_pets ? 'Allows Pets' : 'No Pets');
  }

  if (preferences.allows_smoking !== undefined) {
    activeFilters.push(preferences.allows_smoking ? 'Allows Smoking' : 'No Smoking');
  }

  if (preferences.allows_parties !== undefined) {
    activeFilters.push(preferences.allows_parties ? 'Allows Parties' : 'No Parties');
  }

  if (preferences.requires_employment_proof) {
    activeFilters.push('Employment Proof Required');
  }

  if (preferences.requires_references) {
    activeFilters.push('References Required');
  }

  if (preferences.min_monthly_income) {
    activeFilters.push(`Min Income $${preferences.min_monthly_income}`);
  }

  // Don't show bar if no filters are active
  if (activeFilters.length === 0) return null;

  return (
    <div className="w-full bg-white/10 backdrop-blur-sm border-white/20 border-b px-3 py-2">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Filter className="w-4 h-4 text-white shrink-0" />
          <span className="text-white text-sm font-medium shrink-0">
            {activeFilters.length} Active Filter{activeFilters.length !== 1 ? 's' : ''}:
          </span>
          <div className="flex gap-1 flex-wrap">
            {activeFilters.slice(0, 3).map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/20 text-white border-white/30 text-xs"
              >
                {filter}
              </Badge>
            ))}
            {activeFilters.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30 text-xs cursor-pointer hover:bg-white/30"
                onClick={onOpenFilters}
              >
                +{activeFilters.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-white hover:bg-white/20 shrink-0 gap-1 text-xs"
        >
          <X className="w-3 h-3" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
