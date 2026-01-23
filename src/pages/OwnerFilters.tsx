/**
 * OWNER FILTERS PAGE
 *
 * Full-screen, mobile-first filter page for owners.
 * Features:
 * - Single scroll container (no nested scrolls)
 * - Large touch targets (min 48px)
 * - Fixed bottom Apply/Reset buttons
 * - Instant UI feedback
 * - GPU-accelerated animations for smooth performance
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, User, Briefcase, ArrowLeft, Check, RotateCcw, Home, Building, ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFilterStore, useFilterActions } from '@/state/filterStore';
import type { ClientGender, ClientType } from '@/types/filters';

interface GenderOption {
  id: ClientGender;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const genderOptions: GenderOption[] = [
  { 
    id: 'any', 
    label: 'All', 
    description: 'Show everyone',
    icon: <Users className="w-6 h-6" />
  },
  { 
    id: 'female', 
    label: 'Women', 
    description: 'Female clients',
    icon: <User className="w-6 h-6" />
  },
  { 
    id: 'male', 
    label: 'Men', 
    description: 'Male clients',
    icon: <User className="w-6 h-6" />
  },
];

interface ClientTypeOption {
  id: ClientType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const clientTypeOptions: ClientTypeOption[] = [
  { 
    id: 'all', 
    label: 'All Types', 
    description: 'Show all clients',
    icon: <Users className="w-6 h-6" />,
    gradient: 'from-gray-500 to-slate-600'
  },
  { 
    id: 'hire', 
    label: 'Hiring', 
    description: 'Looking to hire services',
    icon: <Briefcase className="w-6 h-6" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'rent', 
    label: 'Renting', 
    description: 'Looking to rent',
    icon: <Home className="w-6 h-6" />,
    gradient: 'from-orange-500 to-amber-600'
  },
  { 
    id: 'buy', 
    label: 'Buying', 
    description: 'Looking to purchase',
    icon: <ShoppingCart className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-600'
  },
];

export default function OwnerFilters() {
  const navigate = useNavigate();
  
  // Get current filter state from store
  const storeClientGender = useFilterStore((s) => s.clientGender);
  const storeClientType = useFilterStore((s) => s.clientType);
  const { setClientGender, setClientType, resetOwnerFilters } = useFilterActions();
  
  // Local state for pending changes (allows cancel without applying)
  const [localGender, setLocalGender] = useState<ClientGender>(storeClientGender);
  const [localClientType, setLocalClientType] = useState<ClientType>(storeClientType);
  
  // Track if changes were made
  const hasChanges = useMemo(() => {
    return localGender !== storeClientGender || localClientType !== storeClientType;
  }, [localGender, localClientType, storeClientGender, storeClientType]);
  
  const hasActiveFilters = localGender !== 'any' || localClientType !== 'all';
  
  // Apply filters and navigate back
  const handleApply = useCallback(() => {
    setClientGender(localGender);
    setClientType(localClientType);
    navigate(-1);
  }, [localGender, localClientType, setClientGender, setClientType, navigate]);
  
  // Reset all filters
  const handleReset = useCallback(() => {
    setLocalGender('any');
    setLocalClientType('all');
  }, []);
  
  // Go back without applying
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 z-50 flex flex-col">
      {/* Header - Fixed */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-11 h-11 rounded-2xl hover:bg-muted/80 active:scale-95 transition-all touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent text-center leading-tight">Client Preferences</h1>

        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 h-11 rounded-2xl text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 active:scale-95 transition-all touch-manipulation shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        )}
        {!hasActiveFilters && <div className="w-11" />}
      </header>


      {/* Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-28">
        <div className="p-6 space-y-10">
          {/* Gender Section */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></span>
              Client Gender
            </h2>
            <div className="flex gap-3">
              {genderOptions.map((option, index) => {
                const isActive = localGender === option.id;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLocalGender(option.id)}
                    style={{ willChange: 'transform' }}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-3xl border-2 transition-all duration-200 touch-manipulation min-h-[120px] group',
                      isActive
                        ? 'border-primary bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/40 scale-105'
                        : 'border-border/50 bg-card hover:bg-muted/40 hover:border-border/80 hover:shadow-lg active:scale-95'
                    )}
                  >
                    <div className={cn(
                      'mb-3 p-3 rounded-2xl transition-all',
                      isActive ? 'bg-white/20 shadow-lg' : 'bg-muted group-hover:bg-muted/80'
                    )}>
                      {option.icon}
                    </div>
                    <div className={cn(
                      "text-base font-bold transition-all",
                      isActive && "drop-shadow-sm"
                    )}>{option.label}</div>
                    <div className={cn(
                      'text-xs mt-1 font-medium transition-colors',
                      isActive ? 'text-primary-foreground/90' : 'text-muted-foreground'
                    )}>
                      {option.description}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>


          {/* Client Type Section */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></span>
              Looking For
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {clientTypeOptions.map((option, index) => {
                const isActive = localClientType === option.id;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLocalClientType(option.id)}
                    style={{ willChange: 'transform' }}
                    className={cn(
                      'relative flex items-center gap-5 p-5 rounded-3xl border-2 transition-all duration-200 touch-manipulation min-h-[88px] group',
                      isActive
                        ? 'border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20'
                        : 'border-border/50 bg-card hover:bg-muted/40 hover:border-border active:border-primary/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'flex items-center justify-center w-16 h-16 rounded-2xl text-white bg-gradient-to-br shadow-lg transition-transform duration-300',
                      option.gradient,
                      isActive ? 'scale-105' : 'group-hover:scale-110'
                    )}>
                      {option.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "text-lg font-bold transition-colors",
                        isActive ? "text-foreground" : "text-foreground/90"
                      )}>{option.label}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{option.description}</div>
                    </div>

                    {/* Checkmark */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>
        </div>
      </main>


      {/* Footer - Fixed */}
      <footer
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xl border-t border-border/30"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleApply}
            className="w-full h-16 text-lg font-bold rounded-3xl touch-manipulation bg-gradient-to-r from-primary via-primary/90 to-primary hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 active:scale-95"
            size="lg"
          >
            {hasChanges ? '✨ Apply Filters' : 'Done'}
          </Button>
        </motion.div>
      </footer>
    </div>
  );
}
