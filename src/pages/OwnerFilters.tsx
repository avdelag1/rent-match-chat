/**
 * OWNER FILTERS PAGE
 *
 * Full-screen, mobile-first filter page for owners.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, User, Briefcase, Check, Home, ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/state/filterStore';
import type { ClientGender, ClientType as FilterClientType } from '@/types/filters';

// Use types that match the filter store
type Gender = ClientGender;
type ClientType = FilterClientType;

const genderOptions: { id: Gender; label: string; description: string; icon: React.ReactNode }[] = [
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

const clientTypeOptions: { id: ClientType; label: string; description: string; icon: React.ReactNode; gradient: string }[] = [
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
    gradient: 'from-blue-500 to-indigo-600'
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
  const storeGender = useFilterStore((state) => state.clientGender);
  const storeClientType = useFilterStore((state) => state.clientType);
  const setClientGender = useFilterStore((state) => state.setClientGender);
  const setClientType = useFilterStore((state) => state.setClientType);

  // Local state initialized from store
  const [localGender, setLocalGender] = useState<Gender>(storeGender as Gender);
  const [localClientType, setLocalClientType] = useState<ClientType>(storeClientType as ClientType);

  // Sync local state with store on mount
  useEffect(() => {
    setLocalGender(storeGender as Gender);
    setLocalClientType(storeClientType as ClientType);
  }, [storeGender, storeClientType]);

  const handleApply = useCallback(() => {
    // Apply filters to store
    setClientGender(localGender);
    setClientType(localClientType);
    navigate(-1);
  }, [navigate, localGender, localClientType, setClientGender, setClientType]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-sm font-medium"
        >
          Back
        </Button>

        <h1 className="text-base font-semibold">Client Preferences</h1>

        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-8">
          {/* Gender Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Client Gender
            </h2>
            <div className="flex gap-3">
              {genderOptions.map((option) => {
                const isActive = localGender === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setLocalGender(option.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all min-h-[100px]',
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
                  </button>
                );
              })}
            </div>
          </section>

          {/* Client Type Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Looking For
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {clientTypeOptions.map((option) => {
                const isActive = localClientType === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setLocalClientType(option.id)}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl text-white bg-gradient-to-br',
                      option.gradient
                    )}>
                      {option.icon}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>

                    {isActive && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer - positioned above bottom navigation */}
      <footer className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button
          onClick={handleApply}
          className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/20"
          size="lg"
        >
          Apply Filters
        </Button>
      </footer>
    </div>
  );
}
