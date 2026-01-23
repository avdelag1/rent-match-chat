/**
 * CLIENT FILTERS PAGE
 *
 * Full-screen, mobile-first filter page for clients.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Bike, Wrench, ArrowLeft, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Custom motorcycle icon
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="17" r="3" />
    <circle cx="19" cy="17" r="3" />
    <path d="M9 17h6" />
    <path d="M19 17l-2-5h-4l-3-4H6l1 4" />
    <path d="M14 7h3l2 5" />
  </svg>
);

type Category = 'property' | 'motorcycle' | 'bicycle' | 'services';
type ListingType = 'rent' | 'sale' | 'both';

const categoryOptions = [
  {
    id: 'property' as Category,
    label: 'Properties',
    description: 'Houses, apartments, rooms',
    icon: <Home className="w-6 h-6" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'motorcycle' as Category,
    label: 'Motorcycles',
    description: 'Bikes, scooters, ATVs',
    icon: <MotorcycleIcon className="w-6 h-6" />,
    gradient: 'from-slate-500 to-gray-600'
  },
  {
    id: 'bicycle' as Category,
    label: 'Bicycles',
    description: 'Bikes, e-bikes, accessories',
    icon: <Bike className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'services' as Category,
    label: 'Services',
    description: 'Workers, contractors',
    icon: <Wrench className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-600'
  },
];

const listingTypeOptions = [
  { id: 'both' as ListingType, label: 'All', description: 'Show everything' },
  { id: 'rent' as ListingType, label: 'Rent', description: 'Rentals only' },
  { id: 'sale' as ListingType, label: 'Buy', description: 'For sale only' },
];

export default function ClientFilters() {
  const navigate = useNavigate();

  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localListingType, setLocalListingType] = useState<ListingType>('both');

  const handleCategoryToggle = useCallback((categoryId: Category) => {
    setLocalCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleListingTypeChange = useCallback((type: ListingType) => {
    setLocalListingType(type);
  }, []);

  const handleApply = useCallback(() => {
    // TODO: Apply filters to store
    navigate(-1);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-semibold">Properties, Motos, Bikes & Workers</h1>

        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-8">
          {/* Categories Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Categories
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {categoryOptions.map((category) => {
                const isActive = localCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl text-white bg-gradient-to-br',
                      category.gradient
                    )}>
                      {category.icon}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{category.label}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>

                    {isActive && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Listing Type Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Listing Type
            </h2>
            <div className="flex gap-3">
              {listingTypeOptions.map((option) => {
                const isActive = localListingType === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleListingTypeChange(option.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all min-h-[80px]',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="text-base font-semibold">{option.label}</div>
                    <div className={cn(
                      'text-xs mt-1',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 16px)' }}
      >
        <Button
          onClick={handleApply}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          Apply Filters
        </Button>
      </footer>
    </div>
  );
}
