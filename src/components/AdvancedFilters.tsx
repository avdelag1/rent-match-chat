
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Car, Bike, Ship, CircleDot, Briefcase, RotateCcw, Sparkles } from 'lucide-react';
import { PropertyClientFilters } from '@/components/filters/PropertyClientFilters';
import { VehicleClientFilters } from '@/components/filters/VehicleClientFilters';
import { MotoClientFilters } from '@/components/filters/MotoClientFilters';
import { BicycleClientFilters } from '@/components/filters/BicycleClientFilters';
import { YachtClientFilters } from '@/components/filters/YachtClientFilters';
import { WorkerClientFilters } from '@/components/filters/WorkerClientFilters';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'owner' | 'admin';
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

type CategoryType = 'property' | 'vehicle' | 'motorcycle' | 'bicycle' | 'yacht' | 'services';

const categories: { id: CategoryType; name: string; icon: React.ElementType; color: string }[] = [
  { id: 'property', name: 'Property', icon: Home, color: 'text-emerald-500' },
  { id: 'vehicle', name: 'Cars', icon: Car, color: 'text-blue-500' },
  { id: 'motorcycle', name: 'Motos', icon: CircleDot, color: 'text-orange-500' },
  { id: 'bicycle', name: 'Bikes', icon: Bike, color: 'text-purple-500' },
  { id: 'yacht', name: 'Yachts', icon: Ship, color: 'text-cyan-500' },
  { id: 'services', name: 'Workers', icon: Briefcase, color: 'text-pink-500' },
];

export function AdvancedFilters({ isOpen, onClose, userRole, onApplyFilters, currentFilters }: AdvancedFiltersProps) {
  const safeCurrentFilters = currentFilters ?? {};
  const [activeCategory, setActiveCategory] = useState<CategoryType>('property');
  const [filterCounts, setFilterCounts] = useState<Record<CategoryType, number>>({
    property: 0,
    vehicle: 0,
    motorcycle: 0,
    bicycle: 0,
    yacht: 0,
    services: 0,
  });
  const [categoryFilters, setCategoryFilters] = useState<Record<CategoryType, any>>({
    property: safeCurrentFilters,
    vehicle: {},
    motorcycle: {},
    bicycle: {},
    yacht: {},
    services: {},
  });

  const handleApplyFilters = (category: CategoryType, filters: any) => {
    // Count active filters
    const count = Object.entries(filters).filter(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value !== '' && value !== 'any';
      if (typeof value === 'number') return value > 0;
      return false;
    }).length;

    setFilterCounts(prev => ({ ...prev, [category]: count }));
    setCategoryFilters(prev => ({ ...prev, [category]: filters }));
  };

  const handleApply = () => {
    // FIX: Combine filters from ALL categories, not just active one
    // This prevents filters from being lost when switching tabs
    const allFilters: any = {
      activeCategory,
      filterCounts,
      // Collect all category-specific filters
      categoryFilters: categoryFilters,
    };

    // Merge non-empty filters from all categories into the root level
    // This maintains backwards compatibility with existing filter consumers
    Object.entries(categoryFilters).forEach(([category, filters]) => {
      if (filters && Object.keys(filters).length > 0) {
        // Add category-prefixed keys for disambiguation
        Object.entries(filters).forEach(([key, value]) => {
          // Skip empty/default values
          if (
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'string' && (value === '' || value === 'any')) ||
            value === null ||
            value === undefined
          ) {
            return;
          }

          // Store with category prefix to avoid collisions
          // e.g., "property_priceMin", "vehicle_seats"
          const prefixedKey = `${category}_${key}`;
          allFilters[prefixedKey] = value;
        });
      }
    });

    onApplyFilters(allFilters);
    onClose();
  };

  const handleReset = () => {
    setFilterCounts({
      property: 0,
      vehicle: 0,
      motorcycle: 0,
      bicycle: 0,
      yacht: 0,
      services: 0,
    });
    setCategoryFilters({
      property: {},
      vehicle: {},
      motorcycle: {},
      bicycle: {},
      yacht: {},
      services: {},
    });
  };

  const totalActiveFilters = Object.values(filterCounts).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        overlayClassName="bg-transparent backdrop-blur-none"
        className="max-w-2xl h-[60vh] sm:h-[65vh] max-h-[500px] flex flex-col p-0 gap-0 overflow-hidden top-[55%] sm:top-[50%]"
      >
        {/* Header */}
        <DialogHeader className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  {userRole === 'owner' ? 'Find Clients' : 'Filter Listings'}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {userRole === 'owner'
                    ? 'Customize your ideal client profile'
                    : 'Find exactly what you\'re looking for'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b bg-background/50">
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as CategoryType)} className="w-full">
            <TabsList className="w-full grid grid-cols-6 h-12 p-1 bg-muted/50 rounded-xl">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = filterCounts[cat.id];
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="relative rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <Icon className={`w-4 h-4 ${activeCategory === cat.id ? cat.color : 'text-muted-foreground'}`} />
                      <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">{cat.name}</span>
                    </div>
                    <AnimatePresence>
                      {count > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1"
                        >
                          <Badge className="h-4 min-w-[16px] rounded-full px-1 text-[10px] font-bold shadow-sm bg-primary text-primary-foreground">
                            {count}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Filter Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeCategory === 'property' && (
                  <PropertyClientFilters
                    onApply={(filters) => handleApplyFilters('property', filters)}
                    initialFilters={categoryFilters.property}
                    activeCount={filterCounts.property}
                  />
                )}
                {activeCategory === 'vehicle' && (
                  <VehicleClientFilters
                    onApply={(filters) => handleApplyFilters('vehicle', filters)}
                    initialFilters={categoryFilters.vehicle}
                    activeCount={filterCounts.vehicle}
                  />
                )}
                {activeCategory === 'motorcycle' && (
                  <MotoClientFilters
                    onApply={(filters) => handleApplyFilters('motorcycle', filters)}
                    initialFilters={categoryFilters.motorcycle}
                    activeCount={filterCounts.motorcycle}
                  />
                )}
                {activeCategory === 'bicycle' && (
                  <BicycleClientFilters
                    onApply={(filters) => handleApplyFilters('bicycle', filters)}
                    initialFilters={categoryFilters.bicycle}
                    activeCount={filterCounts.bicycle}
                  />
                )}
                {activeCategory === 'yacht' && (
                  <YachtClientFilters
                    onApply={(filters) => handleApplyFilters('yacht', filters)}
                    initialFilters={categoryFilters.yacht}
                    activeCount={filterCounts.yacht}
                  />
                )}
                {activeCategory === 'services' && (
                  <WorkerClientFilters
                    onApply={(filters) => handleApplyFilters('services', filters)}
                    initialFilters={categoryFilters.services}
                    activeCount={filterCounts.services}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="shrink-0 flex gap-2 p-4 sm:p-6 border-t bg-gradient-to-t from-background to-background/80">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Apply {totalActiveFilters > 0 && `(${totalActiveFilters})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
