import { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bike, RotateCcw, Briefcase, Users, User, ChevronDown, Wrench, Filter, X, Check } from 'lucide-react';
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
  { id: 'motorcycle', label: 'Motos', icon: <MotorcycleIcon /> },
  { id: 'bicycle', label: 'Bikes', icon: <Bike className="w-4 h-4" /> },
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
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors duration-150',
          'border',
          isActive
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
        )}
      >
        {icon}
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
          className="z-[9999] min-w-[120px] bg-gray-900 border border-white/20 rounded-lg overflow-hidden pointer-events-auto"
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
                'w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors duration-150',
                value === option.id
                  ? 'bg-orange-500 text-white'
                  : 'text-white hover:bg-white/15'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
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
      <div
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
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold',
                  'bg-red-500/20 text-red-400 border border-red-500/40',
                  'hover:bg-red-500/30 transition-colors duration-150 flex-shrink-0'
                )}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Client Quick Filters (default)
  return (
    <div
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
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-colors duration-150',
                    'border',
                    isActive
                      ? isServices
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                  )}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 flex-shrink-0" />

          {/* Listing type dropdown - compact */}
          <FilterDropdown
            label="Type"
            options={listingTypes}
            value={filters.listingType}
            onChange={(id) => handleListingTypeChange(id as QuickFilterListingType)}
            isActive={filters.listingType !== 'both'}
          />

          {/* Reset button - only show when filters are active */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold',
                'bg-red-500/20 text-red-400 border border-red-500/40',
                'hover:bg-red-500/30 transition-colors duration-150 flex-shrink-0'
              )}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const QuickFilterBar = memo(QuickFilterBarComponent);
