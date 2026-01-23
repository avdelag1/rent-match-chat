/**
 * CLIENT FILTERS PAGE
 *
 * Full-screen, mobile-first filter page for clients.
 * Features:
 * - Single scroll container (no nested scrolls)
 * - Large touch targets (min 48px)
 * - Fixed bottom Apply/Reset buttons
 * - Instant UI feedback
 * - GPU-accelerated animations for smooth performance
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
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 z-50 flex flex-col">
      {/* Header - Fixed */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-11 h-11 rounded-2xl hover:bg-muted/80 active:scale-95 transition-all touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent text-center leading-tight">Properties, Motos, Bikes & Workers</h1>

        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 h-11 rounded-2xl text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 active:scale-95 transition-all touch-manipulation shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        )}
        {!hasActiveFilters && <div className="w-11" />}
      </header>
      
      {/* Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-28">
        <div className="p-6 space-y-10">
          {/* Categories Section */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></span>
              What are you looking for?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {categoryOptions.map((category, index) => {
                const isActive = localCategories.includes(category.id);
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCategoryToggle(category.id)}
                    style={{ willChange: 'transform' }}
                    className={cn(
                      'relative flex items-center gap-5 p-5 rounded-3xl border-2 transition-all duration-200 touch-manipulation min-h-[88px] group',
                      isActive
                        ? 'border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20'
                        : 'border-border/50 bg-card hover:bg-muted/40 hover:border-border active:border-primary/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'flex items-center justify-center w-16 h-16 rounded-2xl text-white bg-gradient-to-br shadow-lg transition-transform duration-300',
                      category.gradient,
                      isActive ? 'scale-105' : 'group-hover:scale-110'
                    )}>
                      {category.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "text-lg font-bold transition-colors",
                        isActive ? "text-foreground" : "text-foreground/90"
                      )}>{category.label}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{category.description}</div>
                    </div>

                    {/* Checkmark */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>


          {/* Listing Type Section */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></span>
              Interest Type
            </h2>
            <div className="flex gap-3">
              {listingTypeOptions.map((option, index) => {
                const isActive = localListingType === option.id;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleListingTypeChange(option.id)}
                    style={{ willChange: 'transform' }}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-3xl border-2 transition-all duration-200 touch-manipulation min-h-[100px] group',
                      isActive
                        ? 'border-primary bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/40 scale-105'
                        : 'border-border/50 bg-card hover:bg-muted/40 hover:border-border/80 hover:shadow-lg active:scale-95'
                    )}
                  >
                    <div className={cn(
                      "text-lg font-bold transition-all",
                      isActive && "drop-shadow-sm"
                    )}>{option.label}</div>
                    <div className={cn(
                      'text-xs mt-1.5 font-medium transition-colors',
                      isActive ? 'text-primary-foreground/90' : 'text-muted-foreground'
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
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xl border-t border-border/30"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleApply}
            className="w-full h-16 text-lg font-bold rounded-3xl touch-manipulation bg-gradient-to-r from-primary via-primary/90 to-primary hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 active:scale-95"
            size="lg"
          >
            {hasChanges ? '✨ Apply Filters' : 'Done'}
          </Button>
        </motion.div>
      </footer>
    </div>
  );
}
