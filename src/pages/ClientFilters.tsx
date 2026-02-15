/**
 * CLIENT FILTERS PAGE - COLORFUL & BEAUTIFUL REDESIGN
 * 
 * A colorful, mobile-first filter page with beautiful UI:
 * 1. Gradient buttons and colored sections
 * 2. Category-specific colors
 * 3. Beautiful card styling
 * 4. Smooth animations
 */

import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Home, Bike, Briefcase, X, ChevronRight, DollarSign, MapPin, Bed, Bath, Eye, Car, PawPrint, Sofa, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFilterStore } from '@/state/filterStore';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { QuickFilterCategory } from '@/types/filters';

// Category configuration with vibrant colors
const categories: { 
  id: QuickFilterCategory; 
  label: string; 
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}[] = [
  { 
    id: 'property', 
    label: 'Properties', 
    icon: <Home className="w-5 h-5" />,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/50',
    shadowColor: 'shadow-blue-500/25',
  },
  { 
    id: 'motorcycle', 
    label: 'Motorcycles', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="17" r="3" />
        <circle cx="19" cy="17" r="3" />
        <path d="M9 17h6M19 17l-2-5h-4l-3-4H6l1 4" />
        <path d="M14 7h3l2 5" />
      </svg>
    ),
    color: 'text-orange-500',
    bgGradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-500/50',
    shadowColor: 'shadow-orange-500/25',
  },
  { 
    id: 'bicycle', 
    label: 'Bicycles', 
    icon: <Bike className="w-5 h-5" />,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/50',
    shadowColor: 'shadow-emerald-500/25',
  },
  { 
    id: 'services', 
    label: 'Services', 
    icon: <Briefcase className="w-5 h-5" />,
    color: 'text-purple-500',
    bgGradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/50',
    shadowColor: 'shadow-purple-500/25',
  },
];

const listingTypes = [
  { id: 'both' as const, label: 'Both', icon: '✨', color: 'from-gray-500 to-gray-600' },
  { id: 'rent' as const, label: 'For Rent', icon: '🏠', color: 'from-blue-500 to-indigo-600' },
  { id: 'sale' as const, label: 'For Sale', icon: '💰', color: 'from-green-500 to-emerald-600' },
];

export default function ClientFilters() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Get current filters from store
  const storeCategories = useFilterStore((state) => state.categories);
  const storeListingType = useFilterStore((state) => state.listingType);
  const setCategories = useFilterStore((state) => state.setCategories);
  const setListingType = useFilterStore((state) => state.setListingType);
  const resetClientFilters = useFilterStore((state) => state.resetClientFilters);
  
  // Local state initialized from store
  const [selectedCategories, setSelectedCategories] = useState<QuickFilterCategory[]>(storeCategories);
  const [selectedListingType, setSelectedListingType] = useState<'rent' | 'sale' | 'both'>(storeListingType);
  
  // Determine initial category from URL or store
  const initialCategory = location.search.includes('category=') 
    ? location.search.split('category=')[1]?.split('&')[0] as QuickFilterCategory
    : storeCategories[0] || 'property';
    
  const [activeTab, setActiveTab] = useState<QuickFilterCategory>(initialCategory);
  
  // Count active filters
  const activeFilterCount = selectedCategories.length + (selectedListingType !== 'both' ? 1 : 0);
  
  const handleCategoryToggle = useCallback((categoryId: QuickFilterCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);
  
  const handleApply = useCallback(() => {
    // Update filter store
    setCategories(selectedCategories);
    setListingType(selectedListingType);
    
    // Invalidate queries to force refresh with new filters
    queryClient.invalidateQueries({ queryKey: ['smart-listings'] });
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    
    // Navigate back to dashboard
    navigate('/client/dashboard', { replace: true });
  }, [selectedCategories, selectedListingType, setCategories, setListingType, queryClient, navigate]);
  
  const handleReset = useCallback(() => {
    setSelectedCategories([]);
    setSelectedListingType('both');
    resetClientFilters();
  }, [resetClientFilters]);
  
  const handleBack = useCallback(() => {
    navigate('/client/dashboard', { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Colorful Header with Gradient */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-background to-background/95 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  What I'm Looking For
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {activeFilterCount > 0 
                    ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                    : 'Select categories to browse'
                  }
                </p>
              </div>
            </div>
            
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 rounded-full"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          
          {/* Listing Type - Colorful Gradient Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span>I Want To</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {listingTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedListingType(type.id)}
                    className={cn(
                      "py-4 px-3 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden",
                      selectedListingType === type.id
                        ? `bg-gradient-to-r ${type.color} text-white shadow-lg shadow-opacity-25`
                        : "bg-muted/50 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="text-2xl mb-1 block">{type.icon}</span>
                    {type.label}
                    {selectedListingType === type.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-sm"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories - Beautiful Gradient Cards */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span>Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <motion.button
                    key={category.id}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                      isSelected
                        ? `bg-gradient-to-r ${category.bgGradient} border-transparent text-white shadow-lg ${category.shadowColor}`
                        : "border-border/50 hover:border-primary/50 bg-card hover:bg-card/80"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-white/20 text-white"
                          : `bg-gradient-to-br ${category.bgGradient} text-white`
                      )}>
                        {category.icon}
                      </div>
                      <div className="text-left">
                        <span className={cn(
                          "text-lg font-semibold",
                          isSelected ? "text-white" : "text-foreground"
                        )}>
                          {category.label}
                        </span>
                        <p className={cn(
                          "text-xs",
                          isSelected ? "text-white/70" : "text-muted-foreground"
                        )}>
                          {category.id === 'property' && 'Apartments, houses, rooms'}
                          {category.id === 'motorcycle' && 'Bikes, scooters, mopeds'}
                          {category.id === 'bicycle' && 'Electric, mountain, city bikes'}
                          {category.id === 'services' && 'Professional services'}
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                    
                    {/* Animated background shimmer for selected */}
                    {isSelected && (
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      />
                    )}
                  </motion.button>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Filters - Colorful Card */}
          {selectedCategories.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10">
                    <Eye className="w-5 h-5 text-purple-500" />
                  </div>
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/client/filters-explore`)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">Advanced Filters</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Customize your search →</span>
                </motion.button>
              </CardContent>
            </Card>
          )}

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} ready to apply
                </span>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {selectedCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                Start your search
              </p>
              <p className="text-sm text-muted-foreground">
                Select at least one category to browse listings
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - Beautiful Gradient Apply Button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-background/95 backdrop-blur-xl border-t p-4">
        <div className="max-w-lg mx-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleApply}
              disabled={selectedCategories.length === 0}
              className={cn(
                "w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all",
                selectedCategories.length === 0
                  ? "bg-muted text-muted-foreground"
                  : "bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
              )}
            >
              <Sparkles className="w-6 h-6 mr-2" />
              {selectedCategories.length === 0 
                ? 'Select a Category' 
                : `Browse ${selectedCategories.length} Categor${selectedCategories.length > 1 ? 'ies' : 'y'}`
              }
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
