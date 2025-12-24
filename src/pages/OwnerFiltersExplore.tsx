import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, Home, Bike, Ship, Car, RotateCcw } from 'lucide-react';
import { PropertyClientFilters } from '@/components/filters/PropertyClientFilters';
import { MotoClientFilters } from '@/components/filters/MotoClientFilters';
import { BicycleClientFilters } from '@/components/filters/BicycleClientFilters';
import { YachtClientFilters } from '@/components/filters/YachtClientFilters';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OwnerFiltersExplore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'property' | 'moto' | 'bicycle' | 'yacht'>('property');
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleApplyFilters = () => {
    navigate('/owner/dashboard');
  };

  const handleClearAll = () => {
    setActiveFilterCount(0);
  };

  const categoryIcons = {
    property: Home,
    moto: Car,
    bicycle: Bike,
    yacht: Ship,
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-full bg-gradient-to-b from-background via-background to-background/95">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-9 w-9 rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">Find Clients</h1>
                  <p className="text-sm text-muted-foreground">Customize your ideal client profile</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs - Modern Design */}
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <Tabs value={activeCategory} onValueChange={(value: any) => setActiveCategory(value)} className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-14 p-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
              {(['property', 'moto', 'bicycle', 'yacht'] as const).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs capitalize">{cat}</span>
                    </div>
                    {activeCategory === cat && activeFilterCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Badge className="h-5 min-w-[20px] rounded-full px-1.5 bg-accent text-accent-foreground text-xs font-bold shadow-lg">
                          {activeFilterCount}
                        </Badge>
                      </motion.div>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <ScrollArea className="h-[calc(100vh-340px)] mt-4">
              <div className="space-y-4 pb-24">
                <TabsContent value="property" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PropertyClientFilters
                      onApply={(filters) => {
                        setActiveFilterCount(Object.keys(filters).length);
                      }}
                      activeCount={activeCategory === 'property' ? activeFilterCount : 0}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="moto" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MotoClientFilters
                      onApply={(filters) => {
                        setActiveFilterCount(Object.keys(filters).length);
                      }}
                      activeCount={activeCategory === 'moto' ? activeFilterCount : 0}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="bicycle" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BicycleClientFilters
                      onApply={(filters) => {
                        setActiveFilterCount(Object.keys(filters).length);
                      }}
                      activeCount={activeCategory === 'bicycle' ? activeFilterCount : 0}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="yacht" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <YachtClientFilters
                      onApply={(filters) => {
                        setActiveFilterCount(Object.keys(filters).length);
                      }}
                      activeCount={activeCategory === 'yacht' ? activeFilterCount : 0}
                    />
                  </motion.div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Apply Button - Fixed above bottom nav */}
        <div className="fixed bottom-24 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl h-14 text-lg font-semibold"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
