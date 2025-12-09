import { motion } from 'framer-motion';
import { Home, Ship, Bike, Car, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Category {
  id: 'property' | 'yacht' | 'motorcycle' | 'bicycle';
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  count?: number;
}

interface CategorySelectionCardProps {
  onSelect: (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => void;
  listingCounts?: {
    property: number;
    yacht: number;
    motorcycle: number;
    bicycle: number;
  };
  className?: string;
}

export function CategorySelectionCard({ onSelect, listingCounts, className }: CategorySelectionCardProps) {
  const categories: Category[] = [
    {
      id: 'property',
      name: 'Property',
      description: 'Houses, apartments, condos',
      icon: <Home className="w-8 h-8" />,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      count: listingCounts?.property || 0,
    },
    {
      id: 'yacht',
      name: 'Yacht',
      description: 'Boats, yachts, watercraft',
      icon: <Ship className="w-8 h-8" />,
      gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
      iconBg: 'bg-cyan-500/10 text-cyan-500',
      count: listingCounts?.yacht || 0,
    },
    {
      id: 'motorcycle',
      name: 'Motorcycle',
      description: 'Bikes, scooters, ATVs',
      icon: <Car className="w-8 h-8" />,
      gradient: 'from-orange-500/20 via-orange-500/10 to-transparent',
      iconBg: 'bg-orange-500/10 text-orange-500',
      count: listingCounts?.motorcycle || 0,
    },
    {
      id: 'bicycle',
      name: 'Bicycle',
      description: 'E-bikes, mountain bikes, city bikes',
      icon: <Bike className="w-8 h-8" />,
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
      iconBg: 'bg-purple-500/10 text-purple-500',
      count: listingCounts?.bicycle || 0,
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Add New Listing</h2>
        <p className="text-muted-foreground">Choose a category to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={cn(
                "group cursor-pointer overflow-hidden border-2 transition-all duration-300",
                "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
                "bg-gradient-to-br", category.gradient
              )}
              onClick={() => onSelect(category.id, 'rent')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", category.iconBg)}>
                    {category.icon}
                  </div>
                  {category.count !== undefined && category.count > 0 && (
                    <Badge variant="secondary" className="font-semibold">
                      {category.count} active
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>

                <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add listing</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
