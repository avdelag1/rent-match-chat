import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Car, Bike, Ship, RotateCcw, Briefcase, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Category type matching ListingFilters
export type QuickFilterCategory = 'property' | 'motorcycle' | 'bicycle' | 'yacht' | 'vehicle';
export type QuickFilterListingType = 'rent' | 'sale' | 'both';

// Owner-specific filter types
export type OwnerClientGender = 'female' | 'male' | 'any';
export type OwnerClientType = 'all' | 'hire' | 'rent' | 'buy';

export interface QuickFilters {
  categories: QuickFilterCategory[];
  listingType: QuickFilterListingType;
  // Client-specific
  showHireServices?: boolean;
  // Owner-specific filters
  clientGender?: OwnerClientGender;
  clientType?: OwnerClientType;
}

interface QuickFilterBarProps {
  filters: QuickFilters;
  onChange: (filters: QuickFilters) => void;
  className?: string;
  userRole?: 'client' | 'owner';
}

const categories: { id: QuickFilterCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'property', label: 'Property', icon: <Home className="w-4 h-4" /> },
  { id: 'vehicle', label: 'Cars', icon: <Car className="w-4 h-4" /> },
  { id: 'motorcycle', label: 'Motos', icon: <MotorcycleIcon /> },
  { id: 'bicycle', label: 'Bikes', icon: <Bike className="w-4 h-4" /> },
  { id: 'yacht', label: 'Yachts', icon: <Ship className="w-4 h-4" /> },
];

const listingTypes: { id: QuickFilterListingType; label: string }[] = [
  { id: 'rent', label: 'Rent' },
  { id: 'sale', label: 'Buy' },
  { id: 'both', label: 'Both' },
];

const genderOptions: { id: OwnerClientGender; label: string; icon: React.ReactNode }[] = [
  { id: 'any', label: 'All', icon: <Users className="w-4 h-4" /> },
  { id: 'female', label: 'Women', icon: <User className="w-4 h-4" /> },
  { id: 'male', label: 'Men', icon: <User className="w-4 h-4" /> },
];

const clientTypeOptions: { id: OwnerClientType; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'All Clients' },
  { id: 'hire', label: 'Hiring Services', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'rent', label: 'Looking to Rent' },
  { id: 'buy', label: 'Looking to Buy' },
];

// Custom motorcycle icon since lucide doesn't have one
function MotorcycleIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="17" r="3" />
      <circle cx="19" cy="17" r="3" />
      <path d="M9 17h6" />
      <path d="M19 17l-2-7h-4l-1 4" />
      <path d="M12 10l-1-3h-2l-1 3" />
      <path d="M5 17l2-7h2" />
    </svg>
  );
}

function QuickFilterBarComponent({ filters, onChange, className, userRole = 'client' }: QuickFilterBarProps) {
  const handleCategoryToggle = useCallback((categoryId: QuickFilterCategory) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];

    onChange({
      ...filters,
      categories: newCategories,
    });
  }, [filters, onChange]);

  const handleListingTypeChange = useCallback((type: QuickFilterListingType) => {
    onChange({
      ...filters,
      listingType: type,
    });
  }, [filters, onChange]);

  const handleHireToggle = useCallback(() => {
    onChange({
      ...filters,
      showHireServices: !filters.showHireServices,
    });
  }, [filters, onChange]);

  const handleGenderChange = useCallback((gender: OwnerClientGender) => {
    onChange({
      ...filters,
      clientGender: gender,
    });
  }, [filters, onChange]);

  const handleClientTypeChange = useCallback((type: OwnerClientType) => {
    onChange({
      ...filters,
      clientType: type,
    });
  }, [filters, onChange]);

  const handleReset = useCallback(() => {
    onChange({
      categories: [],
      listingType: 'both',
      showHireServices: false,
      clientGender: 'any',
      clientType: 'all',
    });
  }, [onChange]);

  const hasActiveFilters = userRole === 'client'
    ? filters.categories.length > 0 || filters.listingType !== 'both' || filters.showHireServices
    : (filters.clientGender && filters.clientGender !== 'any') || (filters.clientType && filters.clientType !== 'all');

  // Owner Quick Filters
  if (userRole === 'owner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'bg-background/80 backdrop-blur-xl border-b border-white/5 px-3 py-2',
          className
        )}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {/* Gender filter chips */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {genderOptions.map((option) => {
                const isActive = filters.clientGender === option.id || (!filters.clientGender && option.id === 'any');
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenderChange(option.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                      'border',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                        : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
                    )}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 flex-shrink-0" />

            {/* Client type chips */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {clientTypeOptions.map((option) => {
                const isActive = filters.clientType === option.id || (!filters.clientType && option.id === 'all');
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClientTypeChange(option.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                      'border',
                      isActive
                        ? option.id === 'hire' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                        : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
                    )}
                  >
                    {option.icon}
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.id === 'all' ? 'All' : option.id === 'hire' ? 'Hire' : option.id === 'rent' ? 'Rent' : 'Buy'}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Reset button */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium',
                    'bg-destructive/10 text-destructive border border-destructive/20',
                    'hover:bg-destructive/20 transition-all duration-200 flex-shrink-0'
                  )}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // Client Quick Filters (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'bg-background/80 backdrop-blur-xl border-b border-white/5 px-3 py-2',
        className
      )}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Main filter row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {/* Hire Services Button - NEW */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHireToggle}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
              'border flex-shrink-0',
              filters.showHireServices
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span>Hire</span>
          </motion.button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 flex-shrink-0" />

          {/* Category chips */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {categories.map((category) => {
              const isActive = filters.categories.includes(category.id);
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    'border',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                      : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
                  )}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 flex-shrink-0" />

          {/* Listing type chips */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {listingTypes.map((type) => {
              const isActive = filters.listingType === type.id;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleListingTypeChange(type.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    'border',
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                      : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
                  )}
                >
                  {type.label}
                </motion.button>
              );
            })}
          </div>

          {/* Reset button - only show when filters are active */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium',
                  'bg-destructive/10 text-destructive border border-destructive/20',
                  'hover:bg-destructive/20 transition-all duration-200 flex-shrink-0'
                )}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Active filter summary */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 overflow-hidden"
            >
              <p className="text-[10px] text-muted-foreground">
                Showing: {filters.showHireServices ? 'Services' : ''}{filters.showHireServices && filters.categories.length > 0 ? ' + ' : ''}
                {filters.categories.length > 0
                  ? filters.categories.map(c => categories.find(cat => cat.id === c)?.label).join(', ')
                  : !filters.showHireServices ? 'All categories' : ''
                }
                {' • '}
                {filters.listingType === 'both' ? 'Rent & Buy' : filters.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export const QuickFilterBar = memo(QuickFilterBarComponent);
