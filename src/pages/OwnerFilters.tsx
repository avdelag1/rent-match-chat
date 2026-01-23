/**
 * OWNER FILTERS PAGE
 * 
 * Full-screen, mobile-first filter page for owners.
 * Features:
 * - Single scroll container (no nested scrolls)
 * - Large touch targets (min 48px)
 * - Fixed bottom Apply/Reset buttons
 * - Instant UI feedback
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
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header - Fixed */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-base font-semibold">Client Preferences</h1>
        
        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors touch-manipulation"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        )}
        {!hasActiveFilters && <div className="w-10" />}
      </header>
      
      {/* Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-24">
        <div className="p-4 space-y-8">
          {/* Gender Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Client Gender
            </h2>
            <div className="flex gap-3">
              {genderOptions.map((option) => {
                const isActive = localGender === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocalGender(option.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all duration-200 touch-manipulation min-h-[100px]',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'mb-2 p-2 rounded-xl',
                      isActive ? 'bg-white/20' : 'bg-muted'
                    )}>
                      {option.icon}
                    </div>
                    <div className="text-base font-semibold">{option.label}</div>
                    <div className={cn(
                      'text-xs mt-0.5',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
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
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Looking For
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {clientTypeOptions.map((option) => {
                const isActive = localClientType === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocalClientType(option.id)}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 touch-manipulation min-h-[72px]',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl text-white bg-gradient-to-br',
                      option.gradient
                    )}>
                      {option.icon}
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                    
                    {/* Checkmark */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="w-5 h-5" />
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
        className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 16px)' }}
      >
        <Button
          onClick={handleApply}
          className="w-full h-14 text-base font-semibold rounded-2xl touch-manipulation"
          size="lg"
        >
          {hasChanges ? 'Apply Filters' : 'Done'}
        </Button>
      </footer>
    </div>
  );
}
