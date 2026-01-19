import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Car, Bike, Ship, RotateCcw, Briefcase, Users, User, ChevronDown, Wrench, Filter, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickFilterCategory, QuickFilters, ClientGender, ClientType } from '@/types/filters';

// Re-export unified types
export type { QuickFilterCategory, QuickFilters } from '@/types/filters';

// Legacy type aliases for backwards compatibility
export type QuickFilterListingType = 'rent' | 'sale' | 'both';
export type OwnerClientGender = ClientGender;
export type OwnerClientType = ClientType;

interface CascadeFilterButtonProps {
  filters: QuickFilters;
  onChange: (filters: QuickFilters) => void;
  userRole?: 'client' | 'owner';
}

// Custom motorcycle icon
function MotorcycleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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

const categories: { id: QuickFilterCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'property', label: 'properties', icon: <Home className="w-4 h-4" /> },
  { id: 'vehicle', label: 'cars', icon: <Car className="w-4 h-4" /> },
  { id: 'motorcycle', label: 'motos', icon: <MotorcycleIcon className="w-4 h-4" /> },
  { id: 'bicycle', label: 'bikes', icon: <Bike className="w-4 h-4" /> },
  { id: 'yacht', label: 'yachts', icon: <Ship className="w-4 h-4" /> },
  { id: 'services', label: 'services', icon: <Wrench className="w-4 h-4" /> },
];

const listingTypes: { id: QuickFilterListingType; label: string }[] = [
  { id: 'both', label: 'all' },
  { id: 'rent', label: 'rent' },
  { id: 'sale', label: 'buy' },
];

const genderOptions: { id: OwnerClientGender; label: string; icon: React.ReactNode }[] = [
  { id: 'any', label: 'all genders', icon: <Users className="w-4 h-4" /> },
  { id: 'female', label: 'women', icon: <User className="w-4 h-4" /> },
  { id: 'male', label: 'men', icon: <User className="w-4 h-4" /> },
];

const clientTypeOptions: { id: OwnerClientType; label: string }[] = [
  { id: 'all', label: 'all clients' },
  { id: 'hire', label: 'hiring' },
  { id: 'rent', label: 'renting' },
  { id: 'buy', label: 'buying' },
];

function CascadeFilterButtonComponent({ filters, onChange, userRole = 'client' }: CascadeFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: QuickFilterCategory) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    onChange({ ...filters, categories: newCategories });
  }, [filters, onChange]);

  const handleListingTypeChange = useCallback((type: QuickFilterListingType) => {
    onChange({ ...filters, listingType: type });
  }, [filters, onChange]);

  const handleGenderChange = useCallback((gender: OwnerClientGender) => {
    onChange({ ...filters, clientGender: gender });
  }, [filters, onChange]);

  const handleClientTypeChange = useCallback((type: OwnerClientType) => {
    onChange({ ...filters, clientType: type });
  }, [filters, onChange]);

  const handleReset = useCallback(() => {
    onChange({
      categories: [],
      listingType: 'both',
      clientGender: 'any',
      clientType: 'all',
    });
  }, [onChange]);

  const hasActiveFilters = userRole === 'client'
    ? filters.categories.length > 0 || filters.listingType !== 'both'
    : (filters.clientGender && filters.clientGender !== 'any') || (filters.clientType && filters.clientType !== 'all');

  const activeCount = userRole === 'client'
    ? filters.categories.length + (filters.listingType !== 'both' ? 1 : 0)
    : (filters.clientGender !== 'any' ? 1 : 0) + (filters.clientType !== 'all' ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200',
          'border shadow-lg',
          isOpen || hasActiveFilters
            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary shadow-primary/25'
            : 'bg-muted/50 text-foreground border-border/50 hover:bg-muted hover:border-border'
        )}
      >
        <Filter className="w-4 h-4" />
        <span>filters</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-xs font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </motion.button>

      {/* Cascade Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-[100] w-80 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-sm font-semibold text-foreground">filters</span>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    reset
                  </motion.button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {userRole === 'client' ? (
                <>
                  {/* Categories Section */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">categories</span>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => {
                        const isActive = filters.categories.includes(category.id);
                        const isServices = category.id === 'services';
                        return (
                          <motion.button
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategoryToggle(category.id)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              'border',
                              isActive
                                ? isServices
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500'
                                  : 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:border-border'
                            )}
                          >
                            {category.icon}
                            <span>{category.label}</span>
                            {isActive && <Check className="w-3 h-3 ml-auto" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Listing Type Section */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">looking to</span>
                    <div className="flex gap-2">
                      {listingTypes.map((type) => {
                        const isActive = filters.listingType === type.id;
                        return (
                          <motion.button
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleListingTypeChange(type.id)}
                            className={cn(
                              'flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              'border',
                              isActive
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500'
                                : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:border-border'
                            )}
                          >
                            {type.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Gender Section (Owner) */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">gender</span>
                    <div className="flex gap-2">
                      {genderOptions.map((option) => {
                        const isActive = filters.clientGender === option.id;
                        return (
                          <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleGenderChange(option.id)}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              'border',
                              isActive
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500'
                                : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:border-border'
                            )}
                          >
                            {option.icon}
                            <span>{option.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Client Type Section (Owner) */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">looking for</span>
                    <div className="grid grid-cols-2 gap-2">
                      {clientTypeOptions.map((option) => {
                        const isActive = filters.clientType === option.id;
                        return (
                          <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleClientTypeChange(option.id)}
                            className={cn(
                              'px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              'border',
                              isActive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:border-border'
                            )}
                          >
                            {option.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-200"
              >
                apply filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const CascadeFilterButton = memo(CascadeFilterButtonComponent);
