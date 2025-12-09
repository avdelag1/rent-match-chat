import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Home, Anchor, Bike, CircleDot, Car, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySelect?: (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle' | 'vehicle', mode: 'rent' | 'sale' | 'both') => void;
  navigateToNewPage?: boolean;
}

interface Category {
  id: 'property' | 'yacht' | 'motorcycle' | 'bicycle' | 'vehicle';
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
  popular?: boolean;
}

const categories: Category[] = [
  {
    id: 'property',
    name: 'Property',
    description: 'Apartments, houses, condos, villas',
    icon: <Home className="w-7 h-7" />,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    iconColor: 'text-emerald-500 bg-emerald-500/10',
    popular: true,
  },
  {
    id: 'yacht',
    name: 'Yacht',
    description: 'Boats, yachts, sailing vessels',
    icon: <Anchor className="w-7 h-7" />,
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    iconColor: 'text-cyan-500 bg-cyan-500/10',
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle',
    description: 'Motorcycles, scooters, ATVs',
    icon: <CircleDot className="w-7 h-7" />,
    gradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
    iconColor: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: 'bicycle',
    name: 'Bicycle',
    description: 'Bikes, e-bikes, mountain bikes',
    icon: <Bike className="w-7 h-7" />,
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    iconColor: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: 'vehicle',
    name: 'Vehicle',
    description: 'Cars, trucks, SUVs',
    icon: <Car className="w-7 h-7" />,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    iconColor: 'text-blue-500 bg-blue-500/10',
  },
];

const modes = [
  { id: 'rent' as const, label: 'For Rent', emoji: '🏠', description: 'Monthly or short-term rental' },
  { id: 'sale' as const, label: 'For Sale', emoji: '💰', description: 'One-time purchase' },
  { id: 'both' as const, label: 'Both Options', emoji: '✨', description: 'Rent & sale available' },
];

export function CategorySelectionDialog({ 
  open, 
  onOpenChange, 
  onCategorySelect,
  navigateToNewPage = false
}: CategorySelectionDialogProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [step, setStep] = useState<'category' | 'mode'>('category');

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep('mode');
  };

  const handleModeSelect = (mode: 'rent' | 'sale' | 'both') => {
    if (!selectedCategory) return;

    if (navigateToNewPage) {
      navigate(`/owner/listings/new?category=${selectedCategory.id}&mode=${mode}`);
      onOpenChange(false);
    } else {
      if (onCategorySelect) {
        onCategorySelect(selectedCategory.id, mode);
      }
      onOpenChange(false);
    }
    
    // Reset state
    setTimeout(() => {
      setSelectedCategory(null);
      setStep('category');
    }, 300);
  };

  const handleBack = () => {
    setStep('category');
    setSelectedCategory(null);
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setSelectedCategory(null);
        setStep('category');
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {step === 'category' ? 'Create New Listing' : `${selectedCategory?.name} Listing`}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {step === 'category' 
                  ? 'Select the type of listing you want to create' 
                  : 'Choose how you want to list this item'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 'category' ? (
                <motion.div
                  key="category"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCategorySelect(category)}
                      className={cn(
                        "group relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300",
                        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                        "bg-gradient-to-br", category.gradient,
                        "border-border/50"
                      )}
                    >
                      {category.popular && (
                        <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground text-xs">
                          Popular
                        </Badge>
                      )}
                      
                      <div className={cn("p-3 rounded-xl shrink-0", category.iconColor)}>
                        {category.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      </div>

                      <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all self-center" />
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBack}
                    className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                  >
                    ← Back to categories
                  </Button>

                  {selectedCategory && (
                    <div className={cn(
                      "flex items-center gap-4 p-4 rounded-xl mb-6",
                      "bg-gradient-to-r", selectedCategory.gradient
                    )}>
                      <div className={cn("p-3 rounded-xl", selectedCategory.iconColor)}>
                        {selectedCategory.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedCategory.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Listing Type</h4>
                    {modes.map((mode, index) => (
                      <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleModeSelect(mode.id)}
                        className={cn(
                          "group w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300",
                          "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                          "border-border/50 bg-card"
                        )}
                      >
                        <span className="text-3xl">{mode.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {mode.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {mode.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
