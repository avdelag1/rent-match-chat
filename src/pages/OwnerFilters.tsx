/**
 * OWNER FILTERS PAGE - COLORFUL & BEAUTIFUL REDESIGN
 * 
 * A colorful filter page for owners with beautiful UI:
 * 1. Gradient buttons and colored sections
 * 2. Client-specific colors
 * 3. Beautiful card styling
 * 4. Smooth animations
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Users, User, Briefcase, Check, X, GenderFemale, GenderMale, Heart, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFilterStore } from '@/state/filterStore';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { ClientGender, ClientType } from '@/types/filters';

// Gender options with vibrant colors
const genderOptions: { 
  id: ClientGender; 
  label: string; 
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
}[] = [
  { 
    id: 'any', 
    label: 'All', 
    description: 'Show everyone',
    icon: <Users className="w-5 h-5" />,
    gradient: 'from-gray-400 to-gray-500',
    bgGradient: 'from-gray-400/20 to-gray-500/10',
  },
  { 
    id: 'female', 
    label: 'Women', 
    description: 'Female clients',
    icon: <GenderFemale className="w-5 h-5" />,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-500/20 to-rose-500/10',
  },
  { 
    id: 'male', 
    label: 'Men', 
    description: 'Male clients',
    icon: <GenderMale className="w-5 h-5" />,
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-500/10',
  },
];

// Client type options with vibrant colors
const clientTypeOptions: { 
  id: ClientType; 
  label: string; 
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
}[] = [
  { 
    id: 'all', 
    label: 'All Types', 
    description: 'All clients',
    icon: <Users className="w-5 h-5" />,
    gradient: 'from-gray-400 to-gray-500',
    bgGradient: 'from-gray-400/20 to-gray-500/10',
  },
  { 
    id: 'hire', 
    label: 'Hiring Services', 
    description: 'Looking to hire',
    icon: <Briefcase className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
  },
  { 
    id: 'rent', 
    label: 'Renting', 
    description: 'Looking to rent',
    icon: <Home className="w-5 h-5" />,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/20 to-cyan-500/10',
  },
  { 
    id: 'buy', 
    label: 'Buying', 
    description: 'Looking to buy',
    icon: <TrendingUp className="w-5 h-5" />,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-500/20 to-amber-500/10',
  },
];

// Helper icon component for home
const Home = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function OwnerFilters() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get current filters from store
  const storeGender = useFilterStore((state) => state.clientGender);
  const storeClientType = useFilterStore((state) => state.clientType);
  const setClientGender = useFilterStore((state) => state.setClientGender);
  const setClientType = useFilterStore((state) => state.setClientType);
  const resetOwnerFilters = useFilterStore((state) => state.resetOwnerFilters);
  
  // Local state initialized from store
  const [selectedGender, setSelectedGender] = useState<ClientGender>(storeGender);
  const [selectedClientType, setSelectedClientType] = useState<ClientType>(storeClientType);
  
  // Count active filters
  const activeFilterCount = 
    (selectedGender !== 'any' ? 1 : 0) + 
    (selectedClientType !== 'all' ? 1 : 0);
  
  const handleApply = useCallback(() => {
    // Update filter store
    setClientGender(selectedGender);
    setClientType(selectedClientType);
    
    // Invalidate queries to force refresh with new filters
    queryClient.invalidateQueries({ queryKey: ['smart-clients'] });
    queryClient.invalidateQueries({ queryKey: ['owner-interested-clients'] });
    
    // Navigate back
    navigate('/owner/dashboard', { replace: true });
  }, [selectedGender, selectedClientType, setClientGender, setClientType, queryClient, navigate]);
  
  const handleReset = useCallback(() => {
    setSelectedGender('any');
    setSelectedClientType('all');
    resetOwnerFilters();
  }, [resetOwnerFilters]);
  
  const handleBack = useCallback(() => {
    navigate('/owner/dashboard', { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Colorful Header with Gradient */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-purple-500/10 via-background to-background/95 backdrop-blur-sm border-b">
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Who I'm Looking For
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {activeFilterCount > 0 
                    ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                    : 'Filter client profiles'
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
          
          {/* Gender - Colorful Gradient Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/10">
                  <Users className="w-5 h-5 text-pink-500" />
                </div>
                <span>Gender</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {genderOptions.map((option) => {
                  const isSelected = selectedGender === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedGender(option.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl transition-all relative overflow-hidden",
                        isSelected
                          ? `bg-gradient-to-br ${option.bgGradient} border-2 border-transparent`
                          : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                      )}
                      style={{
                        borderColor: isSelected ? undefined : undefined
                      }}
                    >
                      {isSelected && (
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-100",
                          option.bgGradient
                        )} />
                      )}
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all relative z-10",
                        isSelected
                          ? `bg-gradient-to-br ${option.gradient} text-white shadow-lg`
                          : "bg-muted"
                      )}>
                        {isSelected ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <div className={option.gradient.replace('from-', 'text-').split(' ')[0]}>
                            {option.icon}
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-semibold relative z-10",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-sm"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Client Type - Colorful Gradient Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                </div>
                <span>Looking For</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientTypeOptions.map((option) => {
                const isSelected = selectedClientType === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedClientType(option.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                      isSelected
                        ? `bg-gradient-to-r ${option.bgGradient} border-transparent`
                        : "border-border/50 hover:border-primary/50 bg-card hover:bg-card/80"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        isSelected
                          ? `bg-gradient-to-br ${option.gradient} text-white shadow-lg`
                          : "bg-muted"
                      )}>
                        {isSelected ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <div className={option.gradient.replace('from-', 'text-').split(' ')[0]}>
                            {option.icon}
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <span className={cn(
                          "text-base font-semibold",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        <p className={cn(
                          "text-xs",
                          isSelected ? "text-muted-foreground" : "text-muted-foreground/70"
                        )}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </CardContent>
          </Card>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-emerald-500/5 border border-primary/20"
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
          {activeFilterCount === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                <Users className="w-12 h-12 text-purple-500" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                Find your ideal clients
              </p>
              <p className="text-sm text-muted-foreground">
                Set filters to discover matching client profiles
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
              className={cn(
                "w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all",
                activeFilterCount === 0
                  ? "bg-muted text-muted-foreground"
                  : "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white"
              )}
            >
              <Sparkles className="w-6 h-6 mr-2" />
              {activeFilterCount === 0 
                ? 'Show All Clients' 
                : `Apply ${activeFilterCount} Filter${activeFilterCount > 1 ? 's' : ''}`
              }
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
