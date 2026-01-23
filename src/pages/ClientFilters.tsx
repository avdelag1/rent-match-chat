/**
 * CLIENT FILTERS PAGE
 * 
 * Full-screen, mobile-first filter page for clients.
 * Features:
 * - Single scroll container (no nested scrolls)
 * - Large touch targets (min 48px)
 * - Fixed bottom Apply/Reset buttons
 * - Instant UI feedback
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home, Bike, Wrench, ArrowLeft, X, Check, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFilterStore, useFilterActions } from '@/state/filterStore';
import type { QuickFilterCategory, QuickFilterListingType } from '@/types/filters';

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

interface CategoryOption {
  id: QuickFilterCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const categoryOptions: CategoryOption[] = [
  {
    id: 'property',
    label: 'Properties',
    description: 'Houses, apartments, rooms',
    icon: <Home className="w-6 h-6" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'motorcycle',
    label: 'Motorcycles',
    description: 'Bikes, scooters, ATVs',
    icon: <MotorcycleIcon className="w-6 h-6" />,
    gradient: 'from-red-500 to-orange-600'
  },
  {
    id: 'bicycle',
    label: 'Bicycles',
    description: 'Bikes, e-bikes, accessories',
    icon: <Bike className="w-6 h-6" />,
    gradient: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Workers, contractors',
    icon: <Wrench className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-600'
  },
];

interface ListingTypeOption {
  id: QuickFilterListingType;
  label: string;
  description: string;
}

const listingTypeOptions: ListingTypeOption[] = [
  { id: 'both', label: 'All', description: 'Show everything' },
  { id: 'rent', label: 'Rent', description: 'Rentals only' },
  { id: 'sale', label: 'Buy', description: 'For sale only' },
];

export default function ClientFilters() {
  const navigate = useNavigate();
  
  // Get current filter state from store
  const storeCategories = useFilterStore((s) => s.categories);
  const storeListingType = useFilterStore((s) => s.listingType);
  const { setCategories, setListingType, resetClientFilters } = useFilterActions();
  
  // Local state for pending changes (allows cancel without applying)
  const [localCategories, setLocalCategories] = useState<QuickFilterCategory[]>(storeCategories);
  const [localListingType, setLocalListingType] = useState<QuickFilterListingType>(storeListingType);
  
  // Track if changes were made
  const hasChanges = useMemo(() => {
    const categoriesChanged = JSON.stringify(localCategories.sort()) !== JSON.stringify(storeCategories.sort());
    const typeChanged = localListingType !== storeListingType;
    return categoriesChanged || typeChanged;
  }, [localCategories, localListingType, storeCategories, storeListingType]);
  
  const hasActiveFilters = localCategories.length > 0 || localListingType !== 'both';
  
  // Handle category toggle
  const handleCategoryToggle = useCallback((categoryId: QuickFilterCategory) => {
    setLocalCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);
  
  // Handle listing type change
  const handleListingTypeChange = useCallback((type: QuickFilterListingType) => {
    setLocalListingType(type);
  }, []);
  
  // Apply filters and navigate back
  const handleApply = useCallback(() => {
    setCategories(localCategories);
    setListingType(localListingType);
    navigate(-1);
  }, [localCategories, localListingType, setCategories, setListingType, navigate]);
  
  // Reset all filters
  const handleReset = useCallback(() => {
    setLocalCategories([]);
    setLocalListingType('both');
  }, []);
  
  // Go back without applying
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header - Fixed */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-base font-semibold">Properties, Motos, Bikes & Workers</h1>
        
        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors touch-manipulation"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        )}
        {!hasActiveFilters && <div className="w-10" />}
      </header>
      
      {/* Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-24">
        <div className="p-4 space-y-8">
          {/* Categories Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Categories
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {categoryOptions.map((category) => {
                const isActive = localCategories.includes(category.id);
                return (
                  <motion.button
                    key={category.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 touch-manipulation min-h-[72px]',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl text-white bg-gradient-to-br',
                      category.gradient
                    )}>
                      {category.icon}
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{category.label}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                    
                    {/* Checkmark */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>
          
          {/* Listing Type Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Listing Type
            </h2>
            <div className="flex gap-3">
              {listingTypeOptions.map((option) => {
                const isActive = localListingType === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleListingTypeChange(option.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all duration-200 touch-manipulation min-h-[80px]',
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
                  </motion.button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer - Fixed */}
      <footer 
        className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 16px)' }}
      >
        <Button
          onClick={handleApply}
          className="w-full h-14 text-base font-semibold rounded-2xl touch-manipulation"
          size="lg"
        >
          {hasChanges ? 'Apply Filters' : 'Done'}
        </Button>
      </footer>
    </div>
  );
}
