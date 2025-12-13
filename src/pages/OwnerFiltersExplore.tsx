import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Car, Bike, Ship, SlidersHorizontal, Sparkles, RotateCcw } from 'lucide-react';
import { PropertyClientFilters } from '@/components/filters/PropertyClientFilters';
import { MotoClientFilters } from '@/components/filters/MotoClientFilters';
import { BicycleClientFilters } from '@/components/filters/BicycleClientFilters';
import { YachtClientFilters } from '@/components/filters/YachtClientFilters';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { springConfigs } from '@/utils/modernAnimations';

const categories = [
  { id: 'property', label: 'Property', icon: Home },
  { id: 'moto', label: 'Moto', icon: Car },
  { id: 'bicycle', label: 'Bicycle', icon: Bike },
  { id: 'yacht', label: 'Yacht', icon: Ship },
];

export default function OwnerFiltersExplore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'property' | 'moto' | 'bicycle' | 'yacht'>('property');
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({
    property: 0,
    moto: 0,
    bicycle: 0,
    yacht: 0,
  });

  const handleApplyFilters = () => {
    navigate('/owner/dashboard');
  };

  const handleClearAll = () => {
    setActiveFilterCount(0);
    setFilterCounts({
      property: 0,
      moto: 0,
      bicycle: 0,
      yacht: 0,
    });
  };

  const handleFilterChange = (category: string, count: number) => {
    setFilterCounts(prev => ({ ...prev, [category]: count }));
    if (category === activeCategory) {
      setActiveFilterCount(count);
    }
  };

  const totalFilters = Object.values(filterCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-40">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springConfigs.smooth}
        className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="flex items-center justify-between px-4 py-4 max-w-2xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/owner/dashboard')}
              className="rounded-xl hover:bg-muted/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springConfigs.bouncy}
              className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"
            >
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </motion.div>
            <h1 className="text-xl font-bold">Filters</h1>
            {totalFilters > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springConfigs.bouncy}
              >
                <Badge className="bg-primary text-primary-foreground rounded-full px-2 min-w-[24px] h-6">
                  {totalFilters}
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-4 max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {categories.map(({ id, label, icon: Icon }) => {
              const count = filterCounts[id] || 0;
              const isActive = activeCategory === id;

              return (
                <motion.button
                  key={id}
                  onClick={() => {
                    setActiveCategory(id as any);
                    setActiveFilterCount(count);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                    transition-all duration-200 shrink-0
                    ${isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="filterCategoryPill"
                      className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg shadow-red-500/20"
                      transition={springConfigs.tab}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                    {count > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`
                          min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold
                          ${isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'}
                        `}
                      >
                        {count}
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Filter Content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={springConfigs.smooth}
          >
            {activeCategory === 'property' && (
              <PropertyClientFilters
                onApply={(filters) => {
                  const count = Object.keys(filters).filter(k => {
                    const val = filters[k];
                    if (Array.isArray(val)) return val.length > 0;
                    if (typeof val === 'boolean') return val;
                    if (typeof val === 'string') return val !== 'any' && val !== 'both';
                    return val !== undefined && val !== null;
                  }).length;
                  handleFilterChange('property', count);
                }}
                activeCount={filterCounts.property || 0}
              />
            )}

            {activeCategory === 'moto' && (
              <MotoClientFilters
                onApply={(filters) => {
                  const count = Object.keys(filters).filter(k => {
                    const val = filters[k];
                    if (Array.isArray(val)) return val.length > 0;
                    if (typeof val === 'boolean') return val;
                    return val !== undefined && val !== null;
                  }).length;
                  handleFilterChange('moto', count);
                }}
                activeCount={filterCounts.moto || 0}
              />
            )}

            {activeCategory === 'bicycle' && (
              <BicycleClientFilters
                onApply={(filters) => {
                  const count = Object.keys(filters).filter(k => {
                    const val = filters[k];
                    if (Array.isArray(val)) return val.length > 0;
                    if (typeof val === 'boolean') return val;
                    return val !== undefined && val !== null;
                  }).length;
                  handleFilterChange('bicycle', count);
                }}
                activeCount={filterCounts.bicycle || 0}
              />
            )}

            {activeCategory === 'yacht' && (
              <YachtClientFilters
                onApply={(filters) => {
                  const count = Object.keys(filters).filter(k => {
                    const val = filters[k];
                    if (Array.isArray(val)) return val.length > 0;
                    if (typeof val === 'boolean') return val;
                    return val !== undefined && val !== null;
                  }).length;
                  handleFilterChange('yacht', count);
                }}
                activeCount={filterCounts.yacht || 0}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Apply Button - Fixed at bottom */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springConfigs.smooth, delay: 0.2 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleApplyFilters}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-500 via-red-500 to-pink-500 hover:from-red-600 hover:via-red-600 hover:to-pink-600 text-white shadow-xl shadow-red-500/25 font-semibold text-base"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Apply Filters
              {totalFilters > 0 && (
                <span className="ml-2 bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {totalFilters}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <BottomNav active="explore" userRole="owner" />
    </div>
  );
}
