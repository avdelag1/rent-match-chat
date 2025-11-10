import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, X } from 'lucide-react';
import { PropertyClientFilters } from '@/components/filters/PropertyClientFilters';
import { MotoClientFilters } from '@/components/filters/MotoClientFilters';
import { BicycleClientFilters } from '@/components/filters/BicycleClientFilters';
import { YachtClientFilters } from '@/components/filters/YachtClientFilters';
import { Badge } from '@/components/ui/badge';

export default function OwnerFiltersExplore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'property' | 'moto' | 'bicycle' | 'yacht'>('property');
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleApplyFilters = () => {
    navigate('/owner/dashboard');
  };

  const handleClearAll = () => {
    setActiveFilterCount(0);
    // Trigger clear in child components via their own state management
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/owner/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Filters</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-primary hover:text-primary/80"
          >
            Clear All
          </Button>
        </div>
      </header>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(value: any) => setActiveCategory(value)} className="w-full max-w-2xl mx-auto">
        <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
          <TabsTrigger value="property" className="relative">
            Property
            {activeCategory === 'property' && activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="moto">Moto</TabsTrigger>
          <TabsTrigger value="bicycle">Bicycle</TabsTrigger>
          <TabsTrigger value="yacht">Yacht</TabsTrigger>
        </TabsList>

        <div className="p-4 space-y-6 pb-24">
          <TabsContent value="property" className="mt-0">
            <PropertyClientFilters 
              onApply={(filters) => {
                console.log('Applied filters:', filters);
                setActiveFilterCount(Object.keys(filters).length);
              }}
              activeCount={activeCategory === 'property' ? activeFilterCount : 0}
            />
          </TabsContent>

          <TabsContent value="moto" className="mt-0">
            <MotoClientFilters 
              onApply={(filters) => {
                console.log('Applied filters:', filters);
                setActiveFilterCount(Object.keys(filters).length);
              }}
              activeCount={activeCategory === 'moto' ? activeFilterCount : 0}
            />
          </TabsContent>

          <TabsContent value="bicycle" className="mt-0">
            <BicycleClientFilters 
              onApply={(filters) => {
                console.log('Applied filters:', filters);
                setActiveFilterCount(Object.keys(filters).length);
              }}
              activeCount={activeCategory === 'bicycle' ? activeFilterCount : 0}
            />
          </TabsContent>

          <TabsContent value="yacht" className="mt-0">
            <YachtClientFilters 
              onApply={(filters) => {
                console.log('Applied filters:', filters);
                setActiveFilterCount(Object.keys(filters).length);
              }}
              activeCount={activeCategory === 'yacht' ? activeFilterCount : 0}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Apply Button - Fixed at bottom above BottomNav */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleApplyFilters}
          className="w-full max-w-2xl mx-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
          size="lg"
        >
          Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="explore" userRole="owner" />
    </div>
  );
}