import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Ship, Bike, BikeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySelect: (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => void;
}

export function CategorySelectionDialog({ 
  open, 
  onOpenChange, 
  onCategorySelect 
}: CategorySelectionDialogProps) {
  const categories = [
    {
      id: 'property' as const,
      title: 'Property',
      icon: Home,
      description: 'Houses, apartments, condos',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'yacht' as const,
      title: 'Yacht',
      icon: Ship,
      description: 'Boats, yachts, vessels',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      id: 'motorcycle' as const,
      title: 'Motorcycle',
      icon: Bike,
      description: 'Motorcycles, scooters',
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'bicycle' as const,
      title: 'Bicycle',
      icon: BikeIcon,
      description: 'Bikes, e-bikes',
      color: 'from-green-500 to-green-600',
    },
  ];

  const modes: Array<{ id: 'rent' | 'sale' | 'both', label: string }> = [
    { id: 'rent', label: 'For Rent' },
    { id: 'sale', label: 'For Sale' },
    { id: 'both', label: 'Both' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Listing</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                    category.color
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex gap-2">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          onCategorySelect(category.id, mode.id);
                          onOpenChange(false);
                        }}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
