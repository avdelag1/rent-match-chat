import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Car, Anchor, Bike, Wrench, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <path d="M12 2L2 8l10 6 10-6-10-6z" />
    <path d="M2 14l10 6 10-6" />
    <path d="M12 8v14" />
  </svg>
);

export type QuickFilterCategory = 'property' | 'vehicle' | 'yacht' | 'moto' | 'bicycle' | 'services';
export type QuickFilterListingType = 'rent' | 'sale' | 'both';
export type OwnerClientGender = 'female' | 'male' | 'any';
export type OwnerClientType = 'all' | 'hire' | 'rent' | 'buy';

export interface QuickFilters {
  categories: QuickFilterCategory[];
  listingType: QuickFilterListingType;
  clientGender?: OwnerClientGender;
  clientType?: OwnerClientType;
}

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
  { id: 'yacht', label: 'Jet', icon: <JetIcon className="w-4 h-4" />, color: 'from-purple-500 to-pink-500', hasSubOptions: true },
  { id: 'moto', label: 'Motorcycle', icon: <MotorcycleIcon className="w-4 h-4" />, color: 'from-red-500 to-orange-500', hasSubOptions: true },
  { id: 'bicycle', label: 'Bicycle', icon: <Bike className="w-4 h-4" />, color: 'from-green-500 to-emerald-500', hasSubOptions: true },
  { id: 'services', label: 'Service', icon: <Wrench className="w-4 h-4" />, color: 'from-pink-500 to-rose-500', hasSubOptions: false },
];

const listingTypeOptions: { id: QuickFilterListingType; label: string }[] = [
  { id: 'both', label: 'Both' },
  { id: 'rent', label: 'Rent' },
  { id: 'sale', label: 'Buy' },
];

// Colorful "Quick Filter" text
const QuickFilterText = () => (
  <span className="font-semibold text-xs tracking-tight whitespace-nowrap">
    <span className="text-orange-400">Q</span>
    <span className="text-pink-400">u</span>
    <span className="text-purple-400">i</span>
    <span className="text-blue-400">c</span>
    <span className="text-cyan-400">k</span>
    <span className="text-white mx-0.5"> </span>
    <span className="text-green-400">F</span>
    <span className="text-yellow-400">i</span>
    <span className="text-orange-400">l</span>
    <span className="text-pink-400">t</span>
    <span className="text-purple-400">e</span>
    <span className="text-blue-400">r</span>
  </span>
);

function QuickFilterDropdownComponent({ filters, onChange, userRole, className }: QuickFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<QuickFilterCategory | null>(null);
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryId: QuickFilterCategory, listingType?: QuickFilterListingType) => {
    // For services, just select and close
    if (categoryId === 'services') {
      onChange({
        ...filters,
        categories: ['services'],
        listingType: 'both',
      });
      setIsOpen(false);
      setHoveredCategory(null);
      return;
    }

    // For other categories, apply with listing type
    if (listingType) {
      onChange({
        ...filters,
        categories: [categoryId],
        listingType,
      });
      setIsOpen(false);
      setHoveredCategory(null);
    }
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
  };

  return (
    <div className={cn('relative', className)}>
      {/* Quick Filter Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-1.5 px-3 h-9 rounded-xl transition-all duration-200',
          activeFilterCount > 0
            ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 shadow-lg shadow-orange-500/10'
            : 'bg-muted/50 border border-white/10 hover:bg-muted hover:border-white/20'
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
              className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Cascade Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
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
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute left-0 top-full mt-2 z-50 min-w-[200px]"
            >
              <div className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-foreground">Select Category</span>
                  {activeFilterCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClearFilters}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
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
                      onMouseLeave={() => !category.hasSubOptions && setHoveredCategory(null)}
                    >
                      <button
                        onClick={() => !category.hasSubOptions && handleCategorySelect(category.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-200',
                          filters.categories.includes(category.id)
                            ? 'bg-gradient-to-r ' + category.color + ' text-white'
                            : 'text-foreground/80 hover:bg-white/5'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'p-1.5 rounded-lg',
                            filters.categories.includes(category.id)
                              ? 'bg-white/20'
                              : `bg-gradient-to-br ${category.color} bg-opacity-20`
                          )}>
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.label}</span>
                        </div>
                        {category.hasSubOptions && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Sub-menu for listing type */}
                      <AnimatePresence>
                        {hoveredCategory === category.id && category.hasSubOptions && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute left-full top-0 ml-1 z-50"
                            onMouseEnter={() => setHoveredCategory(category.id)}
                          >
                            <div className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[140px]">
                              <div className="py-2">
                                {listingTypeOptions.map((listingType, ltIndex) => (
                                  <motion.button
                                    key={listingType.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: ltIndex * 0.05 }}
                                    onClick={() => handleCategorySelect(category.id, listingType.id)}
                                    className={cn(
                                      'w-full flex items-center px-4 py-2.5 text-sm transition-all duration-200',
                                      filters.categories.includes(category.id) && filters.listingType === listingType.id
                                        ? `bg-gradient-to-r ${category.color} text-white`
                                        : 'text-foreground/80 hover:bg-white/5'
                                    )}
                                  >
                                    <span className="font-medium">{listingType.label}</span>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export const QuickFilterDropdown = memo(QuickFilterDropdownComponent);
