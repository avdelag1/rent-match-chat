import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Car, Bike, Wrench, X, Users, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickFilterCategory, QuickFilters, ClientGender, ClientType } from '@/types/filters';

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

// Custom jet icon
const JetIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

// Re-export unified types
export type { QuickFilterCategory, QuickFilters } from '@/types/filters';

// Legacy type aliases for backwards compatibility
export type QuickFilterListingType = 'rent' | 'sale' | 'both';
export type OwnerClientGender = ClientGender;
export type OwnerClientType = ClientType;

interface QuickFilterDropdownProps {
  filters: QuickFilters;
  onChange: (filters: QuickFilters) => void;
  userRole: 'client' | 'owner';
  className?: string;
}

type CategoryOption = {
  id: QuickFilterCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  hasSubOptions: boolean;
};

const categoryOptions: CategoryOption[] = [
  { id: 'property', label: 'Property', icon: <Home className="w-4 h-4" />, color: 'from-orange-500 to-amber-500', hasSubOptions: true },
  { id: 'vehicle', label: 'Car', icon: <Car className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500', hasSubOptions: true },
  { id: 'yacht', label: 'Yacht', icon: <JetIcon className="w-4 h-4" />, color: 'from-purple-500 to-pink-500', hasSubOptions: true },
  { id: 'motorcycle', label: 'Motorcycle', icon: <MotorcycleIcon className="w-4 h-4" />, color: 'from-red-500 to-orange-500', hasSubOptions: true },
  { id: 'bicycle', label: 'Bicycle', icon: <Bike className="w-4 h-4" />, color: 'from-green-500 to-emerald-500', hasSubOptions: true },
  { id: 'services', label: 'Workers', icon: <Wrench className="w-4 h-4" />, color: 'from-pink-500 to-rose-500', hasSubOptions: true },
];

const listingTypeOptions: { id: QuickFilterListingType; label: string }[] = [
  { id: 'both', label: 'Both' },
  { id: 'rent', label: 'Rent' },
  { id: 'sale', label: 'Buy' },
];

// Owner-specific filter options
const genderOptions: { id: OwnerClientGender; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'any', label: 'All Genders', icon: <Users className="w-4 h-4" />, color: 'from-gray-500 to-slate-500' },
  { id: 'female', label: 'Women', icon: <User className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
  { id: 'male', label: 'Men', icon: <User className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' },
];

const clientTypeOptions: { id: OwnerClientType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all', label: 'All Types', icon: <Briefcase className="w-4 h-4" />, color: 'from-gray-500 to-slate-500' },
  { id: 'hire', label: 'Hiring', icon: <Briefcase className="w-4 h-4" />, color: 'from-purple-500 to-violet-500' },
  { id: 'rent', label: 'Renting', icon: <Briefcase className="w-4 h-4" />, color: 'from-orange-500 to-amber-500' },
  { id: 'buy', label: 'Buying', icon: <Briefcase className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
];

// Pink/Mexican color "Quick Filter" text
const QuickFilterText = () => (
  <span className="font-semibold text-xs tracking-tight whitespace-nowrap bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 bg-clip-text text-transparent">
    Quick Filter
  </span>
);

function QuickFilterDropdownComponent({ filters, onChange, userRole, className }: QuickFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<QuickFilterCategory | null>(null);
  const [clickedCategory, setClickedCategory] = useState<QuickFilterCategory | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Count active filters
  const activeFilterCount = (() => {
    let count = 0;
    if (userRole === 'client') {
      count += filters.categories.length;
      if (filters.listingType !== 'both') count += 1;
    } else {
      if (filters.clientGender && filters.clientGender !== 'any') count += 1;
      if (filters.clientType && filters.clientType !== 'all') count += 1;
    }
    return count;
  })();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredCategory(null);
        setClickedCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (categoryId: QuickFilterCategory) => {
    // Toggle the submenu for all categories with sub-options
    setClickedCategory(clickedCategory === categoryId ? null : categoryId);
  };

  const handleCategorySelect = (categoryId: QuickFilterCategory, listingType: QuickFilterListingType) => {
    // Apply category with listing type
    const newFilters = {
      ...filters,
      categories: [categoryId],
      listingType,
    };

    console.log('[QuickFilterDropdown] Category selected:', { categoryId, listingType, newFilters });

    onChange(newFilters);
    setIsOpen(false);
    setHoveredCategory(null);
    setClickedCategory(null);
  };

  const handleGenderSelect = (gender: OwnerClientGender) => {
    console.log('[QuickFilterDropdown] Gender selected:', gender);
    onChange({
      ...filters,
      clientGender: gender,
    });
  };

  const handleClientTypeSelect = (type: OwnerClientType) => {
    console.log('[QuickFilterDropdown] Client type selected:', type);
    onChange({
      ...filters,
      clientType: type,
    });
  };

  const handleClearFilters = () => {
    onChange({
      categories: [],
      listingType: 'both',
      clientGender: 'any',
      clientType: 'all',
    });
    setIsOpen(false);
    setHoveredCategory(null);
    setClickedCategory(null);
  };

  // Render owner filters dropdown - IMPROVED: Better touch targets
  const renderOwnerFilters = () => (
    <div className="bg-background border border-white/10 rounded-2xl shadow-lg overflow-hidden min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <span className="text-base font-semibold text-foreground">Filter Clients</span>
        {activeFilterCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Gender Section */}
      <div className="p-4 border-b border-white/5">
        <span className="text-sm font-medium text-muted-foreground mb-3 block">Gender</span>
        <div className="flex flex-wrap gap-2">
          {genderOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleGenderSelect(option.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px]',
                filters.clientGender === option.id
                  ? `bg-gradient-to-r ${option.color} text-white shadow-md`
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-white/5'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Client Type Section */}
      <div className="p-4">
        <span className="text-sm font-medium text-muted-foreground mb-3 block">Looking For</span>
        <div className="grid grid-cols-2 gap-2">
          {clientTypeOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleClientTypeSelect(option.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px]',
                filters.clientType === option.id
                  ? `bg-gradient-to-r ${option.color} text-white shadow-md`
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-white/5'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Apply button */}
      <div className="p-4 border-t border-white/5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(false)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 touch-manipulation min-h-[48px]"
        >
          Apply Filters
        </motion.button>
      </div>
    </div>
  );

  // Render client filters dropdown (categories) - IMPROVED: Better touch targets
  const renderClientFilters = () => (
    <div className="bg-background border border-white/10 rounded-2xl shadow-lg overflow-hidden min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <span className="text-base font-semibold text-foreground">Select Category</span>
        {activeFilterCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Category Options */}
      <div className="py-2">
        {categoryOptions.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
            onMouseEnter={() => category.hasSubOptions && setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <button
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all duration-200 touch-manipulation min-h-[52px]',
                filters.categories.includes(category.id)
                  ? 'bg-gradient-to-r ' + category.color + ' text-white'
                  : 'text-foreground/80 hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'p-2 rounded-lg',
                  filters.categories.includes(category.id)
                    ? 'bg-white/20'
                    : `bg-gradient-to-br ${category.color} bg-opacity-20`
                )}>
                  {category.icon}
                </span>
                <span className="font-medium text-base">{category.label}</span>
              </div>
              {category.hasSubOptions && (
                <ChevronRight className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  clickedCategory === category.id && "rotate-90"
                )} />
              )}
            </button>

            {/* Sub-menu for listing type */}
            <AnimatePresence>
              {(hoveredCategory === category.id || clickedCategory === category.id) && category.hasSubOptions && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                  className="absolute left-full top-0 ml-1 z-[10003]"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                >
                  <div className="bg-background border border-white/10 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                    <div className="py-2">
                      {listingTypeOptions.map((listingType, ltIndex) => (
                        <motion.button
                          key={listingType.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ltIndex * 0.05 }}
                          onClick={() => handleCategorySelect(category.id, listingType.id)}
                          className={cn(
                            'w-full flex items-center px-5 py-3 text-sm transition-all duration-200 touch-manipulation min-h-[48px]',
                            filters.categories.includes(category.id) && filters.listingType === listingType.id
                              ? `bg-gradient-to-r ${category.color} text-white`
                              : 'text-foreground/80 hover:bg-white/5'
                          )}
                        >
                          <span className="font-medium text-base">{listingType.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn('relative', className)}>
      {/* Quick Filter Button - IMPROVED: Better touch target */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-200 touch-manipulation',
          activeFilterCount > 0
            ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 shadow-lg shadow-orange-500/10'
            : 'bg-muted/50 hover:bg-muted'
        )}
      >
        <QuickFilterText />
        {/* Badge */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10001]"
              onClick={() => {
                setIsOpen(false);
                setHoveredCategory(null);
              }}
            />

            {/* Main dropdown */}
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              className="absolute left-0 top-full mt-2 z-[10002] min-w-[220px]"
            >
              {userRole === 'owner' ? renderOwnerFilters() : renderClientFilters()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export const QuickFilterDropdown = memo(QuickFilterDropdownComponent);
