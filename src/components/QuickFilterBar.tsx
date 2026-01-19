import { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Car, Bike, Ship, RotateCcw, Briefcase, Users, User, ChevronDown, Wrench, Filter, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickFilterCategory, QuickFilters, ClientGender, ClientType } from '@/types/filters';

// Re-export from CascadeFilterButton for backwards compatibility
export { CascadeFilterButton } from './CascadeFilterButton';

// Re-export unified types for backwards compatibility
export type { QuickFilterCategory, QuickFilters } from '@/types/filters';

// Legacy type aliases for backwards compatibility
export type QuickFilterListingType = 'rent' | 'sale' | 'both';
export type OwnerClientGender = ClientGender;
export type OwnerClientType = ClientType;

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
  { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
];

const listingTypes: { id: QuickFilterListingType; label: string }[] = [
  { id: 'both', label: 'All' },
  { id: 'rent', label: 'Rent' },
  { id: 'sale', label: 'Buy' },
];

const genderOptions: { id: OwnerClientGender; label: string; icon: React.ReactNode }[] = [
  { id: 'any', label: 'All', icon: <Users className="w-4 h-4" /> },
  { id: 'female', label: 'Women', icon: <User className="w-4 h-4" /> },
  { id: 'male', label: 'Men', icon: <User className="w-4 h-4" /> },
];

const clientTypeOptions: { id: OwnerClientType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hire', label: 'Hiring' },
  { id: 'rent', label: 'Renting' },
  { id: 'buy', label: 'Buying' },
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

// Dropdown component for compact filters
function FilterDropdown({ 
  label, 
  icon, 
  options, 
  value, 
  onChange, 
  isActive 
}: { 
  label: string;
  icon?: React.ReactNode;
  options: { id: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (id: string) => void;
  isActive?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
          'border will-change-transform',
          isActive
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
            : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
        )}
      >
        {icon}
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              willChange: 'opacity, transform',
            }}
            className="z-[9999] min-w-[120px] bg-popover border border-border rounded-lg shadow-xl overflow-hidden pointer-events-auto"
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors',
                  value === option.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      clientGender: 'any',
      clientType: 'all',
    });
  }, [onChange]);

  const hasActiveFilters = userRole === 'client'
    ? filters.categories.length > 0 || filters.listingType !== 'both'
    : (filters.clientGender && filters.clientGender !== 'any') || (filters.clientType && filters.clientType !== 'all');

  // Owner Quick Filters
  if (userRole === 'owner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
        className={cn(
          'bg-background/80 backdrop-blur-xl border-b border-white/5 px-3 py-2',
          className
        )}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Gender dropdown */}
            <FilterDropdown
              label="Gender"
              icon={<Users className="w-4 h-4" />}
              options={genderOptions}
              value={filters.clientGender || 'any'}
              onChange={(id) => handleGenderChange(id as OwnerClientGender)}
              isActive={filters.clientGender !== 'any' && filters.clientGender !== undefined}
            />

            {/* Client type dropdown */}
            <FilterDropdown
              label="Looking for"
              icon={<Briefcase className="w-4 h-4" />}
              options={clientTypeOptions}
              value={filters.clientType || 'all'}
              onChange={(id) => handleClientTypeChange(id as OwnerClientType)}
              isActive={filters.clientType !== 'all' && filters.clientType !== undefined}
            />

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
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium',
                    'bg-destructive/10 text-destructive border border-destructive/20',
                    'hover:bg-destructive/20 transition-all duration-200 flex-shrink-0'
                  )}
                >
                  <RotateCcw className="w-3 h-3" />
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
      transition={{ type: 'spring', stiffness: 600, damping: 25 }}
      className={cn(
        'bg-background/80 backdrop-blur-xl border-b border-white/5 px-3 py-2',
        className
      )}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Main filter row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Category chips - all listing types including services */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {categories.map((category) => {
              const isActive = filters.categories.includes(category.id);
              const isServices = category.id === 'services';
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    'border',
                    isActive
                      ? isServices
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                        : 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
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

          {/* Listing type dropdown - compact */}
          <FilterDropdown
            label="Type"
            options={listingTypes}
            value={filters.listingType}
            onChange={(id) => handleListingTypeChange(id as QuickFilterListingType)}
            isActive={filters.listingType !== 'both'}
          />

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
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium',
                  'bg-destructive/10 text-destructive border border-destructive/20',
                  'hover:bg-destructive/20 transition-all duration-200 flex-shrink-0'
                )}
              >
                <RotateCcw className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export const QuickFilterBar = memo(QuickFilterBarComponent);
